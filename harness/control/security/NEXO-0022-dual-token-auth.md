# NEXO-0022 Security Review - Dual Token Auth (Access 15min + Refresh 7d)

## Metadata

- Task ID: NEXO-0022
- Date: 2026-07-06
- Security agent: nexo-security
- Reviewed artifact: dual JWT token system (access 15min + refresh 7d)
- Decision: approved

## Scope

Dual-token JWT auth: access token (15 min, used for all API calls) and refresh
token (7 days, used only at `POST /auth/refresh` to get a new access token).
Both tokens are JWTs delivered via httpOnly cookies. The refresh token has no
email/role claims — these are looked up from the DB at refresh time.

## Data And Trust Boundaries

- Access token (`nexo_access_token`): `{ sub, email, role, type: "access" }`, TTL 15 min
- Refresh token (`nexo_refresh_token`): `{ sub, type: "refresh", jti }`, TTL 7 days
- Both signed with HS256 using `JWT_SECRET`
- Both delivered as httpOnly, sameSite=Lax cookies
- Refresh token does NOT contain email/role (looked up at refresh time)
- `type` claim prevents token type confusion (access ≠ refresh)

## Secrets And Environment

- `JWT_SECRET`: shared secret for both access and refresh tokens
- `ACCESS_TOKEN_TTL_SECONDS`: 900 (15 minutes)
- `REFRESH_TOKEN_TTL_SECONDS`: 604800 (7 days)
- `AUTH_SESSION_SECRET`: fallback if `JWT_SECRET` not set (legacy compat)

## Authentication And Sessions

| Endpoint | Auth | Token Required | Cookie Set | Response Body |
|---|---|---|---|---|
| `POST /auth/login` | None | None | access + refresh | `{ user }` |
| `POST /auth/refresh` | Refresh guard | refresh token | access + refresh | `{ user }` |
| `POST /auth/logout` | None | None | clears both | `{ message }` |
| `GET /auth/me` | Access guard | access token | - | `{ user }` |

- Refresh flow: client sends refresh token → server verifies `type=refresh` →
  DB lookup user by `sub` → issues new access token (with current email/role)
  → keeps same refresh token
- The refresh endpoint is protected by `RefreshAuthGuard` which:
  - Reads `nexo_refresh_token` cookie (or Bearer header)
  - Validates JWT signature and expiry
  - Validates `type === "refresh"`
  - Passes through; the controller does the DB lookup + new token issuance

## Token Type Enforcement

- `JwtAccessStrategy` (`"jwt"`): validates `type === "access"` + `email` + `role`
  - A refresh token presented here → rejected (type mismatch)
- `JwtRefreshStrategy` (`"jwt-refresh"`): validates `type === "refresh"` + `sub` + `jti`
  - An access token presented here → rejected (type mismatch)

## Findings

- **F-001 (Low):** Refresh token is NOT rotated on refresh. Same token lives 7
  days. If stolen, attacker has 7-day window. Mitigation: httpOnly cookie + HTTPS
  in production. Future: implement refresh token rotation + blacklist.
- **F-002 (Low):** No `jti` blacklist/revocation table yet. Future: add
  `revoked_refresh_tokens` table to allow administrative revocation.

## Required Mitigations

- Configure `JWT_SECRET` (≥256-bit) and `ACCESS_TOKEN_TTL_SECONDS=900`,
  `REFRESH_TOKEN_TTL_SECONDS=604800` in production
- Enable HTTPS in production for `secure` cookie flag
- Consider refresh token rotation in a future iteration
- Consider adding `revoked_refresh_tokens` table for token revocation

## Residual Risk

- Low. The dual-token pattern is industry standard (OAuth2). Access tokens have
  short TTL (15 min). Refresh tokens are httpOnly (XSS resistant). Token type
  enforcement prevents confusion attacks. Main risk is refresh token theft
  (mitigated by HTTPS + httpOnly).
