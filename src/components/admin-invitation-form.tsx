'use client';
import { useActionState, useEffect, useState } from 'react';
import { createInvitation, type InviteResult } from '@/app/admin/actions';

const initial: InviteResult = { error: '', path: '', email: '' };

export function AdminInvitationForm() {
  const [result, action, pending] = useActionState(createInvitation, initial);
  const [origin, setOrigin] = useState('');
  useEffect(() => { setOrigin(window.location.origin); }, []);
  return (
    <section className="dashboard-item">
      <h2>Generar invitación</h2>
      <p>Enlace personal, de un solo uso y con fecha de caducidad.</p>
      <form action={action} className="dashboard-theme-form">
        <label>Correo del propietario
          <input name="email" type="email" autoComplete="off" maxLength={254} required placeholder="propietario@restaurante.com" />
        </label>
        <label>Caducidad
          <select name="hours" defaultValue="48">
            <option value="1">1 hora</option>
            <option value="24">24 horas</option>
            <option value="48">48 horas</option>
            <option value="72">72 horas</option>
            <option value="168">7 días</option>
          </select>
        </label>
        <button className="auth-submit" type="submit" disabled={pending}>
          {pending ? 'Creando…' : 'Crear invitación'}
        </button>
      </form>
      {result.error ? <p className="auth-alert" role="alert">{result.error}</p> : null}
      {result.path ? (
        <div className="admin-new-link" role="status">
          <strong>Enlace creado para {result.email}</strong>
          <p>Cópialo ahora. Por seguridad, no volverá a mostrarse al recargar.</p>
          <input readOnly aria-label="Enlace de invitación" value={origin + result.path} onFocus={event => event.currentTarget.select()} />
        </div>
      ) : null}
    </section>
  );
}
