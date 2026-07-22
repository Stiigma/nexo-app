# FIAD Credential Map

This is an inventory of variable names, consumers, and safe ownership notes.
Do not add real values, passwords, tokens, connection strings, credential PDFs,
XLSX contents, SQL dumps, service account JSON, hashes, or Drive IDs.

## Global Policy

- Real values live in the operator secret source, GitHub Actions secrets, local
  untracked env files, or platform secret managers.
- Docs may record variable names and what service consumes them.
- Historical config may contain default or literal secret-like values. Do not
  copy them into canonical docs.
- Opening `.env`, `*.sql`, `*.xlsx`, credential PDFs, service account JSON, or
  secret stores requires explicit authorization.

## Database

| Variable | Consumed by | Source/owner | Notes |
| --- | --- | --- | --- |
| `POSTGRES_HOST` | CEF, HU, SAL | Harness/operator | Host only; not secret by itself. |
| `POSTGRES_PORT` | CEF, HU, SAL | Harness/operator | Usually local PostgreSQL port. |
| `POSTGRES_DB` | CEF, HU, SAL | Harness/operator | Verify shared vs per-service DB before use. |
| `POSTGRES_USER` | CEF, HU, SAL | Harness/operator | Per-service users preferred. |
| `POSTGRES_PASSWORD` | CEF, HU, SAL | Secret source | Never write value. |
| `CEF_DB_USER` | Harness compose/scripts | Secret source | CEF local DB user. |
| `CEF_DB_PASSWORD` | Harness compose/scripts | Secret source | Never write value. |
| `HU_DB_USER` | Harness compose/scripts | Secret source | HU local DB user. |
| `HU_DB_PASSWORD` | Harness compose/scripts | Secret source | Never write value. |
| `SAL_DB_USER` | Harness compose/scripts | Secret source | SAL local DB user. |
| `SAL_DB_PASSWORD` | Harness compose/scripts | Secret source | Never write value. |

## Auth And JWT

| Variable | Consumed by | Source/owner | Notes |
| --- | --- | --- | --- |
| `JWT_KEY` / `Jwt__Key` / `Jwt:Key` | CEF, HU, SAL | Secret source | Shared signing key in current code; rotate through coordinated change. |
| `AUTH_SERVER_BASE_URL` | HU, SAL | Harness/operator | CEF auth base URL. |
| `AUTH_SERVER_TOKEN_ENDPOINT` | HU, SAL | Harness/operator | CEF token endpoint, typically service-token path. |
| `AUTH_SERVER_CLIENT_ID` | HU, SAL | CEF service client owner | Client id may be operational metadata; still avoid publishing production ids casually. |
| `AUTH_SERVER_CLIENT_SECRET` | HU, SAL | Secret source | Never write value. |
| `accessToken` cookie | Browsers, CEF/HU/SAL APIs | CEF auth | HttpOnly cookie used by frontends and SignalR. |
| `refreshToken` cookie | Browsers/CEF auth | CEF auth | Refresh lifecycle owned by CEF. |

## CEF Email

| Variable | Consumed by | Source/owner | Notes |
| --- | --- | --- | --- |
| `MAILGUN_API_KEY` | CEF | Secret source | Never write value. |
| `MAILGUN_DOMAIN` | CEF | Mailgun/admin | Domain value is configuration, but do not expose if environment-sensitive. |
| `MAILGUN_BASE_URL` | CEF | Mailgun/admin | Defaults should be verified. |
| `EMAIL_FROM` / `MAILGUN_FROM` | CEF | Mail/admin | Naming differs between code and legacy template; verify before use. |
| `EMAIL_FROM_NAME` | CEF | Mail/admin | Display name only. |

## SAL Google Drive

Current SAL source reads these variables in
`repos/SAL/SIPA-SAL/SIPA-SAL/Program.cs`:

| Variable | Consumed by | Source/owner | Notes |
| --- | --- | --- | --- |
| `GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_PATH` | SAL | Secret source/operator filesystem | Path to service account JSON; never commit JSON. |
| `GOOGLE_DRIVE_APPLICATION_NAME` | SAL | Operator | Non-secret display/config value. |
| `GOOGLE_DRIVE_FOLDER_ID_SOLICITUDES` | SAL | Drive owner | Treat IDs as sensitive operational config. |
| `GOOGLE_DRIVE_FOLDER_ID_REPORTES` | SAL | Drive owner | Treat IDs as sensitive operational config. |
| `GOOGLE_DRIVE_FOLDER_ID_SEGUROS_FACULTATIVOS` | SAL | Drive owner | Treat IDs as sensitive operational config. |
| `GOOGLE_DRIVE_FOLDER_ID_INVITACIONES` | SAL | Drive owner | Treat IDs as sensitive operational config. |
| `GOOGLE_DRIVE_FOLDER_ID_ENCUADREPRO` | SAL | Drive owner | Treat IDs as sensitive operational config. |
| `GOOGLE_DRIVE_FOLDER_ID_ACTIVIDADES` | SAL | Drive owner | Treat IDs as sensitive operational config. |
| `GOOGLE_DRIVE_FOLDER_RAIZ` | SAL | Drive owner | Shared Drive root ID; treat as sensitive operational config. |

Legacy templates/workflows also mention `GOOGLE_DRIVE_CLIENT_ID`,
`GOOGLE_DRIVE_CLIENT_SECRET`, and `GOOGLE_DRIVE_REFRESH_TOKEN`. That does not
match the current service-account path observed in `Program.cs`; reconcile in a
future `FIAD-0004+` infra/security task before operating deploy workflows.

## Deploy And SSH

| Variable/secret | Consumed by | Source/owner | Notes |
| --- | --- | --- | --- |
| `SERVER_HOST` | Workflows/deploy script | Secret source | External deploy target; confirmation required before use. |
| `SERVER_USER` | Workflows/deploy script | Secret source | External deploy target. |
| `SSH_PRIVATE_KEY` / `SSH_KEY` | Workflows/deploy script | Secret source | Never write key. |
| `DOMAIN` | Docker/K8s/workflows/frontends | Operator | Route base. |

## Safe Test Roles

Roles observed in code and safe to document as role names:

- `Root`
- `Admin`
- `Docente`
- `Alumno`
- `Secretaria`
- `Coordinador`
- `Coordinador de PE`
- `Director`
- `Sub Director`
- `Auxiliar Administrativo`
- `Admin de salidas`
- `Posgrado`
- `SerCum`

No passwords or real user credentials are canonical here.
