# CEF System Summary

CEF is an ASP.NET Core backend with a separate frontend. It owns ecosystem
identity, Identity users/roles, refresh tokens, service clients, academic
catalogs, teacher/student/program data, Mailgun-backed email, and SignalR
notifications.

Source layout:

- Solution: `/home/otomi/isyte-backup/Isyte/repos/CEF/SIPA-FIAD/SIPA-FIAD.sln`
- API project: `/home/otomi/isyte-backup/Isyte/repos/CEF/SIPA-FIAD/Presentacion/Presentacion.csproj`
- Data project: `/home/otomi/isyte-backup/Isyte/repos/CEF/SIPA-FIAD/Datos/Datos.csproj`
- Business/services/entities: `Negocios/`, `Servicios/`, `Entidades/`, `Utilidades/`
- Frontend: `/home/otomi/isyte-backup/Isyte/repos/CEF/SIPA_CE_FRONT`
- Dockerfile: `/home/otomi/isyte-backup/Isyte/repos/CEF/SIPA-FIAD/Dockerfile`

Runtime shape:

- `Program.cs` sets `UsePathBase("/cef")`.
- Controllers are mapped under `/cef/api/...` through Traefik.
- Swagger is exposed as `/cef/swagger` behind Harness routing.
- SignalR hubs are mapped at `/cef/hubs/notificaciones` and `/cef/hubs/sal`.
- PostgreSQL is used for Identity and academic data.
- Mailgun is used for email delivery.

Workflow evidence:

- Historical backend workflow:
  `/home/otomi/isyte-backup/Isyte/harness/.github/workflows/cef-backend.yml`
- Historical frontend workflow:
  `/home/otomi/isyte-backup/Isyte/harness/.github/workflows/cef-frontend.yml`
- Workspace map notes a branch mismatch: backend deploy branch is recorded as
  `Postgre`, while the workflow deploy condition checks `deploy`.

Responsibilities:

- Authenticate humans and issue ecosystem JWTs.
- Issue client-credentials tokens to trusted local services.
- Provide CE master data to HU and SAL through service endpoints.
- Centralize roles and role checks.
- Send email and notification events for downstream workflows.

