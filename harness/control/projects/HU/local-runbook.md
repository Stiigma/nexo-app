# HU Local Runbook

Use placeholders only. Do not write real credentials here.

## Required Variables

- PostgreSQL: `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`,
  `POSTGRES_USER`, `POSTGRES_PASSWORD`.
- JWT validation: `Jwt__Issuer`, `Jwt__Audience`, `Jwt__Key`.
- CEF service-token config: `AuthServer__BaseUrl`,
  `AuthServer__TokenEndpoint`, `AuthServer__ClientId`,
  `AuthServer__ClientSecret`.
- CEF resource API: `ResourceApi__BaseUrl`.

## Build Directly

From `/home/otomi/isyte-backup/Isyte/repos/HU/HU-Backend`:

```bash
dotnet restore HU-Back.sln
dotnet build HU-Back.sln
dotnet run --project Presentacion/Presentacion.csproj
```

## Run Through Harness

From `/home/otomi/isyte-backup/Isyte/harness`:

```bash
make up
make logs
```

Harness route expectations:

- `GET http://localhost/hu/swagger`
- `GET http://localhost/hu/api/HoraUniversitaria/listar`
- `GET http://localhost/hu/api/Actividad/cartelera`

## Smoke Checks

1. Start CEF first.
2. Confirm HU starts without missing PostgreSQL or `AuthServer` variables.
3. Authenticate through CEF and use the token against a HU endpoint.
4. Confirm HU can request a CEF service token.
5. Confirm one CEF-backed HU endpoint returns plan or teacher data.

## Troubleshooting

- A valid HU token still fails if `Jwt__Issuer`, `Jwt__Audience` or
  `Jwt__Key` are not aligned with CEF.
- CEF resource calls fail if `AuthServer__ClientId` or
  `AuthServer__ClientSecret` do not match a CEF service client.
- 404s through local proxy usually indicate Traefik `/hu` route drift.

