# Seguridad — Smart Menu SaaS

## Reglas de desarrollo

- No usar `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`, `new Function` ni `document.write` para contenido externo. Mostrar nombres, platos y observaciones mediante JSX (escapado de React).
- No interpolar SQL. Utilizar Prisma, filtros y consultas parametrizadas; nunca `$queryRawUnsafe` con entradas externas.
- Antes de crear **cualquier** endpoint de escritura, implementar autenticación, pertenencia al restaurante, permisos por rol y protección CSRF en servidor.
- Validar toda entrada en el servidor (tipos, longitud, cuotas y relaciones). Usar Zod al introducir mutaciones.
- Cookies de sesión `HttpOnly`, `Secure` y `SameSite`. Nada de tokens de sesión en localStorage.
- No subir originales a Next.js: optimizar imágenes en navegador y usar subida directa al bucket con autorización temporal, validación real y almacenamiento aislado. No admitir SVG arbitrario.
- No aceptar URL arbitraria de cliente como destino de redirección, imagen o petición a servidor; aplicar allowlists y protocolos HTTPS.
- Para QR de precomanda: token opaco de alta entropía, caducidad, idempotencia y revalidación de precio/disponibilidad.
- Las etiquetas dietéticas y los alérgenos deben ser confirmados, nunca inferidos a partir de textos libres.
- Evitar errores que expongan secretos, SQL o trazas. Los logs no deben almacenar datos personales innecesarios.
- Revisar permisos por tenant y ejecutar CI y auditoría antes de fusionar.

## Estado actual

Esta rama introduce **solo lecturas públicas**. La lógica de disponibilidad visible se consulta desde PostgreSQL. No hay editor ni endpoint que permita editar restaurantes sin autorización.

El `next.config.ts` actual incluye una **CSP provisional con `unsafe-inline`**, por compatibilidad inicial. Esto **no es una CSP estricta**. Antes de lanzar usuarios reales, implementar una política con nonces/hashes adecuada para la versión instalada de Next.js y probar en Chromium/WebKit; añadir HSTS solo cuando HTTPS y el dominio estén bien configurados.

Se proporciona un plato con texto hostil únicamente en la semilla E2E opcional. Nunca activar `E2E_TEST_SEED=1` en producción.

El control de revisión de alérgenos es una base técnica; **no acredita por sí mismo cumplimiento legal**. Un responsable del restaurante debe validar los datos y las variantes de cada plato.

## Notificación privada

No comunicar vulnerabilidades ni secretos mediante issues públicos. Contactar por un canal privado al responsable del repositorio.
