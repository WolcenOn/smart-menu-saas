import Link from 'next/link';
import { adminEnabled } from '@/lib/invitation-tokens';
import { adminLogin } from './actions';

export const dynamic = 'force-dynamic';
type Props = { searchParams: Promise<{ error?: string }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link href="/" className="auth-brand">✳ smartmenu</Link>
        <span className="auth-overline">ADMINISTRACIÓN DE LA PLATAFORMA</span>
        <h1>Acceso del administrador</h1>
        <p>Un espacio privado para emitir invitaciones individuales. No utiliza las cuentas de los restaurantes.</p>
        {!adminEnabled() ? <p role="status" className="auth-alert">El acceso administrativo todavía no está configurado.</p> : (
          <form action={adminLogin} className="dashboard-theme-form">
            {error ? <p role="alert" className="auth-alert">No se ha podido validar la clave.</p> : null}
            <label>Clave de administración
              <input type="password" name="adminKey" autoComplete="off" minLength={48} maxLength={1024} required />
            </label>
            <button className="auth-submit" type="submit">Entrar en administración</button>
          </form>
        )}
        <small>El acceso caduca después de una hora. Nunca compartas esta clave con los restaurantes.</small>
      </section>
    </main>
  );
}
