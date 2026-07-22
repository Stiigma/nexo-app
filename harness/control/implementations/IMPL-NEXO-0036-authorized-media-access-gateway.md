# IMPL-NEXO-0036 — Authorized Media Access Gateway

## Metadata

- Task ID: NEXO-0036
- Date: 2026-07-15
- Agent: nexo-build
- Related plan: `plans/NEXO-0036-authorized-media-access-gateway.md`
- Related handoff: `handoffs/HOFF-2026-07-15-authorized-media-access-gateway.md`
- Related ADR: `decisions/ADR-2026-07-15-authorized-media-access-gateway.md`

## Summary

Implemented the request-time photo renewal pattern. `ItemPhoto` now models a
durable `storageKey`; no upload or importer persists a signed URL. Inventory
queries select safe photo metadata only, and frontend cards/detail/lightbox use
the stable route `GET /api/v1/media/photos/:photoId/content`.

The new `ResolveItemPhotoReadUrlUseCase` is the deep media-access module. Its
small interface accepts a photo ID and returns a fresh read URL; it internally
owns photo-key lookup and delegates signing to `FileStoragePort`. Azure Blob
and local storage are adapters at that seam. Azure generates a read-only,
HTTPS-only URL for 300 seconds by default (bounded to 60–3600 seconds), while
the gateway returns a `302` with `Cache-Control: private, no-store`.

## Files Changed

- Prisma schema and guarded data migration
  `20260715210000_item_photo_storage_key`.
- Media file-storage port, upload use case/result, Azure/local adapters,
  read-url resolver, protected controller endpoint, DTO, and unit tests.
- Inventory repository photo selection, both inventory importers, and frontend
  photo type plus URL helper/cards/detail modal.
- Safe environment template for the read URL TTL.

## Behavior Changed

- The object identity persisted for a photo is `items/{itemId}/main.webp`, not
  a full Azure URL or SAS query.
- A browser asks the same-origin gateway for content by `ItemPhoto.id`.
- The gateway requires an authenticated `OperatorWorkspace` session before it
  issues a new temporary redirect to private storage.
- Inventory API responses omit both `storageKey` and any signed URL.
- Rerunning either fixture importer updates the existing photo record with the
  stable key; it cannot add a persisted SAS URL.

## Verification

- Prisma schema generation and validation passed.
- Backend unit suite passed: 14 files, 61 tests.
- Backend and frontend production builds passed; frontend retains only its
  existing bundle-size warning.
- Both fixture importers passed isolated strict TypeScript validation.
- Fixture import dry-run passed without DB/Azure writes: 39 items, 39 WebP
  photos, 39 null sale prices, and 10 null costs.
- Read-only migration simulation found 56 legacy Azure URLs with queries and
  normalized all 56 to canonical `items/{id}/main.webp` keys, with zero
  residual URL/path forms.
- The authorized local migration `20260715210000_item_photo_storage_key` was
  applied and Prisma reports the database schema up to date.
- Direct data validation found 56 total photo records, 56 canonical
  `items/{id}/main.webp` keys, and zero URL/query/local-public residues.
- A live Azure signing check generated a fresh HTTPS-only, read-only URL with
  an expiry; an unsigned blob request was not publicly readable.
- The live backend registers the protected route and returns `401` before
  session authorization. The resolver uses explicit `@Inject(PrismaService)`
  so Nest resolves its dependency reliably at runtime.

## Operational Notes

- `AZURE_READ_URL_TTL_SECONDS` is optional; omitted or invalid values use 300.
  The legacy seven-day variable is no longer consumed by the adapter.
- Do not log or store the redirect location. It is a short-lived browser-only
  bearer capability, not inventory data.
- The migration renames the physical column and normalizes legacy records in
  one transactional operation; it fails closed if an unrecognized URL form
  remains.

## Follow-Up

- In an authenticated operator session, verify the inventory cards, detail
  modal, and lightbox load renewed media URLs, including the 39-item
  `PRICE_PENDING` filter/order view.
- Complete closeout evidence for NEXO-0036 and NEXO-0033. No commit, push, or
  deployment is authorized by this task.
