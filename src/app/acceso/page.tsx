import { signIn } from '@/auth';
import Link from 'next/link';

export default function SignInPage() {
  const enabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET && process.env.AUTH_SECRET);
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link href="/" className="auth-brand">✳ smartmenu</Link>
        <span className="auth-overline">ACCESO PROFESIONAL</span>
        <h1>Bienvenido a tu espacio.</h1>
        <p>Gestiona tus restaurantes y mantén la carta siempre actualizada.</p>
        {enabled ? (
          <form action={async () => { 'use server'; await signIn('google', { redirectTo: '/panel' }); }}>
            <button className="auth-submit" type="submit">Continuar con Google</button>
          </form>
        ) : (
          <p className="auth-alert" role="status">El inicio de sesión aún no está configurado. Activa las credenciales OAuth en Railway para continuar.</p>
        )}
        <small>El acceso a un restaurante requiere una invitación o membresía asignada por su administrador.</small>
      </section>
    </main>
  );
}
