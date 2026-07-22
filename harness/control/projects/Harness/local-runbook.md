# Harness Local Runbook

Use the legacy harness as the source for executable local operations. Use this
workspace's `harness/control/` as canonical memory.

## Common Commands

From `/home/otomi/isyte-backup/Isyte/harness`:

```bash
make up
make down
make build
make logs
make clean
make k3d-up
make k3d-deploy-staging
make k3d-deploy-prod
make k3d-logs
make k3d-restart
make k3d-ci
make k3d-dash
make init-db
make setup
```

Script entry points:

- `scripts/bootstrap.sh`
- `scripts/setup.sh`
- `scripts/init-dbs.sh`
- `scripts/reset-db.sh`
- `scripts/deploy.sh`
- `scripts/k3d-up.sh`
- `scripts/setup-staging.sh`
- `scripts/start-db-tunnel.sh`

## Canonical Context Commands

From `/home/otomi/nexo/develoment`:

```bash
opencode debug config
opencode debug agent fiad-plan
opencode debug agent fiad-build
```

Configured FIAD commands:

- `fiad:resume`: resume from canonical FIAD context.
- `fiad:doctor`: inspect FIAD context readiness.
- `fiad:plan`: planning with canonical FIAD docs.
- `fiad:build`: implementation from FIAD handoffs.
- `fiad:infra`: Docker/K8s/CI/CD/runbook work.
- `fiad:security`: auth/secrets/data exposure review.

## Smoke Checks

1. Validate `opencode.json` and FIAD profile JSON.
2. Check `opencode debug config`.
3. Check `opencode debug agent fiad-plan` and `fiad-build`.
4. Start local stack with `make up` only with user confirmation if it affects
   external state or requires real secrets.
5. Check `/cef/swagger`, `/hu/swagger`, `/sal/swagger`.
6. Check Traefik routes before debugging application code.

## Troubleshooting

- If a FIAD command lacks context, inspect `.opencode/plugins/isyte-ops.mjs`,
  `.opencode/lib/isyte-ops.cjs`, and `harness/control/state/workspace-map.json`.
- If a route 404s, inspect Traefik dynamic route files first, then app
  path-base settings.
- If a service starts but cross-service calls fail, compare each project's
  `security-auth.md` and `credential-map.md` variable names.
