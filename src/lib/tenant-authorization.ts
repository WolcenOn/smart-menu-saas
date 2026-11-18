import 'server-only';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/current-user';
import { canPerform, type RestaurantAction, type RestaurantRole } from '@/lib/permissions';

// Call this independently inside every private read, mutation and API route.
// Never trust a role or restaurant identifier supplied by the browser.
export async function requireRestaurantPermission(
  restaurantId: string,
  action: RestaurantAction,
): Promise<{ userId: string; restaurantId: string; role: RestaurantRole }> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('UNAUTHENTICATED');
  const membership = await prisma.restaurantMember.findUnique({
    where: { restaurantId_userId: { restaurantId, userId } },
    select: { role: true },
  });
  if (!canPerform(membership?.role, action)) throw new Error('FORBIDDEN');
  return { restaurantId, userId, role: membership!.role };
}
