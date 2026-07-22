# SAL System Summary

SAL is an ASP.NET Core backend plus frontend for request workflows around
academic trips/salidas. It owns request state, files, reports, signatures and
background processing, while depending on CEF for identity, roles, users and
notifications.

Source layout:

- Backend root: `/home/otomi/isyte-backup/Isyte/repos/SAL/SIPA-SAL`
- API project: `/home/otomi/isyte-backup/Isyte/repos/SAL/SIPA-SAL/SIPA-SAL/SIPA-SAL.csproj`
- Data project: `/home/otomi/isyte-backup/Isyte/repos/SAL/SIPA-SAL/Datos/Datos.csproj`
- Business/services/entities: `Negocios/`, `Servicios/`, `Entidades/`
- Frontend: `/home/otomi/isyte-backup/Isyte/repos/SAL/Front_SIPA-SAL`
- Dockerfile: `/home/otomi/isyte-backup/Isyte/repos/SAL/SIPA-SAL/Dockerfile`

Runtime shape:

- Controllers are mapped under `/sal/api/...` by Harness Traefik.
- JWT validation trusts CEF-issued tokens.
- Client credentials are used for CEF service calls.
- Google Drive stores uploaded/generated files.
- Hosted services process notifications, report vigency and request
  expiration.
- PostgreSQL stores SAL workflow state.

Workflow evidence:

- Backend workflow:
  `/home/otomi/isyte-backup/Isyte/harness/.github/workflows/sal-backend.yml`
- Frontend workflow:
  `/home/otomi/isyte-backup/Isyte/harness/.github/workflows/sal-frontend.yml`
- Workspace map records SAL backend as `dev/release`; older plugin data used
  `deploy`. Treat branch naming as drift until reconciled.

Responsibilities:

- Create, update, archive, reject, sign and list salida requests.
- Manage request favorites, filters, history views and counts.
- Upload/download/delete supporting files.
- Generate and track reports/documents.
- Notify users through CEF email/notification integrations.

