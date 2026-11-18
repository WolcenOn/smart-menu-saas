'use server';

import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { hashInvitationToken, invitationRawTokenSchema } from '@/lib/invitation-tokens';
import { makeRestaurantSlug, registrationSchema } from '@/lib/restaurant-registration';

export async function registerRestaurant(form: FormData) {
  const tokenField = form.get('token');
  if (typeof tokenField !== 'string' || !invitationRawTokenSchema.safeParse(tokenField).success) {
    redirect('/registro-restaurante');
  }

  // Always return to the original invitation, rather than losing the link
  // and leaving the owner thinking the account was created.
  const invitationPath = '/registro-restaurante/' + tokenField;
  const parsed = registrationSchema.safeParse({
    restaurantName: form.get('restaurantName'),
    ownerName: form.get('ownerName'),
    email: form.get('email'),
    password: form.get('password'),
    token: tokenField,
  });
  if (!parsed.success) {
    const passwordError = parsed.error.issues.some(issue => issue.path[0] === 'password');
    console.info('[restaurant-registration] rejected=invalid-form');
    redirect(invitationPath + '?error=' + (passwordError ? 'password' : 'details'));
  }

  const { email, restaurantName, ownerName, password } = parsed.data;
  const tokenHash = hashInvitationToken(tokenField);
  const passwordHash = await bcrypt.hash(password, 12);
  const slug = makeRestaurantSlug(restaurantName, randomBytes(6).toString('hex'));

  let failure: 'invalid-invitation' | 'existing-email' | 'server' | null = null;
  try {
    await prisma.$transaction(async tx => {
      const invite = await tx.restaurantInvitation.findUnique({
        where: { tokenHash },
        select: { id: true, email: true },
      });
      if (!invite || invite.email !== email) throw new Error('INVALID_INVITATION');

      const claimed = await tx.restaurantInvitation.updateMany({
        where: {
          id: invite.id, tokenHash, email, usedAt: null, revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { usedAt: new Date() },
      });
      if (claimed.count !== 1) throw new Error('INVALID_INVITATION');

      const user = await tx.user.create({
        data: { email, name: ownerName, passwordHash },
      });
      const restaurant = await tx.restaurant.create({
        data: {
          slug, name: restaurantName,
          themePreset: 'OLIVE', menuLayout: 'CARDS',
          members: { create: { userId: user.id, role: 'OWNER' } },
          menus: {
            create: {
              name: 'Carta principal', published: true,
              categories: { create: { name: 'Para empezar', position: 1 } },
            },
          },
        },
        select: { id: true },
      });
      await tx.restaurantInvitation.update({
        where: { id: invite.id },
        data: { restaurantId: restaurant.id },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      failure = 'existing-email';
    } else if (error instanceof Error && error.message === 'INVALID_INVITATION') {
      failure = 'invalid-invitation';
    } else {
      failure = 'server';
      // Do not log tokens, passwords, form submissions, or email addresses.
      console.error('[restaurant-registration] rejected=database-error');
    }
  }

  if (failure) {
    redirect(invitationPath + '?error=' + failure);
  }

  // Do not show a success notice before PostgreSQL confirms the transaction.
  redirect('/acceso?created=1');
}
