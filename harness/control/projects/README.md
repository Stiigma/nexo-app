# FIAD Project Context

This directory is the canonical per-project entry point for FIAD ecosystem work.
It is paired with `harness/control/ecosystem/` and replaces legacy chat/memory
as the normal operating context.

Projects:

- `CEF/`: Control Escolar FIAD, auth backbone, master data, notifications.
- `HU/`: Horas Universitarias service and frontend.
- `SAL/`: Salidas/Autorizaciones service and frontend.
- `Harness/`: local Docker, Traefik, K3d/K8s, CI/CD and OpenCode adapters.

Rules:

- Source repositories remain under `/home/otomi/isyte-backup/Isyte` and are
  treated as read-only evidence for this context.
- Do not open or copy real secret files. Record variable names, owners, and
  consumers only.
- New FIAD implementation work discovered from these docs should become
  `FIAD-0004+`.

