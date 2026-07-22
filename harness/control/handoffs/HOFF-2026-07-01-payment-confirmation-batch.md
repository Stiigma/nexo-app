# HOFF-2026-07-01-payment-confirmation-batch

## Metadata

- Task ID: `NEXO-0002`
- Date: 2026-07-01
- Authoring agent: `nexo-plan` with `nexo-design` input
- Receiving agent: `nexo-build`
- Status: ready for scoped Feature 3 implementation

## Objective

Extend `prototypes/purchase-capture-demo/` so a draft `Purchase Cart` with
items can be confirmed as a `Purchase Batch` after payment, converting
`Purchase Cart Items` into `Garments` in `Acquired Stock`.

This is the final slice that completes the inventory-first purchase flow
for the meeting demo. A cart with captured items moves through payment
confirmation, batch creation, internal code assignment, and acquired-stock
review.

## Context

Feature 1 created the purchase cart shell. Feature 2 added pre-payment item
capture with categories, capture IDs, and provisional totals. Feature 3
closes the loop: payment evidence, difference reasons, batch creation,
internal codes, and the resulting acquired-stock inventory.

The domain distinction is critical:

- `Purchase Cart` and `Purchase Cart Item` exist before payment.
- `Purchase Evidence` is required to confirm payment.
- `Paid Total` may differ from `Expected Total`; a `Difference Reason` is
  required when it does.
- Confirmation creates a `Purchase Batch` (one per store/payment).
- Confirmed items become `Garments` in `Acquired Stock` state.
- `Garments` receive stable `Internal Codes` after confirmation.
- `Acquired Stock` cannot be reserved or sold until the `Minimum Garment
  File` is complete.
- `Category Review` carries over from cart item to garment and blocks
  availability.

## Source Docs

- `NEXO_PROJECT.md`
- `CONTEXT.md`
- `docs/spec/SRS.md` (FR-PUR-005, FR-PUR-006, FR-INV-001, FR-INV-004,
  FR-INV-008, FR-INV-009)
- `docs/spec/user-stories.md` (US-004, portions of US-017)
- `docs/design/purchase-capture-demo-brief.md`
- `harness/control/plans/NEXO-0002-domain-context.md`
- `harness/control/handoffs/HOFF-2026-07-01-purchase-capture-demo.md`
- `harness/control/handoffs/HOFF-2026-07-01-purchase-cart-item-capture.md`
- `harness/control/implementations/NEXO-0002-purchase-cart-shell.md`
- `harness/control/implementations/NEXO-0002-purchase-cart-item-capture.md`

## Files To Create Or Modify

- `prototypes/purchase-capture-demo/src/domain/types.ts`
- `prototypes/purchase-capture-demo/src/domain/validation.ts`
- `prototypes/purchase-capture-demo/src/domain/validation.test.ts`
- `prototypes/purchase-capture-demo/src/domain/cartTotals.ts`
- `prototypes/purchase-capture-demo/src/data/purchaseCartRepository.ts`
- `prototypes/purchase-capture-demo/src/data/purchaseCartRepository.test.ts`
- `prototypes/purchase-capture-demo/src/state/usePurchaseCartStore.ts`
- `prototypes/purchase-capture-demo/src/App.tsx`
- `prototypes/purchase-capture-demo/src/components/CartDetail.tsx`
- `prototypes/purchase-capture-demo/src/components/PaymentConfirmForm.tsx`
- `prototypes/purchase-capture-demo/src/components/BatchSummary.tsx`
- `prototypes/purchase-capture-demo/src/components/AcquiredStockList.tsx`
- `prototypes/purchase-capture-demo/src/components/format.ts`
- `prototypes/purchase-capture-demo/README.md`
- Control-plane records under `harness/control/`

## Implementation Steps

1. Add SQLite tables for `purchase_batches`, `garments`, and
   `difference_reasons`, plus non-destructive schema metadata bump to
   version 3.
2. Seed cataloged `Difference Reasons`: Descuento, Redondeo, Impuesto
   adicional, Otro. "Otro" requires a free-text note.
3. Add domain types for batches, garments, inventory states, difference
   reasons, payment confirmation input, and batch detail.
4. Add `Purchase Evidence` placeholder options: Ticket, Factura, Digital.
5. Add validation for payment confirmation: required evidence, paid total
   > 0, difference reason required when paid total ≠ expected total, note
   required when reason is "Otro".
6. Add repository methods: confirm cart as batch, list batches, list
   garments, get batch detail, get garment, list difference reasons, seed
   and reset batch/garment data.
7. Generate deterministic `Internal Codes` per store after confirmation
   using the store's prefix (e.g., `GW-001`, `ROS-001`, `BUR-001`,
   `SAL-001`) and a global garment sequence.
8. Add a Zustand workflow for the confirm payment screen with evidence,
   paid total, difference reason, and difference note draft.
9. Replace the static pre-inventory note in `CartDetail` with a working
   "Confirmar pago" button that only enables when the cart has at least
   one item.
10. Build `PaymentConfirmForm`: evidence selector, expected total display,
    paid total input, difference reason dropdown (shown when totals differ),
    difference note (shown when reason is "Otro").
11. Build `BatchSummary`: batch metadata, store, date, totals comparison,
    difference reason, list of assigned internal codes.
12. Build `AcquiredStockList`: garments with internal codes, photo
    placeholders, costs, categories or category review, inventory state
    badge, and blocked-availability indicators.
13. Add a screen switcher so after confirmation the user sees Batch Summary,
    then can navigate to Acquired Stock.
14. Keep totals demo-only and display-only. No stored rounding policy.
15. Show blocked availability: garments with category review or missing
    minimum file fields cannot be reserved or sold.

## Verification

- `npm run test`
- `npm run build`
- Repository coverage for batch creation, garment conversion, internal code
  assignment, difference reason catalog, reset behavior.
- Validation coverage for required evidence, positive paid total, required
  difference reason on mismatch, required note for "Otro".
- Domain coverage for batch totals comparison and garment state flows.
- Manual mobile review remains required when a Vite server can be approved;
  if blocked, record it as a verification gap.

## Risks

- Users may mistake `Purchase Cart Items` on `Batch Summary` for current
  inventory.
- Internal code generation must be deterministic and testable.
- Batch creation is irreversible in the demo; no unconfirm flow.
- Display formatting may imply a durable rounding policy before `OQ-001`
  is resolved.
- The `Minimum Garment File` check is simplified to category review only
  because brand, size, condition, color, location, and suggested price are
  not captured in the demo.

## Acceptance Criteria

- A cart with items shows "Confirmar pago" button; it is disabled when the
  cart has no items.
- Payment confirmation requires purchase evidence and a paid total greater
  than zero.
- When paid total differs from expected total, a difference reason is
  required. When the reason is "Otro", a note is required.
- Confirmation creates one `Purchase Batch` and converts all cart items into
  `Garments` with deterministic `Internal Codes`.
- Assigned internal codes use store prefix and are stable.
- `Batch Summary` shows the comparison between expected and paid totals
  plus the difference reason.
- `Acquired Stock` shows garments with internal codes, photo placeholders,
  costs, categories or category review, and `Acquired Stock` state.
- Garments with category review show a blocked-availability indicator.
- No reports, sales, reservations, QR, auth, deployment, object storage, or
  real exchange-rate integration is added.

## Required Gates

- QA review: required before treating the demo slice as ready for a meeting.
- Security review: not required for this local-only prototype slice.
- User confirmation: required before commit, push, deploy, external
  services, or conversion into durable product architecture.
