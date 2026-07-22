# NEXO-0022 Closeout - Dual Token Auth (Access 15min + Refresh 7d)

- Task ID: NEXO-0022
- Status: closed
- Date: 2026-07-06
- Agent: nexo-security
- Plan: `plans/NEXO-0022-dual-token-auth.md`
- Report: `reports/2026-07-06/NEXO-0022-dual-token-auth-session-001.md`
- Security review: `security/NEXO-0022-dual-token-auth.md`

## Outcome

Sistema de doble token JWT implementado:
- **Access token** (15 min): protege todos los endpoints de API
- **Refresh token** (7 días): solo para renovar access token sin reautenticar

## Acceptance Criteria

- [x] Login emite access token (15 min) + refresh token (7 días) como cookies httpOnly
- [x] Refresh endpoint (`POST /auth/refresh`) valida refresh token y emite nuevo access token
- [x] Refresh token rechazado en endpoints protegidos (type enforcement)
- [x] Access token rechazado en endpoint refresh
- [x] Logout limpia ambas cookies
- [x] Bearer header fallback funciona
- [x] Token type enforcement previene confusion attacks
- [x] 16/16 tests pasan
- [x] TypeScript compila limpio
- [x] Security review filed

## Final State

| Aspect | Before (NEXO-0020) | After (NEXO-0022) |
|---|---|---|
| Cookie | `nexo_access_token` (8h) | `nexo_access_token` (15min) |
| Cookie | - | `nexo_refresh_token` (7d) |
| Endpoints | login, logout, me, workspace probes | login, **refresh**, logout, me, workspace probes |
| Passport strategies | `JwtCookieStrategy` ("jwt") | `JwtAccessStrategy` ("jwt") + `JwtRefreshStrategy` ("jwt-refresh") |
| Guards | `SessionAuthGuard` | `SessionAuthGuard` + `RefreshAuthGuard` |
| JWT payload | `{ sub, email, role }` | `{ sub, email, role, type: "access" }` + `{ sub, type: "refresh", jti }` |
| TTL config | `AUTH_SESSION_TTL_SECONDS` | `ACCESS_TOKEN_TTL_SECONDS` + `REFRESH_TOKEN_TTL_SECONDS` |

## Residual

- Refresh token rotation (future)
- Revocation blacklist table (future)
- Production env: `JWT_SECRET`, `ACCESS_TOKEN_TTL_SECONDS=900`, `REFRESH_TOKEN_TTL_SECONDS=604800`

## Next

Resume NEXO-0008 (F2 operational catalogs).
