import Link from 'next/link';
import { prisma } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-session';
import { accountStatus } from '@/lib/account-status';
import { AdminInvitationForm } from '@/components/admin-invitation-form';
import { logoutAdmin, revokeInvitation, changeAccountAccess } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminHomePage() {
  await requireAdminSession();

  const [invites, users, events, restaurantCount] = await Promise.all([
    prisma.restaurantInvitation.findMany({
      orderBy: { createdAt: 'desc' }, take: 200,
      select: {
        id: true, email: true, createdAt: true, expiresAt: true,
        usedAt: true, revokedAt: true, restaurantId: true,
      },
    }),
    prisma.user.findMany({
      orderBy: { email: 'asc' }, take: 200,
      select: {
        id: true, name: true, email: true, suspendedAt: true, deletedAt: true, lockedUntil: true,
        memberships: {
          select: {
            role: true, createdAt: true,
            restaurant: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    }),
    prisma.adminAuditEvent.findMany({
      orderBy: { createdAt: 'desc' }, take: 100,
      select: { id: true, action: true, email: true, createdAt: true },
    }),
    prisma.restaurant.count(),
  ]);
  const attachedRestaurants = await prisma.restaurant.findMany({
    where: { id: { in: invites.flatMap(i => i.restaurantId ? [i.restaurantId] : []) } },
    select: { id: true, name: true },
  });
  const restaurantNames = new Map(attachedRestaurants.map(r => [r.id, r.name]));
  const now = new Date();
  const activeAccounts = users.filter(user => accountStatus(user) === 'ACTIVE').length;

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
        <h1>Restaurantes y cuentas</h1>
        <p>Gestiona los accesos y consulta el historial sin perder las cartas de los restaurantes.</p>

        <div className="admin-summary">
          <div><span>Restaurantes registrados</span><strong>{restaurantCount}</strong></div>
          <div><span>Usuarios mostrados</span><strong>{users.length}</strong></div>
          <div><span>Cuentas activas mostradas</span><strong>{activeAccounts}</strong></div>
        </div>

        <section className="admin-invitations-grid">
          <AdminInvitationForm />
          <section className="dashboard-item">
            <h2>Historial de invitaciones</h2>
            <p>Incluye invitaciones utilizadas, caducadas y revocadas.</p>
            {invites.length === 0 ? <p>No hay invitaciones todavía.</p> : (
              <div className="admin-invite-list">
                {invites.map(invite => {
                  const status = invite.revokedAt ? 'Revocada' : invite.usedAt ? 'Utilizada' : invite.expiresAt <= now ? 'Caducada' : 'Pendiente';
                  const restaurantName = invite.restaurantId ? restaurantNames.get(invite.restaurantId) : undefined;
                  return (
                    <article key={invite.id} className="admin-invite">
                      <strong>{restaurantName ?? 'Restaurante pendiente de alta'}</strong>
                      <span>{invite.email}</span>
                      <small>{status} · creada {invite.createdAt.toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</small>
                      <small>Caduca {invite.expiresAt.toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</small>
                      {status === 'Pendiente' ? (
                        <form action={revokeInvitation}>
                          <input type="hidden" name="invitationId" value={invite.id} />
                          <button className="dashboard-logout" type="submit">Revocar invitación</button>
                        </form>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </section>

        <section className="admin-accounts-section" aria-label="Gestión de usuarios">
          <div className="editor-section-title"><h2>Usuarios registrados</h2><span>Se muestran hasta 200 cuentas</span></div>
          {users.length === 0 ? <p>No hay usuarios registrados.</p> : (
            <div className="admin-account-list">
              {users.map(user => {
                const status = accountStatus(user);
                return (
                  <article className="admin-account" key={user.id} aria-label={'Cuenta de ' + user.email}>
                    <div className="admin-account-main">
                      <div className="admin-dish-title">
                        <strong>{user.name || 'Sin nombre'}</strong>
                        <span className={'admin-account-status admin-account-status-' + status.toLowerCase()}>
                          {status === 'ACTIVE' ? 'Activo' : status === 'PAUSED' ? 'Pausado' : 'Acceso eliminado'}
                        </span>
                      </div>
                      <p>{user.email}</p>
                      {status === 'ACTIVE' && user.lockedUntil && user.lockedUntil > now ? <small>Bloqueada temporalmente hasta {user.lockedUntil.toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</small> : null}
                      {user.memberships.length === 0 ? <small>Sin restaurante asignado</small> : (
                        <div className="admin-user-restaurants">
                          {user.memberships.map(member => (
                            <div key={member.restaurant.id}>
                              <strong>{member.restaurant.name}</strong>
                              <small>{member.role} · alta {member.createdAt.toLocaleDateString('es-ES')}</small>
                              <Link href={'/r/' + member.restaurant.slug}>Ver carta</Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {status !== 'REMOVED' ? (
                      <div className="admin-account-actions">
                        {status === 'ACTIVE' && user.lockedUntil && user.lockedUntil > now ? (
                          <form action={changeAccountAccess}>
                            <input type="hidden" name="userId" value={user.id} />
                            <input type="hidden" name="accessAction" value="unlock" />
                            <button className="dashboard-logout" type="submit">Desbloquear cuenta</button>
                          </form>
                        ) : null}
                        <form action={changeAccountAccess}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="accessAction" value={status === 'PAUSED' ? 'resume' : 'pause'} />
                          <button className="dashboard-logout" type="submit">
                            {status === 'PAUSED' ? 'Reactivar acceso' : 'Pausar acceso'}
                          </button>
                        </form>
                        <details className="admin-remove-details">
                          <summary>Eliminar acceso definitivamente</summary>
                          <p>Se desactivará la cuenta y no podrá volver a iniciar sesión. La carta y el historial se conservarán.</p>
                          <form action={changeAccountAccess}>
                            <input type="hidden" name="userId" value={user.id} />
                            <input type="hidden" name="accessAction" value="remove" />
                            <label>Escribe exactamente el correo para confirmar:
                              <input name="confirmEmail" type="email" required placeholder={user.email} />
                            </label>
                            <button className="editor-toggle editor-toggle-stop" type="submit">Confirmar eliminación del acceso</button>
                          </form>
                        </details>
                      </div>
                    ) : <small>Cuenta archivada. Historial conservado.</small>}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="admin-accounts-section" aria-label="Historial de acciones administrativas">
          <div className="editor-section-title"><h2>Historial de acciones</h2><span>Últimos 100 eventos</span></div>
          {events.length === 0 ? <p>Todavía no hay cambios de acceso registrados.</p> : (
            <div className="admin-event-list">
              {events.map(event => (
                <div key={event.id}>
                  <span>{event.action === 'ACCOUNT_PAUSED' ? 'Pausado' : event.action === 'ACCOUNT_RESUMED' ? 'Reactivado' : event.action === 'ACCOUNT_ACCESS_REMOVED' ? 'Acceso eliminado' : event.action === 'ACCOUNT_UNLOCKED' ? 'Desbloqueado' : event.action}</span>
                  <strong>{event.email}</strong>
                  <small>{event.createdAt.toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</small>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
