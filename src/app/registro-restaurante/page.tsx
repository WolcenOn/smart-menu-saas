import Link from 'next/link';
import { registrationEnabled } from '@/lib/restaurant-registration';
import { registerRestaurant } from './actions';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ error?: string }> };

export default async function RestaurantRegistrationPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const enabled = registrationEnabled();
  return (
    <main className="auth-page">
      <section className="auth-panel auth-panel--wide">
        <Link href="/" className="auth-brand">✳ smartmenu</Link>
        <span className="auth-overline">ALTA DE RESTAURANTES</span>
        <h1>Tu restaurante, listo para empezar.</h1>
        <p>Crea tu espacio, personaliza la carta y empieza a añadir platos. Sin configuraciones técnicas.</p>
        {!enabled ? (
          <p className="auth-alert" role="status">Las nuevas altas están disponibles por invitación durante el piloto. Contacta con Smart Menu para obtener acceso.</p>
        ) : (
          <>
            {error ? <p className="auth-alert" role="alert">
              {error === 'unavailable' ? 'No hemos podido crear la cuenta. Si ya tienes acceso, entra desde la página de inicio de sesión.' : 'Comprueba los datos y tu código de invitación, e inténtalo de nuevo.'}
            </p> : null}
            <form action={registerRestaurant} className="dashboard-theme-form">
              <label>Nombre del restaurante
                <input name="restaurantName" autoComplete="organization" maxLength={160} minLength={2} required placeholder="Ej. Casa Laurel" />
              </label>
              <label>Tu nombre
                <input name="ownerName" autoComplete="name" maxLength={120} minLength={2} required placeholder="Nombre del propietario" />
              </label>
              <label>Correo electrónico
                <input name="email" type="email" autoComplete="email" maxLength={254} required placeholder="tu@restaurante.com" />
              </label>
              <label>Contraseña
                <input name="password" type="password" autoComplete="new-password" minLength={14} maxLength={100} required aria-describedby="password-guidance" />
              </label>
              <p className="form-hint" id="password-guidance">Mínimo 14 caracteres, con mayúscula, minúscula, número y símbolo.</p>
              <label>Código de invitación al piloto
                <input name="inviteCode" type="text" autoComplete="off" minLength={24} maxLength={200} required />
              </label>
              <button className="auth-submit" type="submit">Crear mi restaurante</button>
            </form>
          </>
        )}
        <p className="registration-switch">¿Ya tienes una cuenta? <Link href="/acceso">Acceder al panel</Link></p>
        <small>Durante el piloto, el registro necesita invitación para evitar cuentas y restaurantes fraudulentos. Google OAuth podrá añadirse después.</small>
      </section>
    </main>
  );
}
