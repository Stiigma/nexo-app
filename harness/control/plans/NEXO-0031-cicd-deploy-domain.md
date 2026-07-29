# NEXO-0031 — CI/CD, Deploy & Domain Infrastructure

## Objective

Configurar CI/CD con GitHub Actions, desplegar el backend via Docker + ngrok
(Neon DB) y el frontend en Vercel bajo el subdominio
`teamnexo.nexoshopmx.store`, más una estrategia de backups para la base de
datos Neon.

## Done When

- [ ] GitHub Actions: workflow de CI para `nexo-api` (test → build).
- [ ] GitHub Actions: workflow de CI/CD para `nexo-app` (test → build → deploy a Vercel).
- [ ] Backend Dockerizado y servido via ngrok (túnel HTTPS público).
- [ ] Frontend deployado en Vercel en `teamnexo.nexoshopmx.store`.
- [ ] Backups de BD Neon automatizados (pg_dump → Azure Blob Storage).
- [ ] Runbook documentado para operaciones diarias.
- [ ] ADRs aceptados para cada decisión durable.

## Scope

### Fase 1 (ahora)

| Componente | Stack | Detalle |
|-----------|-------|---------|
| CI Backend | GitHub Actions | test (vitest), build (tsc), lint |
| CI/CD Frontend | GitHub Actions + Vercel | test (vitest), build (vite), deploy |
| Deploy Backend | Docker (Local) + ngrok | Contenedor expuesto a Neon DB |
| Deploy Frontend | Vercel | `teamnexo.nexoshopmx.store` |
| DB Backups | GitHub Actions + pg_dump | Scheduled dump a Azure Blob |
| Dominio | nexoshopmx.store | Subdominio `teamnexo` → Vercel |

### Fase 2 (cuando AWS esté listo)

| Componente | Stack | Detalle |
|-----------|-------|---------|
| Deploy Backend | AWS (ECS/EKS/EC2) | Migrar de Docker local a cloud |
| Infra as Code | Pulumi o Terraform | Definir infraestructura AWS |
| Monitoreo | CloudWatch | Logs, métricas, alertas |

## Out Of Scope

- AWS infrastructure (espera autorización).
- Kubernetes (sobreingeniería para Fase 1).
- CI/CD para media/Azure (ya configurado manualmente).
- WebSocket o real-time features.
- Producción multi-región.

## Steps

1. **Crear Backend Dockerfile**
   - Multi-stage build (Node 22 Alpine).
   - pnpm, build, prune para producción.
   - Exponer :3000, Prisma generate en startup.

2. **Actualizar docker-compose.yml**
   - Agregar servicio `nexo-api` + healthcheck.
   - Agregar servicio `ngrok` para túnel HTTPS.
   - Variables de entorno para Neon DB y ngrok auth token.

3. **Crear GitHub Actions workflows**
   - `.github/workflows/nexo-api-ci.yml`: test + build.
   - `.github/workflows/nexo-app-cicd.yml`: test + build + deploy Vercel.

4. **Crear vercel.json para frontend**
   - Configurar SPA rewrite rules.
   - Definir build command y output directory.

5. **Configurar ngrok**
   - Obtener ngrok auth token (free tier).
   - Configurar tunnel HTTP → `nexo-api:3000`.
   - Documentar URL pública generada.

6. **Configurar subdominio en Vercel**
   - Agregar `teamnexo.nexoshopmx.store` en proyecto Vercel.
   - Apuntar DNS (CNAME → `cname.vercel-dns.com`).

7. **Crear backup workflow**
   - GitHub Actions scheduled (daily).
   - pg_dump de Neon → comprimir → subir a Azure Blob.
   - Retención de 7 días, alerta si falla.

8. **Crear runbook operacional**
   - Cómo levantar/bajar el backend Docker.
   - Cómo verificar estado de ngrok.
   - Cómo restaurar un backup de BD.
   - Cómo hacer rollback de frontend en Vercel.

9. **Crear ADRs**
   - `ADR-2026-07-07-deploy-strategy-phase1.md`
   - `ADR-2026-07-07-cicd-pipeline.md`
   - `ADR-2026-07-07-db-backup-strategy.md`

## Progress

- 2026-07-07: Plan creado. Pendiente delegar a nexo-infra.
- 2026-07-22: Reproducido el fallo de Vercel `vite: command not found` en un
  checkout limpio ejecutado desde la raíz del repositorio. La instalación y el
  build limpios dentro de `front/` pasan, por lo que la corrección es configurar
  Vercel con Root Directory `front` y retirar el override heredado `vite build`.
  El runbook quedó actualizado; QA aprobó la preparación local y seguridad
  aprobó esta remediación acotada. El cambio externo y el redeploy siguen
  pendientes de confirmación explícita del usuario.
- 2026-07-22: El redeploy compiló y quedó Ready, pero la aceptación detectó el
  interstitial gratuito `ERR_NGROK_6024` en tráfico de navegador. Se aprobó el
  proxy same-origin Vercel→ngrok para cubrir API, cookies y fotos nativas.
- 2026-07-22: Con autorización explícita, se confirmaron Root Directory
  `front`, Vite, Node 22.x y ausencia de overrides; se configuraron
  `VITE_API_BASE_URL=/api/v1` y el `BACKEND_ORIGIN` actual para Production y
  Preview. El redeploy `9p8buojpD` quedó Ready y la ruta hospedada entrega JSON
  del backend sin el interstitial. La aceptación autenticada y el resto de la
  infraestructura NEXO-0031 siguen abiertos.
- 2026-07-25: Restaurado de forma reversible el backup local
  `nexo-backup-20260726T041228Z.sql.gz`. La base activa pasó de 56 a 78
  artículos/fotos; las 9 migraciones y sus checksums coinciden, no hay
  huérfanos, las 78 claves existen en Azure y la aceptación local autenticada
  de catálogos, inventario y fotos pasó. La base anterior se conserva como
  `nexo_pre_restore_20260726` para rollback.

## Decision Log

- 2026-07-07: ngrok elegido como túnel temporal (vs Cloudflare Tunnel, Tailscale Funnel)
  porque es el más simple para exponer un solo puerto. Cloudflare Tunnel requiere
  dominio en Cloudflare, Tailscale requiere VPN. ngrok funciona out-of-the-box.
- 2026-07-07: Vercel para frontend (no Netlify) porque ya tiene experiencia previa
  con React/Vite y soporta dominios custom en free tier.
- 2026-07-07: Azure Blob para backups porque ya está configurado para fotos
  (mismo storage account, reutilizar container o crear uno nuevo).
- 2026-07-22: Mantener `front/vercel.json` como configuración canónica y no
  duplicar `package.json`, Vite ni el lockfile en la raíz para ocultar un Root
  Directory incorrecto. Vercel debe instalar y construir desde `front/`.
- 2026-07-22: Enrutar `/api/v1/*` por Vercel con upstream fijo
  `BACKEND_ORIGIN` e inyectar server-side `ngrok-skip-browser-warning`; el
  navegador no debe llamar directamente al dominio ngrok.

## Risks

| Riesgo | Mitigación |
|--------|-----------|
| ngrok URL cambia en cada reinicio | ngrok free tier tiene URLs efímeras. Usar ngrok authtoken para URL semi-estable o actualizar `BACKEND_ORIGIN` en Vercel y re-deployar. |
| Cold start de ngrok + backend | Usar `restart: unless-stopped` en Docker Compose. Monitorear uptime. |
| Neon free tier limita a 0.5 GB | Monitorear tamaño de BD. Hacer vacuum regular. Backups permiten migrar si se excede. |
| Vercel Hobby plan limita 100 GB bandwidth | Suficiente para Fase 1. Monitorear analytics. |
| Docker local requiere máquina prendida 24/7 | Aceptado como limitación de Fase 1. AWS resolverá en Fase 2. |

## Verification

- [ ] `docker compose up` levanta backend + PostgreSQL + ngrok sin errores.
- [ ] ngrok genera URL pública accesible desde internet.
- [ ] `curl https://ngrok-url/api/v1/health` responde 200.
- [ ] GitHub Actions CI pasa en ambos repos.
- [ ] Vercel deploy exitoso en `teamnexo.nexoshopmx.store`.
- [x] Backup manual ejecutado y restaurado con éxito en BD local.
- [ ] Backup diario automático configurado y verificado.

## Related Records

- ADR: `docs/adr/ADR-2026-07-07-deploy-strategy-phase1.md`
- ADR: `docs/adr/ADR-2026-07-07-cicd-pipeline.md`
- ADR: `docs/adr/ADR-2026-07-07-db-backup-strategy.md`
- Handoff: `harness/control/handoffs/HOFF-2026-07-07-cicd-deploy-domain.md`
- Runbook: `harness/control/runbooks/RUNBOOK-NEXO-0031-operations.md`
- Architecture evaluation: `harness/control/decisions/DEC-NEXO-0031-vercel-ngrok-same-origin-proxy.md`
- Proxy ADR: `docs/adr/ADR-2026-07-22-vercel-ngrok-same-origin-proxy.md`
- Proxy handoff: `harness/control/handoffs/HOFF-2026-07-22-vercel-ngrok-same-origin-proxy.md`
