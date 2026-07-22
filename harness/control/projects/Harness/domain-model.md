# Harness Operational Model

Harness domain concepts are operational rather than application entities.

Projects:

- CEF: auth, CE master data, notifications.
- HU: university-hour service.
- SAL: salida workflow service.
- Harness: routes, scripts, workflows and canonical control context.

Runtime components:

- Docker Compose services for CEF/HU/SAL/frontends/PostgreSQL/Traefik.
- Traefik static and dynamic config.
- K3d/K8s base resources and overlays.
- GitHub Actions workflows per backend/frontend.
- OpenCode command adapters and canonical agent docs.

State records:

- `harness/control/state/workspace-map.json`: repo paths, deploy branch notes,
  canonical profiles and sensitive/deploy file patterns.
- `harness/control/state/project-policy.json`: FIAD operating policy.
- `harness/control/tasks.md`: live task index including `FIAD-0003`.
- `harness/control/ecosystem/credential-map.md`: safe credential inventory.

Relationships:

- Harness routes frontend and backend traffic to each project.
- Harness scripts bring up shared infrastructure first, then services.
- Workflows build/deploy each project from historical branch conventions.
- OpenCode adapters read canonical control docs; `.opencode/` is an adapter
  layer, not the source of truth.

Sensitive model elements:

- `.env`, SQL dumps, PDFs/XLSX credential documents, service account JSON,
  `Secrets/`, and `traefik/users` are sources for humans/operators only and are
  not copied into canonical memory.

