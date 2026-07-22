# HOFF-2026-07-07-cicd-deploy-domain

## Metadata

- Task ID: NEXO-0031
- Date: 2026-07-08 (filename aligns with plan NEXO-0031 reference `HOFF-2026-07-07-cicd-deploy-domain.md`)
- Authoring agent: nexo-plan
- Receiving agent: nexo-infra
- Status: in_progress (file-creation scope executed 2026-07-08; push/deploy/real-backup pending user confirmation)

## Objective

Configurar CI/CD y despliegue Fase 1 de Nexo:

1. Backend (`back/`, `@nexo/back`) Dockerizado, servido vía ngrok (túnel HTTPS
   público) contra Neon DB.
2. Frontend (`front/`, `@nexo/front`) con CI/CD a Vercel en
   `teamnexo.nexoshopmx.store`.
3. GitHub Actions: CI backend (test → build → lint) y CI/CD frontend
   (test → build → deploy Vercel).
4. Backups automáticos de Neon DB (pg_dump → Azure Blob Storage).
5. Runbook operacional y 3 ADRs de decisiones durables.

## Context

Currently:

- `back/` y `front/` ya usan **pnpm** con dependencias pinneadas (NEXO-0024).
- `infra/docker-compose.yml` existe pero solo tiene `nexo-postgres` (Postgres
  16 local para dev). No tiene servicios `nexo-api` ni `ngrok`.
- No hay `.github/workflows/` en ninguno de los dos proyectos.
- No hay `front/vercel.json`.
- No hay ADRs de deploy/cicd/backup.
- Fase 2 (AWS, IaC, CloudWatch) está fuera de alcance y espera autorización.

Plan canónico: `harness/control/plans/NEXO-0031-cicd-deploy-domain.md`.

Restricciones del control plane:

- **No escribir secretos reales.** Usar placeholders plantilla en todos los
  archivos (tokens ngrok, Vercel, Neon `DATABASE_URL`, Azure Storage connstring).
- **Commit/push/deploy/cambios externos requieren confirmación explícita del
  usuario.** El agente nexo-infra debe crear los archivos y dejar los pasos de
  deploy real (Vercel deploy, ngrok up, DNS, backup run) como pendientes de
  aprobación + credenciales que el usuario debe proveer.

## Source Docs

- `harness/control/plans/NEXO-0031-cicd-deploy-domain.md` (plan completo, risks,
  decision log)
- `infra/docker-compose.yml` — compose actual (solo Postgres local)
- `back/package.json` — scripts `build` (tsc), `test` (vitest), `start`
- `front/package.json` — scripts `build` (vite), `test` (vitest), `dev`
- `back/.env` / `front/.env` — variables de entorno (usar como referencia de
  nombres, no commitear valores reales)
- `docs/adr/` — ubicación de los ADRs

## Files To Create Or Modify

### back/ (`@nexo/back`, backend / "nexo-api")

- **CREATE** `back/Dockerfile` — multi-stage Node 22 Alpine + pnpm, build, prune,
  `prisma generate`, expone :3000.
- **CREATE** `back/.dockerignore` — excluir node_modules, .env, dist opcional.
- **CREATE** `back/.github/workflows/nexo-api-ci.yml` — test (vitest) + build
  (tsc) + lint.
- **MODIFY** `infra/docker-compose.yml` — agregar servicios `nexo-api` (build
  desde `back/`, healthcheck, env `DATABASE_URL` apuntando a Neon) y `ngrok`
  (túnel a `nexo-api:3000`, authtoken por env).

### front/ (`@nexo/front`, frontend / "nexo-app")

- **CREATE** `front/vercel.json` — SPA rewrites, build command, output dir.
- **CREATE** `front/.github/workflows/nexo-app-cicd.yml` — test + build + deploy
  Vercel (usando `VERCEL_TOKEN` y `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID`).
- **MODIFY** `front/.env.example` (o `.env.production.example`) — agregar
  `VITE_API_BASE_URL` apuntando a la URL pública de ngrok (placeholder).

### harness/control/

- **CREATE** `harness/control/runbooks/RUNBOOK-NEXO-0031-operations.md` — levantar/bajar
  backend Docker, verificar ngrok, restaurar backup, rollback en Vercel.
- **CREATE** `docs/adr/ADR-2026-07-07-deploy-strategy-phase1.md`
- **CREATE** `docs/adr/ADR-2026-07-07-cicd-pipeline.md`
- **CREATE** `docs/adr/ADR-2026-07-07-db-backup-strategy.md`

### Backups (repositorio backend o repo dedicado)

- **CREATE** `.github/workflows/nexo-db-backup.yml` (en el repo que contiene la
  config de Neon, o en `back/`) — scheduled daily, `pg_dump` → gzip → upload a
  Azure Blob, retención 7 días, alerta si falla.

## Implementation Steps

### Step 1 — Backend Dockerfile

Multi-stage build:

```dockerfile
# build
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
RUN pnpm prune --prod

# runtime
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
RUN pnpm dlx prisma generate
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

`back/.dockerignore`: `node_modules`, `.env*`, `dist` (se reconstruye),
`coverage`, `.git`.

### Step 2 — docker-compose (nexo-api + ngrok)

Agregar a `infra/docker-compose.yml` (mantener `nexo-postgres` para dev local):

```yaml
  nexo-api:
    build:
      context: ./back
    container_name: nexo-api
    restart: unless-stopped
    environment:
      DATABASE_URL: ${NEXO_DATABASE_URL}   # Neon DB (placeholder en .env)
      PORT: "3000"
      # ...otras vars de back/.env (placeholders)
    depends_on:
      - nexo-postgres   # solo para dev local; en deploy real usa Neon
    ports:
      - "127.0.0.1:3000:3000"
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:3000/api/v1/health || exit 1"]
      interval: 10s
      timeout: 3s
      retries: 5

  nexo-ngrok:
    image: ngrok/ngrok:latest
    container_name: nexo-ngrok
    restart: unless-stopped
    command: ["http", "nexo-api:3000"]
    environment:
      NGROK_AUTHTOKEN: ${NGROK_AUTHTOKEN}   # placeholder
    ports:
      - "127.0.0.1:4040:4040"   # dashboard local (no exponer público)
    depends_on:
      - nexo-api
```

Crear `infra/.env.example` con `NEXO_DATABASE_URL=` y `NGROK_AUTHTOKEN=`
(placeholders; el usuario completa con Neon + ngrok reales).

### Step 3 — GitHub Actions: backend CI

`back/.github/workflows/nexo-api-ci.yml`:

- trigger: push/PR en `back/**` y `infra/**`.
- job: checkout → setup node 22 + pnpm → `pnpm install --frozen-lockfile` →
  `pnpm test` → `pnpm run build` → `pnpm run lint` (si existe).

### Step 4 — Vercel config + frontend CI/CD

`front/vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

`front/.github/workflows/nexo-app-cicd.yml`:

- trigger: push a `main` (o rama de deploy) en `front/**`.
- job: checkout → node 22 + pnpm → install → `pnpm test` → `pnpm build` →
  deploy con `amondnet/vercel-action@v25` usando secrets
  `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

### Step 5 — ngrok + subdominio Vercel (requiere usuario)

- Usuario: crear cuenta ngrok, generar authtoken, agregarlo a `infra/.env`
  (`NGROK_AUTHTOKEN`).
- Usuario: en Vercel, agregar dominio `teamnexo.nexoshopmx.store` al proyecto
  frontend y configurar DNS CNAME → `cname.vercel-dns.com`.
- Documentar en el runbook la URL pública efímera de ngrok y cómo actualizar
  `VITE_API_BASE_URL` en frontend cuando cambie.

### Step 6 — Backup workflow (Neon → Azure Blob)

`.github/workflows/nexo-db-backup.yml` (schedule `cron` diario):

- `pg_dump "$NEON_DATABASE_URL" | gzip > backup.sql.gz`
- subir a Azure Blob con `azure/cli` o `az storage blob upload` usando
  `AZURE_STORAGE_CONNECTION_STRING` (placeholder).
- retención 7 días (borrar blobs >7d).
- paso de alerta (issue o webhook) si el dump falla.

### Step 7 — Runbook

`harness/control/runbooks/RUNBOOK-NEXO-0031-operations.md` con secciones:
levantar/bajar backend Docker, verificar estado ngrok (dashboard :4040),
restaurar backup (`pg_restore` / `gunzip | psql`), rollback de frontend en
Vercel (`vercel rollback`), y troubleshooting de URL efímera de ngrok.

### Step 8 — ADRs

- `ADR-2026-07-07-deploy-strategy-phase1.md`: ngrok + Docker local + Vercel,
  justificando por qué Fase 1 no usa AWS/K8s.
- `ADR-2026-07-07-cicd-pipeline.md`: GitHub Actions para ambos repos, Vercel
  deploy.
- `ADR-2026-07-07-db-backup-strategy.md`: pg_dump diario a Azure Blob,
  retención 7 días.

### Step 9 — Git (requiere confirmación)

Commits por repo (back, front, infra) y push a GitHub. Mensajes tipo:

```
feat(infra): backend Dockerfile, ngrok compose, CI workflows, backup + ADRs

- Multi-stage Dockerfile for @nexo/back (pnpm, prisma generate)
- docker-compose nexo-api + ngrok services
- GitHub Actions CI backend / CI-CD frontend / Neon backup
- ADRs deploy/cicd/backup, operations runbook
```

**No pushear ni desplegar sin confirmación explícita del usuario.**

## Verification

- [ ] `back/Dockerfile` build exitoso: `docker build -t nexo-api ./back`
- [ ] `docker compose -f infra/docker-compose.yml up nexo-api nexo-ngrok` levanta
      sin errores (con `.env` de placeholders; ngrok up requiere token real).
- [ ] `curl http://localhost:3000/api/v1/health` responde 200 (local).
- [ ] `back/.github/workflows/nexo-api-ci.yml` pasa test + build + lint.
- [ ] `front/vercel.json` presente y válido (deploy dry-run con `vercel build`).
- [ ] `front/.github/workflows/nexo-app-cicd.yml` pasa test + build.
- [ ] Backup workflow corre manualmente y sube artifact a Azure Blob (con
      credenciales reales provistas por el usuario).
- [ ] Runbook documentado y ADRs creados en `docs/adr/`.
- [ ] Vercel domain `teamnexo.nexoshopmx.store` agregado + DNS CNAME (usuario).

## Risks

| Riesgo | Mitigación |
|--------|-----------|
| ngrok URL cambia en cada reinicio (free tier) | authtoken para URL semi-estable; documentar update de `VITE_API_BASE_URL` en runbook. |
| Cold start ngrok + backend | `restart: unless-stopped`; monitorear uptime. |
| Neon free tier 0.5 GB | monitorear tamaño; vacuum; backups permiten migrar. |
| Vercel Hobby 100 GB bandwidth | suficiente Fase 1; monitorear analytics. |
| Docker local 24/7 | aceptado Fase 1; AWS en Fase 2. |
| Secretos reales expuestos en repo | **solo placeholders**; tokens vía secrets de GitHub/Vercel/ngrok, nunca commiteados. |
| Deploy accidental sin confirmación | pasos de push/deploy marcados como pending approval. |

## Acceptance Criteria

1. `docker build` del backend produce imagen ejecutable que expone :3000 y corre
   `prisma generate` al arrancar.
2. `docker compose up` levanta `nexo-api` + `nexo-ngrok` sin error de
   configuración (token real provisto por usuario para túnel público).
3. CI backend (GitHub Actions) pasa test + build + lint en PR.
4. CI/CD frontend pasa test + build y está cableado a Vercel (deploy requiere
   `VERCEL_TOKEN` + confirmación usuario).
5. Backup diario de Neon → Azure Blob configurado y verificado manualmente.
6. Runbook + 3 ADRs creados y enlazados.
7. Cero secretos reales en el repo; todo usa placeholders/secret references.

## Required Gates

- QA review: **Sí** — cambios de CI/CD/deploy requieren revisión de QA antes de
  close (regla del control plane).
- Security review: **Sí** — manejo de secretos, exposición pública (ngrok),
  backup de BD; requiere revisión de seguridad antes de close.
- User confirmation: **Sí** — push a GitHub, deploy Vercel, ngrok up, DNS y
  ejecución de backups reales requieren confirmación y credenciales del usuario.

## Next Step

Al completar archivos + gates, el agente nexo-infra reporta y solicita al
usuario confirmación para: (a) push de los 3 repos, (b) deploy Vercel, (c)
ngrok token real, (d) DNS del subdominio, (e) credenciales Neon/Azure para el
primer backup. Luego closeout de NEXO-0031.

## Execution Log

- 2026-07-08: `nexo-plan` delegó la creación de archivos a `nexo-infra`
  (subagent). Resultado: todos los archivos de Fase 1 creados/modificados,
  `docker compose config` exit 0, YAML/JSON válidos, pnpm referenciado en
  Dockerfile + workflows. Cero secretos reales escritos. Pendiente de usuario:
  push, deploy Vercel, ngrok authtoken real, DNS `teamnexo.nexoshopmx.store`,
  credenciales Neon/Azure para backup real. QA + Security review requeridas
  antes de close. Ver reporte `reports/2026-07-08/NEXO-0031-infra-handoff-execution.md`.
