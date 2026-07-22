# Harness Routes And Operational Endpoints

Harness itself is not an application API. Its endpoint surface is the routing
and local operations it provides to CEF, HU and SAL.

## Traefik Routes

| Route | Target | Source | Notes |
| --- | --- | --- | --- |
| `/cef` | CEF frontend/backend grouping | `/home/otomi/isyte-backup/Isyte/harness/traefik/dynamic/cef.yml` | CEF path base is also set in backend `UsePathBase("/cef")` |
| `/cef/api` | CEF backend API | same | auth, CE, HU/SAL service endpoints |
| `/cef/swagger` | CEF Swagger | same | may be behind basic auth middleware |
| `/cef/hubs` | CEF SignalR | same | notifications and SAL hubs |
| `/hu` | HU frontend/backend grouping | `/home/otomi/isyte-backup/Isyte/harness/traefik/dynamic/hu.yml` | local HU service |
| `/hu/api` | HU backend API | same | activities, attendance, expositors, posters |
| `/hu/swagger` | HU Swagger | same | may be behind basic auth middleware |
| `/sal` | SAL frontend/backend grouping | `/home/otomi/isyte-backup/Isyte/harness/traefik/dynamic/sal.yml` | local SAL service |
| `/sal/api` | SAL backend API | same | salida requests, files, reports |
| `/sal/swagger` | SAL Swagger | same | may be behind basic auth middleware |

## Middleware And Infra Routes

| Surface | Source | Purpose |
| --- | --- | --- |
| Security headers | `harness/traefik/dynamic/auth.yml`, `harness/k8s/base/middleware/sec-headers.yaml` | common headers |
| Rate limit | `harness/traefik/dynamic/auth.yml`, `harness/k8s/base/middleware/rate-limit.yaml` | request limiting |
| Swagger auth | `harness/traefik/dynamic/auth.yml`, `harness/k8s/base/middleware/swagger-auth.yaml` | protect docs |
| K8s ingress | `harness/k8s/base/ingress/*.yaml` | CEF/HU/SAL ingress routes |
| Monitoring | `harness/k8s/base/monitoring/uptime-kuma.yaml` | local monitor surface |

## OpenCode Commands

Configured in `opencode.json`:

- `fiad:resume`
- `fiad:doctor`
- `fiad:plan`
- `fiad:build`
- `fiad:infra`
- `fiad:security`
- `isyte:resume`
- `isyte:doctor`

The local adapter `.opencode/plugins/isyte-ops.mjs` loads
`.opencode/lib/isyte-ops.cjs`, which injects canonical FIAD context into
matching OpenCode sessions and compaction events.
