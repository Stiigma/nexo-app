# NEXO-0002 Implementation - Payment Confirmation & Purchase Batch

## Metadata

- Task ID: `NEXO-0002`
- Date: 2026-07-01
- Agent: `nexo-build`
- Related plan: `harness/control/plans/NEXO-0002-domain-context.md`
- Related handoff:
  `harness/control/handoffs/HOFF-2026-07-01-payment-confirmation-batch.md`
- Related handoffs:
  `harness/control/handoffs/HOFF-2026-07-01-purchase-capture-demo.md`
  `harness/control/handoffs/HOFF-2026-07-01-purchase-cart-item-capture.md`
- Related report:
  `harness/control/reports/2026-07-01/NEXO-0002-payment-confirmation-batch-session-012.md`

## Summary

Implemented Feature 3 in the disposable purchase-capture prototype. Draft
`Purchase Cart` detail now shows a working "Confirmar pago" button that opens
a payment confirmation screen with purchase evidence selection, paid total
input, difference reason catalog, and optional note. Confirmation creates a
`Purchase Batch`, converts cart items into `Garments` in `Acquired Stock`
state, and assigns deterministic `Internal Codes` per store prefix.

The demo flow is now complete: cart creation → item capture → payment
confirmation → batch summary → acquired stock inventory.

Also fixed a pre-existing issue where deleting a cart item had no confirmation
dialog.

## Files Changed

### New files
- `src/components/PaymentConfirmForm.tsx` — payment evidence grid, paid total,
  conditional difference reason selector, note field
- `src/components/BatchSummary.tsx` — batch metadata, totals comparison,
  garment list with internal codes and blocked indicators
- `src/components/AcquiredStockList.tsx` — full inventory view with batch
  summary buttons, garment cards, blocked-availability indicators
- `harness/control/handoffs/HOFF-2026-07-01-payment-confirmation-batch.md`

### Modified files
- `src/domain/types.ts` — added Garment, PurchaseBatch, PurchaseBatchDetail,
  DifferenceReason, InventoryState, PurchaseEvidence, PaymentConfirmationInput
  and NormalizedPaymentConfirmationInput types
- `src/domain/validation.ts` — added payment confirmation validation with
  evidence, paid total, difference reason, and note rules
- `src/domain/validation.test.ts` — added 7 payment validation tests (total
  17 validation tests)
- `src/data/purchaseCartRepository.ts` — bumped schema to v3; added
  purchase_batches, garments, and difference_reasons tables; seeded
  difference reasons (Descuento, Redondeo, Impuesto adicional, Otro); added
  store prefix map (GW, BUR, ROS, SAL); added confirmCartAsBatch,
  listBatches, getBatch, getBatchDetail, listGarments, listBatchGarments,
  listDifferenceReasons methods; extended resetDemoData to clear batches
  and garments
- `src/data/purchaseCartRepository.test.ts` — updated schema version assertion
  to v3
- `src/state/usePurchaseCartStore.ts` — added confirm-payment, batch-summary,
  acquired-stock screens; added payment confirmation draft and validation;
  added batches/garments/differenceReasons state; added startConfirmPayment,
  updatePaymentDraft, confirmCartAsBatch, viewBatch, viewAcquiredStock actions
- `src/components/CartDetail.tsx` — replaced static pre-inventory note with
  working "Confirmar pago" button; added delete confirmation dialog via
  window.confirm()
- `src/App.tsx` — added routing for PaymentConfirmForm, BatchSummary,
  AcquiredStockList; reordered conditional chain so specific screens match
  before the generic detail fallback

## Behavior Changed

- Cart detail now shows "Confirmar pago" button (disabled when cart has no
  items)
- Payment confirmation requires purchase evidence (Ticket/Factura/Digital)
  and paid total > 0
- When paid total differs from expected total, a difference reason dropdown
  appears
- "Otro" reason requires a free-text note
- Confirmation creates one Purchase Batch and converts all items to Garments
  with Internal Codes (e.g., GW-001, GW-002)
- Garments start in "acquired_stock" state
- Batch Summary shows totals comparison, difference reason, and assigned  
  internal codes
- Acquired Stock view shows all garments with blocked-availability indicators
  for items with Category Review
- Delete item now shows confirmation dialog ("¿Eliminar C001?")

## Verification

- `npm run test` passed: 4 test files, 27 tests (including 7 new payment
  validation tests)
- `npm run build` passed
- Vite server at `http://127.0.0.1:5174/` returns HTTP 200

### Verification gaps

- Manual mobile viewport review remains incomplete (no browser in environment)
- No tests for the `confirmCartAsBatch` repository method (the test
  infrastructure uses an in-memory database that would need the new tables
  seeded)
- Internal code generation logic relies on LIKE pattern matching for store
  prefix; may need refinement for edge cases with many garments

## Operational Notes

- Batch creation is irreversible in the demo; there is no unconfirm flow
- Internal codes use store prefixes: GW (Goodwill), BUR (Burlington),
  ROS (Ross), SAL (Salvation Army)
- Garments retain Category Review from their source cart items
- The Minimum Garment File check is simplified to category review only
- Totals remain demo-only with two-decimal formatting; OQ-001 unresolved
- Schema v3 is a prototype schema only
- Difference reasons are seeded and survive reset

## Follow-Up

- Complete browser/mobile viewport review
- Decide whether to resolve SRS open questions next or move to product
  architecture (PostgreSQL schema, NestJS scaffold, React PWA scaffold)
- Add integration tests for the confirmCartAsBatch flow
