import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { isDishPublic } from '@/lib/catalog/visibility';

export const dynamic = 'force-dynamic';

type RouteProps = { params: Promise<{ slug: string }> };

export default async function PublicMenuPage({ params }: RouteProps) {
  const { slug } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80) notFound();

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    select: {
      name: true,
      timezone: true,
      menus: {
        where: { published: true },
        select: {
          id: true,
          name: true,
          categories: {
            orderBy: { position: 'asc' },
            select: {
              id: true,
              name: true,
              dishes: {
                where: { status: 'PUBLISHED', allergensReviewedAt: { not: null } },
                orderBy: { position: 'asc' },
                select: {
                  id: true,
                  name: true,
                  description: true,
                  price: true,
                  status: true,
                  availability: true,
                  allergensReviewedAt: true,
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
    <main className="page">
      <header className="hero">
        <p className="eyebrow">CARTA DIGITAL</p>
        <h1>{restaurant.name}</h1>
        <p>Consulta los platos y sus alérgenos. La disponibilidad puede cambiar durante el servicio.</p>
      </header>
      {restaurant.menus.length === 0 ? <p>Este restaurante todavía no ha publicado una carta.</p> : null}
      {restaurant.menus.map((menu) => (
        <section key={menu.id} aria-label={menu.name}>
          <h2>{menu.name}</h2>
          {menu.categories.map((category) => (
            <section key={category.id} aria-label={category.name}>
              <h3>{category.name}</h3>
              <div className="grid">
                {category.dishes.filter(isDishPublic).map((dish) => (
                  <article className="feature" key={dish.id}>
                    <div className="dish-heading">
                      <h4>{dish.name}</h4>
                      {dish.availability === 'SOLD_OUT' ? <span className="sold-out">Agotado</span> : null}
                    </div>
                    <p>{dish.description}</p>
                    <p className="price">{Number(dish.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                    <p className="allergens">
                      <strong>Alérgenos:</strong>{' '}
                      {dish.allergens.length > 0
                        ? dish.allergens.map((item) => item.allergen.name).join(', ')
                        : 'Sin alérgenos de declaración obligatoria identificados por el restaurante'}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </section>
      ))}
      <p className="notice">La información alimentaria ha sido revisada por el restaurante. Para alergias o intolerancias, confirma siempre con el personal.</p>
    </main>
  );
}
