# Harness Integrations

Local routing:

- Traefik maps `/cef`, `/hu` and `/sal` route families to project services.
- Swagger routes can be protected by middleware.
- Security headers and rate limits are centralized in Traefik/K8s middleware.

Runtime integration:

- Docker Compose coordinates local app services and infrastructure.
- K3d/K8s manifests provide staging/production-like deployment shape.
- PostgreSQL is shared infrastructure, with separate application databases or
  schemas depending on env setup.

CI/CD integration:

- Historical workflows under `.github/workflows` build/deploy six targets:
  CEF backend/frontend, HU backend/frontend, SAL backend/frontend.
- `workspace-map.json` and project profiles document known branch/deploy drift.

OpenCode integration:

- `opencode.json` maps `fiad:*` and `isyte:*` commands to FIAD agents.
- `.opencode/agents/fiad-*.md` are adapters that point back to
  `harness/control/agents/fiad-*.md`.
- `.opencode/plugins/isyte-ops.mjs` exposes the ESM runtime adapter;
  `.opencode/lib/isyte-ops.cjs` reads canonical ecosystem/state files and
  injects context for FIAD commands.

Canonical context integration:

- `harness/control/ecosystem/overview.md` gives the entry-point mental model.
- `harness/control/ecosystem/integrations.md` explains cross-service calls.
- `harness/control/ecosystem/local-dotnet-service-playbook.md` explains how to
  add another local .NET service.
- Per-project profiles under `harness/control/projects/` provide source-path
  evidence.
