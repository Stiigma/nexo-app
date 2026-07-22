# NEXO-0002 Report — Batch+Multi-Payment Rewrite Session 014

## Metadata

- Date: 2026-07-01
- Agent: `nexo-build`
- Task: `NEXO-0002` — create domain context document
- Status: Full prototype rewrite to batch+multi-payment model completed; automated checks pass; manual visual review remains incomplete.

## What Was Done

- Executed the full Batch+Multi-Payment rewrite handoff
  (`HOFF-2026-07-01-purchase-batch-multi-payment.md` and
  `HOFF-2026-07-01-batch-multi-payment-steps.md`).
- Phase 1-2 (schema v4 + types): new `payments` table between `purchase_batches`
  and `garments`; `Payment`, `PurchaseBatch` (consolidated), `PurchaseBatchDetail`
  with nested payments+garments; `PaymentConfirmationInput` with `batchMode` and
  `existingBatchId`.
- Phase 3 (repository): `confirmCartAsBatch` with batchMode logic (new, existing,
  auto find/create); cart deleted after confirmation; `listBatchesForStoreDate`;
  `seedDemoBatches` creates temp carts and confirms them; `deleteCart` method.
- Phase 4 (store): new screens (`batch-list`, `cart-create`, `cart-capture`,
  `batch-detail`); `eligibleBatches`, `batchMode`/`existingBatchId` in payment
  draft; `deleteActiveCart`, `startCartFromStore`, `seedDemoBatches`.
- Phase 5 (components): `BatchList` (home), `BatchDetail` (payments+garments),
  `NewCartFlow` (store selector), `CartCapture` (item capture with discard);
  `PaymentConfirmForm` adapted with batch selector radio+dropdown;
  `AcquiredStockList` adapted for v4 types; removed `CartList`, `CartDetail`,
  `CartForm`, `BatchSummary`.
- Phase 6 (App.tsx): batch-centric routing.
- Phase 7 (tests): 41 tests across 4 files; new tests for multi-payment
  batch confirmation, batchMode=new vs existing, cart deletion, consolidated
  totals, batchMode validation, seedDemoBatches.
- Phase 8 (verification): `npm run test` 41/41 passed; `npm run build` clean.

## Files Changed

### New
- `prototypes/purchase-capture-demo/src/components/BatchList.tsx`
- `prototypes/purchase-capture-demo/src/components/BatchDetail.tsx`
- `prototypes/purchase-capture-demo/src/components/NewCartFlow.tsx`
- `prototypes/purchase-capture-demo/src/components/CartCapture.tsx`
- `harness/control/implementations/NEXO-0002-batch-multi-payment-rewrite.md`

### Modified
- `prototypes/purchase-capture-demo/src/domain/types.ts`
- `prototypes/purchase-capture-demo/src/domain/validation.ts`
- `prototypes/purchase-capture-demo/src/domain/cartTotals.ts`
- `prototypes/purchase-capture-demo/src/data/purchaseCartRepository.ts`
- `prototypes/purchase-capture-demo/src/state/usePurchaseCartStore.ts`
- `prototypes/purchase-capture-demo/src/components/PaymentConfirmForm.tsx`
- `prototypes/purchase-capture-demo/src/components/AcquiredStockList.tsx`
- `prototypes/purchase-capture-demo/src/App.tsx`
- `prototypes/purchase-capture-demo/src/domain/validation.test.ts`
- `prototypes/purchase-capture-demo/src/data/purchaseCartRepository.test.ts`
- `prototypes/purchase-capture-demo/src/domain/cartTotals.test.ts`

### Removed
- `prototypes/purchase-capture-demo/src/components/CartList.tsx`
- `prototypes/purchase-capture-demo/src/components/CartDetail.tsx`
- `prototypes/purchase-capture-demo/src/components/CartForm.tsx`
- `prototypes/purchase-capture-demo/src/components/BatchSummary.tsx`

### To be updated (control plane)
- `harness/control/README.md`
- `harness/control/tasks.md`
- `harness/control/state/CURRENT.md`
- `harness/control/state/NEXT.md`
- `harness/control/journal/2026-07-01.md`

## Verification Performed

- `npm run test`: 4 test files, 41 tests, all passed.
- `npm run build`: clean, no errors.
- Vite dev server at `http://127.0.0.1:5174/` returns HTTP 200.

## Verification Gaps

- Manual mobile/browser review remains incomplete (no Chromium/Chrome binary
  or Playwright in environment).
- No integration test for the full confirmCartAsBatch flow across multiple
  carts/payments.
- Internal code sequence logic is not unit-tested in isolation.

## Open Items

- OQ-001 rounding policy remains unresolved.
- Batch date handling: "Nuevo pago en este lote" button on batch detail creates
  a cart with today's date, which may not match the batch's date. UX refinement
  deferred.
- Product backend (PostgreSQL, NestJS, React PWA) not scaffolded.
- Multi-store buying trip (future entity) not modeled.

## Recommended Next Step

Complete a real mobile/browser review of `http://127.0.0.1:5174/`. Then decide:
resolve remaining SRS open questions (OQ-001 rounding, exchange-rate fallback,
admin corrections, duplicate customers, QR payload, listing lifecycle), or
start product architecture work (PostgreSQL schema, NestJS scaffold,
React PWA scaffold).
