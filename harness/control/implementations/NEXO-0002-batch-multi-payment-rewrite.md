# NEXO-0002 — Batch+Multi-Payment Rewrite Implementation Record

## Metadata

- Date: 2026-07-01
- Agent: `nexo-build`
- Task: `NEXO-0002` — create domain context document
- Source handoff: `HOFF-2026-07-01-purchase-batch-multi-payment.md`
- Source steps: `HOFF-2026-07-01-batch-multi-payment-steps.md`
- ADR: `docs/adr/ADR-2026-07-01-purchase-batch-multi-payment.md`

## Summary

Full rewrite of `prototypes/purchase-capture-demo/` from the v3 1:1
cart-to-batch model to the v4 Batch+Multi-Payment model.

## Domain Model Changes

| Aspect | v3 (obsolete) | v4 (current) |
| --- | --- | --- |
| Entity relationship | 1 cart = 1 batch | 1 batch = N payments (1 store, 1 day) |
| Cart lifecycle | Persistent draft | Ephemeral: disappears after confirmation |
| Home screen | Cart list | Batch list |
| Payment data | On batch directly | On Payment sub-entity |
| Batch schema | cart_id UNIQUE, evidence, paid_total, diff_reason | store_id + date key, no payment data |
| Garment parent | batch_id | payment_id |
| Internal codes | Global per store (GW-001...) | Same, independent of batch/payment |

## Schema v4

- `purchase_batches`: id, store_id, date, currency, created_at (no cart_id, no payment fields)
- `payments` (new): id, batch_id, cart_id UNIQUE, evidence, tax_rate, exchange_rate, expected_total, paid_total, difference_reason_id, difference_note, garment_count, created_at
- `garments`: payment_id replaces batch_id

## Key Implementation Decisions

1. **Batch creation when confirming**: explicit `batchMode` field.
   - `"new"` always creates a new batch
   - `"existing"` with `existingBatchId` adds to the specified batch
   - Default/auto mode finds or creates batch for store+date

2. **Cart deletion on confirm**: after converting items to garments, both `purchase_cart_items` and `purchase_carts` rows are deleted in the same transaction.

3. **Demo seed**: creates temporary carts, confirms them into batches with payments, then carts are deleted. Result: batches appear in the home list, carts are gone.

4. **Consolidated batch totals**: `calculateBatchConsolidatedTotals` aggregates paymentCount, garmentCount, expectedTotal, paidTotal from all payments in a batch.

## Files Created

- `src/components/BatchList.tsx` — home screen showing batches
- `src/components/BatchDetail.tsx` — batch detail with payments + garments
- `src/components/NewCartFlow.tsx` — store selector for new cart
- `src/components/CartCapture.tsx` — item capture (replaces CartDetail)

## Files Modified

- `src/domain/types.ts` — new Payment, PurchaseBatch, PurchaseBatchDetail, Garment, PaymentConfirmationInput types
- `src/domain/validation.ts` — batchMode + existingBatchId validation
- `src/domain/cartTotals.ts` — added calculateBatchConsolidatedTotals
- `src/data/purchaseCartRepository.ts` — schema v4, payments table, batch-aware confirmCartAsBatch, seedDemoBatches, deleteCart, listBatchesForStoreDate
- `src/state/usePurchaseCartStore.ts` — new screens (batch-list, cart-create, cart-capture, batch-detail), batchMode state, eligibleBatches, deleteActiveCart
- `src/components/PaymentConfirmForm.tsx` — batch selector (radio: existing batch or new batch)
- `src/components/AcquiredStockList.tsx` — adapted for PurchaseBatch v4 type
- `src/App.tsx` — batch-centric routing

## Files Removed

- `src/components/CartList.tsx` — replaced by BatchList.tsx
- `src/components/CartDetail.tsx` — replaced by CartCapture.tsx
- `src/components/CartForm.tsx` — replaced by NewCartFlow.tsx
- `src/components/BatchSummary.tsx` — replaced by BatchDetail.tsx

## Test Changes

- `purchaseCartRepository.test.ts`: schema version 3→4, seedDemoCarts→seedDemoBatches, new tests for multi-payment, batchMode, cart deletion, internal code sequencing
- `validation.test.ts`: added batchMode + existingBatchId to all payment tests, new tests for batchMode validation
- `cartTotals.test.ts`: added calculateBatchConsolidatedTotals tests (single, multiple, empty)
- `exchangeRate.test.ts`: unchanged

## Verification

- `npm run test`: 4 files, 41 tests, all passing
- `npm run build`: clean, no errors
- Vite dev server: HTTP 200 at `http://127.0.0.1:5174/`
- Manual browser review: pending (no Chromium/Chrome/Playwright in environment)

## Remaining Gaps

- OQ-001 rounding policy unresolved
- No integration test for confirmCartAsBatch full flow
- Internal code sequence not unit-tested in isolation
- Visual mobile/browser review incomplete
