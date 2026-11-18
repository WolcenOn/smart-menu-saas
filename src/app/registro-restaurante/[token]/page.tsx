import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { hashInvitationToken, invitationRawTokenSchema } from '@/lib/invitation-tokens';
import { registerRestaurant } from '../actions';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = { params: Promise<{ token: string }>; searchParams: Promise<{ error?: string }> };

export default async function InvitationRegistrationPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { error } = await searchParams;
  if (!invitationRawTokenSchema.safeParse(token).success) notFound();
  const invitation = await prisma.restaurantInvitation.findUnique({
    where: { tokenHash: hashInvitationToken(token) },
    select: { email: true, usedAt: true, revokedAt: true, expiresAt: true },
  });
  const valid = invitation && !invitation.usedAt && !invitation.revokedAt && invitation.expiresAt > new Date();

  return (
    <main className="auth-page">
      <section className="auth-panel auth-panel--wide">
        <Link href="/" className="auth-brand">✳ smartmenu</Link>
        <span className="auth-overline">INVITACIÓN PARA RESTAURANTES</span>
        <h1>Tu restaurante, listo para empezar.</h1>
        {!valid ? <p className="auth-alert" role="alert">Este enlace ha caducado, ya se ha utilizado o ha sido revocado. Solicita uno nuevo.</p> : (
          <>
            <p>Tu invitación es para <strong>{invitation.email}</strong>. Crea tu cuenta y accede directamente al editor de tu carta.</p>
            {error ? (
              <p className="auth-alert" role="alert">
                {error === 'password'
                  ? 'La contraseña debe tener entre 14 y 100 caracteres, con al menos una mayúscula, una minúscula, un número y un símbolo. La invitación sigue disponible.'
                  : error === 'details'
                    ? 'Comprueba el nombre del restaurante, tu nombre y los datos del formulario. La invitación sigue disponible.'
                    : error === 'existing-email'
                      ? 'Este correo ya está registrado. Accede con tu cuenta o solicita recuperar la contraseña.'
                      : error === 'invalid-invitation'
                        ? 'Esta invitación ya no es válida. Solicita una nueva al administrador.'
                        : 'No se ha podido completar el registro. No se ha creado la cuenta. Inténtalo de nuevo.'}
              </p>
            ) : null}
            <form action={registerRestaurant} className="dashboard-theme-form">
              <input type="hidden" name="token" value={token} />
              <label>Nombre del restaurante
                <input name="restaurantName" autoComplete="organization" maxLength={160} minLength={2} required placeholder="Ej. Casa Laurel" />
              </label>
              <label>Tu nombre
                <input name="ownerName" autoComplete="name" maxLength={120} minLength={2} required />
              </label>
              <label>Correo invitado
                <input name="email" type="email" value={invitation.email} readOnly />
              </label>
              <label>Contraseña
                <input name="password" type="password" autoComplete="new-password" minLength={14} maxLength={100} required pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{14,100}" title="Entre 14 y 100 caracteres, con mayúscula, minúscula, número y símbolo" aria-describedby="password-guidance" />
              </label>
              <p className="form-hint" id="password-guidance">Mínimo 14 caracteres, con mayúscula, minúscula, número y símbolo.</p>
              <button className="auth-submit" type="submit">Crear restaurante y acceder</button>
            </form>
          </>
        )}
        <p className="registration-switch">¿Ya tienes cuenta? <Link href="/acceso">Acceder</Link></p>
      </section>
    </main>
  );
}
