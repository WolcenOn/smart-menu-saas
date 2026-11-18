# Identidad y aislamiento por restaurante

Se utiliza Auth.js con PrismaAdapter y sesiones en PostgreSQL.

## Configurar OAuth en Railway

En las variables privadas del servicio web:
- AUTH_SECRET: secreto criptográfico aleatorio largo según Auth.js.
- AUTH_GOOGLE_ID y AUTH_GOOGLE_SECRET: credenciales de Google Cloud.
- AUTH_TRUST_HOST=true solo con el proxy HTTPS fiable de Railway.

Registrar callback en Google Cloud: https://TU-DOMINIO/api/auth/callback/google

Sin configurar OAuth no aparece una alternativa de contraseña insegura.

## Roles y permisos

- OWNER: puede gestionar carta, temas, disponibilidad y miembros (cuando se implemente).
- EDITOR: puede gestionar carta, temas y disponibilidad.
- WAITER: solo consultar panel y cambiar agotados (cuando se implemente).

La membresía se asigna explícitamente en RestaurantMember. No existe autoasignación como propietario ni alta automática de restaurantes.

## Editor de apariencia

El panel muestra un formulario de temas únicamente para OWNER y EDITOR. La Server Action vuelve a comprobar membresía y rol en PostgreSQL mediante updateMany restringido. Zod limita presets, layout y eslogan; no se admite CSS o HTML personalizado. Las operaciones fallan cerradas.

La protección de Server Actions frente a CSRF depende de la validación de Origin de Next.js, y debe verificarse con el proxy/host real de Railway.

## Pendientes

No hay API de alta de restaurantes, invitaciones, gestión de usuarios, imágenes ni editor de productos. Probar OAuth real y cookies antes de abrir a clientes.
