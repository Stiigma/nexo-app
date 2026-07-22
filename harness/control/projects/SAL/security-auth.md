# SAL Security And Auth

SAL is security-sensitive because it combines CEF identity, role-sensitive
approval flows, generated documents and Google Drive files.

Auth behavior:

- JWT bearer validation is configured in `SIPA-SAL/Program.cs`.
- Tokens can be read from `Authorization: Bearer` and the `accessToken` cookie.
- Current user context is provided by `Servicios/Auth_CE/CurrentUserService.cs`.
- Service-to-CEF auth uses `Servicios/Auth_CE/ServiceTokenProvider.cs`.
- CEF resource clients live under `Servicios/CE/ApiClients/`.

Sensitive data rules:

- Do not record `AUTH_SERVER_CLIENT_SECRET`, JWT signing key, DB password,
  Google service-account JSON contents, Drive folder IDs with privileged
  context, user passwords or document contents.
- Do not open legacy `.env`, SQL dumps, PDFs, XLSX, service account JSON files
  or secret stores while maintaining this context.
- Use the safe inventory in `../../ecosystem/credential-map.md`.

Access and data exposure risks:

- Request history endpoints expose workflow state; role checks must be verified
  for coordinator, director, administrative and teacher views.
- File download endpoints depend on both SAL authorization and Drive object
  access.
- Generated PDFs/reports may contain personal or academic data.
- Background notification/report jobs can amplify bad state transitions if
  event publishing changes are not tested.

Recommended review triggers:

- Any change to `SolicitudSalidaController`, report/file controllers, CEF API
  clients, Drive services, JWT config, role checks or background services
  should get FIAD security review before close.

