# Smart Menu SaaS

Plataforma de cartas digitales inteligentes para hostelería.

## Estado

**Prototipo en desarrollo, no listo para restaurantes reales.** Esta rama incluye una carta pública alimentada por PostgreSQL y una semilla de pruebas. Todavía **no** hay autenticación ni edición de cartas.

Funciones ya implementadas:
- Esquema multirrestaurante básico en PostgreSQL + Prisma.
- Los 14 grupos de alérgenos y control de revisión para publicación.
- Carta pública en `/r/[slug]` con nombres y descripciones renderizados como texto seguro en React.
- Plato marcado como **Agotado** permanece visible.
- Endpoint de disponibilidad `/api/health` (comprueba PostgreSQL).
- Pruebas unitarias con Vitest y E2E con Playwright (escritorio y móvil).

Funciones pendientes: permisos y autenticación, editor, fotos seguras, etiquetas dietéticas, programación, reservas, precomandas y tickets.

## Inicio local

Requisitos: Node.js 22, npm y PostgreSQL.

1. Copia `.env.example` a `.env` e introduce la URL de una base de datos **de desarrollo**.
2. Ejecuta:

```bash
npm install
npx prisma generate
npm run db:migrate
npm run db:seed
npm run dev
```

Para una demostración de la carta `/r/demo-restaurante` en una **base desechable de pruebas**, ejecuta `E2E_TEST_SEED=1 npm run db:seed`. Esa acción borra y recrea el restaurante demo si ya existe. **Nunca** establezcas esa variable en producción.

## Comprobaciones

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
```

E2E requiere PostgreSQL migrado, datos de prueba cargados y conexión por `DATABASE_URL`.

**Pendiente importante:** generar y confirmar `package-lock.json` después de verificar compatibilidad de dependencias y cambiar el CI a `npm ci`; no fusionar sin una ejecución satisfactoria de GitHub Actions.

Consulta [SECURITY.md](SECURITY.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) y [docs/RAILWAY.md](docs/RAILWAY.md).

## Licencia

El repositorio contiene actualmente licencia GPLv3. Revisar su conveniencia para el modelo comercial antes de distribuir software.
