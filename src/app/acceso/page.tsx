import { signIn } from '@/auth';
import Link from 'next/link';
import { loginWithPassword } from './actions';

type Props = { searchParams: Promise<{ error?: string; created?: string }> };

export default async function SignInPage({ searchParams }: Props) {
  const { error, created } = await searchParams;
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link href="/" className="auth-brand">✳ smartmenu</Link>
        <span className="auth-overline">ACCESO PROFESIONAL</span>
        <h1>Bienvenido a tu espacio.</h1>
        <p>Accede a tu restaurante para actualizar platos, alérgenos y disponibilidad.</p>
        {created === '1' ? <p className="auth-success" role="status">Tu cuenta y tu restaurante se han creado correctamente. Accede con el mismo correo y contraseña para abrir el panel. No necesitas otra invitación.</p> : null}
        {error ? <p className="auth-alert" role="alert">No hemos podido iniciar sesión. Comprueba el correo y la contraseña. Si has probado varias veces, espera 15 minutos antes de volver a intentarlo. Si persiste, solicita al administrador que compruebe el estado de tu cuenta.</p> : null}
        <form action={loginWithPassword} className="dashboard-theme-form">
          <label>Correo electrónico
            <input type="email" name="email" autoComplete="username" required maxLength={254} />
          </label>
          <label>Contraseña
            <input type="password" name="password" autoComplete="current-password" required minLength={1} maxLength={200} />
          </label>
          <button className="auth-submit" type="submit">Entrar al panel</button>
        </form>
        {googleEnabled ? (
          <form action={async () => { 'use server'; await signIn('google', { redirectTo: '/panel' }); }}>
            <button className="dashboard-logout" type="submit">Continuar con Google</button>
          </form>
        ) : null}
        <p className="registration-switch">¿Aún no tienes restaurante? <Link href="/registro-restaurante">Crear mi restaurante</Link></p>
        <small>Si eres parte del equipo de un restaurante, accede con la cuenta facilitada por su propietario.</small>
      </section>
    </main>
  );
}
