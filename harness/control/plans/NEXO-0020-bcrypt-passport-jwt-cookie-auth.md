# NEXO-0020 - bcrypt + Passport JWT Cookie Auth Upgrade

## Metadata

- Task ID: NEXO-0020
- Status: active
- Priority: P0
- Parent: NEXO-0007 (F1 Auth and base permissions)
- Created: 2026-07-06
- Agent: nexo-security

## Objective

Replace the F1 auth foundation's custom HMAC token signing and Node `crypto.scrypt`
password hashing with industry-standard **bcrypt** and **Passport JWT** over
**httpOnly cookies**.

## What Changes

### Password Hashing: scrypt → bcrypt

- New adapter: `BcryptPasswordHasher` implementing `PasswordHasher`
- Uses `bcrypt.hash(password, 12)` and `bcrypt.compare(password, hash)`
- `@types/bcrypt` for TypeScript type safety
- Old `NodeScryptPasswordHasher` kept as reference for migration

### Session Tokens: HMAC → JWT (Passport)

- New adapter: `JwtSessionTokenSigner` implementing `SessionTokenSigner`
- Uses `@nestjs/jwt` (`JwtService`) under the hood
- JWT signed with `JWT_SECRET` env var (falls back to `AUTH_SESSION_SECRET`)
- Standard RS256/HS256 with expiration from `AUTH_SESSION_TTL_SECONDS`

### Auth Transport: Authorization Header → httpOnly Cookie

- Login endpoint sets `nexo_access_token` httpOnly, secure, sameSite=Lax cookie
- Login response no longer exposes `accessToken` in body
- New `/auth/logout` endpoint clears the cookie (Sets `nexo_access_token=''`)
- `SessionAuthGuard` extracts JWT from cookie first, falls back to `Authorization: Bearer <token>`
- `main.ts` adds `cookie-parser` middleware

### Passport Integration

- New `JwtCookieStrategy` extends `PassportStrategy(Strategy)`
- Custom extractor reads JWT from `req.cookies.nexo_access_token` with Bearer fallback
- NestJS `AuthGuard('jwt')` wrapped in `JwtCookieAuthGuard`

## Files To Create

| File | Purpose |
|------|---------|
| `back/src/modules/identity/infrastructure/security/bcrypt-password-hasher.ts` | bcrypt hasher adapter |
| `back/src/modules/identity/infrastructure/security/jwt-session-token-signer.ts` | JWT token signer adapter |
| `back/src/modules/identity/interface/http/guards/jwt-cookie.strategy.ts` | Passport JWT cookie strategy |

## Files To Modify

| File | Change |
|------|--------|
| `back/package.json` | Add bcrypt, @types/bcrypt, @nestjs/passport, passport, passport-jwt, @nestjs/jwt, cookie-parser, @types/cookie-parser |
| `back/src/modules/identity/identity.module.ts` | Wire BcryptPasswordHasher, JwtSessionTokenSigner, Passport JwtStrategy |
| `back/src/modules/identity/interface/http/auth.controller.ts` | Set/clear httpOnly cookie on login/logout; add logout endpoint |
| `back/src/modules/identity/interface/http/guards/session-auth.guard.ts` | Read JWT from cookie with Bearer fallback |
| `back/src/main.ts` | Add cookie-parser middleware |
| `back/src/modules/identity/infrastructure/security/hash-password.cli.ts` | Use bcrypt |
| `back/.env` | Rename comment for clarity (bcrypt hash); add JWT_SECRET |
| `back/.env.example` | Same as .env |
| `back/src/modules/identity/interface/http/auth.e2e-spec.ts` | Use cookie jar in supertest for auth tests |

## Implementation Steps

1. Install all dependencies.
2. Create `BcryptPasswordHasher`.
3. Create `JwtSessionTokenSigner`.
4. Create `JwtCookieStrategy` (Passport).
5. Modify `SessionAuthGuard` to extract from cookies.
6. Modify `AuthController` for cookie-based login + logout.
7. Update `IdentityModule` DI wiring.
8. Update `main.ts` with cookie-parser.
9. Update `hash-password.cli.ts`.
10. Update `.env` / `.env.example`.
11. Update e2e tests.
12. Run tests (`npx vitest run` + `npx tsc --noEmit`).
13. Write security review record.

## Security Decisions

- `bcrypt` cost factor: 12 (industry standard, resistant to GPU attacks)
- Cookie: `httpOnly=true`, `secure=true` in production, `sameSite=Lax`
- JWT in cookie is NOT accessible to JavaScript (XSS protection)
- Bearer header fallback preserved for Swagger and API clients
- `JWT_SECRET` is separate from `AUTH_SESSION_SECRET` for env clarity; falls back
- No token in response body (no localStorage leakage)

## Verification

- `npx vitest run` passes all e2e tests
- `npx tsc --noEmit` passes
- Login sets httpOnly cookie
- Guard reads from cookie
- Logout clears cookie
- Bearer header still works as fallback

## Risks

- Low: bcrypt is a native addon; ensure it compiles in CI (prebuild available for most platforms)
- Low: Cookie size limit (~4KB) — JWTs stay well under 2KB
- Medium: e2e tests need cookie-aware supertest agent

## Acceptance Criteria

- [ ] bcrypt used for password hashing with `@types/bcrypt`
- [ ] Passport + JWT used for session tokens via httpOnly cookies
- [ ] Login sets `nexo_access_token` httpOnly cookie
- [ ] Logout clears cookie
- [ ] Bearer header fallback works
- [ ] All existing tests pass
- [ ] Security review filed
