'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
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
