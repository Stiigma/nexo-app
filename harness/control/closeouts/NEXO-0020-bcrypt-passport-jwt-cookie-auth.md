# NEXO-0020 Closeout - bcrypt + Passport JWT Cookie Auth

- Task ID: NEXO-0020
- Status: closed
- Date: 2026-07-06
- Agent: nexo-security
- Plan: `plans/NEXO-0020-bcrypt-passport-jwt-cookie-auth.md`
- Report: `reports/2026-07-06/NEXO-0020-bcrypt-passport-jwt-cookie-auth-session-001.md`
- Security review: `security/NEXO-0020-bcrypt-passport-jwt-cookie-auth.md`

## Outcome

Successfully replaced Node `crypto.scrypt` password hashing with **bcrypt** (cost
factor 12) and the custom HMAC session token signer with **Passport JWT**
delivered via **httpOnly cookies**.

## Acceptance Criteria

- [x] bcrypt used for password hashing with `@types/bcrypt`
- [x] Passport + JWT used for session tokens via httpOnly cookies
- [x] Login sets `nexo_access_token` httpOnly cookie
- [x] Logout clears cookie (`POST /api/v1/auth/logout`)
- [x] Bearer header fallback works
- [x] All 12 tests pass (3 unit + 1 architecture + 8 e2e)
- [x] Security review filed

## Final State

| Component | Before | After |
|-----------|--------|-------|
| Password hasher | `NodeScryptPasswordHasher` (crypto.scrypt) | `BcryptPasswordHasher` (bcrypt, cost=12) |
| Token signer | `HmacSessionTokenSigner` (HMAC-SHA256) | `JwtSessionTokenSigner` (JWT HS256 via `@nestjs/jwt`) |
| Auth guard | Custom `SessionAuthGuard` (Bearer header) | Passport `AuthGuard("jwt")` (cookie + Bearer) |
| Transport | `Authorization: Bearer <token>` in response body | httpOnly cookie `nexo_access_token` (no token in body) |
| Strategy | N/A | `JwtCookieStrategy` (Passport, lazy secret resolution) |
| Logout | Not implemented | `POST /api/v1/auth/logout` clears cookie |

## Residual Tasks

- Generate real bcrypt hashes for seed users (`npm run auth:hash-password`)
- Configure production `JWT_SECRET` (minimum 256-bit random)
- Enable HTTPS in production for `secure` cookie flag
- Add CORS for frontend (NEXO-0008 or separate task)

## Next

Resume NEXO-0008 (F2 operational catalogs) using the bcrypt+Passport auth foundation.
