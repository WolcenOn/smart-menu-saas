# Railway — despliegue inicial (no automático)

## Requisitos previos
El proyecto necesita un PostgreSQL accesible. No desplegar todavía como servicio de clientes: **no hay autenticación ni interfaz de edición**.

1. En Railway crea un proyecto y añade **Database → PostgreSQL**. Mantén la base de datos sin acceso público.
2. Añade un servicio desde el repositorio GitHub y selecciona la rama deseada solo después de aprobar la PR.
3. En Variables del servicio Next.js, crea la referencia DATABASE_URL apuntando al DATABASE_URL privado del servicio PostgreSQL. No copies contraseñas al repositorio ni uses NEXT_PUBLIC_DATABASE_URL.
4. Ajusta el build a `npm run build` (el postinstall de npm genera el cliente Prisma).
5. Antes de iniciar la nueva versión, ejecuta las migraciones **una vez**, mediante un paso de despliegue controlado: `npm run db:migrate`. No usar `prisma db push` para producción.
6. Start command: `npm run start`. Railway proporciona PORT; Next debe escuchar en el puerto configurado.
7. Health check: `/api/health`. Verifica conexión a la base de datos y devuelve 503 si falla.
8. Configura HTTPS/dominio, observabilidad, copias de seguridad y prueba restauración antes de cualquier uso real.

**Importante:** el seed por defecto solo registra alérgenos. La demostración contiene datos inseguros intencionales para probar XSS y se activa **exclusivamente** con `E2E_TEST_SEED=1` en una base de datos de pruebas que pueda borrarse. **Nunca establezcas esa variable en producción.**

## Desarrollo local y CI
```bash
npm install
npx prisma generate
npm run db:migrate
npm run db:seed
npm run dev
```

En CI se inicia un PostgreSQL aislado, se crean datos de prueba y se ejecuta Playwright en Chromium de escritorio y móvil.

## Estado pendiente
- Falta autenticación y autorización de administradores/camareros.
- No hay imágenes ni almacenamiento S3 todavía.
- No se han implementado programación temporal ni promociones.
- Antes de producción: generar y confirmar package-lock.json, sustituir `npm install` por `npm ci`, afinar CSP con nonces/hashes, comprobar auditoría y habilitar backups.
