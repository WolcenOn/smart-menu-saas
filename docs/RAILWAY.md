# Despliegue en Railway

## Diagnóstico inicial

La rama `main` del repositorio todavía no contiene código de aplicación. El desarrollo está en `chore/secure-foundation` dentro de la [PR #1](https://github.com/WolcenOn/smart-menu-saas/pull/1). Railway no puede construir Next.js si apunta a `main` antes de fusionar la PR.

**No desplegar públicamente para clientes reales hasta pasar CI y revisar seguridad.**

## Configuración de Railway

1. En el proyecto Railway, crea un servicio PostgreSQL si no existe.
2. Conecta el servicio web de GitHub al repositorio. Para una preview de pruebas puedes usar la rama `chore/secure-foundation`; para producción, espera a una PR aprobada y fusionada a `main`.
3. En las variables del servicio web, añade `DATABASE_URL` mediante referencia a `Postgres.DATABASE_URL` del servicio de base de datos. No copies secretos al repositorio.
4. Comando de build: `npm run build`. Comando de inicio: `npm run start` (Next.js respeta la variable `PORT`).
5. Las migraciones se aplican una única vez por release con `npm run db:migrate` después de configurar la base, preferentemente en un paso previo al despliegue. No ejecutar `prisma db push` en producción.
6. Healthcheck: `/api/health`. Este endpoint mide disponibilidad del proceso web, no acceso a la base.
7. Configura un dominio HTTPS, observabilidad, copias de seguridad y procedimiento de restauración antes de uso real.

## Importante para el primer arranque

- `npm run build` necesitará el cliente Prisma generado (`prisma generate`). En la siguiente revisión fijaremos dependencias y automatizaremos su generación.
- No pongas `E2E_TEST_SEED=1` en Railway: borra y recrea el restaurante demo, y se utiliza solo en CI con una base desechable.
- No expongas PostgreSQL por TCP público salvo necesidad operativa específica.
- Si la raíz `/` abre, pero `/r/demo-restaurante` no existe, es normal: el seed de producción solo crea alérgenos, no un restaurante demo.
- La carta pública actual requiere PostgreSQL activo.
- Todavía no hay autenticación ni editor; esta rama no es un producto terminado.

## Diagnóstico de fallos

| Síntoma | Posible causa |
|---|---|
| Missing package.json | Railway construye `main` antes de fusionar la PR |
| DATABASE_URL missing | Falta variable de referencia al PostgreSQL |
| P1001 / conexión fallida | PostgreSQL no está listo o la URL es incorrecta |
| Relation does not exist | No se aplicaron migraciones |
| Healthcheck fallido | La aplicación no arrancó o el puerto es incorrecto |
| 404 en demo-restaurante | No existe seed de demostración en producción |

Comprueba primero Deployments → Build Logs y Deploy Logs. No compartas URLs de base de datos, contraseñas o tokens.
