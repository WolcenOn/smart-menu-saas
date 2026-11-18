# Acceso básico para demo y migración a OAuth

## Qué funciona
- Inicio de sesión con correo/contraseña mediante Auth.js Credentials.
- Sesión JWT firmada por Auth.js con AUTH_SECRET. Caduca en 24 horas.
- Hash bcrypt (coste 12); jamás guardar la contraseña en texto plano.
- Cinco errores consecutivos bloquean temporalmente el usuario (15 minutos). Esta protección **no sustituye** rate limiting por IP delante del servicio para un despliegue público.
- No hay registro público, restablecimiento de contraseña ni contraseñas predefinidas.
- Se conservan las tablas de Auth.js para añadir Google OAuth más adelante.

## Configuración Railway
1. Añadir AUTH_SECRET (valor aleatorio de al menos 32 bytes) y AUTH_TRUST_HOST=true solo detrás del proxy HTTPS de Railway.
2. DATABASE_URL debe apuntar a PostgreSQL privado de Railway.
3. Mantener Build: npm run build; Pre-deploy: npm run db:migrate; Start: npm run start.
4. No activar E2E_TEST_SEED fuera de la base CI.
5. Ejecutar bootstrap **una sola vez** desde un terminal seguro en un entorno de pruebas con variables temporales BOOTSTRAP_CONFIRM=CREATE_FIRST_OWNER, BOOTSTRAP_EMAIL, BOOTSTRAP_PASSWORD, BOOTSTRAP_RESTAURANT_NAME y BOOTSTRAP_RESTAURANT_SLUG, mediante npm run bootstrap:demo.
6. Borrar inmediatamente todas las variables BOOTSTRAP_* después de ejecutar el comando. Nunca poner la contraseña en un archivo del repositorio, comandos de CI ni logs.
7. Entrar por /acceso, editar en /panel y consultar /r/slug.

## Advertencias de seguridad
- Configurar TLS, rate limiting por IP/WAF y medidas de monitorización en el proveedor. El bloqueo de cuenta puede ser abusado por terceros y no evita fuerza bruta distribuida.
- OAuth posterior: habilitar credenciales Google en Auth.js y vincular cuentas por identidad verificada mediante un proceso explícito y seguro. No autoasignar permisos por email.
- No se han implementado autoservicio de contraseñas, correo de recuperación ni MFA: limitar al piloto con usuarios de confianza.
- El bootstrap rechaza usuarios/restaurantes existentes y nunca modifica una contraseña existente.
- Revisar cabeceras CSP y lockfile reproducible antes de acceso abierto a clientes reales.
