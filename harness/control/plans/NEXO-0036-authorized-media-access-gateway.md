# NEXO-0036 - Authorized Media Access Gateway And Renewable Photo URLs

## Objective

Replace persisted Azure SAS URLs with stable storage keys and serve garment
photos through an authenticated media gateway that issues a fresh, short-lived
read URL every time a browser requests a photo.

## Done When

- `item_photos` persist only a provider-neutral `storageKey`, never an Azure
  URL or SAS query string.
- Existing photo references are normalized from their legacy Azure/local URLs
  to storage keys by a reversible, guarded Prisma migration.
- `GET /api/v1/media/photos/:photoId/content` verifies the operator session
  and permission before redirecting to a newly issued, HTTPS-only read URL.
- The frontend uses that stable gateway URL by photo ID; cards, detail, and
  lightbox no longer depend on the storage provider or an expired URL.
- Azure read URLs are short-lived (five minutes by default), read-only, and
  are not returned by inventory endpoints or stored in PostgreSQL.
- Unit tests prove authorization wiring, key-only persistence, fresh URL
  resolution, and rejection of a missing photo.

## Scope

- Define the durable media-access convention and document its rationale.
- Rename the photo persistence field to `storageKey` and migrate known legacy
  Azure and local URL forms to their canonical key.
- Evolve the storage interface from a generic persisted URL into a private
  short-lived-read-URL capability.
- Add the authenticated gateway endpoint and switch inventory rendering to it.
- Provide migration and implementation evidence; leave commit, push, deploy,
  and migration application subject to their existing explicit gates.

## Out Of Scope

- Making the Azure container public.
- Sharing photos with unauthenticated users or external marketplaces.
- Streaming every image through the API server.
- Changing photo upload UX or multi-photo product requirements.
- Rotating infrastructure credentials or deploying configuration changes.

## Architecture Decision

Use the **authenticated signed-redirect gateway** pattern:

1. PostgreSQL owns only the stable `storageKey` such as
   `items/{itemId}/main.webp`.
2. The inventory response exposes photo metadata, not the storage key or a
   signed URL.
3. The browser uses one stable, same-origin media URL per photo ID.
4. The media gateway authenticates and authorizes that request, then asks the
   configured storage adapter for a newly signed, read-only URL and returns a
   temporary redirect with no-store caching.

This creates one deep `ResolveItemPhotoReadUrlUseCase` module. Its interface is
only `photoId -> fresh read URL`; its implementation hides photo lookup,
storage provider, SAS issuance, TTL, HTTPS constraints, and missing-object
handling. The external seam is the `FileStoragePort` capability to issue a
short-lived read URL. Azure and local storage are real adapters at that seam.
Inventory callers therefore do not learn Azure paths, SAS syntax, key material,
or refresh timing. Changing provider or expiry policy stays local to media.

## Steps

1. Register NEXO-0036, this plan, ADR, and a complete build handoff.
2. Change `ItemPhoto.path` to `storageKey`; create a migration that canonicalizes
   legacy Azure/local URLs and fails rather than silently retaining an unknown
   URL form.
3. Update the media storage interface and adapters so uploads return a stable
   key while signed read URLs are generated only on demand.
4. Implement and test the deep photo-read resolver plus protected redirect
   endpoint for operator workspace access.
5. Map inventory API photos to safe metadata and have frontend images resolve
   the stable media route by photo ID.
6. Run schema/type/unit/build checks. Apply the database migration only after
   explicit authorization, then validate existing photos and authenticated UI.
7. Record QA and security review before closing NEXO-0033 or NEXO-0036.

## Progress

- 2026-07-15: Planned after the user reported expired photo URLs. The user
  explicitly selected remediation rather than accepting the seven-day SAS risk.
- 2026-07-15: Implemented locally. Schema generation/validation, 61 backend
  tests, both production builds, importer dry-run, strict importer typechecks,
  and a read-only 56-row normalization simulation passed. The migration itself
  remains pending explicit user authorization.
- 2026-07-15: The user authorized and the local Prisma migration
  `20260715210000_item_photo_storage_key` was applied. All 56 records now use
  canonical item keys with zero URL/query/public-path residues. A new Azure
  read URL was issued HTTPS-only and read-only; an unsigned request did not
  return public content. A runtime dependency omission in the resolver was
  corrected with explicit `@Inject(PrismaService)`, then the protected route
  started and returned `401` before authorization as intended. Backend tests
  (61), backend build, and frontend build pass. Authenticated visual QA is
  the sole remaining acceptance gate.

## Decision Log

- 2026-07-15: Use request-time renewal, not a cron that renews stored tokens.
  A signed URL is a bearer capability and must not become persisted state.
- 2026-07-15: Prefer a short signed redirect over an API byte-stream proxy.
  It retains private storage and authorization while Azure serves image bytes
  directly, avoiding avoidable API bandwidth and latency.
- 2026-07-15: Keep the Azure account connection information inside the storage
  adapter only; no controller, inventory code, or frontend code may parse or
  construct a SAS URL.
- 2026-07-15: Keep the data-migration gate separate from code implementation.
  The migration is ready and validated non-mutatively, but was not applied.
- 2026-07-15: Inject `PrismaService` explicitly in the deep resolver. This
  makes its database dependency unambiguous to Nest at runtime and keeps the
  module's small `photoId -> fresh read URL` interface unchanged.

## Risks

- Applying the column rename/data migration changes local database records and
  must be explicitly authorized before execution.
- A valid operator session is required at image-request time; expired sessions
  must refresh through the existing auth flow before protected content is
  requested again.
- The Azure container must remain private; this task does not alter its access
  policy.

## Verification

- `pnpm prisma validate` and a migration-diff/schema check without writing.
- Media unit tests for storage-key upload results, short-lived URL resolution,
  no full SAS exposure in inventory response mapping, and missing-photo error.
- Backend unit test suite and backend/frontend production builds.
- After explicit migration approval: verify every `item_photos.storageKey`
  lacks `?`, `http`, and `/storage/photos/`; verify 56 photos resolve via a
  fresh protected request and the UI shows them after the old SAS expiry.
