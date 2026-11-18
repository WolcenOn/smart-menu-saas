# Fotografías optimizadas para cartas digitales

## Flujo de subida
1. Solo OWNER/EDITOR puede solicitar subida de imagen para un plato de su restaurante.
2. El navegador decodifica JPG/PNG/WebP y reexporta a WebP con ancho/alto máximo 960 px (sin EXIF original).
3. La API valida sesión, tenant, tamaño (600 KB) y limita subidas pendientes a 3 por plato.
4. La API emite URL prefirmada de PUT válida 90 s hacia un key aleatorio de cuarentena.
5. El navegador envía la foto directamente al almacenamiento S3 compatible.
6. La API de finalización comprueba tamaño, Content-Type y decodificación real con Sharp, límite de píxeles y que no sea animada.
7. El servidor **re-codifica** a WebP, guarda bajo una clave interna aleatoria y marca el archivo como imagen del plato en PostgreSQL dentro de una transacción.
8. Las imágenes publicadas se sirven por una ruta del propio servidor **solo si el plato y la carta están publicados**. El bucket permanece privado.

No se aceptan enlaces de imágenes arbitrarios, SVG ni HTML del cliente.

## Railway (servicio web)
Variables privadas:
- S3_BUCKET
- S3_REGION (Cloudflare R2 utiliza habitualmente auto)
- S3_ACCESS_KEY_ID
- S3_SECRET_ACCESS_KEY
- S3_ENDPOINT (solo cuando se usa endpoint S3 compatible; debe ser HTTPS)

Nunca prefijar secretos con NEXT_PUBLIC_. En AWS S3 estándar no hace falta S3_ENDPOINT.

La Content Security Policy genera el origen permitido para connect-src a partir de S3_ENDPOINT o de región y bucket. **El servicio debe recompilarse al cambiar endpoint**. Revisa next.config.ts.

### CORS del bucket
Autorizar solo el origen HTTPS de la aplicación (o localhost del desarrollo), método PUT y cabecera Content-Type. No permitir '*' en el entorno público. El bucket debe permanecer privado.

### Riesgos y límites del piloto
- Falta contador de cuotas de almacenamiento atómico por tenant, limpieza programada de subidas pendientes caducadas y objetos huérfanos tras fallos de red.
- El proxy público de imágenes utiliza ancho de banda del servicio Railway. Incorporar CDN cuando haya tráfico real.
- La descarga de imágenes de S3 se limita a 600 KB por objeto publicado, y su formato es WebP validado.
- No activar subidas para clientes ajenos al piloto sin completar cuotas, backups, rate limiting y monitoreo.

## Verificación
Vitest comprueba dimensiones, límites y claves; GitHub Actions comprueba compilación y Playwright el resto de editor. La subida real requiere credenciales y un bucket de pruebas, y **no se ejecuta en CI sin S3**.
