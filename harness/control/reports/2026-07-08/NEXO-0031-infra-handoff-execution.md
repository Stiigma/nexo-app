# NEXO-0031 — Infra Handoff Execution (file-creation scope)

- Date: 2026-07-08
- Authoring agent: nexo-plan
- Executing agent: nexo-infra (subagent, delegated)
- Handoff: `harness/control/handoffs/HOFF-2026-07-07-cicd-deploy-domain.md`

## What was done

`nexo-plan` edited `.opencode/agents/nexo-plan.md` and `.opencode/agents/nexo-infra.md`
to make `nexo-infra` delegatable from `nexo-plan` (permission blocks + explicit
`mode: all` and tool allow-list), then delegated the Fase 1 file-creation scope
of the handoff to `nexo-infra`.

### Files created / modified (absolute paths)

- `/home/otomi/nexo/develoment/back/Dockerfile`
- `/home/otomi/nexo/develoment/back/.dockerignore`
- `/home/otomi/nexo/develoment/back/.github/workflows/nexo-api-ci.yml`
- `/home/otomi/nexo/develoment/infra/docker-compose.yml` (added `nexo-api`, `nexo-ngrok`; kept `nexo-postgres`)
- `/home/otomi/nexo/develoment/infra/.env.example` (placeholders only)
- `/home/otomi/nexo/develoment/front/vercel.json`
- `/home/otomi/nexo/develoment/front/.github/workflows/nexo-app-cicd.yml`
- `/home/otomi/nexo/develoment/front/.env.production.example` (placeholder)
- `/home/otomi/nexo/develoment/.github/workflows/nexo-db-backup.yml`
- `/home/otomi/nexo/develoment/harness/control/runbooks/RUNBOOK-NEXO-0031-operations.md`
- `/home/otomi/nexo/develoment/docs/adr/ADR-2026-07-07-deploy-strategy-phase1.md`
- `/home/otomi/nexo/develoment/docs/adr/ADR-2026-07-07-cicd-pipeline.md`
- `/home/otomi/nexo/develoment/docs/adr/ADR-2026-07-07-db-backup-strategy.md`

## Verification (non-destructive)

- `docker compose -f infra/docker-compose.yml config` → exit 0; services
  `nexo-api`, `nexo-ngrok`, `nexo-postgres` parsed.
- YAML (4 files) and JSON (`front/vercel.json`) parse OK.
- pnpm referenced in Dockerfile + both CI workflows.

## Guardrails honored

- No real secrets written; all credentials are placeholders or
  `${{ secrets.* }}` references.
- `back/.env`, `front/.env`, and credential-bearing files left untouched.
- Nothing built, pushed, deployed, or run against live services.

## Pending (requires user confirmation + credentials)

1. Push to GitHub (back, front, root/infra).
2. Vercel deploy + add domain `teamnexo.nexoshopmx.store` + DNS CNAME.
3. Real ngrok authtoken for the public tunnel.
4. Neon `DATABASE_URL` + Azure Storage connection string as GitHub Actions
   secrets before the backup workflow can run for real.
5. QA review + Security review before close (control-plane rule for CI/CD,
   deploy, secrets, exposure, backups).

## Next step

Obtain user confirmation + credentials for items 1–4, run QA + security gates,
then close NEXO-0031 with a closeout that records deployed URLs and verified
backup restore.
