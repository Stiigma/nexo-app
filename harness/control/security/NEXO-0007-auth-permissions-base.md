# NEXO-0007 Security Review - Auth And Base Permissions

## Metadata

- Task ID: `NEXO-0007`
- Date: 2026-07-06
- Security agent: Codex / `nexo-security`
- Reviewed artifact:
  `harness/control/implementations/NEXO-0007-auth-permissions-base.md`
- Decision: approved

## Scope

Reviewed F1 authentication, local session handling, role enforcement,
placeholder environment handling, dependency audit state, and infrastructure
exposure.

## Data And Trust Boundaries

- Backend server-side guards are the trust boundary for protected operations.
- Frontend route filtering is treated as usability only, not authorization.
- No customer, garment, sale, or financial data is introduced in this slice.

## Secrets And Environment

- No real secrets were written.
- `back/.env.example` contains placeholders only.
- A generated `back/.env` placeholder artifact was removed.
- Production startup requires `AUTH_SESSION_SECRET`; without it, the token
  signer throws in `NODE_ENV=production`.

## Authentication And Sessions

- Local auth is behind the `IdentityProvider` interface.
- Password verification uses Node `scrypt` and constant-time comparison.
- Session tokens are HMAC-signed and include an expiration timestamp.
- Session validation re-checks the user repository so deactivated or
  role-changed users are rejected.

## Roles And Permissions

- Admin and Operator roles are modeled in the domain.
- Admin is allowed admin and operator permissions.
- Operator is limited to operator permissions.
- API tests verify unauthenticated rejection, Admin allowed, Operator allowed,
  and Operator denied for admin.

## Sensitive Data

- Passwords are not stored in source.
- Tests use placeholder credentials only.
- No logs expose tokens or password hashes.

## Dependencies And Configuration

- `cd back && npm audit --audit-level=high`: 0 vulnerabilities.
- `cd back && npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.
- `cd front && npm audit --audit-level=high`: 0 vulnerabilities.
- `multer@2.2.0` is pinned through `overrides` to resolve the vulnerable
  transitive range reported by npm audit.
- NPM reported pending install-script approval warnings for Prisma and esbuild;
  build/test/audit passed without granting additional script approval.

## Infrastructure Exposure

- No deploy, CI/CD, Kubernetes, public network exposure, or external identity
  provider was configured.
- Supertest required local ephemeral binding only during backend verification.
- HTTPS enforcement remains a production deployment concern outside F1.

## Findings

- No blocking security findings.

## Required Mitigations

- None required before F1 closeout.

## Residual Risk

- F1 runtime auth storage is in-memory and intended for local scaffolding only.
  Persistent Prisma-backed auth storage must be wired before production use.
- HMAC local sessions are acceptable for F1 but should be revisited if an
  external identity provider is adopted.
