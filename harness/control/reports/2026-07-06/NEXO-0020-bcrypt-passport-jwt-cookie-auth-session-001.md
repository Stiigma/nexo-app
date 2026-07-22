# NEXO-0020 - bcrypt + Passport JWT Cookie Auth - Session 001

- Date: 2026-07-06
- Agent: nexo-security
- Task: `plans/NEXO-0020-bcrypt-passport-jwt-cookie-auth.md`

## Summary

Upgraded the F1 identity module's auth foundation from Node `crypto.scrypt` + custom
HMAC token signing to industry-standard **bcrypt** + **Passport JWT** with
**httpOnly cookies**.

## What Changed

### New Files

| File | Purpose |
|------|---------|
| `back/src/modules/identity/infrastructure/security/bcrypt-password-hasher.ts` | bcrypt PasswordHasher (cost=12) |
| `back/src/modules/identity/infrastructure/security/jwt-session-token-signer.ts` | JWT SessionTokenSigner using `@nestjs/jwt` |
| `back/src/modules/identity/interface/http/guards/jwt-cookie.strategy.ts` | Passport JWT strategy reading cookies+Bearer |
| `harness/control/plans/NEXO-0020-bcrypt-passport-jwt-cookie-auth.md` | Task plan |
| `harness/control/security/NEXO-0020-bcrypt-passport-jwt-cookie-auth.md` | Security review |

### Modified Files

| File | Change |
|------|--------|
| `back/package.json` | Added bcrypt, @nestjs/passport, passport, passport-jwt, @nestjs/jwt, cookie-parser |
| `back/src/modules/identity/identity.module.ts` | Wired BcryptPasswordHasher, JwtSessionTokenSigner, Passport, JwtModule.registerAsync |
| `back/src/modules/identity/interface/http/auth.controller.ts` | Set httpOnly cookie on login, added logout endpoint |
| `back/src/modules/identity/interface/http/guards/session-auth.guard.ts` | Now extends `AuthGuard("jwt")` from Passport |
| `back/src/main.ts` | Added cookieParser middleware and Swagger cookie auth |
| `back/src/modules/identity/infrastructure/security/hash-password.cli.ts` | Switched to BcryptPasswordHasher |
| `back/.env` + `back/.env.example` | Added JWT_SECRET, updated comments for bcrypt |
| `back/src/modules/identity/interface/http/auth.e2e-spec.ts` | Updated for cookie-based auth + bcrypt |

### Key Technical Decisions

1. **Lazy env resolution**: Uses `JwtModule.registerAsync` and `secretOrKeyProvider` to read secrets at DI/resolution time (not module import time), which is essential for test env vars set in `beforeAll`.
2. **Dual auth transport**: Guard checks httpOnly cookie first, falls back to `Authorization: Bearer` for Swagger/API clients.
3. **Cookie security**: `httpOnly=true`, `secure=NODE_ENV==='production'`, `sameSite=lax`.
4. **No token in response body**: Login returns only `{ user }`, preventing localStorage XSS leakage.

## What Was Verified

- All 12 tests pass (3 unit + 1 architecture + 8 e2e)
- TypeScript compilation passes (`tsc --noEmit`)
- Login sets `nexo_access_token` httpOnly cookie
- Cookie-based auth works for Admin and Operator workspaces
- Bearer header fallback works
- Logout clears cookie
- Invalid credentials rejected with 401
- Admin/Operator permission boundaries enforced

## What Remains

- Generate real bcrypt hashes for seed users (`npm run auth:hash-password`)
- Provide production `JWT_SECRET` (≥256-bit random)
- Enable HTTPS in production for `secure` cookie flag
- Add CORS configuration for frontend (separate task)

## Recommended Next Step

Close NEXO-0020 and continue with NEXO-0008 (F2 operational catalogs).
