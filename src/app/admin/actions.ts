'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
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
