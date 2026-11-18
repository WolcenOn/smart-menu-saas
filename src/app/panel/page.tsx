import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/current-user';
import { canPerform } from '@/lib/permissions';
import { signOut } from '@/auth';
import { updateRestaurantTheme } from './actions';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/acceso');
  const memberships = await prisma.restaurantMember.findMany({
    where: { userId },
    select: {
      role: true,
      restaurant: { select: { id: true, name: true, slug: true, themePreset: true, menuLayout: true, tagline: true,
        menus: { select: { published: true, categories: { select: { dishes: { select: { status: true, availability: true } } } } } },
      } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <Link href="/" className="auth-brand">✳ smartmenu</Link>
        <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }); }}>
          <button type="submit" className="dashboard-logout">Cerrar sesión</button>
        </form>
      </header>
      <section className="dashboard-body">
        <p className="auth-overline">PANEL PROFESIONAL</p>
        <div className="dashboard-intro">
          <div>
            <h1>Tu espacio de trabajo</h1>
            <p>Gestiona tus platos, comprueba qué ve el cliente y personaliza tu restaurante desde un mismo lugar.</p>
          </div>
          <span className="dashboard-context">{memberships.length} {memberships.length === 1 ? 'restaurante asignado' : 'restaurantes asignados'}</span>
        </div>
        {memberships.length === 0
          ? <div className="dashboard-empty">Tu cuenta todavía no tiene restaurantes asignados. Solicita acceso al administrador.</div>
          : <div className="dashboard-grid">
              {memberships.map(({ role, restaurant }) => {
                const dishes = restaurant.menus.flatMap(menu => menu.categories.flatMap(category => category.dishes));
                const published = dishes.filter(dish => dish.status === 'PUBLISHED').length;
                const soldOut = dishes.filter(dish => dish.status === 'PUBLISHED' && dish.availability === 'SOLD_OUT').length;
                return (
                <article className="dashboard-item" key={restaurant.id}>
                  <div className="dashboard-restaurant-title">
                    <span className="dashboard-role">{role === 'OWNER' ? 'Propietario' : role === 'EDITOR' ? 'Editor' : 'Camarero'}</span>
                    <h2>{restaurant.name}</h2>
                  </div>
                  <div className="dashboard-kpis" aria-label={'Resumen de ' + restaurant.name}>
                    <div><strong>{dishes.length}</strong><span>Platos totales</span></div>
                    <div><strong>{published}</strong><span>Publicados</span></div>
                    <div><strong>{soldOut}</strong><span>Agotados</span></div>
                  </div>
                  {dishes.length === 0 ? (
                    <p className="dashboard-onboarding-hint">Empieza por añadir tu primer plato. Tu carta pública estará lista cuando publiques los productos.</p>
                  ) : published === 0 ? (
                    <p className="dashboard-onboarding-hint">Ya tienes platos en borrador. Revisa los alérgenos y publícalos para que aparezcan en la carta.</p>
                  ) : null}
                  <div className="dashboard-card-actions">
                    <Link href={'/panel/restaurantes/' + restaurant.id} className="editor-primary editor-link">Editar carta <span aria-hidden="true">→</span></Link>
                    <Link href={'/r/' + restaurant.slug} className="dashboard-secondary-link" target="_blank" rel="noopener noreferrer">Ver carta pública <span aria-hidden="true">↗</span></Link>
                  </div>
                  {canPerform(role, 'manageTheme') ? (
                    <details className="dashboard-customize">
                      <summary>Personalizar apariencia <span aria-hidden="true">⌄</span></summary>
                      <p>Elige la presentación que mejor encaje con tu restaurante. Puedes cambiarla cuando quieras.</p>
                      <form action={updateRestaurantTheme} className="dashboard-theme-form">
                      <input type="hidden" name="restaurantId" value={restaurant.id} />
                      <label>Estilo de carta
                        <select name="preset" defaultValue={restaurant.themePreset}>
                          <option value="OLIVE">Oliva</option>
                          <option value="TERRACOTTA">Terracota</option>
                          <option value="OCEAN">Atlántico</option>
                          <option value="NOIR">Noche</option>
                        </select>
                      </label>
                      <label>Presentación
                        <select name="layout" defaultValue={restaurant.menuLayout}>
                          <option value="CARDS">Tarjetas</option>
                          <option value="LIST">Lista</option>
                        </select>
                      </label>
                      <label>Eslogan
                        <input name="tagline" type="text" maxLength={180} defaultValue={restaurant.tagline} />
                      </label>
                      <button className="auth-submit" type="submit">Guardar apariencia</button>
                      </form>
                    </details>
                  ) : (
                    <p className="dashboard-permissions-hint">Tu cuenta permite gestionar disponibilidad, pero el diseño de la carta lo cambia el propietario o editor.</p>
                  )}
                </article>
              ); })}
            </div>
        }
      </section>
    </main>
  );
}
