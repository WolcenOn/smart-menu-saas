import { signIn } from '@/auth';
import Link from 'next/link';
import { loginWithPassword } from './actions';

type Props = { searchParams: Promise<{ error?: string }> };

export default async function SignInPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link href="/" className="auth-brand">✳ smartmenu</Link>
        <span className="auth-overline">ACCESO PROFESIONAL</span>
        <h1>Bienvenido a tu espacio.</h1>
        <p>Accede a tu restaurante para actualizar platos, alérgenos y disponibilidad.</p>
        {error ? <p className="auth-alert" role="alert">No se ha podido iniciar sesión. Comprueba los datos o vuelve a intentarlo más tarde.</p> : null}
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
        <small>No hay registro público. El acceso se asigna por el administrador del sistema.</small>
      </section>
    </main>
  );
}
