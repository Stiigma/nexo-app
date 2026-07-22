# NEXO-0022 - Dual Token Auth - Session 001

- Date: 2026-07-06
- Agent: nexo-security
- Task: `plans/NEXO-0022-dual-token-auth.md`

## Summary

Replaced the single JWT token system with a dual-token scheme:
- **Access token**: 15 min TTL, `type: "access"`, usado en todos los endpoints protegidos
- **Refresh token**: 7 day TTL, `type: "refresh"`, solo para `POST /auth/refresh`

## What Changed

### New Files

| File | Purpose |
|------|---------|
| `back/src/modules/identity/interface/http/guards/jwt-refresh.strategy.ts` | Passport refresh token strategy (`"jwt-refresh"`) |
| `back/src/modules/identity/interface/http/guards/refresh-auth.guard.ts` | Guard para el endpoint refresh |
| `harness/control/plans/NEXO-0022-dual-token-auth.md` | Task plan |
| `harness/control/security/NEXO-0022-dual-token-auth.md` | Security review |

### Modified Files

| File | Change |
|------|--------|
| `back/src/modules/identity/application/ports/session-token-signer.ts` | Interfaz: `signAccessToken`, `signRefreshToken`, `verifyAccessToken`, `verifyRefreshToken` |
| `back/src/modules/identity/application/ports/identity-provider.ts` | `AuthSession` incluye `refreshToken`; nuevo método `refreshAccessToken` |
| `back/src/modules/identity/application/local-identity.provider.ts` | Emite ambos tokens en `authenticate()`; implementa `refreshAccessToken()` (DB lookup + nuevo access) |
| `back/src/modules/identity/infrastructure/security/jwt-session-token-signer.ts` | Dos `JwtService` (access 15min + refresh 7d); payloads con `type` y `jti` |
| `back/src/modules/identity/interface/http/guards/jwt-cookie.strategy.ts` | Renombrado a `JwtAccessStrategy`, valida `type === "access"` |
| `back/src/modules/identity/interface/http/auth.controller.ts` | Login: 2 cookies (`nexo_access_token` + `nexo_refresh_token`); `POST /auth/refresh`; logout limpia ambas |
| `back/src/modules/identity/identity.module.ts` | `JwtModule` access + `REFRESH_JWT_SERVICE` custom; ambas estrategias y guards |
| `back/src/modules/identity/application/tokens.ts` | `ACCESS_JWT_SERVICE`, `REFRESH_JWT_SERVICE` |
| `back/.env` + `.env.example` | `ACCESS_TOKEN_TTL_SECONDS=900`, `REFRESH_TOKEN_TTL_SECONDS=604800` |
| `back/src/modules/identity/infrastructure/security/hmac-session-token-signer.ts` | Actualizado a nueva interfaz (compat) |
| `back/src/modules/identity/interface/http/auth.e2e-spec.ts` | 12 tests: cookies duales, refresh flow, token type enforcement, logout |

## What Was Verified

- 16/16 tests pass (vitest)
- TypeScript compila limpio (`tsc --noEmit`)
- Login emite dos cookies httpOnly (access + refresh)
- Refresh genera nuevo access token sin reautenticar
- Refresh token rechazado en endpoints protegidos (`type !== "access"`)
- Access token rechazado en endpoint refresh (`type !== "refresh"`)
- Logout limpia ambas cookies
- Bearer header fallback funciona con access token
- Admin/Operator permisos intactos

## Remaining

- Refresh token rotation (para mayor seguridad)
- Tabla `revoked_refresh_tokens` para revocación
- Configurar `JWT_SECRET`, `ACCESS_TOKEN_TTL_SECONDS=900`, `REFRESH_TOKEN_TTL_SECONDS=604800` en producción

## Next

Resume NEXO-0008 (F2 operational catalogs) con el sistema de autenticación completo.
