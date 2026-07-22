# HU Integrations

Inbound consumers:

- HU frontend calls the HU backend under `/hu/api`.
- Harness routes `/hu`, `/hu/api` and `/hu/swagger`.

Outbound dependencies:

- CEF for JWT authority, service-token issuance and CE resource data.
- PostgreSQL for HU-owned and mirrored CE tables.

Backend-to-backend flow:

1. HU validates user JWTs issued by CEF.
2. HU uses `AuthServer` configuration and `ServiceTokenProvider` to call CEF
   `/api/auth/service-token`.
3. HU uses `ResourceApi:BaseUrl` and authenticated clients to read CE data.
4. HU returns HU-specific activity/attendance responses to its frontend.

Routing contracts:

- Traefik dynamic source:
  `/home/otomi/isyte-backup/Isyte/harness/traefik/dynamic/hu.yml`.
- Local base: `/hu`.
- API base: `/hu/api`.
- Swagger: `/hu/swagger`.

Data contracts with CEF:

- Students by id, matricula and user id.
- Teachers by id and study plan.
- Study plans list/id.
- User roles/claims from CEF JWT.

