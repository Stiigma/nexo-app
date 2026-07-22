# FIAD Tools And Scripts

## OpenCode Commands

Canonical commands:

- `fiad:resume` - read FIAD control-plane entrypoints and summarize state.
- `fiad:doctor` - verify FIAD continuity, links, JSON, reports, profiles, and
  adapters.
- `fiad:plan` - create or update a non-mutating FIAD plan/handoff.
- `fiad:build` - implement from FIAD handoff or investigation.
- `fiad:infra` - execute infrastructure work with gates.
- `fiad:security` - review secrets/auth/permissions/exposure.

Compatibility aliases:

- `isyte:resume`
- `isyte:doctor`

Legacy backup commands include more `isyte:*` aliases, but the canonical
surface in this workspace should prefer `fiad:*`.

## Local Plugin

`.opencode/plugins/isyte-ops.mjs` loads the testable
`.opencode/lib/isyte-ops.cjs` core and injects FIAD context from:

- `state/workspace-map.json`
- `state/project-policy.json`
- `ecosystem/overview.md`
- `ecosystem/integrations.md`
- Project Profiles

It does not replace the Nexo budget guard and does not mutate files.

## Harness Makefile

Historical source: `/home/otomi/isyte-backup/Isyte/harness/Makefile`.

Important targets:

- `make up` - local Docker Compose stack from `harness/docker`.
- `make down` - stop compose stack.
- `make build` - build compose services.
- `make logs` - stream compose logs.
- `make clean` - stop compose stack and remove volumes.
- `make k3d-up` - create K3d cluster.
- `make k3d-setup` - setup K3d staging.
- `make k3d-deploy-staging` - apply staging Kustomize overlay.
- `make k3d-deploy-prod` - apply production overlay.
- `make k3d-logs SERVICE=<name>` - tail deployment logs.
- `make k3d-restart SERVICE=<name>` - restart deployment.
- `make init-db` - initialize PostgreSQL DB/users.

## Harness Scripts

Historical source: `/home/otomi/isyte-backup/Isyte/harness/scripts/`.

- `bootstrap.sh` - dependency/config bootstrap and next-step guidance.
- `setup.sh` - dependency check and local mode selection.
- `init-dbs.sh` - PostgreSQL DB/user creation. Review before use; historical
  defaults must be replaced with real secret-source values.
- `reset-db.sh` - destructive DB reset; requires explicit confirmation before
  use.
- `k3d-up.sh` - creates local K3d cluster named `fiad` by default.
- `setup-staging.sh` - staging setup.
- `start-db-tunnel.sh` - DB tunnel helper.
- `deploy.sh` - local/remote image build and deploy helper. External mutation
  requires explicit user confirmation.

## Docker Compose

Historical source: `/home/otomi/isyte-backup/Isyte/harness/docker/docker-compose.yml`.

Services:

- `traefik`
- `forward-auth`
- `postgres`
- `cef-backend`
- `cef-frontend`
- `hu-backend`
- `hu-frontend`
- `sal-backend`
- `sal-frontend`

Known guardrail: historical compose contains literal/default secret-like values
and mounts real env/secret paths. Treat it as a source to clean up before use,
not a safe template.

## K3d/K8s

Historical source: `/home/otomi/isyte-backup/Isyte/harness/k8s/`.

- `base/` contains namespace, services, deployments, ingress, middleware,
  monitoring, and PostgreSQL service.
- `overlays/staging/` and `overlays/production/` patch environment, domain, and
  replica count.
- Durable K8s conventions require an ADR and QA/security review before close.

## CI/CD Workflows

Historical source: `/home/otomi/isyte-backup/Isyte/harness/.github/workflows/`.

- `cef-backend.yml`
- `cef-frontend.yml`
- `hu-backend.yml`
- `hu-frontend.yml`
- `sal-backend.yml`
- `sal-frontend.yml`

Known inconsistencies:

- `workspace-map.json` names CEF backend deploy branch `Postgre`, while the
  historical workflow deploy condition checks `deploy`.
- Project Profiles name SAL backend `dev` and frontend `release`; the legacy
  plugin used `deploy` for SAL components.
- SAL workflow variables for Google Drive do not fully match current SAL
  `Program.cs`.

Treat CI/CD edits as `fiad-infra` work with an ADR, QA, security review, and
explicit user confirmation before push/deploy.
