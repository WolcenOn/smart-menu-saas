# Identidad y aislamiento por restaurante — fase 1

Se utiliza Auth.js con PrismaAdapter y sesiones persistidas en PostgreSQL.

## Inicio de sesión (Google OAuth)
Configura en Railway, **nunca en Git**:
- `AUTH_SECRET`: secreto aleatorio largo generado con el procedimiento de Auth.js.
- `AUTH_GOOGLE_ID` y `AUTH_GOOGLE_SECRET`: OAuth client registrado en Google Cloud.
- `AUTH_TRUST_HOST=true` únicamente detrás del proxy HTTPS fiable de Railway.

URI de callback de Google OAuth: `https://TU-DOMINIO/api/auth/callback/google`.

La aplicación no ofrece contraseñas propias, no almacena hashes de contraseñas y no usa credenciales de prueba. Sin estas variables, no habilita el acceso OAuth.

## Roles y control de acceso
- `OWNER`: editar carta, tema, disponibilidad y miembros.
- `EDITOR`: editar carta, tema y disponibilidad.
- `WAITER`: consultar panel y cambiar disponibilidad (fase posterior).
- Usuario sin membresía: acceso denegado al restaurante.

No se crea automáticamente un restaurante al registrarse: un operador de confianza debe asignar la membresía, mediante una futura herramienta administrativa segura. **Nunca convertir al primer usuario registrado en administrador automáticamente.**

La verificación de pertenencia ocurre en el servidor. Para futuras mutaciones usar `requireRestaurantPermission(restaurantId, action)` en cada operación, Zod para datos, comprobaciones CSRF/Origin y condiciones de carrera. No confiar solo en redirecciones o controles visuales.

## Restricciones de esta fase
- No existe editor ni API pública de escritura.
- No hay alta de restaurante automática ni asignación de permisos desde navegador.
- No se permite gestión de miembros todavía.
- Revisar login OAuth, cookies y producción antes de admitir clientes reales.
