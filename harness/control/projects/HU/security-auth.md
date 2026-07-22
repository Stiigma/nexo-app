# HU Security And Auth

HU does not own human identity. It trusts CEF-issued JWTs and uses CEF service
client credentials for backend-to-backend calls.

Auth behavior:

- JWT bearer validation is configured in `Presentacion/Program.cs`.
- Tokens can be read from `Authorization: Bearer` and the `accessToken` cookie.
- `CurrentUserService` reads CEF claims for current-user flows.
- `ServiceTokenProvider` obtains service tokens from CEF.

Policies from `Program.cs`:

- `AdminOnly`
- `DocenteOnly`
- `AlumnoOnly`
- `AcademicStaff`

Sensitive data rules:

- Do not record `AuthServer__ClientSecret`, JWT signing key, DB password or
  user passwords.
- Approved source/owner references are in
  `../../ecosystem/credential-map.md`.
- Do not open legacy `.env`, SQL dumps, credential docs or secret stores while
  maintaining this context.

Known risks:

- HU stores mirrored CE data; verify exposure when adding endpoints.
- `AcademicStaff` behavior depends on CEF role naming; role drift should be
  tested with actual CEF test users from the approved secret source.
- Frontend/backend cookie behavior should be checked whenever domain/path
  routing changes.

