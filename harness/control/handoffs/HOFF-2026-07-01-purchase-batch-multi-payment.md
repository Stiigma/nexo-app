# HOFF-2026-07-01-purchase-batch-multi-payment

## Metadata

- Task ID: `NEXO-0002`
- Date: 2026-07-01
- Authoring agent: `nexo-plan` with `nexo-design` input
- Receiving agent: `nexo-build`
- Status: ready for full prototype rewrite to Batch+Payment domain model

## Objective

Rewrite `prototypes/purchase-capture-demo/` from cart-centric (home = carts,
batch = 1:1) to batch-centric (home = batches, batch = 1 store-day with N
payments). The `Purchase Cart` becomes an ephemeral capture tool that
disappears after confirmation.

## Domain Decisions (from grill session 2026-07-01)

1. **Purchase Batch** = 1 store, 1 day, N payments. Home screen shows batches.
2. **Payment** = 1 confirmed cart, with own evidence, tax, FX, totals, diff reason.
3. **Purchase Cart** = ephemeral. Confirmation consumes it into a payment; cart vanishes.
4. **Multi-payment**: confirming a cart offers "add to existing batch (store+day)" or "new batch".
5. **Per-payment data**: each payment keeps its own tax/FX/evidence. Batch shows consolidated totals.
6. **Internal codes**: global per store (GW-001, GW-002...), independent of batch/payment.

See `docs/adr/ADR-2026-07-01-purchase-batch-multi-payment.md` for full rationale.

## Entity Hierarchy

```
Purchase Batch (1 store, 1 day, N payments)
  └── Payment (1 confirmed cart)
        ├── evidence, taxRate, exchangeRate
        ├── expectedTotal, paidTotal, differenceReason, differenceNote
        └── Garments (Internal Code per store, Acquired Stock)
```

## Screen Flow

```
HOME: Batch List
  → [Nuevo carrito] → Select Store → Capture Items → Confirm Payment
       → Batch selector: "Add to Goodwill (today)" or "New batch"
       → Batch Detail (shows consolidated payments + garments)

  → [Click batch] → Batch Detail
       → Payments list with per-payment totals
       → Consolidated batch totals
       → [Ver Acquired Stock] → AcquiredStockList
```

## Files To Create Or Modify

### Rewrite (full replacement)
- `src/domain/types.ts` — new types: PurchaseBatch, Payment, PaymentInput, etc.
- `src/domain/validation.ts` — payment validation (reuse from v3, adapt)
- `src/domain/validation.test.ts` — cart, item, payment validation tests
- `src/domain/cartTotals.ts` — per-cart and batch-consolidated totals
- `src/data/purchaseCartRepository.ts` — schema v4 with payments table
- `src/data/purchaseCartRepository.test.ts` — repository tests
- `src/state/usePurchaseCartStore.ts` — new screens and actions
- `src/App.tsx` — routing for batch-centric flow
- `src/main.tsx` — entry (keep)
- `src/styles.css` — keep

### New components
- `src/components/BatchList.tsx` — replaces CartList as home screen
- `src/components/BatchDetail.tsx` — shows payments + consolidated totals + garments
- `src/components/NewCartFlow.tsx` — store selection + cart creation
- `src/components/CartCapture.tsx` — item capture (replaces CartDetail)
- `src/components/CartItemForm.tsx` — adapt from v3
- `src/components/PaymentConfirmForm.tsx` — adapt from v3, add batch selector
- `src/components/AcquiredStockList.tsx` — adapt from v3
- `src/components/format.ts` — keep
- `src/components/ui.tsx` — keep

### Remove or repurpose
- `CartList.tsx` → replaced by `BatchList.tsx`
- `CartDetail.tsx` → replaced by `CartCapture.tsx`
- `CartForm.tsx` → simplified into `NewCartFlow.tsx`
- `BatchSummary.tsx` → merged into `BatchDetail.tsx`

### Control plane
- New report under `harness/control/reports/`
- Updated `harness/control/implementations/`
- Updated `harness/control/state/CURRENT.md`, `NEXT.md`
