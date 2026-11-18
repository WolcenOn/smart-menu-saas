# Historial y gestión de usuarios de restaurantes

El administrador entra en `/admin/acceso` mediante `ADMIN_ACCESS_KEY`, y gestiona usuarios desde `/admin`.

## Información disponible
- Historial de invitaciones: email, estado, fecha de creación y **nombre del restaurante** cuando se ha completado.
- Usuarios: nombre, correo, cada restaurante asociado y rol OWNER/EDITOR/WAITER.
- Estados de acceso: activo, pausado y acceso eliminado.
- Historial de operaciones del administrador: pausa, reactivación y eliminación de acceso, con fecha.
- Vista limitada a 200 cuentas, 200 invitaciones y los 100 eventos más recientes; se ampliará con paginación.

## Acciones
- **Pausar**: bloquea futuros logins y todas las rutas privadas incluso para sesiones JWT existentes.
- **Reactivar**: permite entrar de nuevo con las credenciales anteriores y reinicia contadores de bloqueo.
- **Eliminar acceso**: requiere escribir el correo completo, desactiva el acceso permanentemente, borra el hash de la contraseña y elimina vínculos OAuth de esa cuenta. No borra las cartas, restaurantes ni el historial para evitar pérdida accidental de datos. Una cuenta archivada no puede reactivarse desde este panel.
- Toda operación exige una sesión administrativa válida, comprueba transiciones en PostgreSQL y crea `AdminAuditEvent` en la misma transacción.

**Importante:** eliminar acceso es una baja lógica, **no una eliminación definitiva de datos personales**. Una futura función de supresión conforme al RGPD necesitará su propio flujo de borrado/anonymización con políticas de conservación, copias de seguridad y dependencias.

## Acceso: diagnóstico en Railway
Si un restaurante ya se registró y aparece en este panel, comprueba:
1. Su estado es **Activo**.
2. Correo exacto de su cuenta. No crear otra invitación con el mismo correo.
3. Que `DATABASE_URL` apunta al PostgreSQL que contiene la cuenta, que `AUTH_SECRET` es estable y que `AUTH_TRUST_HOST=true` solo se usa tras proxy HTTPS confiable.
4. Si el login sigue fallando, consulta Railway → servicio web → Logs y busca `[restaurant-login]`. Se registra únicamente el **tipo** de error Auth.js, sin correos, contraseñas ni tokens.
5. Si se han producido al menos cinco intentos fallidos, espera 15 minutos sin repetirlos.

## Railway
Esta fase añade campos `User.suspendedAt`, `User.deletedAt` y la tabla `AdminAuditEvent`. Ejecutar `npm run db:migrate` antes de arrancar la nueva versión. No requiere variables nuevas.
