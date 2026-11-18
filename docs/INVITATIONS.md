# Invitaciones de un solo uso y administración privada

## Modelo
- Administrador de plataforma: `/admin/acceso`, clave larga `ADMIN_ACCESS_KEY` (mínimo 48 caracteres aleatorios), independiente de las cuentas de propietarios y camareros.
- Cookie de administración firmada con HMAC, HttpOnly, Secure (producción), SameSite Strict; expira tras 1 hora. La firma utiliza tanto `ADMIN_ACCESS_KEY` como `AUTH_SECRET`; rotar cualquiera invalida las sesiones existentes.
- Panel `/admin`: emitir una invitación por email, elegir caducidad (1–168 horas), mostrar el enlace **una sola vez**, consultar estado y revocar.
- Invitaciones: token de 256 bits generado con CSPRNG, en base de datos **solo SHA-256**; email designado, caducidad, usado/revocado, restaurante creado.
- El enlace de invitación sirve para crear el restaurante y el usuario OWNER mediante transacción. En el mismo commit de PostgreSQL se marca el token como consumido.
- Login del restaurante sigue usando Auth.js; no existe una cuenta superadministradora mezclada con los restaurantes.

## Railway, cuando esta PR esté fusionada
1. Mantener `DATABASE_URL` (PostgreSQL privado de Railway), `AUTH_SECRET` y `AUTH_TRUST_HOST=true` bajo HTTPS.
2. Crear una clave aleatoria con `openssl rand -hex 48` y guardarla como **`ADMIN_ACCESS_KEY`**, solo en Railway Variables (no en repositorio ni en chats).
3. **Eliminar `RESTAURANT_SIGNUP_CODE`**; el código compartido queda obsoleto y no es aceptado.
4. Mantener build `npm run build`, pre-deploy `npm run db:migrate`, inicio `npm run start`.
5. Abrir `https://TU-DOMINIO/admin/acceso`. Introducir tu clave. En `/admin`, generar invitación y copiar el enlace; compartirlo en privado con el propietario.
6. El propietario abre su enlace, crea restaurante y cuenta y entra directamente a `/panel`.

## Precauciones
- Los enlaces son credenciales: compartir solo por canales privados. Las rutas con token tienen `Referrer-Policy: no-referrer` y `Cache-Control: no-store`. Evitar analíticas y logs de URL sin redactar.
- La clave del administrador es de alta entropía; **para exposición pública de /admin/acceso, añadir un WAF/rate-limit por IP en el borde y considerar 2FA**. El MVP no implementa un bloqueo distribuido persistente.
- Los tokens no validan automáticamente la propiedad del correo. Antes de un registro abierto/comercial se necesitará verificación de email y envío de correo transaccional.
- Las invitaciones no son recuperables después de crearse; pueden revocarse y sustituirse.
- Rotar `ADMIN_ACCESS_KEY` invalida sesiones administrativas. Para revocar todos los enlaces pendientes, revócalos desde el panel.
