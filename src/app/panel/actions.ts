'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/current-user';
import { themeInputSchema } from '@/lib/theme-input';

export async function updateRestaurantTheme(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/acceso');

  const parsed = themeInputSchema.safeParse({
    restaurantId: formData.get('restaurantId'),
    preset: formData.get('preset'),
    layout: formData.get('layout'),
    tagline: formData.get('tagline'),
  });
  if (!parsed.success) throw new Error('INVALID_THEME_SETTINGS');

  const { restaurantId, preset, layout, tagline } = parsed.data;
  const updated = await prisma.restaurant.updateMany({
    where: {
      id: restaurantId,
      members: { some: { userId, role: { in: ['OWNER', 'EDITOR'] } } },
    },
    data: { themePreset: preset, menuLayout: layout, tagline },
  });
  if (updated.count !== 1) throw new Error('FORBIDDEN');

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { slug: true },
  });
  if (restaurant) revalidatePath('/r/' + restaurant.slug);
  revalidatePath('/panel');
}
