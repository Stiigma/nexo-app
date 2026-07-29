# NEXO-0051 - Multi-Photo Inventory Support (Upload, Gallery, Management)

## Metadata

- Task ID: `NEXO-0051`
- Status: `planned`
- Priority: P1
- Created: 2026-07-26
- Planning agent: `nexo-plan`
- Receiving agent: `nexo-build`, after the governed build gate passes
- Required gates: architecture decision, migration plan, QA review, and
  security review
- Related tasks: `NEXO-0036` supplies protected photo reads; `NEXO-0042` is a
  smaller overlapping upload-button task and must not be implemented separately;
  `NEXO-0050` owns lifecycle/readiness consequences of changing a main photo.

## 1. Objective

Allow an authorized operator or administrator to upload, view, select, order,
and delete up to five photos for an existing inventory item while preserving
exactly one main photo, private object storage, deterministic ordering, and
eventual blob cleanup. Upgrade the inventory card, detail modal, editor, and
lightbox into one consistent, accessible, mobile-first gallery experience.

The implementation must keep provider keys and signed Azure URLs out of the
browser. Clients continue to render each photo through
`GET /api/v1/media/photos/:photoId/content`.

## Done When

- An item can hold one through five photos, returned in deterministic
  `displayOrder` order, with exactly one `isMain=true` photo.
- Operator and Admin users can upload one or more valid images, choose the main
  photo, reorder the complete set, and delete any photo except the last.
- Uploads are optimized by the current Sharp pipeline and stored below a
  server-generated `items/{itemId}/...` key; no client can choose or see a
  storage key.
- Metadata mutations are transactional. Deleting the main photo promotes the
  first remaining photo. Blob deletion is idempotent and durably retried if the
  storage provider is temporarily unavailable.
- Inventory cards show the main photo and a photo-count badge. Detail and
  lightbox views navigate the ordered collection without losing the selected
  index.
- The editor provides an accessible photo manager with drop/select upload,
  previews, progress, main selection, confirmation before delete, and
  keyboard/touch-friendly reorder controls.
- Automated backend tests, frontend logic tests, builds, migration checks,
  authenticated desktop/mobile acceptance, QA, and security review pass.

## Scope

- Existing inventory items and the current `ItemPhoto` relation.
- Multipart multi-file upload and association in one inventory route.
- Main-photo, reorder, delete, cleanup, and concurrency/invariant policy.
- Existing private media gateway and image optimization pipeline.
- Inventory list/detail/editor cache synchronization and gallery UI.
- A guarded Prisma migration for indexes, constraints, and durable deletion
  cleanup records.

## Out Of Scope

- In-browser crop, rotate, filters, or other photo editing.
- AI tagging, photo annotations, video, GIF, or document support.
- Public/anonymous photo access, CDN redesign, or making Azure public.
- Original-file retention; the current optimized WebP output remains canonical.
- Redesigning item creation or purchase capture. This plan prevents existing
  items from losing their last photo; the separate create flow must continue to
  satisfy `FR-INV-002` before it is exposed as a complete workflow.
- A generic digital-asset-management service or a new message broker.
- Commit, push, deploy, production migration, storage-policy changes, or real
  blob deletion outside an authorized test fixture without explicit user
  confirmation.

## 2. Current State Analysis

### Data and backend

- `back/prisma/schema.prisma` already models `Item 1--N ItemPhoto` with
  `storageKey`, `isMain`, and `displayOrder`, so the core cardinality does not
  need redesign.
- There is no uniqueness/index protection for storage keys, main photos, or
  item/order lookups. Existing records are reported as one main photo at order
  zero, but the database can currently hold two mains or none.
- `PrismaInventoryRepository` includes safe photo metadata but does not order
  the relation. It correctly omits `storageKey`.
- `POST /media/upload` validates one file, runs Sharp, and returns a storage key
  without creating `ItemPhoto`. It is Admin-only and is not suitable as a
  browser-visible two-step item-photo contract.
- `FileStoragePort` and both current adapters already support idempotent
  `delete(storageKey)`. `UploadMediaUseCase` already owns optimization/upload.
- `GET /media/photos/:photoId/content` is the accepted authenticated signed-
  redirect gateway from `NEXO-0036`; it must remain unchanged as the read path.
- The inventory module owns item writes. The media module owns processing,
  provider selection, and object operations. No outbox/cleanup worker is
  currently implemented despite the broader architecture ADR.

### Frontend

- `ItemDto.photos` already contains safe metadata, and
  `itemPhotoContentUrl(photoId)` builds the protected content route.
- `InventoryCard` finds main/first and opens a single-source lightbox.
- `ItemDetailModal` renders one hero image and has no thumbnail selection.
- `PhotoLightbox` accepts one `src`, supports Escape/backdrop/close, and has no
  index, arrows, swipe, thumbnails, focus return, or image error state.
- `ItemEditorDialog` has no photo UI. Its normal fields save as one form, while
  photo operations need independent immediate mutations and clear copy that
  Cancel does not undo an already completed upload/delete/reorder.
- React Query caches inventory pages, but `InventoryPage` stores the complete
  editing item object. That copy can become stale after a photo mutation.
- Existing dependencies already supply Axios progress callbacks, Nest/Multer
  multipart handling, TanStack Query, Radix AlertDialog, Lucide icons, and
  React pointer events. No drag/drop, carousel, swipe, or scheduler package is
  necessary.

### Requirement and task alignment

- `FR-INV-002` requires a visible main photo and treats the main photo as
  mandatory. This task must never let its management endpoints leave an
  existing item without one.
- `NEXO-0026` recorded five photos per item as the current v1 limit. This plan
  adopts that limit (`MAX_PHOTOS_PER_ITEM = 5`) unless the product owner records
  a later requirement change.
- `NEXO-0036` forbids exposing persisted storage keys or signed URLs in
  inventory responses. All new response DTOs return photo IDs and metadata
  only.
- `NEXO-0050` treats main-photo changes as material lifecycle edits. If its
  lifecycle policy lands first, these photo commands must invoke its readiness,
  revision, approval-invalidation, and audit policy in the same transaction;
  this task must not duplicate that policy.

## 3. Architecture Decisions

### Decision boundary

Choose which module owns the HTTP and business contract for item photos, how
media storage is invoked, and how metadata/blob consistency is recovered after
partial failure.

### Options considered

1. **Keep the current two-step public contract:** upload under `/media`, return
   a storage key, then add a link endpoint. This is small but exposes storage
   identity to clients, creates orphan windows, and lets controllers bypass the
   main/order invariant.
2. **Inventory-owned item-photo commands using a narrow media application
   facade:** inventory validates ownership and photo-set policy; media processes,
   uploads, and deletes provider objects. Metadata changes and cleanup requests
   commit together. This preserves both bounded-context responsibilities.
3. **Move association and all photo policy into Media:** centralizes binaries
   but makes Media own item authorization/readiness and write another module's
   aggregate, weakening cohesion.

### Selected endpoint and module seam

- Put all association/mutation routes in `ItemsController` under
  `/api/v1/inventory/items/:id/photos`.
- Add an inventory application service/use case that owns item lookup, role
  policy, limits, main selection, ordering, transaction boundaries, and the
  returned canonical photo collection.
- Export narrow `UploadMediaUseCase` and `DeleteStoredMediaUseCase` application
  capabilities from `MediaModule`. Inventory imports those capabilities; it
  does not instantiate Azure/local adapters or parse provider responses.
- Refactor `MediaModule` provider registration only as needed to make one
  configured module safely importable by `InventoryModule`; do not create two
  storage-adapter instances or let `InventoryModule` import provider SDKs.
- Keep the existing generic `POST /media/upload` for compatibility, mark it as
  unsuitable/deprecated for item-photo UI, and do not call it from the editor.
- Use a small durable `ItemPhotoBlobDeletion` cleanup record owned with the
  item-photo association. Deleting metadata and enqueueing cleanup happen in
  one database transaction; storage deletion is then attempted immediately and
  retried by an idempotent, bounded in-process reconciler. This follows the
  accepted transactional-outbox principle without adding a broker dependency.
- Use serializable photo-set transactions (with bounded retry for serialization
  conflicts) and full-set validation for reorder. Do not add a second client-
  editable version field solely for this slice.

### API contract

| Method and route | Request | Success response | Key rules |
| --- | --- | --- | --- |
| `POST /inventory/items/:id/photos` | `multipart/form-data`, field `files`, 1 to remaining slots | `201` with canonical `photos[]` and upload metadata | Validate all files before processing; append order; first photo becomes main only if no main exists; batch association is all-or-nothing. |
| `DELETE /inventory/items/:id/photos/:photoId` | none | `200` canonical `photos[]`; `202` only when metadata committed but blob cleanup remains queued | Photo must belong to route item; reject last photo; promote next ordered photo when deleting main. |
| `PUT /inventory/items/:id/photos/:photoId/main` | empty body | `200` canonical `photos[]` | Flip old/new main atomically; idempotent if already main; do not change order. |
| `PUT /inventory/items/:id/photos/reorder` | `{ "photoIds": [ordered full set] }` | `200` canonical `photos[]` | Exact same IDs, no duplicates, all owned by item; normalize to zero-based contiguous order. |

Common behavior:

- Require `SessionAuthGuard`, `PermissionGuard`, and
  `Permission.OperatorWorkspace`, matching the shared editor and ASM-005. Both
  Operator and Admin can manage photos; provider/storage administration remains
  unavailable to both through these routes.
- Return `401` unauthenticated, `403` permission failure, `404` for unknown item
  or a photo not owned by that item, `409` for a concurrent set change, `413`
  for size limits, and `422` for the five-photo cap or attempted last-photo
  deletion. Use stable error codes in response details where supported.
- Accept JPEG, PNG, or WebP; maximum 5 MiB per source file and five files/item.
  Validate declared MIME, decoded image, count, and available slots. Sharp
  remains the authority that rejects malformed/spoofed image content.
- Generate keys server-side as `items/{itemId}/{randomUUID}.webp` and never
  return them. Preserve the current EXIF stripping, auto-rotation, max 2048px,
  and WebP settings.
- Return photos ordered by `displayOrder`, then deterministic ID/created-time
  tie-breakers while legacy data is normalized.

### Batch and failure semantics

1. Validate item, all files, and remaining slots before uploading any object.
2. Process a maximum of five files with bounded concurrency (two at a time) to
   cap memory/CPU pressure.
3. If any upload fails, do not create photo rows. Delete already uploaded
   objects idempotently; persist a cleanup record if immediate compensation
   fails.
4. After all uploads succeed, create all `ItemPhoto` rows in one serializable
   transaction. Append contiguous orders and preserve the current main.
5. If metadata commit fails, compensate every new object as in step 3.
6. For deletion, remove metadata/promote/reorder and enqueue the storage key in
   one transaction. Attempt object deletion after commit. A provider failure
   leaves a non-secret cleanup record and returns `202`; the photo remains
   absent from reads and cleanup retries until `deleteIfExists` succeeds.
7. Never log signed URLs, credentials, file bytes, or EXIF. Logs may contain a
   correlation ID, item/photo ID, operation, and bounded error category.

## Architecture Decision Evaluation

- Decision: approved
- Selected option: Option 2 — inventory-owned item-photo commands backed by a
  narrow media upload/delete facade and a durable, idempotent cleanup record.
- Rationale: Item ownership, authorization, the five-photo cap, main-photo
  invariant, order, and readiness belong to Inventory; image transformation and
  provider operations belong to Media. The selected seam avoids exposing
  storage keys or duplicating provider logic while containing distributed
  database/blob failure with the smallest durable recovery mechanism.
- Pattern decision: Use an Application Service/Facade plus transactional
  repository and outbox-style cleanup record. Use direct pure photo-set policy
  functions; do not add a State object hierarchy, carousel library, drag/drop
  library, workflow engine, or general event bus.
- Required evidence or approval: This task-bound plan is the architecture and
  migration evidence. It instantiates the accepted modular-monolith,
  port-adapter storage, and authenticated media-gateway ADRs, so no new ADR is
  required. Explicit user confirmation is still required before applying a
  migration, deleting non-fixture blobs, deploying, committing, or pushing.
- Reversibility: API/UI code and new indexes/cleanup table can be rolled back by
  migration while preserving existing photo rows. A blob intentionally deleted
  after confirmation cannot be recreated by code rollback; storage backup or
  provider soft-delete, if separately configured, is the operational recovery.

### Dependency posture

No new direct dependency is selected. Use existing Nest/Multer, Sharp, Axios,
TanStack Query, Radix AlertDialog, React, and Pointer Events. Reorder arrows are
the required accessible/mobile control; native drag enhancement is optional
only if it does not become the sole control. If implementation proposes a new
DnD, carousel, gesture, upload, or scheduling package, stop and run
`nexo-select-dependency`, update the manifest, and obtain approval before
changing a package manifest or lockfile.

### Component tree changes

```text
InventoryPage
├─ InventoryGrid
│  └─ InventoryCard
│     └─ PhotoLightbox (ordered photos, initial main index)
├─ ItemDetailModal
│  ├─ PhotoHero (selected index)
│  ├─ PhotoThumbnailStrip
│  └─ PhotoLightbox (same selected index)
└─ ItemEditorDialog
   └─ ItemPhotoManager (dedicated Fotos tab)
      ├─ PhotoDropzone / file input / progress
      ├─ PhotoManagementGrid
      │  └─ main, move up/down, delete actions
      └─ PhotoDeleteConfirmation (existing AlertDialog)
```

Store `editingItemId`, not an `ItemDto` copy, in `InventoryPage`; derive the
current item from React Query data so card, detail, and editor see the same
canonical photo set after each mutation.

## 4. Backend Implementation Steps

### Phase 1 - Domain and contracts

1. Add `back/src/modules/inventory/domain/item-photo.ts` (or equivalently named
   focused files) with `ItemPhotoEntity`, `MAX_PHOTOS_PER_ITEM`, deterministic
   sorting, full-set reorder validation, next-main selection, and stable domain
   errors. Keep it free of Nest, Prisma, and storage SDK imports.
2. Extend `back/src/modules/inventory/domain/item.ts` so returned item entities
   explicitly type `photos`; remove unsafe casts where practical.
3. Create request/response DTOs under
   `back/src/modules/inventory/interface/http/dto/`:
   - `reorder-item-photos.dto.ts` with a non-empty unique UUID/string array;
   - `item-photo-response.dto.ts` exposing only ID, item ID, main flag, order,
     and creation time;
   - a canonical photo-set mutation response, including cleanup state only as a
     bounded enum and never a storage key.
4. Centralize per-file validation/constants currently in `MediaController` so
   the generic and inventory upload routes cannot drift.

### Phase 2 - Media application facade

1. Export `UploadMediaUseCase` from
   `back/src/modules/media/media.module.ts` for internal module use.
2. Add
   `back/src/modules/media/application/services/delete-stored-media.usecase.ts`
   as the sole inventory-facing delete capability. It accepts a trusted
   server-side storage key, calls `FileStoragePort.delete`, and treats a missing
   object as success.
3. Refactor `media.module.ts`, `inventory.module.ts`, and `app.module.ts` so the
   configured media providers are instantiated once and the inventory module
   imports only exported application capabilities.
4. Keep `media.controller.ts` read gateway behavior intact. Mark its generic
   upload route deprecated for item association in OpenAPI/comments; do not
   remove it without a separate compatibility check.
5. Add adapter/use-case tests for idempotent deletion and ensure no exception or
   response leaks provider URLs or credentials.

### Phase 3 - Inventory application and persistence

1. Add `back/src/modules/inventory/application/item-photo.service.ts` to
   orchestrate upload, association, main selection, reorder, and delete.
2. Extend `InventoryRepository` with intention-revealing photo-set methods or a
   focused `ItemPhotoRepository` port. Do not expose generic Prisma delegates to
   the controller.
3. Implement the Prisma adapter methods in
   `back/src/modules/inventory/infrastructure/repositories/` with serializable
   transactions and bounded retry for serialization conflicts:
   - load/lock item photo set;
   - append a batch and assign contiguous orders;
   - switch main by clearing then setting inside one transaction;
   - reorder only when the request IDs exactly match the current set;
   - delete/promote/compact and enqueue cleanup atomically;
   - claim/complete/fail cleanup jobs without exposing keys externally.
4. Add
   `back/src/modules/inventory/infrastructure/item-photo-blob-cleanup.worker.ts`
   (name may follow local conventions). Run a bounded startup/interval sweep,
   use idempotent storage delete, exponential/backoff timestamps, a maximum
   batch size, and lifecycle cleanup on module shutdown. Multiple API instances
   may race safely because deletion is idempotent; use an atomic claim/lease if
   the deployment becomes multi-instance.
5. Ensure `itemInclude.photos` has explicit `orderBy` and continues to select no
   `storageKey`. Update repository contract tests accordingly.
6. Integrate with NEXO-0050 if present: main selection, addition, reorder, and
   deletion are material photo edits. Invoke its reconciliation/revision/audit
   hook in the same transaction. If NEXO-0050 is not present, expose one
   application seam and leave a named integration test—not duplicate lifecycle
   rules in this task.

### Phase 4 - HTTP endpoints

1. Add the four routes to
   `back/src/modules/inventory/interface/http/items.controller.ts`, keeping the
   controller limited to guards, multipart/DTO validation, status mapping, and
   service invocation.
2. Use `FilesInterceptor("files", 5, ...)` with memory/file-count limits and a
   pipe that validates every file before the application service runs. Bound
   multipart field sizes and reject unknown excessive parts.
3. Generate UUID-based item-scoped object keys on the server. Do not derive a
   key from an untrusted original filename.
4. Add OpenAPI operation/request/response/error documentation, including batch
   all-or-nothing behavior and `202` cleanup-pending behavior.
5. Add authorization and IDOR tests: a valid user cannot mutate a photo through
   a different item ID; unknown and cross-item photo IDs return the same safe
   not-found contract.

## 5. Frontend Implementation Steps

### Phase 5 - Types, API, and cache model

1. Update `front/src/features/inventory/types/item.ts` so `photos` is a
   canonical ordered array in inventory responses and add mutation response and
   cleanup-status types.
2. Add a shared helper such as
   `front/src/features/inventory/lib/item-photos.ts` for stable ordering, main
   index, photo URL mapping, index clamping, and adjacent-index navigation.
3. Extend `front/src/common/services/api-client.ts` with a focused multipart
   method that accepts `FormData` and Axios `onUploadProgress`. Let the browser
   set the multipart boundary rather than forcing JSON `Content-Type`.
4. Add hooks under `front/src/features/inventory/hooks/`:
   - `use-item-photo-upload.ts`;
   - `use-item-photo-delete.ts`;
   - `use-item-photo-main.ts`;
   - `use-item-photo-reorder.ts`;
   - a shared cache updater that merges the canonical photo set into every
     matching `['inventory','items', ...]` page.
5. Change `InventoryPage.tsx` from `editingItem: ItemDto` to `editingItemId` and
   derive the editor item from current query data. Refetch the selected item on
   a conflict or if it is not present in the current page.
6. Optimistically update only main selection and reorder, snapshotting every
   touched cache and rolling back on failure. Upload uses local object-URL
   previews until canonical success. Delete waits for server acknowledgement.

### Phase 6 - Item editor photo manager

1. Create `ItemPhotoManager.tsx` and focused child components under
   `front/src/features/inventory/components/`; do not grow the existing
   500-line editor with all gallery state inline.
2. Add a dedicated `Fotos` tab to `ItemEditorDialog`. Make the tabs wrap or use
   a two-by-two mobile grid so labels remain usable at 320-390px widths.
3. Dropzone behavior:
   - button plus native `multiple` file input, keyboard activation, and drag
     enter/leave/drop states;
   - accept JPEG/PNG/WebP and show five-MiB/five-photo limits before selection;
   - reject too many/invalid files locally with per-file messages while still
     relying on server validation;
   - show aggregate upload percentage and pending thumbnails; disable duplicate
     submit while uploading; revoke every object URL on completion/unmount.
4. Preview grid behavior:
   - ordered thumbnails with `Principal` star and position label;
   - explicit `Hacer principal`, `Mover antes`, `Mover después`, and `Eliminar`
     controls with 44px mobile targets and descriptive `aria-label`s;
   - up/down (previous/next) buttons are the required reorder mechanism and
     remain available even if native drag enhancement is added;
   - disable actions while their item mutation is pending, not the unrelated
     garment form where safe.
5. Use the existing Radix `AlertDialog` for delete confirmation. Explain when
   deleting the main photo will promote the next photo, and do not offer delete
   for the last remaining photo.
6. Photo mutations persist immediately and independently of the garment form.
   Add explicit helper text: closing/cancelling the form does not undo completed
   photo changes. Include active photo mutations in the editor's close guard so
   it cannot disappear mid-upload/delete.
7. On `202`, show a non-alarming toast that the photo was removed and storage
   cleanup is pending. On failure, keep/refetch the canonical set and retain
   selected local files when a safe retry is possible.

### Phase 7 - Card, detail gallery, and lightbox

1. `InventoryCard.tsx`:
   - continue rendering the main photo;
   - add an always-readable `Camera` badge such as `5` in the photo corner;
   - open the lightbox with all ordered photo URLs at the main photo's index;
   - reset loading state when the main photo changes.
2. `ItemDetailModal.tsx`:
   - maintain `selectedPhotoIndex`, initialized to the main index and reset when
     the item/photo set changes;
   - render a horizontally scrollable thumbnail strip below the hero;
   - mark the selected thumbnail with `aria-current`, visible focus, and main
     status; click/tap switches the hero;
   - make the hero a button that opens the lightbox at the selected index;
   - retain a per-photo loading/error placeholder rather than hiding the whole
     gallery after one failed image.
3. `PhotoLightbox.tsx`:
   - replace `src` with `photos: { id, src, alt }[]` and `initialIndex`;
   - provide previous/next controls, wrap or clamp consistently (choose clamp
     with disabled end arrows for predictable accessibility), and show
     `Foto X de Y` in an `aria-live` region;
   - support ArrowLeft, ArrowRight, Escape, close button, and backdrop click;
   - implement horizontal touch/pointer swipe with an intent/threshold guard so
     vertical movement and control clicks do not navigate accidentally;
   - add a bottom, horizontally scrollable thumbnail strip and keep the active
     thumbnail visible;
   - focus the close button on open, trap/contain focus using existing dialog
     primitives or equivalent tested behavior, restore prior focus/body overflow
     on close, and stop inner controls/images from triggering backdrop close;
   - prefetch only adjacent protected URLs and use lazy thumbnails to avoid
     requesting all full-size images on every card render.
4. Keep `item-photo-content-url.ts` as the only browser URL constructor. Do not
   add storageKey, SAS URL, or provider fields to frontend types.

## 6. Database Considerations And Migration Plan

### Schema changes

1. Update `ItemPhoto.storageKey` to be unique, preventing two metadata rows from
   sharing one deletable object.
2. Add `@@index([itemId, displayOrder])` for ordered item gallery reads.
3. Add migration SQL for:
   - a partial unique index on `itemId WHERE isMain = true` (at most one main);
   - a non-negative `displayOrder` check;
   - a deferred constraint trigger that rejects a non-empty photo set without
     exactly one main and rejects deleting the last photo while its item still
     exists, while allowing item cascade deletion;
   - `ItemPhotoBlobDeletion` with unique storage key, request/attempt/lease and
     retry timestamps, bounded last-error category, and indexes for pending
     work. Do not store a URL, SAS token, credential, or file bytes.
4. Keep contiguous ordering as transactional application policy; the database
   index supports reads but need not be unique, avoiding transient reorder
   collisions.

### Pre-migration audit

- Count items/photos; group each item by photo count and main count.
- Verify every current photo has one canonical non-URL `storageKey`, one main
  per item, non-negative order, no duplicate key, and no duplicate photo ID.
- Verify the reported baseline (one photo, `isMain=true`, `displayOrder=0`) and
  fail the migration on anomalies. Do not silently choose a new main for
  production data.
- If duplicate display orders exist on a multi-photo test dataset, normalize
  deterministically by current order, creation time, then ID in a reviewed data
  repair before adding constraints.

### Rollout and rollback

1. Generate and inspect the Prisma migration; run `prisma validate` and drift
   checks without applying it to a user environment.
2. Apply to a disposable/restored database copy, seed one-to-five-photo cases,
   and verify constraints plus rollback.
3. Deploy code capable of reading the new schema only after the migration order
   is approved. Keep the old single-photo rendering compatible throughout.
4. Rollback can remove the cleanup table/indexes/trigger and return to
   single-photo UI without deleting surviving photo rows. Do not roll back by
   rewriting storage keys or making the container public.
5. Production migration, deploy, and any deletion against non-fixture storage
   require explicit user confirmation. Before enabling delete, verify the
   provider's operational restore/soft-delete posture; do not claim code
   rollback can restore a deleted object.

## 7. Testing Strategy

### Backend unit and integration tests

- Pure policy tables: 1-5 cap, append order, exact-set reorder, duplicates,
  cross-item IDs, set-main idempotence, main promotion, last-photo rejection,
  and deterministic tie-breaking.
- Upload facade: every supported type, malformed/spoofed content, per-file and
  aggregate count limits, WebP output, EXIF removal, server-generated keys,
  bounded concurrency, all-or-nothing association, and compensation.
- Repository/transaction: exactly one main after every command, contiguous
  order, partial unique constraint, serializable conflict behavior, cleanup job
  committed with metadata delete, and no partial state after failures.
- Cleanup worker: immediate success, provider outage, retry/backoff, restart,
  duplicate worker claim, idempotent missing blob, and bounded/sanitized errors.
- HTTP/e2e: route/status/DTO/OpenAPI contracts; unauthenticated, Operator,
  Admin, forbidden role; IDOR/cross-item rejection; 404/409/413/422/202 mapping.
- Response privacy: inventory and mutation responses never contain
  `storageKey`, `http`, query tokens, or provider details; deleted photo content
  route returns not found while surviving photos remain readable.
- Regression: existing inventory list/facets/editor/media-read and media upload
  tests continue to pass.

### Frontend automated tests

- Pure gallery helpers: stable ordering, main index, clamping after deletion,
  previous/next boundaries, and URL mapping.
- Photo manager reducer/state helpers: local validation, remaining slots,
  optimistic main/reorder update and rollback, cleanup-pending response, and
  object-URL cleanup.
- Lightbox navigation logic: keyboard command mapping and swipe threshold/
  direction. Use pure functions under Vitest so no new test dependency is
  required.
- Cache merge helper: update the item across multiple paginated query caches
  without dropping financial redaction or unrelated fields.
- `pnpm --dir front build` remains the type-level contract gate. If automated
  DOM component coverage is proposed, select/approve a test dependency in a
  separate dependency evaluation rather than silently adding one.

### Manual authenticated acceptance

- Run as Operator and Admin at desktop and 390px mobile widths.
- Upload 1 then multiple images; observe progress, previews, final order, cap,
  invalid type/size, network failure, and retry.
- Change main; confirm card, detail hero, readiness, and lightbox all update.
- Reorder with keyboard and touch targets; refresh and confirm persistence.
- Delete a non-main and the main with confirmation; confirm promotion; confirm
  last-photo delete is unavailable and server-rejected if forced.
- Navigate detail thumbnails and lightbox by click, keyboard, swipe, and screen
  reader labels; verify Escape/backdrop/close and focus return.
- Inspect browser requests: all image sources use the same-origin protected
  `/api/v1/media/photos/:id/content` route and no SAS/storage key appears in API
  payloads, DOM attributes, logs, or persisted frontend state.

## 8. Verification Checklist

### Planning/build gate

- [ ] Resolve ownership overlap with NEXO-0042 and schema/invalidation overlap
  with NEXO-0050.
- [ ] Run `node harness/control/scripts/control-engine.mjs inspect --task NEXO-0051`.
- [ ] Run `node harness/control/scripts/control-engine.mjs gate --task NEXO-0051 --name build` before product changes.

### Schema/backend

- [ ] Pre-migration audit passes with no duplicate keys or invalid main sets.
- [ ] `pnpm --dir back db:validate`
- [ ] Focused item-photo/media unit and integration tests pass.
- [ ] `pnpm --dir back test:unit`
- [ ] `pnpm --dir back test:e2e`
- [ ] `pnpm --dir back test`
- [ ] `pnpm --dir back build`
- [ ] Disposable-copy migration, constraint, retry-worker, and rollback checks
  pass before requesting environment authorization.

### Frontend

- [ ] `pnpm --dir front test`
- [ ] `pnpm --dir front build`
- [ ] Card count/main, detail thumbnails, editor photo manager, and lightbox
  acceptance pass on desktop and mobile.
- [ ] Keyboard, focus, screen-reader labels, touch targets, swipe, loading,
  error, empty, single-photo, and five-photo states pass.

### Privacy, security, and close gates

- [ ] Operator/Admin permissions and cross-item IDOR tests pass.
- [ ] No storage key, signed URL, credential, EXIF, or file content leaks.
- [ ] Blob cleanup succeeds or remains durably queued and observable without a
  false-success orphan.
- [ ] NEXO-0050 readiness/approval invalidation is tested if that policy exists.
- [ ] QA report records exactly one passing decision.
- [ ] Security review records exactly one approved decision.
- [ ] Implementation record/report and closeout are created only at the
  corresponding milestone; task row and manifest remain synchronized.
- [ ] Run `graphify update .` after product code changes.

## 9. Risks And Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Database commit and blob storage cannot be one transaction | Orphan blobs or missing objects | Upload compensation; deletion cleanup record committed with metadata; idempotent immediate and background retry; reconciliation metrics/report. |
| Two users edit the same photo set | Lost reorder or two mains | Serializable transaction, exact full-set validation, partial unique main index, bounded conflict retry, return/refetch canonical state. |
| Deleting the main/last photo breaks FR-INV-002 | Item becomes visually invalid | Reject last deletion; atomically promote first remaining ordered photo; deferred constraint and tests. |
| Five in-memory 5 MiB uploads plus Sharp pressure API memory/CPU | Latency or process exhaustion | Hard count/size limits, bounded concurrency of two, reject excessive multipart parts, benchmark representative images. |
| MIME spoof or malicious image | Parser/CPU/security risk | MIME plus decoded-image validation, current Sharp limits/metadata stripping, bounded dimensions/size, security review. |
| Storage keys or signed URLs leak through new DTOs/logs | Private media disclosure | Explicit response DTO/select, protected helper URL only, privacy assertions, sanitized logs, security review. |
| Photo actions are immediate while garment fields are unsaved | User assumes Cancel reverted photos | Separate Fotos tab/helper copy, confirmation, mutation-specific progress, close guard, canonical refetch. |
| Optimistic UI diverges after failure | Wrong hero/order shown | Limit optimism to reversible metadata actions; snapshot/rollback; no optimistic delete; refetch on conflict/error. |
| Swipe conflicts with vertical scrolling or assistive controls | Poor mobile accessibility | Pointer intent threshold, accessible buttons remain primary, 44px targets, manual mobile/keyboard QA. |
| NEXO-0042 duplicates upload work | Conflicting hooks/UI | Treat NEXO-0042 as absorbed; nexo updates its disposition before build. |
| NEXO-0050 changes photo materiality/readiness | Approval remains stale | Integrate through one lifecycle reconciliation seam in the same transaction; no duplicate policy. |
| Migration exposes dirty legacy data | Constraint application fails or silently changes main | Read-only audit first; fail closed and create reviewed repair evidence; no silent production normalization. |
| Permanent blob delete is irreversible | Code rollback cannot restore photo | Destructive confirmation, explicit environment authorization, verify operational backup/soft-delete posture, never imply metadata rollback restores bytes. |

## 10. Estimated Effort

| Workstream | Estimate |
| --- | ---: |
| Architecture alignment, schema audit, migration/constraints | 1.0-1.5 engineer-days |
| Media facade, inventory photo service/endpoints, cleanup retry | 2.5-3.5 engineer-days |
| Backend unit/integration/e2e and failure/concurrency tests | 1.5-2.0 engineer-days |
| Editor photo manager, hooks, progress, cache synchronization | 2.0-2.5 engineer-days |
| Card/detail/lightbox gallery, accessibility, touch behavior | 1.5-2.0 engineer-days |
| Migration rehearsal, authenticated QA, security review, fixes | 1.5-2.0 engineer-days |
| **Total** | **10-13.5 engineer-days** |

One engineer should plan for roughly two to three calendar weeks including
review and QA. The main uncertainty is failure-safe blob cleanup and integration
timing with NEXO-0050; a simplified best-effort delete would reduce effort but
does not satisfy the durability/risk standard selected here.

## Acceptance Criteria

1. A valid one-to-five-file upload associates optimized photos with the route
   item and returns the ordered safe metadata set; any failed batch leaves no
   photo metadata and compensates uploaded objects.
2. The first photo of an empty legacy set becomes main; later uploads preserve
   the current main and append contiguous display orders.
3. Exactly one main exists after upload, set-main, reorder, and delete,
   including concurrent requests. Reorder never changes main.
4. Deleting a non-last main promotes the first remaining ordered photo.
   Deleting the last photo returns `422` and changes neither metadata nor blob.
5. A successful delete removes metadata and the blob. A temporary provider
   failure returns cleanup-pending status and is retried durably to completion.
6. Operator and Admin can use all four routes; unauthenticated, unauthorized,
   cross-item, invalid-file, and over-limit requests fail safely.
7. No inventory/photo mutation response or frontend state contains storage keys
   or signed URLs; every rendered image uses the protected photo-ID gateway.
8. Card, detail, editor, and lightbox render the same canonical main/order after
   mutation and after refresh.
9. Lightbox click, keyboard, Escape, swipe, thumbnail, backdrop, close, focus,
   loading, and error behavior pass for one and multiple photos on mobile and
   desktop.
10. Migration rehearsal, backend/frontend gates, QA, and security review pass
    without regressing the existing single-photo dataset.

## Decision Log

- 2026-07-26: Registered NEXO-0051 as the complete P1 replacement scope for the
  smaller NEXO-0042 upload-button idea; existing single-photo behavior remains
  backward compatible.
- 2026-07-26: Selected inventory-owned photo commands with Media retaining
  processing/storage capabilities and the NEXO-0036 gateway retaining reads.
- 2026-07-26: Adopted the existing five-photo v1 limit and no-new-dependency UI
  implementation using reorder arrows and native pointer/drop behavior.
- 2026-07-26: Selected transactionally tracked, idempotent blob cleanup rather
  than untracked best-effort deletion.

## Next Step

`nexo` should resolve the NEXO-0042 disposition and NEXO-0050 integration order,
run the NEXO-0051 control-engine inspect/build gate, and then route the handoff
to `nexo-build`. Product code, migration application, and non-fixture blob
deletion remain unauthorized by this planning artifact alone.
