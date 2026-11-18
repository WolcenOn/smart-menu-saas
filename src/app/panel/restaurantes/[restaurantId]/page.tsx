import Link from 'next/link';
import Image from 'next/image';
import { DishPhotoUploader } from '@/components/dish-photo-uploader';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/current-user';
import { canPerform } from '@/lib/permissions';
import { ALLERGEN_IDS } from '@/lib/editor-input';
import { addCategory, addDish, editDish, changeDishAvailability } from '../actions';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ restaurantId: string }> };

export default async function RestaurantEditorPage({ params }: Props) {
  const { restaurantId } = await params;
  const userId = await getCurrentUserId();
  if (!userId) redirect('/acceso');
  if (!/^c[a-z0-9]{20,}$/.test(restaurantId)) notFound();

  const restaurant = await prisma.restaurant.findFirst({
    where: { id: restaurantId, members: { some: { userId } } },
    select: {
      id: true, name: true, slug: true,
      members: { where: { userId }, select: { role: true } },
      menus: {
        orderBy: { name: 'asc' },
        select: {
          id: true, name: true, published: true,
          categories: {
            orderBy: { position: 'asc' },
            select: {
              id: true, name: true,
              dishes: {
                orderBy: { position: 'asc' },
                select: {
                  id: true, name: true, description: true, price: true,
                  status: true, availability: true, allergensReviewedAt: true, imageKey: true,
                  allergens: { select: { allergenId: true } },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!restaurant) notFound();
  const role = restaurant.members[0]?.role;
  const canEdit = canPerform(role, 'manageMenu');
  const canToggle = canPerform(role, 'toggleAvailability');
  const allDishes = restaurant.menus.flatMap(menu => menu.categories.flatMap(category => category.dishes));
  const publishedCount = allDishes.filter(dish => dish.status === 'PUBLISHED').length;
  const draftCount = allDishes.filter(dish => dish.status !== 'PUBLISHED').length;
  const soldOutCount = allDishes.filter(dish => dish.status === 'PUBLISHED' && dish.availability === 'SOLD_OUT').length;
  const allergens = await prisma.allergen.findMany({
    where: { id: { in: [...ALLERGEN_IDS] } },
    select: { id: true, name: true }, orderBy: { name: 'asc' },
  });

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <Link href="/panel" className="auth-brand">✳ smartmenu</Link>
        <Link href="/panel" className="dashboard-logout">← Mis restaurantes</Link>
      </header>
      <section className="dashboard-body editor-page">
        <p className="auth-overline">GESTIÓN DE LA CARTA</p>
        <div className="editor-heading">
          <div><h1>{restaurant.name}</h1><p>Edita los platos, comprueba sus alérgenos y actualiza lo que queda en cocina.</p></div>
          <Link href={'/r/' + restaurant.slug} className="site-button site-button--solid" target="_blank" rel="noopener noreferrer">Vista del cliente ↗</Link>
        </div>

        <div className="editor-overview" aria-label="Resumen de tu carta">
          <div><strong>{allDishes.length}</strong><span>Platos totales</span></div>
          <div><strong>{publishedCount}</strong><span>Publicados</span></div>
          <div><strong>{draftCount}</strong><span>Por revisar</span></div>
          <div><strong>{soldOutCount}</strong><span>Agotados</span></div>
        </div>
        {allDishes.length === 0 ? (
          <div className="editor-start-card">
            <span aria-hidden="true" className="editor-start-icon">✳</span>
            <div>
              <strong>Vamos a preparar tu primera carta</strong>
              <p>Abre una categoría y pulsa «Añadir plato o bebida». Completa el precio y revisa los alérgenos antes de publicarlo.</p>
            </div>
            <a href="#categorias" className="editor-primary editor-link">Empezar <span aria-hidden="true">↓</span></a>
          </div>
        ) : (
          <div className="editor-hint"><strong>Consejo:</strong> los platos agotados siguen visibles con su estado. Los borradores se publican cuando confirmas la revisión de ingredientes y alérgenos.</div>
        )}
        {restaurant.menus.some(menu => menu.categories.length > 1) ? (
          <nav className="editor-category-nav" aria-label="Ir a una categoría">
            <span>Categorías</span>
            {restaurant.menus.flatMap(menu => menu.categories).map(category => (
              <a key={category.id} href={'#categoria-' + category.id}>{category.name}</a>
            ))}
          </nav>
        ) : null}
        {restaurant.menus.length === 0 ? <p>Este restaurante todavía no tiene una carta. Solicita su creación al administrador.</p> : null}
        {restaurant.menus.map(menu => (
          <section key={menu.id} className="editor-menu" aria-label={menu.name} id="categorias">
            <div className="editor-section-title">
              <div><span className="dashboard-role">CARTA {menu.published ? 'PUBLICADA' : 'BORRADOR'}</span><h2>{menu.name}</h2></div>
              <span>{menu.categories.reduce((count, category) => count + category.dishes.length, 0)} productos</span>
            </div>
            {menu.categories.map(category => (
              <section key={category.id} className="editor-category" aria-label={category.name} id={'categoria-' + category.id}>
                <div className="editor-section-title"><h3>{category.name}</h3><span>{category.dishes.length} platos</span></div>
                {category.dishes.length === 0 ? (
                  <div className="editor-category-empty">
                    <span aria-hidden="true">✦</span>
                    <div><strong>Esta categoría aún está vacía</strong><p>Añade el primer producto para empezar a dar forma a tu carta.</p></div>
                  </div>
                ) : null}
                <div className="editor-dishes">
                  {category.dishes.map(dish => (
                    <article key={dish.id} className="editor-dish" aria-label={'Gestión de ' + dish.name}>
                      <div className="editor-dish-overview">
                        <div>
                          <div className="editor-dish-title">
                            <strong>{dish.name}</strong>
                            <span className={'editor-status ' + (dish.availability === 'SOLD_OUT' ? 'editor-status-sold' : 'editor-status-available')}>{dish.availability === 'SOLD_OUT' ? 'Agotado' : 'Disponible'}</span>
                            {dish.status !== 'PUBLISHED' ? <span className="editor-status editor-status-draft">Borrador</span> : null}
                          </div>
                          <p>{dish.description}</p>
                          <small>{dish.allergens.length > 0 ? dish.allergens.map(a => allergens.find(x => x.id === a.allergenId)?.name ?? a.allergenId).join(' · ') : 'Sin alérgenos declarados'}</small>
                        </div>
                        <div className="editor-dish-controls">
                          <strong>{Number(dish.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</strong>
                          {canToggle ? (
                            <form action={changeDishAvailability}>
                              <input type="hidden" name="restaurantId" value={restaurant.id} />
                              <input type="hidden" name="dishId" value={dish.id} />
                              <input type="hidden" name="availability" value={dish.availability === 'AVAILABLE' ? 'SOLD_OUT' : 'AVAILABLE'} />
                              <button className={'editor-toggle ' + (dish.availability === 'AVAILABLE' ? 'editor-toggle-stop' : 'editor-toggle-go')} type="submit">{dish.availability === 'AVAILABLE' ? 'Marcar agotado' : 'Volver a disponible'}</button>
                            </form>
                          ) : null}
                        </div>
                      </div>
                      {dish.imageKey ? (
                        <Image unoptimized src={'/api/public/dish-image/' + dish.id}
                          alt={'Fotografía de ' + dish.name} width={250} height={160} className="editor-photo" />
                      ) : null}
                      {canEdit ? <DishPhotoUploader dishId={dish.id} /> : null}
                      {canEdit ? (
                        <details className="editor-details">
                          <summary>Editar información y alérgenos</summary>
                          <form action={editDish} className="editor-form">
                            <input type="hidden" name="restaurantId" value={restaurant.id} />
                            <input type="hidden" name="dishId" value={dish.id} />
                            <div className="editor-fields">
                              <label>Nombre <input name="name" required minLength={2} maxLength={160} defaultValue={dish.name} /></label>
                              <label>Precio (€) <input name="price" required inputMode="decimal" pattern="[0-9]{1,5}([,.][0-9]{1,2})?" defaultValue={dish.price.toString()} /></label>
                            </div>
                            <label>Descripción <textarea name="description" rows={2} maxLength={1200} defaultValue={dish.description} /></label>
                            <fieldset className="allergen-fieldset">
                              <legend>Alérgenos de declaración obligatoria</legend>
                              <div className="allergen-grid">{allergens.map(a => (
                                <label key={a.id}><input type="checkbox" name="allergens" value={a.id} defaultChecked={dish.allergens.some(x => x.allergenId === a.id)} />{a.name}</label>
                              ))}</div>
                            </fieldset>
                            <label className="review-checkbox"><input type="checkbox" name="reviewed" defaultChecked={dish.allergensReviewedAt !== null} /> He revisado ingredientes y alérgenos; autorizo la publicación de este plato.</label>
                            <button type="submit" className="editor-primary">Guardar cambios</button>
                          </form>
                        </details>
                      ) : null}
                    </article>
                  ))}
                </div>
                {canEdit ? (
                  <details className="editor-details editor-add">
                    <summary>+ Añadir plato o bebida</summary>
                    <form action={addDish} className="editor-form">
                      <input type="hidden" name="restaurantId" value={restaurant.id} />
                      <input type="hidden" name="categoryId" value={category.id} />
                      <div className="editor-fields">
                        <label>Nombre del producto <input name="name" required minLength={2} maxLength={160} placeholder="Ej. Croquetas caseras" /></label>
                        <label>Precio (€) <input name="price" required inputMode="decimal" pattern="[0-9]{1,5}([,.][0-9]{1,2})?" placeholder="9,50" /></label>
                      </div>
                      <label>Descripción <textarea name="description" rows={2} maxLength={1200} defaultValue="" placeholder="Ingredientes, elaboración o presentación" /></label>
                      <fieldset className="allergen-fieldset">
                        <legend>Alérgenos (selecciona los presentes)</legend>
                        <div className="allergen-grid">{allergens.map(a => (
                          <label key={a.id}><input type="checkbox" name="allergens" value={a.id} />{a.name}</label>
                        ))}</div>
                      </fieldset>
                      <label className="review-checkbox"><input type="checkbox" name="reviewed" /> Confirmo que he revisado la composición y los alérgenos; publicar este plato.</label>
                      <p className="editor-help">Si no marcas la revisión, el producto se guarda como borrador y no aparece en la carta pública.</p>
                      <button type="submit" className="editor-primary">Añadir producto</button>
                    </form>
                  </details>
                ) : null}
              </section>
            ))}
            {canEdit ? (
              <details className="editor-details editor-add">
                <summary>+ Crear categoría</summary>
                <form action={addCategory} className="editor-form">
                  <input type="hidden" name="restaurantId" value={restaurant.id} />
                  <input type="hidden" name="menuId" value={menu.id} />
                  <label>Nombre de la categoría <input name="name" required minLength={2} maxLength={100} placeholder="Ej. Bebidas, Postres, Arroces" /></label>
                  <button className="editor-primary" type="submit">Crear categoría</button>
                </form>
              </details>
            ) : null}
          </section>
        ))}
      </section>
    </main>
  );
}
