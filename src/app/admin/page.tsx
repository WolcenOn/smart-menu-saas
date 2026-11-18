import Link from 'next/link';
import { prisma } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-session';
import { AdminInvitationForm } from '@/components/admin-invitation-form';
import { logoutAdmin, revokeInvitation } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminHomePage() {
  await requireAdminSession();
  const invites = await prisma.restaurantInvitation.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true, email: true, createdAt: true, expiresAt: true,
      usedAt: true, revokedAt: true, restaurantId: true,
    },
  });
  const now = new Date();
  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <Link href="/" className="auth-brand">✳ smartmenu · admin</Link>
        <form action={logoutAdmin}>
          <button type="submit" className="dashboard-logout">Cerrar sesión</button>
        </form>
      </header>
      <section className="dashboard-body">
        <p className="auth-overline">ADMINISTRACIÓN DE LA PLATAFORMA</p>
        <h1>Invitaciones a restaurantes</h1>
        <p>Genera accesos individuales. Solo tú podrás crear y revocar invitaciones.</p>
        <div className="dashboard-grid admin-invitations-grid">
          <AdminInvitationForm />
          <section className="dashboard-item">
            <h2>Invitaciones recientes</h2>
            {invites.length === 0 ? <p>No hay invitaciones todavía.</p> : (
              <div className="admin-invite-list">
                {invites.map(invite => {
                  const status = invite.revokedAt ? 'Revocada' : invite.usedAt ? 'Utilizada' : invite.expiresAt <= now ? 'Caducada' : 'Pendiente';
                  const pending = status === 'Pendiente';
                  return (
                    <article key={invite.id} className="admin-invite">
                      <strong>{invite.email}</strong>
                      <small>{status} · caduca {invite.expiresAt.toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</small>
                      {pending ? (
                        <form action={revokeInvitation}>
                          <input type="hidden" name="invitationId" value={invite.id} />
                          <button className="dashboard-logout" type="submit">Revocar</button>
                        </form>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
