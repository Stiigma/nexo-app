# HOFF-2026-07-26-multi-photo-inventory

## Metadata

- Task ID: `NEXO-0051`
- Date: 2026-07-26
- Authoring agent: `nexo-plan`
- Receiving agent: `nexo-build`
- Status: ready for governed build gate; not implementation authorization
- Plan: `harness/control/plans/NEXO-0051-multi-photo-inventory.md`

## Objective

Implement private, failure-safe one-to-five-photo inventory management and a
mobile-first gallery across the item editor, card, detail modal, and lightbox.

## Context

`ItemPhoto` already supports one-to-many metadata and the NEXO-0036 gateway
already resolves protected content by photo ID. Current data and UI use one
main photo only. The selected architecture keeps item-photo commands and
invariants in Inventory while Media remains responsible for Sharp and object
storage. No new dependency is approved.

NEXO-0042 overlaps and must not be built independently. NEXO-0050 may require
photo changes to invalidate readiness/approval; integrate through its policy if
present rather than duplicating it.

## Source Docs

- `AGENTS.md`
- `NEXO_PROJECT.md`
- `docs/spec/requirements/FR/inventory/FR-INV-002.md`
- `docs/spec/requirements/FR/inventory/FR-INV-010.md`
- `docs/adr/ADR-2026-07-06-modular-monolith-ddd-cqrs-events.md`
- `docs/adr/ADR-2026-07-07-media-storage-azure.md`
- `harness/control/plans/NEXO-0036-authorized-media-access-gateway.md`
- `harness/control/plans/NEXO-0051-multi-photo-inventory.md` (canonical task plan)

## Files To Create Or Modify

### Backend

- `back/prisma/schema.prisma`
- `back/prisma/migrations/<timestamp>_multi_photo_inventory/migration.sql`
- `back/src/app.module.ts`
- `back/src/modules/media/media.module.ts`
- `back/src/modules/media/interface/http/media.controller.ts`
- `back/src/modules/media/application/services/delete-stored-media.usecase.ts`
- `back/src/modules/media/**/__tests__/`
- `back/src/modules/inventory/inventory.module.ts`
- `back/src/modules/inventory/domain/item.ts`
- `back/src/modules/inventory/domain/item-photo.ts`
- `back/src/modules/inventory/application/item-photo.service.ts`
- `back/src/modules/inventory/application/ports/inventory-repository.ts` or a
  focused item-photo repository port
- `back/src/modules/inventory/infrastructure/repositories/prisma-inventory.repository.ts`
- `back/src/modules/inventory/infrastructure/item-photo-blob-cleanup.worker.ts`
- `back/src/modules/inventory/interface/http/items.controller.ts`
- `back/src/modules/inventory/interface/http/dto/*item-photo*.ts`
- focused domain, application, repository, controller, and e2e tests

### Frontend

- `front/src/common/services/api-client.ts`
- `front/src/features/inventory/types/item.ts`
- `front/src/features/inventory/lib/item-photos.ts`
- `front/src/features/inventory/hooks/use-item-photo-*.ts`
- `front/src/features/inventory/components/ItemPhotoManager.tsx`
- `front/src/features/inventory/components/ItemEditorDialog.tsx`
- `front/src/features/inventory/components/InventoryCard.tsx`
- `front/src/features/inventory/components/ItemDetailModal.tsx`
- `front/src/features/inventory/components/PhotoLightbox.tsx`
- `front/src/features/inventory/views/InventoryPage.tsx`
- focused Vitest files for gallery/cache/photo-manager logic

## Implementation Steps

1. Run the NEXO-0051 control-engine inspect/build gate; stop on a blocked or
   invalid result.
2. Audit current photo data and implement the guarded Prisma migration:
   storage-key uniqueness, item/order index, one-main/check constraints, and
   durable blob-deletion cleanup records.
3. Add pure item-photo policy and tests first: cap, ordering, main switch,
   promotion, last-photo rejection, and exact-set reorder.
4. Export narrow media upload/delete capabilities and make module registration
   single-instance/import-safe without exposing provider adapters.
5. Implement serializable inventory photo transactions, upload compensation,
   deletion cleanup queue/retry, deterministic photo reads, and NEXO-0050
   reconciliation when present.
6. Add the four protected inventory endpoints and complete contract,
   authorization, IDOR, invalid-file, concurrency, and response-privacy tests.
7. Add multipart progress/cache hooks and switch InventoryPage to derive the
   editing item by ID.
8. Build the dedicated Fotos tab/manager with immediate mutation copy,
   previews, progress, main, move controls, and Radix delete confirmation.
9. Upgrade card, detail, and lightbox to one ordered gallery model with count,
   thumbnail, keyboard, focus, and pointer-swipe behavior.
10. Run focused tests during development, then one full backend/frontend gate,
    disposable migration rehearsal, authenticated mobile/desktop QA, and
    security review. Run `graphify update .` after product changes.

## Verification

- `pnpm --dir back db:validate`
- `pnpm --dir back test:unit`
- `pnpm --dir back test:e2e`
- `pnpm --dir back test`
- `pnpm --dir back build`
- `pnpm --dir front test`
- `pnpm --dir front build`
- Disposable/restored database migration, constraint, cleanup-retry, and
  rollback checks
- Authenticated Operator/Admin desktop and 390px mobile acceptance
- Browser/network privacy check for protected photo-ID URLs only
- QA pass and security approval before close

## Risks

- DB/blob partial failure: use upload compensation and transactionally tracked,
  idempotent deletion retry.
- Concurrency: serializable transactions, exact-set reorder, and partial unique
  main constraint.
- Irreversible deletion: confirmation and explicit authorization; code rollback
  does not restore bytes.
- Memory/CPU pressure: five-by-five-MiB hard cap and processing concurrency two.
- NEXO-0042/0050 overlap: resolve ownership/order before product changes.
- Private media leakage: safe DTO/select, no storage key/SAS in browser or logs.

## Acceptance Criteria

- All ten acceptance criteria in the canonical plan pass.
- One-to-five photos remain ordered with exactly one main after every command
  and concurrent test.
- Delete never removes the last photo and eventually removes the selected blob.
- Card, detail, editor, and lightbox converge on the same canonical collection.
- No new dependency, public storage access, signed-URL persistence, or
  unauthorized external change is introduced.

## Receiving Agent

`nexo-build` should implement the plan phases in order and return to `nexo` with
changed files, migration evidence, focused/full test results, unresolved risks,
and the paths needed for implementation, QA, and security evidence. It must not
delegate, apply an environment migration, delete non-fixture blobs, commit,
push, or deploy without the separately required user confirmation.
