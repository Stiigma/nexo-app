# HU System Summary

HU is an ASP.NET Core backend plus frontend for Horas Universitarias. It stores
HU-specific data locally while relying on CEF for authentication, service
tokens and CE master data.

Source layout:

- Solution: `/home/otomi/isyte-backup/Isyte/repos/HU/HU-Backend/HU-Back.sln`
- API project: `/home/otomi/isyte-backup/Isyte/repos/HU/HU-Backend/Presentacion/Presentacion.csproj`
- Data project: `/home/otomi/isyte-backup/Isyte/repos/HU/HU-Backend/Datos/Datos.csproj`
- Business/services/entities: `Negocios/`, `Servicios/`, `Entidades/`
- Frontend: `/home/otomi/isyte-backup/Isyte/repos/HU/HU-Frontend`
- Dockerfile: `/home/otomi/isyte-backup/Isyte/repos/HU/HU-Backend/Dockerfile`

Runtime shape:

- Controllers are mapped under `/hu/api/...` by Harness Traefik.
- JWT validation is configured against CEF-issued tokens.
- `ServiceTokenProvider` requests CEF service tokens using client credentials.
- `ResourceApi` clients call CEF master-data endpoints.
- PostgreSQL stores HU and CE mirror/reference tables.

Workflow evidence:

- Backend workflow:
  `/home/otomi/isyte-backup/Isyte/harness/.github/workflows/hu-backend.yml`
- Frontend workflow:
  `/home/otomi/isyte-backup/Isyte/harness/.github/workflows/hu-frontend.yml`
- Workspace map records backend deploy branch `deploy` and frontend branch
  `release`.

Responsibilities:

- Manage university-hour cycles.
- Manage activities and activity posters.
- Register attendance and certificates.
- Manage speakers/expositors.
- Present CE data needed by HU screens through CEF-backed API clients.

