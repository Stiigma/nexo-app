# SAL Integrations

Inbound consumers:

- SAL frontend calls SAL backend under `/sal/api`.
- Harness routes `/sal`, `/sal/api` and `/sal/swagger`.

Outbound dependencies:

- CEF for JWT authority, service-token issuance, users, roles, SAL info,
  teacher data, email and notifications.
- Google Drive for uploaded/generated request documents.
- PostgreSQL for SAL workflow state.
- CEF SignalR/notification paths for user notifications.

Backend-to-backend flow:

1. User authenticates with CEF and sends CEF JWT to SAL.
2. SAL validates the JWT using CEF-aligned issuer/audience/key.
3. SAL uses `AUTH_SERVER_*` variables to request a CEF service token.
4. SAL uses `URL_CE_API` and `Servicios/CE/ApiClients/*` to call CEF resource
   endpoints.
5. SAL stores files through Google Drive and records metadata in PostgreSQL.
6. SAL emits notification/email work through its background services and CEF
   clients.

Routing contracts:

- Traefik dynamic source:
  `/home/otomi/isyte-backup/Isyte/harness/traefik/dynamic/sal.yml`.
- Local base: `/sal`.
- API base: `/sal/api`.
- Swagger: `/sal/swagger`.

Known integration drift:

- Current `Program.cs` expects service-account style Google Drive variables
  such as `GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_PATH` and folder IDs.
- Some historical templates referred to client-id/client-secret style Drive
  variables. Use `Program.cs` as current source until a future FIAD task
  reconciles templates.
- SAL branch names differ across historical plugin data, workflows and project
  profiles.

