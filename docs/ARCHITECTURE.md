# Arquitectura y fases

## Implementado
- Next.js 16 App Router + React 19 + TypeScript estricto.
- Prisma 6 / PostgreSQL con primera migración versionada.
- Entidades: Restaurant → Menu → MenuCategory → Dish, Allergen y relación DishAllergen.
- Carta pública `/r/[slug]` con consulta restringida a cartas publicadas y platos con alérgenos revisados.
- Estado manual `SOLD_OUT` **visible** en carta; no hay todavía cambios de estado mediante UI.
- Sin mutaciones de clientes ni permisos implementados: la edición queda bloqueada hasta autenticar usuarios.
- Vitest para reglas puras; Playwright para visualización pública y XSS.

## Próximo trabajo
1. Autenticación segura y membresías por restaurante.
2. CRUD autorizado de restaurantes/cartas/platos/alérgenos con Zod y auditoría.
3. Etiquetas y variantes con revisión de alérgenos independiente.
4. Platos programados y ofertas independientes.
5. Compresión frontend, subida S3 segura y cuotas.
6. Precomandas con QR y confirmación del camarero.
7. Cola de impresión y adaptadores para impresoras seleccionadas.

## Invariantes
- Todas las escrituras deben validar pertenencia al tenant **en servidor**.
- Precio de venta como Decimal; se formatea solo para mostrar.
- Una oferta no reactiva platos agotados.
- Los datos externos se muestran como texto, nunca como HTML ejecutable.
- Prohibido mostrar platos sin revisión alimentaria completa.
- El render público actual es dinámico para evitar disponibilidad obsoleta; optimizarlo más adelante sin perder frescura.
