# SAL Local Runbook

Use placeholders only. Do not write real credentials here.

## Required Variables

- PostgreSQL: `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`,
  `POSTGRES_USER`, `POSTGRES_PASSWORD`.
- CEF resource API: `URL_CE_API`.
- CEF service-token config: `AUTH_SERVER_BASE_URL`,
  `AUTH_SERVER_TOKEN_ENDPOINT`, `AUTH_SERVER_CLIENT_ID`,
  `AUTH_SERVER_CLIENT_SECRET`.
- JWT validation: `Jwt__Issuer`, `Jwt__Audience`, `Jwt__Key`.
- Google Drive: `GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_PATH`,
  `GOOGLE_DRIVE_APPLICATION_NAME`, `GOOGLE_DRIVE_FOLDER_ID_SOLICITUDES`,
  `GOOGLE_DRIVE_FOLDER_ID_REPORTES`,
  `GOOGLE_DRIVE_FOLDER_ID_SEGUROS_FACULTATIVOS`,
  `GOOGLE_DRIVE_FOLDER_ID_INVITACIONES`,
  `GOOGLE_DRIVE_FOLDER_ID_ENCUADREPRO`,
  `GOOGLE_DRIVE_FOLDER_ID_ACTIVIDADES`, `GOOGLE_DRIVE_FOLDER_RAIZ`.

## Build Directly

From `/home/otomi/isyte-backup/Isyte/repos/SAL/SIPA-SAL`:

```bash
dotnet restore
dotnet build
dotnet run --project SIPA-SAL/SIPA-SAL.csproj
```

## Run Through Harness

From `/home/otomi/isyte-backup/Isyte/harness`:

```bash
make up
make logs
```

Harness route expectations:

- `GET http://localhost/sal/swagger`
- `GET http://localhost/sal/api/TipoActividad`
- `GET http://localhost/sal/api/SolicitudSalida`

## Smoke Checks

1. Start CEF first.
2. Confirm SAL starts without missing `POSTGRES_*`, `AUTH_SERVER_*`,
   `URL_CE_API` or `GOOGLE_DRIVE_*` errors.
3. Authenticate through CEF and call a SAL catalog endpoint.
4. Confirm SAL can obtain a CEF service token.
5. Exercise one read-only request list/filter endpoint.
6. For file/report changes, verify upload/download against a non-production
   Drive folder configured through the approved secret source.

## Troubleshooting

- SAL startup is strict about several required variables; missing values throw
  in `Program.cs`.
- Drive failures often mean service-account path or folder IDs are wrong.
- CEF calls fail if `AUTH_SERVER_*` and `URL_CE_API` are not aligned with the
  local CEF route.
- Historical Drive env templates may not match current source; prefer
  `SIPA-SAL/Program.cs`.

