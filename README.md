# Smart Menu SaaS

Plataforma SaaS de cartas digitales inteligentes para restaurantes.

## Estado
**MVP de demostración en desarrollo (PR apiladas).** El catálogo público, temas visuales y editor de cartas están implementados en las ramas de desarrollo. No se ha realizado el despliegue público de estas funcionalidades.

## Funcionalidades del piloto
- Temas de carta: Oliva, Terracota, Atlántico y Noche; tarjetas/lista.
- Acceso con correo y contraseña por Auth.js (migrable a OAuth).
- Restaurante asignado mediante membresía explícita OWNER/EDITOR/WAITER.
- Panel privado: crear categorías, añadir/editar platos, precios y descripción.
- Los 14 alérgenos de declaración obligatoria y casilla de revisión antes de publicar.
- Botón de disponibilidad: **AGOTADO** permanece visible en carta pública.
- Protección por servidor y tenant en acciones de escritura.
- Vitest, Playwright escritorio/móvil y GitHub Actions con PostgreSQL.

## Desarrollo local
Requiere Node.js 22+, npm y PostgreSQL.

```bash
npm install
npx prisma generate
npm run db:migrate
npm run db:seed
npm run dev
```

Configurar `DATABASE_URL`, `AUTH_SECRET` y `AUTH_TRUST_HOST=true` para el entorno local detrás de un host confiable.

Para crear el primer propietario en un **entorno privado de pruebas**, consulta [docs/DEMO_ACCESS.md](docs/DEMO_ACCESS.md).

## Comprobaciones
```bash
npm run typecheck
npm run lint
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
```

Los E2E necesitan una base de datos efímera migrada y un seed protegido por CI.

## Railway
- Build: `npm run build`.
- Predeploy: `npm run db:migrate`.
- Start: `npm run start`.
- Variables: `DATABASE_URL` (PostgreSQL privado), `AUTH_SECRET`, `AUTH_TRUST_HOST=true` solo bajo proxy confiable.

Consulta [docs/RAILWAY.md](docs/RAILWAY.md), [docs/MENU_EDITOR.md](docs/MENU_EDITOR.md), [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) y [SECURITY.md](SECURITY.md).

## Pendientes importantes
- Registrar un lockfile reproducible y usar npm ci en CI.
- Endurecer la CSP antes de abrir a clientes reales.
- Añadir protección de tasa por IP/WAF y recuperación segura de cuentas.
- Fotografías con S3, programación, precomandas, impresoras y reservas.
- Revisar la licencia GPLv3 y visibilidad pública del repositorio.
