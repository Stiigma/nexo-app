# CEF Integrations

Inbound consumers:

- CEF frontend calls CEF auth and CE API endpoints.
- HU backend validates CEF JWTs and calls HU-specific CEF service endpoints.
- SAL backend validates CEF JWTs and calls SAL-specific CEF service endpoints.
- Harness routes external/local traffic to CEF through Traefik.

Outbound dependencies:

- PostgreSQL for Identity, CE data, refresh tokens, service clients and
  notifications.
- Mailgun for email delivery through `EmailController`.
- SignalR for notification delivery to browser clients and SAL-related events.

Authentication contracts:

- Human auth uses CEF-issued JWTs, cookies and refresh tokens.
- Backend-to-backend auth uses CEF `ServiceClient` records and
  `/api/auth/service-token`.
- JWT validation uses issuer, audience and signing key from configuration.
- SignalR accepts tokens through auth header/cookie and, for hubs, query-string
  `access_token` handling in `Program.cs`.

Routing contracts:

- Traefik dynamic route source:
  `/home/otomi/isyte-backup/Isyte/harness/traefik/dynamic/cef.yml`.
- Local base: `/cef`.
- API base: `/cef/api`.
- Swagger: `/cef/swagger`.
- Hubs: `/cef/hubs/notificaciones`, `/cef/hubs/sal`.

Known integration drift:

- `workspace-map.json` records CEF backend deploy branch as `Postgre`.
- Historical workflow deploy condition references `deploy`.
- Treat this as a CI/CD alignment task if implementation work is opened later.

