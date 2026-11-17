# Seguridad — Smart Menu SaaS

## Principios obligatorios

- Nunca utilizar `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`, `new Function` ni `document.write` con datos del usuario. Renderizar texto con JSX; si en el futuro hay HTML enriquecido, exigir revisión de diseño, sanitización especializada y pruebas.
- Prohibido construir SQL mediante concatenación. Usar Prisma y consultas parametrizadas. Evitar `$queryRawUnsafe`.
- Toda operación privada debe verificar sesión, pertenencia al restaurante y rol **en el servidor**. No aceptar `restaurantId` como prueba de autorización.
- Validar datos en servidor con esquemas estrictos (p. ej. Zod), límites de longitud y tipos. La validación frontend solo mejora UX.
- Proteger mutaciones frente a CSRF y verificar origen; cookies HttpOnly, Secure y SameSite. Nunca almacenar tokens de sesión en localStorage.
- Secrets únicamente en entorno de Railway/secret manager; nunca en el repositorio ni en variables `NEXT_PUBLIC_`.
- Fotografías: compresión en navegador para reducir tráfico, subida directa temporal, control de cuota en servidor, validación real del objeto en almacenamiento aislado y publicación solo tras aprobación. No admitir SVG arbitrario.
- No introducir URLs de terceros directamente en `href`, redirecciones o imágenes; permitir protocolos y hosts autorizados.
- QR de precomanda: tokens opacos de alta entropía, expiración, una única confirmación idempotente y revalidación del precio y disponibilidad.
- Mantener alérgenos verificados y separados de etiquetas voluntarias o modificaciones del cliente.
- Prohibido publicar mensajes de error con secretos, SQL o trazas internas.
- Ejecutar análisis estático, pruebas, revisión de dependencias y revisión de permisos antes de fusionar una PR.

## Riesgos y estado de esta rama

Esta rama contiene **solo una pantalla pública estática**, sin login, base de datos ni entrada de datos de clientes. **No está lista para producción SaaS**. La cabecera CSP inicial contiene `unsafe-inline` para compatibilidad; antes de exponer formularios o datos de restaurantes debe endurecerse con nonces/hashes adaptados a Next.js, probarse con la configuración real y revisar todas las fuentes externas. HSTS únicamente cuando el dominio HTTPS definitivo esté configurado correctamente.

## Notificación de vulnerabilidades

No publicar exploits ni credenciales en issues públicos. Contactar de forma privada al responsable del proyecto.
