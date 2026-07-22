# NEXO-0020 Security Review - bcrypt + Passport JWT Cookie Auth

## Metadata

- Task ID: NEXO-0020
- Date: 2026-07-06
- Security agent: nexo-security
- Reviewed artifact: identity module auth stack upgrade
- Decision: approved

## Scope

Replace Node `crypto.scrypt` + custom HMAC token signing with **bcrypt** + **Passport JWT** over **httpOnly cookies**. Scope covers the complete identity module: password hashing, session token generation/verification, auth guards, login/logout endpoints, cookie transport, and e2e test coverage.

## Data And Trust Boundaries

- Password hashes: stored in PostgreSQL `User.passwordHash` column (bcrypt, cost 12)
- JWTs: HS256-signed, expire per `AUTH_SESSION_TTL_SECONDS` (default 8h)
- Cookies: `nexo_access_token`, httpOnly=true, secure=true in production, sameSite=Lax
- Bearer header: retained as fallback for Swagger and API clients
- No accessToken in response body (prevents localStorage XSS leakage)

## Secrets And Environment

- `JWT_SECRET`: primary JWT signing secret (new env var)
- `AUTH_SESSION_SECRET`: fallback if `JWT_SECRET` is not set
- Both use placeholders in dev; production requires long random strings (≥256-bit)
- `AUTH_SESSION_TTL_SECONDS`: session duration (default 28800 = 8h)
- `NEXO_SEED_*_PASSWORD_HASH`: now bcrypt hashes (generated via `npm run auth:hash-password`)

## Authentication And Sessions

- Login: `POST /api/v1/auth/login` → validates credentials via `BcryptPasswordHasher` → issues JWT → sets httpOnly cookie → returns `{ user }` (no token in body)
- Logout: `POST /api/v1/auth/logout` → clears cookie (maxAge=0)
- JWT expiration enforced by Passport `ignoreExpiration: false`
- Cookie: `httpOnly: true` (XSS protection), `secure: NODE_ENV === 'production'`, `sameSite: lax`
- Guard supports both cookie (`nexo_access_token`) and `Authorization: Bearer <jwt>` (fallback)

## Roles And Permissions

- No changes to role/policy domain logic
- Admin: `admin:workspace` + `operator:workspace`
- Operator: `operator:workspace` only
- Permission guard unchanged; e2e tests confirm Admin/Operator boundary

## Sensitive Data

- Password hashes: bcrypt with cost factor 12 (GPU-resistant)
- JWTs signed with HS256 (HMAC-SHA256)
- No secrets in logs, response bodies, or error messages
- Cookie is httpOnly (inaccessible to JavaScript)

## Dependencies And Configuration

- `bcrypt@^6.0.0` + `@types/bcrypt@^6.0.0` (password hashing)
- `@nestjs/passport@^11.0.5` + `passport@^0.7.0` + `passport-jwt@^4.0.1` (auth framework)
- `@nestjs/jwt@^11.0.2` (JWT signing/verification)
- `cookie-parser@^1.4.7` + `@types/cookie-parser@^1.4.10` (cookie parsing)
- All versions pinned as caret ranges; no known CVEs
- bcrypt requires native compilation (node-gyp); prebuilt binaries available for most platforms

## Infrastructure Exposure

- Cookies scoped to `/` path
- No CORS changes in this task (configure separately for frontend)
- HTTPS required in production for `secure` cookie flag
- `sameSite: lax` protects against CSRF on unsafe methods

## Findings

- **F-001 (Low):** bcrypt native addon requires node-gyp compilation; ensure CI has build tools
- **F-002 (Low):** `secure` flag conditionally set; ensure `NODE_ENV=production` in deployment

## Required Mitigations

- Provide long random `JWT_SECRET` in production deployment (≥256-bit, e.g., `openssl rand -base64 64`)
- Regenerate `NEXO_SEED_*_PASSWORD_HASH` values with `npm run auth:hash-password`
- Enable HTTPS in production so `secure` cookie flag takes effect
- Add CORS configuration when frontend connects (separate task)

## Residual Risk

- Low. Industry-standard algorithms (bcrypt, JWT) replace custom implementations.
- Cookie-based JWT reduces token leakage surface compared to localStorage.
- CSRF risk is low with `sameSite: lax` but should be monitored when adding state-changing endpoints.
