'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { getImageStorage, storageIsConfigured } from '@/lib/image-storage';
import { adminAccountAction, canApplyAccountAction } from '@/lib/admin-account-action';
import { requireAdminSession, endAdminSession } from '@/lib/admin-session';
import { hashInvitationToken, invitationEmailSchema, inviteDurationSchema, newInvitationToken } from '@/lib/invitation-tokens';

export type InviteResult = { error: string; path: string; email: string };

export async function createInvitation(_state: InviteResult, form: FormData): Promise<InviteResult> {
  await requireAdminSession();
  const email = invitationEmailSchema.safeParse(form.get('email'));
  const hours = inviteDurationSchema.safeParse(form.get('hours'));
  if (!email.success || !hours.success) return { error: 'Comprueba el correo y la duración.', path: '', email: '' };

  const token = newInvitationToken();
  await prisma.restaurantInvitation.create({
    data: {
      tokenHash: hashInvitationToken(token),
      email: email.data,
      expiresAt: new Date(Date.now() + hours.data * 60 * 60 * 1000),
    },
  });
  revalidatePath('/admin');

  // The raw token is shown once to the authenticated administrator, never saved.
  return { error: '', path: '/registro-restaurante/' + token, email: email.data };
}

export async function revokeInvitation(form: FormData) {
  await requireAdminSession();
  const id = form.get('invitationId');
  if (typeof id !== 'string' || !/^c[a-z0-9]{20,}$/.test(id)) return;
  await prisma.restaurantInvitation.updateMany({
    where: { id, usedAt: null, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  revalidatePath('/admin');
}

export async function logoutAdmin() {
  await requireAdminSession();
  await endAdminSession();
  redirect('/admin/acceso');
}

export async function changeAccountAccess(form: FormData) {
  await requireAdminSession();
  const parsed = adminAccountAction.safeParse({
    userId: form.get('userId'),
    action: form.get('accessAction'),
    confirmEmail: form.get('confirmEmail') || undefined,
  });
  if (!parsed.success) throw new Error('INVALID_ACCOUNT_ACTION');
  const { userId, action, confirmEmail } = parsed.data;

  await prisma.$transaction(async tx => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, suspendedAt: true, deletedAt: true, lockedUntil: true },
    });
    if (!user || !canApplyAccountAction(action, user, confirmEmail)) {
      throw new Error('INVALID_ACCOUNT_STATE');
    }
    const condition = action === 'resume'
      ? { not: null }
      : action === 'pause'
        ? null
        : undefined;
    const changed = await tx.user.updateMany({
      where: {
        id: user.id,
        deletedAt: null,
        ...(condition === undefined ? {} : { suspendedAt: condition }),
      },
      data: action === 'unlock'
        ? { failedLogins: 0, lockedUntil: null }
        : action === 'pause'
        ? { suspendedAt: new Date() }
        : action === 'resume'
          ? { suspendedAt: null, failedLogins: 0, lockedUntil: null }
          : { deletedAt: new Date(), suspendedAt: new Date(), passwordHash: null },
    });
    if (changed.count !== 1) throw new Error('ACCOUNT_STATE_CHANGED');
    if (action === 'remove') {
      await tx.account.deleteMany({ where: { userId } });
    }
    await tx.session.deleteMany({ where: { userId } });
    await tx.adminAuditEvent.create({
      data: {
        action: action === 'pause' ? 'ACCOUNT_PAUSED' : action === 'resume' ? 'ACCOUNT_RESUMED' : action === 'unlock' ? 'ACCOUNT_UNLOCKED' : 'ACCOUNT_ACCESS_REMOVED',
        userId, email: user.email,
        details: action === 'remove' ? 'Access removed; restaurant history retained.' : 'Access changed by administrator.',
      },
    });
  });
  revalidatePath('/admin');
}

export async function permanentlyDeleteRestaurant(form: FormData) {
  await requireAdminSession();
  const restaurantId = form.get('restaurantId');
  const confirmation = form.get('confirmation');
  if (typeof restaurantId !== 'string' || !/^c[a-z0-9]{20,}$/.test(restaurantId) || typeof confirmation !== 'string') {
    throw new Error('INVALID_RESTAURANT_DELETE');
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: {
      id: true, name: true,
      members: { select: { userId: true, user: { select: { email: true } } } },
      menus: { select: { categories: { select: { dishes: {
        select: { imageKey: true, imageUploads: { select: { objectKey: true } } },
      } } } } },
    },
  });
  if (!restaurant || restaurant.name !== confirmation.trim()) throw new Error('CONFIRM_RESTAURANT_NAME');

  // Remove private image objects first. If storage isn't reachable, don't
  // erase the DB references needed to recover and clean up those objects.
  const keys = new Set<string>();
  for (const menu of restaurant.menus) {
    for (const category of menu.categories) {
      for (const dish of category.dishes) {
        if (dish.imageKey) keys.add(dish.imageKey);
        for (const upload of dish.imageUploads) keys.add(upload.objectKey);
      }
    }
  }
  if (keys.size > 0) {
    if (!storageIsConfigured()) throw new Error('STORAGE_REQUIRED_FOR_DELETE');
    const { bucket, client } = getImageStorage();
    const allKeys = [...keys];
    for (let i = 0; i < allKeys.length; i += 500) {
      const result = await client.send(new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: allKeys.slice(i, i + 500).map(Key => ({ Key })), Quiet: true },
      }));
      if (result.Errors?.length) throw new Error('IMAGE_CLEANUP_FAILED');
    }
  }

  await prisma.$transaction(async tx => {
    // Only remove the intended tenant, not any other restaurant sharing staff.
    const removed = await tx.restaurant.deleteMany({
      where: { id: restaurantId, name: restaurant.name },
    });
    if (removed.count !== 1) throw new Error('RESTAURANT_ALREADY_CHANGED');

    // RestaurantInvitation.restaurantId is intentionally not a foreign key.
    // Delete invitations linked to the erased tenant so its customer record
    // is no longer present in the invitations database.
    await tx.restaurantInvitation.deleteMany({ where: { restaurantId } });

    for (const member of restaurant.members) {
      // Only delete accounts exclusively belonging to the removed restaurant.
      await tx.user.deleteMany({ where: { id: member.userId, memberships: { none: {} } } });
    }
    // Remove the personal identifiers of accounts exclusive to this tenant
    // from older administrative logs, while retaining operation timestamps.
    const orphanedUsers = restaurant.members.map(member => member.userId);
    await tx.adminAuditEvent.updateMany({
      where: { userId: { in: orphanedUsers } },
      data: { userId: null, email: 'redacted', details: 'Prior account action - erased client' },
    });
    await tx.adminAuditEvent.create({
      data: {
        action: 'RESTAURANT_HARD_DELETED',
        email: 'redacted',
        details: 'Restaurant deleted by administrator; ID: ' + restaurantId,
      },
    });
  });
  revalidatePath('/admin');
}
