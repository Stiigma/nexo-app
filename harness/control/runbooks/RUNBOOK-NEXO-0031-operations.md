# Runbook - Operaciones Nexo (NEXO-0031, Fase 1)

## Propósito

Procedimientos operativos para levantar/bajar el backend Docker (local/Phase-1),
verificar el túnel ngrok, restaurar respaldos de Neon DB y hacer rollback del
frontend en Vercel. Véase también `harness/control/handoffs/HOFF-2026-07-07-cicd-deploy-domain.md`.

Todas las credenciales reales (Neon `DATABASE_URL`, ngrok authtoken, tokens de
Vercel, connection string de Azure) se proveen por el usuario vía `.env` local o
secrets de GitHub/Vercel/ngrok. **Nunca se commitean secretos reales.**

## Precondiciones

- Ejecutar desde la raíz del workspace: `/home/otomi/nexo/develoment`.
- Docker y Docker Compose instalados y funcionando.
- `infra/.env` creado a partir de `infra/.env.example` con los valores reales
  (Neon `DATABASE_URL`, `NGROK_AUTHTOKEN`).
- Cuenta ngrok con authtoken válido (para el túnel público HTTPS real).

## Levantar el backend (Docker)

```bash
cd infra
# Validar que el compose parsea sin error (no levanta contenedores):
docker compose config

# Levantar solo Postgres local + API (sin ngrok):
docker compose up -d nexo-postgres nexo-api

# Levantar todo (API + túnel ngrok público):
docker compose up -d
```

Verificar que la API responde localmente:

```bash
curl -fsS http://localhost:3000/api/v1/health
```

## Verificar el estado de ngrok

El dashboard de ngrok queda en `http://127.0.0.1:4040` (solo loopback, no
exponer públicamente). Ahí se ve la URL pública HTTPS efímera y las requests
entrantes.

```bash
# Abrir en navegador (máquina local):
#   http://127.0.0.1:4040

# O consultar la API del dashboard por CLI:
curl -fsS http://127.0.0.1:4040/api/tunnels | head
```

La URL pública aparece en `public_url`. Copiarla para configurar
`VITE_API_BASE_URL` en el frontend (ver troubleshooting de URL efímera).

## Bajar el backend

```bash
cd infra
docker compose down            # detiene y remueve contenedores
docker compose down -v         # también borra volúmenes (¡cuidado: borra datos locales)
```

Para solo detener ngrok (dejar API local arriba):

```bash
docker compose stop nexo-ngrok
```

## Restaurar un backup (Neon DB)

Los backups diarios se guardan en Azure Blob (`nexo-db-backups`). Para restaurar:

1. Descargar el blob deseado (desde Azure Portal o CLI con
   `AZURE_STORAGE_CONNECTION_STRING` en el entorno local):

   ```bash
   az storage blob download \
     --connection-string "$AZURE_STORAGE_CONNECTION_STRING" \
     --container-name nexo-db-backups \
     --name nexo-backup-YYYYMMDDTHHMMSSZ.sql.gz \
     --file restore.sql.gz
   ```

2. Restaurar en la base destino (vaciar/crear esquema primero si es necesario):

   ```bash
   # Restaurar sobre la misma Neon DB (CUIDADO: sobreescribe datos):
   gunzip -c restore.sql.gz | psql "$NEON_DATABASE_URL"

   # O sobre Postgres local para validar antes de tocar producción:
   gunzip -c restore.sql.gz | psql "$LOCAL_DATABASE_URL"
   ```

> Precaución: `psql` sobre Neon con datos existentes puede requerir
> `DROP SCHEMA public CASCADE;` + `CREATE SCHEMA public;` previo, o restaurar
> sobre una base nueva y luego promoverla. Validar en local primero.

## Rollback del frontend en Vercel

Si un deploy de `front` introduce un error:

```bash
# Listar deployments y hacer rollback al anterior estable (requiere Vercel CLI
# autenticado localmente; no se ejecuta en CI):
vercel rollback
```

En la UI de Vercel: abrir el proyecto `teamnexo.nexoshopmx.store` →
*Deployments* → seleccionar el deployment anterior sano → *Promote to Production*.

## Troubleshooting: URL efímera de ngrok

El tier free de ngrok cambia la URL pública en cada reinicio del contenedor
`nexo-ngrok`. Cuando la URL cambia:

1. Obtener la nueva `public_url` desde el dashboard `:4040` o
   `curl http://127.0.0.1:4040/api/tunnels`.
2. Actualizar `VITE_API_BASE_URL` en el frontend:
   - Editar `front/.env.production` con la nueva URL (sin slash final).
   - Re-deploy del frontend en Vercel (o dejar que el CI/CD lo haga en el
     siguiente push a `main`).
3. Para estabilizar la URL en Fase 1, usar un ngrok authtoken (ya configurado
   vía `NGROK_AUTHTOKEN`) y, si el plan lo permite, un subdominio fijo de ngrok.

Síntomas comunes:

| Síntoma | Causa probable | Acción |
|--------|----------------|--------|
| Frontend no llega a la API | `VITE_API_BASE_URL` apunta a URL ngrok vieja | Actualizar URL y re-deploy |
| ngrok `402/err_ngrok_limit` | authtoken faltante/inválido o límite free | Verificar `NGROK_AUTHTOKEN` en `infra/.env` |
| `/api/v1/health` 502 | API caída o no lista | `docker compose logs nexo-api`; esperar healthcheck |
| ngrok dashboard no abre | puerto `4040` no expuesto en loopback | revisar mapeo de puertos en `docker-compose.yml` |

## Rollback de infraestructura local

Para revertir a solo Postgres local (sin ngrok/API containerizados):

```bash
cd infra
docker compose down
git restore infra/docker-compose.yml   # si se desea volver al compose original
```

## Registros relacionados

- Handoff: `harness/control/handoffs/HOFF-2026-07-07-cicd-deploy-domain.md`
- ADRs: `docs/adr/ADR-2026-07-07-deploy-strategy-phase1.md`,
  `docs/adr/ADR-2026-07-07-cicd-pipeline.md`,
  `docs/adr/ADR-2026-07-07-db-backup-strategy.md`
- Backup workflow: `.github/workflows/nexo-db-backup.yml`
