# FIAD Integrations

## High-Level Flow

| Consumer | Provider | Mechanism | Purpose | Source evidence |
| --- | --- | --- | --- | --- |
| CEF frontend | CEF API | Axios with `withCredentials` | Auth, master data, users, notifications | `repos/CEF/SIPA_CE_FRONT/src/common/api/InstanciaAxios.ts` |
| HU frontend | HU API | Axios with cookies | HU activities, attendance, posters | `repos/HU/HU-Frontend/src/lib/axios.ts` |
| HU frontend | CEF API | Axios with cookies | Login, refresh, current user | `repos/HU/HU-Frontend/src/services/auth.service.ts` |
| SAL frontend | SAL API | Axios with cookies | SAL requests, files, reports | `repos/SAL/Front_SIPA-SAL/src/shared/services/httpClientSAL.ts` |
| SAL frontend | CEF API | Axios with cookies | Login and profile/session | `repos/SAL/Front_SIPA-SAL/src/shared/services/httpClientCE.ts` |
| HU backend | CEF API | Client credentials token + HttpClient | Docente, Alumno, PlanEstudio lookups | `repos/HU/HU-Backend/Presentacion/Program.cs` |
| SAL backend | CEF API | Client credentials token + HttpClient | Users, roles, email, notifications, SAL info | `repos/SAL/SIPA-SAL/Servicios/CE/ApiClients/` |
| SAL backend | Google Drive | Service account / Drive API | Upload/download/delete request documents | `repos/SAL/SIPA-SAL/Datos/GoogleDrive/` |
| CEF backend | Mailgun | HTTP API | Email notifications | `repos/CEF/SIPA-FIAD/Utilidades/Email/` |

## JWT And Cookies

CEF sets/uses `accessToken` and refresh cookies for browser sessions. HU and SAL
JWT handlers read `accessToken` from cookies first, then Bearer headers. CEF
SignalR also accepts `access_token` from query string for WebSocket handshakes.

Source evidence:

- CEF JWT/Identity config: `repos/CEF/SIPA-FIAD/Presentacion/Program.cs`
- HU JWT validation: `repos/HU/HU-Backend/Presentacion/Program.cs`
- SAL JWT validation: `repos/SAL/SIPA-SAL/SIPA-SAL/Program.cs`

## Client Credentials

CEF stores service clients in `ServiceClients` with `ClientId`,
`ClientSecretHash`, `AllowedScopes`, active flag, and timestamps. HU and SAL
request tokens from CEF through `AUTH_SERVER_BASE_URL`,
`AUTH_SERVER_TOKEN_ENDPOINT`, `AUTH_SERVER_CLIENT_ID`, and
`AUTH_SERVER_CLIENT_SECRET`.

Do not write client secret values. Create clients through CEF admin endpoints or
approved seed/migration flow, then store secrets in the operator secret source.

## SignalR

CEF exposes two hubs:

- `/hubs/notificaciones` for general notifications.
- `/hubs/sal` for SAL-specific lightweight events.

Traefik exposes them under `/cef/hubs/notificaciones` and `/cef/hubs/sal`.
CEF frontend and SAL frontend both use SignalR with credentials.

Source evidence:

- `repos/CEF/SIPA-FIAD/Presentacion/Hubs/NotificacionHub.cs`
- `repos/CEF/SIPA-FIAD/Presentacion/Hubs/SALHub.cs`
- `repos/CEF/SIPA-FIAD/Presentacion/Program.cs`
- `repos/SAL/Front_SIPA-SAL/src/shared/services/signalRClient.ts`

## PostgreSQL

All .NET backends use EF Core with Npgsql. Source code reads DB connection
parts from environment variables:

- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

The historical Docker Compose config and DB scripts disagree on whether local
services share one database or use per-service DBs. Verify the chosen model
before running migrations or `init-dbs.sh`.

## Traefik Routing

Traefik dynamic files define path-prefix routing and strip middleware:

- `cef.yml`: `/cef/api`, `/cef/swagger`, `/cef/hubs`, `/cef`.
- `hu.yml`: `/hu/api`, `/hu/swagger`, `/hu`.
- `sal.yml`: `/sal/api`, `/sal/swagger`, `/sal`.
- `auth.yml`: global security headers, rate limits, swagger basic auth, and
  optional forward-auth.

## Google Drive

SAL stores request-related PDFs/documents in Google Drive and persists internal
file IDs in database records. New docs must not expose Drive IDs, service
account JSON, refresh tokens, or folder IDs unless explicitly authorized.

Source evidence:

- `repos/SAL/SIPA-SAL/Datos/GoogleDrive/Factory/GoogleDriveService.cs`
- `repos/SAL/SIPA-SAL/Datos/GoogleDrive/Repositories/`
- `repos/SAL/SIPA-SAL/Entidades/ConfigCE/GoogleDriveOptions.cs`
- `repos/SAL/SIPA-SAL/SIPA-SAL/Program.cs`
