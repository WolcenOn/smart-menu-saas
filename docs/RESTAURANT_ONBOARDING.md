# Alta de restaurantes mediante invitaciones

## Propietario
1. El administrador crea un enlace individual para el correo invitado en `/admin`.
2. El restaurante abre el enlace `/registro-restaurante/<token>` antes de que caduque.
3. El propietario introduce nombre del restaurante, su nombre y contraseña. El correo está vinculado a la invitación.
4. PostgreSQL consume el token **una sola vez** en la misma transacción que crea User, Restaurant, OWNER y carta inicial.
5. Auth.js inicia sesión automáticamente y abre `/panel`.

El enlace no puede reutilizarse y nunca se almacena sin hashing. El menú `/registro-restaurante` sin token informa de que se requiere invitación.

## Administración
- `/admin/acceso`: acceso con clave larga y cookie independiente de los restaurantes, válida 1 hora.
- `/admin`: crear invitación con caducidad de 1 a 168 horas, copiarla una vez y revocar invitaciones pendientes.
- La clave nunca se muestra al restaurante ni se guarda en PostgreSQL.

## Railway
Conservar `DATABASE_URL`, `AUTH_SECRET` y `AUTH_TRUST_HOST=true` detrás del proxy HTTPS. Añadir `ADMIN_ACCESS_KEY` (secreto aleatorio, por ejemplo `openssl rand -hex 48`). Eliminar `RESTAURANT_SIGNUP_CODE`, que ya no es válido.

Build: `npm run build`, predeploy: `npm run db:migrate`, start: `npm run start`. Es necesaria la migración de `RestaurantInvitation`.

## Límites del piloto
Implementar rate limiting/WAF por IP, notificaciones por correo y verificación de titularidad del email antes del registro público. Los enlaces son credenciales: compartir en privado y evitar guardar rutas completas en herramientas de analítica o logs públicos. Para instrucciones ampliadas, ver `docs/INVITATIONS.md`.
