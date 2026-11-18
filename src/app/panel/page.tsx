import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/current-user';
import { canPerform } from '@/lib/permissions';
import { signOut } from '@/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/acceso');

  const memberships = await prisma.restaurantMember.findMany({
    where: { userId },
    select: { role: true, restaurant: { select: { id: true, name: true, slug: true, themePreset: true } } },
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
        <h1>Mis restaurantes</h1>
        <p>Únicamente se muestran los restaurantes a los que tienes acceso.</p>
        {memberships.length === 0
          ? <div className="dashboard-empty">Tu cuenta está autenticada, pero todavía no tiene restaurantes asignados. Solicita acceso al administrador de la plataforma.</div>
          : <div className="dashboard-grid">
              {memberships.map(({ role, restaurant }) => (
                <article className="dashboard-item" key={restaurant.id}>
                  <div><span className="dashboard-role">{role === 'OWNER' ? 'Propietario' : role === 'EDITOR' ? 'Editor' : 'Camarero'}</span><h2>{restaurant.name}</h2></div>
                  <p>Plantilla: {restaurant.themePreset}</p>
                  <Link href={`/r/${restaurant.slug}`}>Ver carta pública</Link>
                  {canPerform(role, 'manageTheme') ? <p>Personalización editable: próxima iteración.</p> : null}
                </article>
              ))}
            </div>
        }
      </section>
    </main>
  );
}
