# HOFF-2026-07-15-authorized-media-access-gateway

## Metadata

- Task ID: NEXO-0036
- Date: 2026-07-15
- Authoring agent: nexo-plan
- Receiving agent: nexo-build
- Status: ready for implementation

## Objective

Implement renewable access to private garment photos without persisting or
returning long-lived Azure SAS URLs as inventory data.

## Context

NEXO-0033 imported 39 WebP photos and revealed the existing storage pattern:
`ItemPhoto.path` contains a full Azure SAS URL, configured for seven days.
Those URLs inevitably expire, making valid photos unreachable and leaving a
read bearer capability in PostgreSQL/API responses. The user requested a
durable, decoupled remediation.

## Source Docs

- `plans/NEXO-0036-authorized-media-access-gateway.md`
- `decisions/ADR-2026-07-15-authorized-media-access-gateway.md`
- `security/NEXO-0033-price-pending-import.md`
- `implementations/IMPL-NEXO-0033-import-price-pending.md`

## Files To Create Or Modify

- `back/prisma/schema.prisma`
- `back/prisma/migrations/<timestamp>_item_photo_storage_key/migration.sql`
- `back/src/modules/media/application/ports/file-storage.port.ts`
- `back/src/modules/media/application/services/resolve-item-photo-read-url.usecase.ts`
- `back/src/modules/media/infrastructure/adapters/{azure-blob-storage,local-storage}.adapter.ts`
- `back/src/modules/media/interface/http/media.controller.ts`
- `back/src/modules/media/media.module.ts`
- Media unit tests.
- Inventory response mapping and frontend photo type/URL helper/components.
- `back/scripts/import-inventory-fixture.ts` so reruns persist the stable key.
- Control-plane implementation, report, QA, and security records.

## Implementation Steps

1. Rename `ItemPhoto.path` to `storageKey` in Prisma and create a migration.
   Canonicalize only recognized Azure container URLs and local `/storage/photos/`
   forms; strip a query string first. Raise an error if a URL-shaped value
   remains so no unknown path is corrupted.
2. Make the storage port return stable object metadata from `upload` and expose
   a request-time `getReadUrl(storageKey, ttl)` operation. Azure must emit a
   read-only, HTTPS-only SAS with a bounded seconds-based TTL; local returns
   its own retrievable path without signing.
3. Add `ResolveItemPhotoReadUrlUseCase(photoId)`. It is the deep module that
   finds the private storage key, requests a fresh URL, and returns it. Keep
   database lookup/provider details internal; callers only know photo ID.
4. Add `GET media/photos/:photoId/content`, guarded by session and
   `OperatorWorkspace`, which redirects to the resolver result and sets
   `Cache-Control: private, no-store`.
5. Sanitize item responses to omit `storageKey`; expose photo ID and display
   metadata only. Make cards, detail, and lightbox derive the stable gateway
   URL from that ID.
6. Change the fixture importer to write `stored.storageKey`; a rerun must
   update the same photo record without introducing signed URLs.
7. Add focused tests, run full builds, and document migration application as a
   separate user gate. Do not run it, commit, push, or deploy without approval.

## Verification

- Tests prove resolver returns a freshly supplied adapter URL for a known ID,
  rejects unknown IDs, and never returns the storage key to an inventory caller.
- Azure adapter tests prove read-only HTTPS SAS with a short TTL; local adapter
  behavior remains supported.
- Prisma schema validates and the generated migration is reviewed without
  applying it.
- Backend tests and builds; frontend build.
- After authorized migration: direct safe query shows canonical keys for all
  photos, and authenticated browser UI receives image content successfully.

## Risks

- Do not log, persist, or surface the generated redirect location in reports.
- The redirect still carries a short-lived capability to the browser, so it is
  no-store and limited to read/HTTPS; it is no longer retained in DB/API state.
- Browser image loads depend on the existing authenticated session; do not use
  a refresh token as a resource-authorization substitute.

## Acceptance Criteria

- An expired legacy SAS is no longer a permanent broken data reference.
- The data model stores only canonical provider-neutral keys.
- Every protected request receives a new short-lived read URL under the
  existing operator authorization policy.
- Azure/SAS concerns stay inside the media adapter and resolver; inventory and
  frontend do not branch on `http`, Azure, SAS, or expiry duration.

## Required Gates

- QA review: required before close.
- Security review: required before close.
- User confirmation: required before applying the database migration; required
  for commit, push, deploy, or external configuration changes.

