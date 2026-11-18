'use client';

import { useActionState } from 'react';
import { resetOwnerPassword, type PasswordResetResult } from '@/app/admin/actions';

const initial: PasswordResetResult = { error: '', password: '' };

export function AdminPasswordReset({ userId, email }: { userId: string; email: string }) {
  const [result, action, pending] = useActionState(resetOwnerPassword, initial);
  return (
    <details className="admin-remove-details">
      <summary>Recuperar acceso · contraseña nueva</summary>
      <p>Para cuentas activas que no pueden iniciar sesión. Se genera una contraseña temporal nueva que solo se muestra una vez. El restaurante y sus cartas se conservan.</p>
      <form action={action}>
        <input type="hidden" name="userId" value={userId} />
        <label>Confirma el correo de esta cuenta
          <input name="confirmEmail" type="email" placeholder={email} required autoComplete="off" />
        </label>
        <button type="submit" className="dashboard-logout" disabled={pending}>
          {pending ? 'Generando…' : 'Generar contraseña nueva'}
        </button>
      </form>
      {result.error ? <p role="alert" className="auth-alert">{result.error}</p> : null}
      {result.password ? (
        <div className="admin-new-link" role="status">
          <strong>Contraseña nueva generada</strong>
          <p>Cópiala ahora y entrégala únicamente al propietario por un canal privado. La anterior ya no funciona. No vuelvas a generar otra sin necesidad.</p>
          <input aria-label="Nueva contraseña del propietario" readOnly value={result.password}
            onFocus={event => event.currentTarget.select()} />
        </div>
      ) : null}
    </details>
  );
}
