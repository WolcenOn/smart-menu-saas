'use server';

import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { hashInvitationToken } from '@/lib/invitation-tokens';
import { makeRestaurantSlug, registrationSchema } from '@/lib/restaurant-registration';

export async function registerRestaurant(form: FormData) {
  const input = registrationSchema.safeParse({
    restaurantName: form.get('restaurantName'),
    ownerName: form.get('ownerName'),
    email: form.get('email'),
    password: form.get('password'),
    token: form.get('token'),
  });
  if (!input.success) redirect('/registro-restaurante');

  const { token, email, restaurantName, ownerName, password } = input.data;
  const tokenHash = hashInvitationToken(token);
  const passwordHash = await bcrypt.hash(password, 12);
  const slug = makeRestaurantSlug(restaurantName, randomBytes(6).toString('hex'));

  try {
    await prisma.$transaction(async tx => {
      const invite = await tx.restaurantInvitation.findUnique({
        where: { tokenHash },
        select: { id: true, email: true },
      });
      // Do not reveal whether an email address or invitation exists.
      if (!invite || invite.email !== email) throw new Error('INVALID_INVITATION');

      // Only one concurrent request can claim the invitation. If creating
      // the restaurant fails, the transaction restores the invitation too.
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code !== 'P2002') throw error;
    // Don't preserve the secret token in an error redirect or server logs.
    redirect('/registro-restaurante?error=invalid');
  }

  // Do not couple successful registration to Auth.js session creation.
  // A login failure must never make the owner believe the account was not created.
  redirect('/acceso?created=1');
}
