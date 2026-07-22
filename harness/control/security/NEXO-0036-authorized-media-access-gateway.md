# NEXO-0036 Security Review — Authorized Media Access Gateway

## Metadata

- Task ID: NEXO-0036
- Date: 2026-07-15
- Security agent: nexo-security
- Reviewed artifact: storage-key migration, media resolver, protected redirect,
  Azure/local adapters, importers, and inventory response selection
- Decision: conditionally approved

## Scope

Review the remediation for expiring signed Azure photo URLs and the associated
data, authorization, storage, and browser capability boundaries.

## Data And Trust Boundaries

- PostgreSQL will retain a non-secret object key only; photo bytes remain in
  private object storage.
- The stable media route accepts only a database photo ID. It resolves the key
  server-side and does not expose it in inventory responses.
- The redirect location is a transient read capability for the requesting
  browser; the API body never includes it and it is marked `private, no-store`.

## Secrets And Environment

- Azure connection information remains read only from the process environment
  inside the Azure adapter. No key was logged, copied into control records, or
  added to the repository template.
- The new TTL configuration has a safe default of 300 seconds and is bounded
  to 60–3600 seconds, preventing accidental long-lived generated URLs.

## Authentication And Sessions

- The media controller retains class-level `SessionAuthGuard` and the content
  route adds `PermissionGuard`.
- The route uses the existing access-token policy; it does not repurpose a
  refresh token as a resource-authorizing bearer token.

## Roles And Permissions

- `OperatorWorkspace` is the minimum permission for photo content, aligned
  with the inventory read route. Unauthenticated requests are rejected before
  storage resolution.

## Sensitive Data

- Item images are internal operational assets. Their storage key is no longer
  returned to ordinary inventory consumers, reducing accidental provider-path
  disclosure.
- A short-lived Azure SAS can still exist in the requesting browser's redirect
  chain. This is necessary for Azure direct serving; it has read-only, HTTPS
  permissions and is not persisted.

## Dependencies And Configuration

- No dependency or external service was added.
- Azure signing remains constrained to `BlobSASPermissions.parse("r")` and
  `SASProtocol.Https`.

## Infrastructure Exposure

- This change does not change Azure public-access settings, DNS, deployment,
  or the container itself.

## Findings

- SEC-1 (mitigated in code, pending application): persistent signed bearer
  URLs are eliminated once the pending data migration applies.
- SEC-2 (low, open): private-container posture remains unverified. The
  implementation assumes the configured container is not public.
- SEC-3 (low, accepted design): a valid short-lived read URL appears in the
  browser redirect chain for an authorized request. `no-store`, HTTPS-only,
  read-only signing, and five-minute default TTL limit its exposure.

## Required Mitigations

- Before close, apply the reviewed migration and verify no database photo
  column retains URL/query data.
- Confirm the Azure container allows no anonymous/public blob access before a
  production deployment.

## Residual Risk

Conditionally approved. The original seven-day persisted-SAS risk is remediated
by the implementation but cannot be considered resolved until the explicit
migration gate and authenticated verification complete. No commit, push,
deploy, or infrastructure change occurred.

