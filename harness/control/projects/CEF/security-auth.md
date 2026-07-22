# CEF Security And Auth

CEF is the trust anchor for FIAD local services.

Auth flows:

- Human login creates an access token and refresh token.
- Refresh tokens are persisted through `RefreshToken`.
- Access tokens are accepted from `Authorization: Bearer`, HttpOnly
  `accessToken` cookie, and SignalR `access_token` query string for hub paths.
- Service clients authenticate to `/api/auth/service-token` and receive JWTs
  for backend-to-backend resource calls.

Policies from `Program.cs`:

- `AdminOnly`
- `DocenteOnly`
- `AlumnoOnly`
- `ServiceOnly`
- API fallback policy that expects authenticated requests for API traffic.

Sensitive data rules:

- Do not document real JWT keys, Mailgun API keys, DB credentials, service
  client secrets or refresh tokens.
- Use only variable names and owner/source references in
  `../../ecosystem/credential-map.md`.
- Do not open legacy `.env`, SQL dumps, PDFs, XLSX, service account JSON files
  or `traefik/users` while maintaining this context.

Known risks:

- Service-client secrets must be rotated if they were ever exposed in chat,
  commits or logs.
- SignalR query-string tokens can appear in proxy logs; keep log retention and
  masking under review.
- Branch/deploy drift exists in historical workflow metadata and should be
  fixed in a future CI/CD task.

