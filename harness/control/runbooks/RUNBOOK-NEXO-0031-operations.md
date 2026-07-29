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

## Configurar el proyecto frontend en Vercel

El frontend es una aplicación autónoma dentro de `front/`. La raíz del
repositorio no contiene `package.json`; su `package-lock.json` está vacío y no
declara Vite. Por eso, un build ejecutado desde la raíz con el comando
`vite build` falla con `vite: command not found`. No se debe duplicar el
manifest ni las dependencias del frontend en la raíz para compensar una
configuración incorrecta de Vercel.

Antes de cambiar cualquier valor o iniciar un redeploy, obtener confirmación
explícita del usuario que cubra tanto los seis ajustes de build indicados abajo
como el nuevo deployment. Sin esa autorización, limitarse a inspeccionar y
registrar los valores no secretos actuales del proyecto correcto.

Después de esa confirmación, abrir el proyecto frontend en el dashboard de
Vercel y aplicar estos valores en **Settings → Build and Deployment**:

| Setting | Valor requerido |
|---|---|
| Root Directory | `front` |
| Framework Preset | `Vite` |
| Build Command override | Desactivado; `front/vercel.json` define `pnpm build` |
| Output Directory override | Desactivado; `front/vercel.json` define `dist` |
| Install Command override | Desactivado; Vercel detecta pnpm mediante `front/pnpm-lock.yaml` |
| Node.js Version | `22.x` |

En **Settings -> Environment Variables**, configurar para Production y Preview:

| Variable | Valor requerido |
|---|---|
| `VITE_API_BASE_URL` | `/api/v1` |
| `BACKEND_ORIGIN` | URL HTTPS pública actual de ngrok, sin `/api/v1` ni slash final |

`BACKEND_ORIGIN` es el upstream fijo que consume `front/vercel.json`; no debe
usar el prefijo `VITE_` ni quedar incorporado en el bundle del navegador.

Pasos exactos después de la autorización:

1. Confirmar el equipo y proyecto correctos, verificar que no haya otro
   deployment en curso y registrar los valores no secretos actuales.
2. En **Root Directory**, seleccionar **Edit**, escribir `front` y guardar.
3. En **Build & Development Settings**, seleccionar **Vite**.
4. Desactivar los overrides de **Build Command**, **Output Directory** e
   **Install Command** para que `front/vercel.json` y el lockfile sean la fuente
   canónica. Si la UI no permite retirar un Build Command heredado, sustituirlo
   por `pnpm build`; nunca dejar `vite build`.
5. Confirmar **Node.js Version 22.x** y guardar.
6. Configurar `VITE_API_BASE_URL=/api/v1` y `BACKEND_ORIGIN` con la URL HTTPS
   pública actual de ngrok para Production y Preview.
7. Reintentar el deployment fallido o crear uno nuevo bajo la autorización
   explícita ya registrada. El log nuevo debe instalar desde `front/`,
   ejecutar `pnpm build` y publicar `front/dist` (mostrado como `dist` desde la
   Root Directory).

`front/vercel.json` permanece como la única configuración de deployment en el
repositorio. La documentación vigente de Vercel confirma que Root Directory
controla la ruta de instalación y que los ajustes de framework, build, install
y output pueden configurarse en el proyecto:
<https://vercel.com/docs/builds/configure-a-build#root-directory>.

Antes de cambiar el dashboard, registrar sus valores actuales. Para rollback
de esta corrección, restaurar esos valores; no agregar manifests ni copiar
dependencias a la raíz. Si el build nuevo termina pero la aplicación presenta
una regresión, promover el deployment estable anterior como se describe en
**Rollback del frontend en Vercel**.

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
curl -fsS http://localhost:3001/api/v1/health
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

La URL pública aparece en `public_url`. Usarla como `BACKEND_ORIGIN` en Vercel;
el navegador conserva `VITE_API_BASE_URL=/api/v1` (ver troubleshooting de URL
efímera).

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

## Restaurar un backup de base de datos

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

2. Validar el archivo antes de conectarlo a una base:

   ```bash
   gzip -t restore.sql.gz
   sha256sum restore.sql.gz
   ```

### Restauración local reversible (preferida)

No borrar primero `nexo` ni usar `docker compose down -v`. Restaurar en
paralelo, validar y hacer un intercambio de nombres:

```bash
# Crear y cargar una base paralela.
docker compose -f infra/docker-compose.yml exec -T nexo-postgres \
  psql -X -v ON_ERROR_STOP=1 -U nexo_app -d postgres \
  -c 'CREATE DATABASE nexo_restore_YYYYMMDD OWNER nexo_app;'

gunzip -c restore.sql.gz | docker compose -f infra/docker-compose.yml exec -T \
  nexo-postgres psql -X -v ON_ERROR_STOP=1 -U nexo_app \
  -d nexo_restore_YYYYMMDD

# Validar conteos, migraciones, claves foráneas y blobs de fotografías antes
# del corte. Después, detener únicamente la API.
docker compose -f infra/docker-compose.yml stop nexo-api

# Ejecutar desde la base de mantenimiento, sin conexiones abiertas a nexo.
docker compose -f infra/docker-compose.yml exec -T nexo-postgres \
  psql -X -v ON_ERROR_STOP=1 -U nexo_app -d postgres \
  -c 'ALTER DATABASE nexo RENAME TO nexo_pre_restore_YYYYMMDD;'
docker compose -f infra/docker-compose.yml exec -T nexo-postgres \
  psql -X -v ON_ERROR_STOP=1 -U nexo_app -d postgres \
  -c 'ALTER DATABASE nexo_restore_YYYYMMDD RENAME TO nexo;'

docker compose -f infra/docker-compose.yml start nexo-api
```

Mantener `nexo_pre_restore_YYYYMMDD` durante la aceptación. Si falla, detener
la API, renombrar la base nueva con un sufijo de fallo, devolver la base previa
a `nexo` y reiniciar la API. Borrar la base previa debe ser una operación
posterior y explícitamente autorizada.

El dump sólo contiene `item_photos.storageKey`; no contiene los objetos de
Azure. Antes del intercambio, verificar que cada clave restaurada existe en el
contenedor privado de fotografías.

### Restauración en Neon

Restaurar primero en una rama o base nueva de Neon, validar y promoverla. Evitar
vaciar directamente la base activa:

```bash
gunzip -c restore.sql.gz | psql "$NEW_NEON_DATABASE_URL"
```

El cambio de conexión o promoción de la rama requiere autorización explícita y
un rollback documentado.

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
2. Actualizar `BACKEND_ORIGIN` en Vercel con la nueva URL (sin `/api/v1` ni
   slash final). Mantener `VITE_API_BASE_URL=/api/v1`.
3. Re-deploy del frontend en Vercel para aplicar el nuevo upstream.
4. Para estabilizar la URL en Fase 1, usar un ngrok authtoken (ya configurado
   vía `NGROK_AUTHTOKEN`) y, si el plan lo permite, un subdominio fijo de ngrok.

Síntomas comunes:

| Síntoma | Causa probable | Acción |
|--------|----------------|--------|
| `vite: command not found` y comando efectivo `vite build` | Root Directory apunta a la raíz del repositorio y/o existe un override heredado; Vercel no instala `front/package.json` ni carga `front/vercel.json` | Configurar Root Directory `front`, retirar overrides y verificar que el comando efectivo sea `pnpm build` |
| Respuesta `200 text/html` con `ERR_NGROK_6024` | El bundle llama directamente a ngrok o el proxy no fue desplegado | Fijar `VITE_API_BASE_URL=/api/v1`, verificar `BACKEND_ORIGIN` y re-deploy |
| Frontend no llega a la API después de rotar ngrok | `BACKEND_ORIGIN` apunta a la URL ngrok anterior | Actualizar `BACKEND_ORIGIN` y re-deploy |
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
