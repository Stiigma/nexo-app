# Harness Code Map

Legacy harness source root:
`/home/otomi/isyte-backup/Isyte/harness`.

Canonical control root:
`/home/otomi/nexo/develoment/harness/control`.

OpenCode adapter root:
`/home/otomi/nexo/develoment/.opencode`.

Important legacy harness files:

- `Makefile`: common targets for local Docker and K3d/K8s operations.
- `docker/docker-compose.yml`: local Compose stack.
- `docker/docker-compose.k3d.yml`: K3d-oriented Compose support.
- `traefik/traefik.yml`: static Traefik config.
- `traefik/dynamic/auth.yml`: middleware/security/rate-limit/basic auth.
- `traefik/dynamic/cef.yml`, `hu.yml`, `sal.yml`: project routes.
- `scripts/bootstrap.sh`: bootstrap flow.
- `scripts/setup.sh`: setup flow.
- `scripts/init-dbs.sh`: database initialization.
- `scripts/reset-db.sh`: reset helper.
- `scripts/deploy.sh`: deploy helper.
- `scripts/k3d-up.sh`: K3d cluster helper.
- `scripts/setup-staging.sh`: staging helper.
- `scripts/start-db-tunnel.sh`: DB tunnel helper.
- `k8s/base/`: namespace, services, deployments, middleware, ingress,
  monitoring.
- `k8s/overlays/staging/` and `k8s/overlays/production/`: environment-specific
  patches.
- `.github/workflows/*.yml`: CI/CD workflows for CEF/HU/SAL backends and
  frontends.

Canonical FIAD files in this workspace:

- `harness/control/ecosystem/*.md`
- `harness/control/projects/*/*.md`
- `harness/control/projects/*/profile.json`
- `harness/control/agents/fiad-*.md`
- `harness/control/checklists/fiad-*.md`
- `harness/control/skills/fiad-*.md`
- `harness/control/state/workspace-map.json`
- `harness/control/state/project-policy.json`
- `.opencode/agents/fiad-*.md`
- `.opencode/plugins/isyte-ops.mjs`
- `.opencode/lib/isyte-ops.cjs`
- `opencode.json`
