# Railway — MVP demostrable

## Problema histórico
Si el Build Command está configurado como `npm run db:migrate`, sustituye la compilación de Next.js. Los comandos correctos son:

| Fase | Comando |
|---|---|
| Build | `npm run build` |
| Pre-deploy | `npm run db:migrate` |
| Start | `npm run start` |
| Healthcheck | `/api/health` |

## Requisitos
1. Servicio PostgreSQL en el mismo proyecto de Railway.
2. Variable `DATABASE_URL` por referencia a la conexión privada de PostgreSQL.
3. Para acceso básico, `AUTH_SECRET` largo y aleatorio; `AUTH_TRUST_HOST=true` únicamente detrás del proxy HTTPS confiable.
4. No hacen falta variables Google OAuth durante el piloto. Si están ausentes, solo se ofrece contraseña.
5. Usar el dominio HTTPS proporcionado por Railway.
6. El **bootstrap** del primer propietario se ejecuta manualmente con variables temporales y autorización explícita; ver `docs/DEMO_ACCESS.md`.

No fijar `E2E_TEST_SEED=1` en Railway. Esa semilla elimina el restaurante de pruebas y crea credenciales conocidas: se reserva para PostgreSQL efímero de GitHub Actions con CI=true.

## Atención a las ramas
- La PR #6 incorpora el diseño a main.
- La PR #12 añade identidad y editor de apariencia.
- La PR #13 añade acceso básico y editor de cartas.
- No mezclar PR apiladas ni desplegar commits sin ejecutar las migraciones correspondientes.

## Checklist antes de pilotos externos
- Pruebas verdes (migraciones, build, Playwright, auditoría de seguridad).
- Dominio HTTPS, rate limiting externo y backup/restauración.
- Lockfile y endurecimiento de CSP.
- Secretos solo en Railway Variables, jamás en GitHub.
- Cuenta inicial creada con secreto temporal, retirado inmediatamente después.
