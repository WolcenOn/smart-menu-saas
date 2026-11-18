# Editor de cartas: primera versión funcional

## Incluido
- Acceso por correo y contraseña con Auth.js.
- Panel privado con restaurantes según membresía.
- Categorías creadas por OWNER/EDITOR.
- Creación y modificación de platos con precio decimal, descripción y alérgenos.
- Publicación solo al marcar explícitamente que el restaurante revisó la información alimentaria.
- Cambio de disponibilidad en un clic para OWNER, EDITOR y WAITER.
- Productos SOLD_OUT siempre visibles en carta pública si están publicados, pero no seleccionables en futuros pedidos.
- React muestra nombres y descripciones como texto escapado; no se interpreta HTML de usuarios.
- Temas y diseño del restaurante editables solo con rol autorizado.

## No incluido
- Fotografías y optimización S3, reservas, precomandas o impresión.
- Variantes dietéticas y promociones programadas; fases posteriores.
- Alta de restaurantes y cuentas desde UI: se usa bootstrap explícito de propietario.
- Sesión/contraseña recuperable automáticamente; acceso limitado a pilotos autorizados.

## Normas de seguridad
- Cada Server Action exige sesión y rol en el servidor.
- Todas las operaciones verifican que IDs de menú, categoría o plato pertenecen al restaurante actual.
- Validación estricta con Zod, precios normalizados, lista cerrada de 14 alérgenos.
- No hay HTML enriquecido ni CSS arbitrario.
- Prohibido crear usuarios públicos.
- No desplegar para clientes reales sin configurar rate limiting por IP, endurecer CSP y revisar la gestión de credenciales.

## Pruebas
GitHub Actions ejecuta TypeScript, ESLint, Vitest, compilación, migración PostgreSQL, Playwright y auditoría.
Los E2E contienen una cuenta de pruebas aislada SOLO en CI.

## Siguientes entregas
- Subida segura de imágenes optimizadas y almacenamiento compatible S3.
- Etiquetas dietéticas y variantes.
- Horarios y ofertas.
- Precomandas QR con cola de impresión.
