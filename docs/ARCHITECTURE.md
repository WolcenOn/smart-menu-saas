# Arquitectura inicial

Monolito modular Next.js + TypeScript. Próximos componentes (todavía NO implementados): PostgreSQL en Railway, Prisma, sesiones seguras, aislamiento por restaurante, almacenamiento S3 de imágenes, carta pública, disponibilidad, promociones y posteriormente precomandas QR e impresión.

## Módulos previstos

1. Identidad y pertenencias: usuarios, restaurantes y permisos.
2. Catálogo: cartas, categorías, platos, bebidas, variantes, etiquetas y alérgenos.
3. Publicación: borradores, disponibilidad horaria y promociones independientes del producto.
4. Sala: cambio rápido a `AGOTADO` — permanece visible pero no seleccionable.
5. Precomandas (fase posterior): borradores, orden del servicio, token QR y confirmación por camarero.
6. Impresión (fase posterior): cola y adaptadores certificados de impresora.
7. Cuotas: productos activos, fotografías y bytes reales por establecimiento.

## Invariantes de diseño

- `restaurantId` debe estar presente en entidades de tenant y validarse en servidor en cada escritura/lectura privada.
- Precio de venta decimal exacto; nunca fiarse de importes enviados por el cliente.
- `AGOTADO` no implica eliminar ni ocultar un plato publicado.
- Una oferta programada no puede reactivar un plato agotado.
- La carta se renderiza con React/JSX sin HTML suministrado por clientes.
- Los horarios se interpretan en la zona IANA del restaurante, con reglas de expiración precisas.
- Cada etapa de desarrollo tendrá migraciones, pruebas y criterios de aceptación.
