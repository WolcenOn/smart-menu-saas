import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { MenuView } from '@/components/menu-view';

export const dynamic = 'force-dynamic';

type RouteProps = { params: Promise<{ slug: string }> };

export default async function PublicMenuPage({ params }: RouteProps) {
  const { slug } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80) notFound();

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    select: {
      name: true,
      tagline: true,
      themePreset: true,
      menuLayout: true,
      menus: {
        where: { published: true },
        select: {
          id: true, name: true,
          categories: {
            orderBy: { position: 'asc' },
            select: {
              id: true, name: true,
              dishes: {
                where: { status: 'PUBLISHED', allergensReviewedAt: { not: null } },
                orderBy: { position: 'asc' },
                select: {
                  id: true, name: true, description: true, price: true, imageKey: true,
                  availability: true,
                  allergens: { select: { allergen: { select: { name: true } } } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!restaurant) notFound();

  return (
    <MenuView
      restaurantName={restaurant.name}
      tagline={restaurant.tagline}
      themePreset={restaurant.themePreset}
      menuLayout={restaurant.menuLayout}
      menus={restaurant.menus.map(menu => ({
        id: menu.id, name: menu.name,
        categories: menu.categories.map(category => ({
          id: category.id, name: category.name,
          dishes: category.dishes.map(dish => ({
            id: dish.id, name: dish.name, description: dish.description,
            price: Number(dish.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }),
            availability: dish.availability,
            imageUrl: dish.imageKey ? '/api/public/dish-image/' + dish.id : null,
            allergens: dish.allergens.map(({ allergen }) => allergen.name),
          })),
        })),
      }))}
    />
  );
}
