import 'server-only';
import { getCurrentUserId } from '@/lib/current-user';
import { prisma } from '@/lib/db';

export async function getEditableDish(dishId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  const dish = await prisma.dish.findFirst({
    where: {
      id: dishId,
      category: { menu: { restaurant: { members: {
        some: { userId, role: { in: ['OWNER', 'EDITOR'] } },
      } } } },
    },
    select: {
      id: true,
      category: { select: { menu: { select: {
        restaurantId: true,
        restaurant: { select: { slug: true } },
      } } } },
    },
  });
  return dish ? {
    dishId: dish.id,
    restaurantId: dish.category.menu.restaurantId,
    slug: dish.category.menu.restaurant.slug,
    userId,
  } : null;
}

export function requestIsSameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  const contentType = req.headers.get('content-type')?.split(';')[0]?.trim();
  return contentType === 'application/json' && !!origin && origin === new URL(req.url).origin;
}
