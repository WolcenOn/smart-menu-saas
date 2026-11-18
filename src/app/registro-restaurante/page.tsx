import Link from 'next/link';

export default function RestaurantRegistrationLanding() {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link href="/" className="auth-brand">✳ smartmenu</Link>
        <span className="auth-overline">ALTA DE RESTAURANTES</span>
        <h1>Tu restaurante merece una gran carta.</h1>
        <p>Durante nuestro piloto, los restaurantes se registran mediante un enlace de invitación personal enviado por Smart Menu.</p>
        <p className="auth-alert" role="status">¿Has recibido una invitación? Abre el enlace que te han facilitado para crear tu cuenta.</p>
        <p className="registration-switch">¿Ya tienes acceso? <Link href="/acceso">Entrar al panel</Link></p>
      </section>
    </main>
  );
}
