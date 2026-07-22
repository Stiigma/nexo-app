# Local .NET Service Playbook

Use this playbook when adding a new local FIAD service that must run beside CEF,
HU, and SAL.

## Expected Structure

Follow the existing .NET layering unless a new ADR says otherwise:

- `Entidades/` for EF entities, DTOs, options, profiles, enums, events.
- `Datos/` for `DbContext`, repositories, Google/third-party data adapters, and
  Unit of Work.
- `Negocios/` for business rules and orchestration.
- `Servicios/` for application services, API clients, background jobs, auth
  handlers, and helpers.
- Presentation project for controllers, `Program.cs`, Swagger, auth, CORS,
  rate limiting, and middleware.

## Auth Against CEF

1. Register a service client in CEF; store only `ClientSecretHash` in CEF.
2. Configure the new service with:
   - `AUTH_SERVER_BASE_URL`
   - `AUTH_SERVER_TOKEN_ENDPOINT`
   - `AUTH_SERVER_CLIENT_ID`
   - `AUTH_SERVER_CLIENT_SECRET`
   - `JWT_KEY`
3. Validate user JWTs with the same issuer/audience policy used by HU/SAL.
4. Read user tokens from `accessToken` cookie and optionally Bearer headers.
5. Use an HttpClient with a delegating handler like `ServiceAuthHandler` for CEF
   resource calls.

## Database

1. Choose database model explicitly: shared `SIPA-FIAD` DB or per-service DB.
2. Add `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, and
   `POSTGRES_PASSWORD` to env templates.
3. Use EF Core + Npgsql.
4. Add `DbSet` entries and EF mappings in the service `DbContext`.
5. Do not hard-code credentials in `appsettings*.json`.

## Docker And Traefik

1. Add a Dockerfile for the backend.
2. Add frontend Dockerfile only if the service has a UI.
3. Add Docker Compose service entries under Harness.
4. Add Traefik dynamic routes:
   - `/<service>/api` to backend.
   - `/<service>/swagger` to backend with swagger auth if exposed.
   - `/<service>` to frontend if present.
   - `/<service>/hubs` for SignalR if present.
5. Use strip-prefix middleware to keep app routes stable.

## Health And Diagnostics

At minimum add:

- Swagger enabled for local/dev only or gated in shared environments.
- DB connectivity check or health endpoint.
- Logs that identify service, environment, DB host/name without secrets.
- Smoke commands in `local-runbook.md`.

## Verification

- `dotnet restore`
- `dotnet build --configuration Release`
- `dotnet test --configuration Release --no-build` if tests exist.
- `docker compose config` from Harness.
- Local smoke:
  - unauthenticated Swagger route as expected.
  - login through CEF.
  - protected endpoint with CEF cookie.
  - service-to-CEF call through client credentials.
  - SignalR connect if applicable.

## Control-Plane Records

For new service implementation, open `FIAD-0004+` and create:

- Plan in `plans/`.
- Handoff in `handoffs/` for non-trivial implementation.
- ADR for durable infra/auth/routing conventions.
- Implementation record in `implementations/`.
- Report and closeout with verification.
