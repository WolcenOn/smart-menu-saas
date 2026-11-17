# Smart Menu SaaS

Plataforma en desarrollo para cartas digitales inteligentes de hostelería.

## Estado

Esta rama propone **una base pública estática**, sin autenticación ni persistencia todavía. No utilizar para datos reales de restaurantes o clientes.

## Funcionalidades planificadas

- Cartas personalizables y QR por restaurante.
- Información de los 14 grupos de alérgenos, etiquetas veganas y variantes alimentarias verificadas.
- Platos y promociones con disponibilidad programada.
- Estado **Agotado** visible en la carta, sin permitir solicitar el plato.
- Precomandas QR organizadas por momentos de servicio y confirmadas por camarero.
- Impresión de comandas con identificación de mesa, en fase posterior.
- Cuotas por productos e imágenes; personalización premium opcional.

## Stack

Next.js, TypeScript y CSS. PostgreSQL/Prisma y Railway están previstos para la siguiente fase.

## Desarrollo local

```bash
npm install
npm run dev
```

Comprobaciones:

```bash
npm run typecheck
npm run lint
npm run build
```

Consulta [SECURITY.md](SECURITY.md) y [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) antes de añadir nuevas funcionalidades.

**Importante:** El repositorio actual contiene una licencia GPLv3. Revisar si se ajusta a la estrategia comercial antes de distribuir el software.
