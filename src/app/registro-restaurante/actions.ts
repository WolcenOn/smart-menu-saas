'use server';

import { randomBytes } from 'node:crypto';
import { signIn } from '@/auth';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { makeRestaurantSlug, registrationEnabled, registrationSchema, validRegistrationCode } from '@/lib/restaurant-registration';

export async function registerRestaurant(form: FormData) {
  if (!registrationEnabled()) redirect('/registro-restaurante?error=closed');

  const input = registrationSchema.safeParse({
    restaurantName: form.get('restaurantName'),
    ownerName: form.get('ownerName'),
    email: form.get('email'),
    password: form.get('password'),
    inviteCode: form.get('inviteCode'),
  });

  if (!input.success) redirect('/registro-restaurante?error=invalid');
  if (!validRegistrationCode(input.data.inviteCode)) redirect('/registro-restaurante?error=invalid');

  // Never accept a client-supplied tenant, member role, slug or identity.
  const passwordHash = await bcrypt.hash(input.data.password, 12);
  const slug = makeRestaurantSlug(input.data.restaurantName, randomBytes(6).toString('hex'));

  try {
    await prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          email: input.data.email,
          name: input.data.ownerName,
          passwordHash,
        },
      });
      await tx.restaurant.create({
        data: {
          slug,
          name: input.data.restaurantName,
          themePreset: 'OLIVE',
          menuLayout: 'CARDS',
          members: { create: { userId: user.id, role: 'OWNER' } },
          menus: {
            create: {
              name: 'Carta principal',
              published: true,
              categories: { create: { name: 'Para empezar', position: 1 } },
            },
          },
        },
      });
    });
  } catch (error) {
    // Avoid disclosing whether a specific email already exists.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      redirect('/registro-restaurante?error=unavailable');
    }
    throw error;
  }

  // Sign in with Auth.js after the successful atomic creation: no second form.
  // Existing session and OAuth migration compatibility are preserved.
  await signIn('credentials', { email: input.data.email, password: input.data.password, redirectTo: '/panel' });
}
