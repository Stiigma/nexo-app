# ADR-2026-07-07-deploy-strategy-phase1

## Status

Accepted.

## Context

Nexo v1 needs a deployable Fase 1 while the product is still evolving (features
F2–F11 pending). The backend (`@nexo/back`, NestJS + Prisma + PostgreSQL) must be
exposed over a stable public HTTPS endpoint, and the frontend (`@nexo/front`,
React PWA, Vite) must be served with CI/CD. The team wants minimal operational
burden and cost during this early phase, with a clear, low-risk path to a future
cloud-native Phase 2 (AWS, IaC, Kubernetes, CloudWatch).

Constraints:

- Single operator, no dedicated SRE; 24/7 availability is "best effort" in Fase 1.
- Backend database lives in **Neon** (managed Postgres) — already chosen.
- Frontend custom domain target: `teamnexo.nexoshopmx.store` on **Vercel**.
- Budget-conscious: avoid standing up a full Kubernetes/AWS footprint yet.
- Must keep all secrets out of source control (control-plane rule).

## Decision

Adopt a **Docker-Compose + ngrok + Vercel** deploy strategy for Fase 1:

| Layer | Choice | Rationale |
|---|---|---|
| Backend runtime | Docker image (`back/Dockerfile`, multi-stage Node 22 Alpine + pnpm) run via `docker compose` on a single host | Simple, reproducible, matches existing `infra/docker-compose.yml` (already has `nexo-postgres`) |
| Public HTTPS for backend | `ngrok` tunnel (`nexo-ngrok` service) to `nexo-api:3000` | Instant public TLS endpoint without DNS/load-balancer setup; good enough for Fase 1 |
| Frontend hosting | Vercel (`teamnexo.nexoshopmx.store`) via `vercel.json` + `amondnet/vercel-action` | Global CDN, zero-config SPA, free-tier friendly, first-class CI/CD |
| Local dev DB | `nexo-postgres` (Postgres 16) in compose | Kept for offline dev; production uses Neon via `NEXO_DATABASE_URL` |
| Phase 2 deferral | AWS / IaC / K8s / CloudWatch explicitly out of scope | Defer cost/complexity until product is stable |

`nexo-api` is bound to `127.0.0.1:3000` and is reached publicly only through the
ngrok tunnel; the ngrok dashboard is bound to `127.0.0.1:4040` (never public).

## Consequences

- **Positive:** Near-zero infrastructure setup; backend reachable over HTTPS in
  minutes; frontend deploys automatically on push to `main`.
- **Positive:** Secrets stay in `.env`/GitHub/Vercel/ngrok secrets; nothing
  sensitive is committed.
- **Positive:** Clear, documented migration path to Phase 2 (swap ngrok for a
  managed ingress; move compose service to container orchestration).
- **Risk:** ngrok free tier rotates the public URL on restart — mitigated by
  ngrok authtoken and documented `VITE_API_BASE_URL` update procedure in the
  runbook (`RUNBOOK-NEXO-0031-operations.md`).
- **Risk:** Single-host Docker is a SPOF for the API — accepted for Fase 1;
  Phase 2 addresses HA.
- **Risk:** ngrok exposes the API publicly; mitigated by authtoken, loopback
  dashboard binding, and standard app-level auth (NEXO-0007/0020/0022).
- **Risk:** Neon free-tier storage (0.5 GB) — mitigated by daily backups and
  monitoring (see `ADR-2026-07-07-db-backup-strategy.md`).
