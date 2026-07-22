# CEF Local Runbook

Use this as an operational checklist. Do not place real values in this file.

## Required Variables

- PostgreSQL: `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`,
  `POSTGRES_USER`, `POSTGRES_PASSWORD`.
- JWT: `Jwt__Issuer`, `Jwt__Audience`, `Jwt__Key`.
- Email: `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_BASE_URL`,
  `EMAIL_FROM`.
- Optional migration flag: `AUTO_MIGRATE`.

Secret sources are listed in `../../ecosystem/credential-map.md`; use
placeholders in docs and examples.

## Build Directly

From `/home/otomi/isyte-backup/Isyte/repos/CEF/SIPA-FIAD`:

```bash
dotnet restore SIPA-FIAD.sln
dotnet build SIPA-FIAD.sln
dotnet run --project Presentacion/Presentacion.csproj
```

## Run Through Harness

From `/home/otomi/isyte-backup/Isyte/harness`:

```bash
make up
make logs
```

Harness route expectations:

- `GET http://localhost/cef/swagger`
- `GET http://localhost/cef/api/auth/check`
- `POST http://localhost/cef/api/auth/login`
- `POST http://localhost/cef/api/auth/service-token`

## Smoke Checks

1. Confirm CEF container/process starts without missing variable errors.
2. Open Swagger through `/cef/swagger`.
3. Exercise auth check and login with test credentials from the approved
   secret source, not from this repository.
4. Request a service token using a configured service client.
5. Check one service endpoint used by HU or SAL.
6. Check SignalR hub negotiation from a frontend if the change touches
   notifications.

## Troubleshooting

- Missing PostgreSQL variables fail startup early in `Program.cs`.
- Bad JWT key/issuer/audience causes all HU/SAL validation to fail.
- Mailgun variables are required for email paths.
- Path-base issues usually surface as `/cef/swagger` or `/cef/api` 404s; check
  both `UsePathBase("/cef")` and Traefik rules.

