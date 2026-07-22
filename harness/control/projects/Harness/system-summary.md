# Harness System Summary

Harness is the operating platform around CEF, HU and SAL. In the current Nexo
workspace, `harness/control/` is canonical for FIAD context. The historical
FIAD harness under `/home/otomi/isyte-backup/Isyte/harness` remains source
evidence for Docker, Traefik, K3d/K8s, scripts and workflows.

Main responsibilities:

- Route local traffic to CEF, HU and SAL.
- Run local Docker Compose stacks.
- Provide K3d/K8s manifests and overlays.
- Hold GitHub Actions workflows for the FIAD services.
- Provide scripts for setup, deploy, DB initialization, tunnel and reset tasks.
- Provide OpenCode command adapters for `fiad:*` and `isyte:*`.
- Store canonical task, plan, report, closeout, profile and ecosystem context.

Important source locations:

- Legacy Makefile: `/home/otomi/isyte-backup/Isyte/harness/Makefile`
- Docker Compose: `/home/otomi/isyte-backup/Isyte/harness/docker/docker-compose.yml`
- K3d Compose: `/home/otomi/isyte-backup/Isyte/harness/docker/docker-compose.k3d.yml`
- Traefik static config: `/home/otomi/isyte-backup/Isyte/harness/traefik/traefik.yml`
- Traefik dynamic config: `/home/otomi/isyte-backup/Isyte/harness/traefik/dynamic/`
- K8s base/overlays: `/home/otomi/isyte-backup/Isyte/harness/k8s/`
- Scripts: `/home/otomi/isyte-backup/Isyte/harness/scripts/`
- Workflows: `/home/otomi/isyte-backup/Isyte/harness/.github/workflows/`

Canonical FIAD context locations:

- Ecosystem docs: `harness/control/ecosystem/`
- Project docs: `harness/control/projects/`
- State JSON: `harness/control/state/`
- FIAD agents/checklists/skills: `harness/control/agents/`,
  `harness/control/checklists/`, `harness/control/skills/`
- OpenCode adapters: `.opencode/agents/fiad-*.md`,
  `.opencode/plugins/isyte-ops.mjs`, `.opencode/lib/isyte-ops.cjs`,
  `opencode.json`
