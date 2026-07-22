# HOFF-2026-07-01-purchase-cart-item-capture

## Metadata

- Task ID: `NEXO-0002`
- Date: 2026-07-01
- Authoring agent: `nexo-plan` with `nexo-design` input
- Receiving agent: `nexo-build`
- Status: ready for scoped Feature 2 implementation

## Objective

Extend `prototypes/purchase-capture-demo/` so a draft `Purchase Cart` can
capture and manage `Purchase Cart Items` before payment.

The slice remains explicitly pre-inventory. Cart items have capture IDs, photo
placeholders, purchase costs, optional formal categories, and category review
state, but they do not have internal codes, purchase batches, acquired-stock
records, QR, sales, reservations, or payment confirmation.

## Context

Feature 1 created the disposable React + SQLite WASM + Zustand purchase cart
shell. The cart detail screen currently stops before garment capture. Feature 2
fills that deliberate gap by adding item capture inside a draft cart while
preserving the inventory-first terminology from `CONTEXT.md`.

The business distinction remains important:

- `Purchase Cart Item` is captured before payment and is not inventory.
- `Capture ID` is a temporary per-cart identity such as `C001`.
- Missing category means the item needs `Category Review`.
- Selecting a formal category clears category review.
- `Internal Code`, `Purchase Batch`, and `Acquired Stock` begin after payment
  confirmation and remain out of scope for this slice.

## Source Docs

- `NEXO_PROJECT.md`
- `CONTEXT.md`
- `docs/design/purchase-capture-demo-brief.md`
- `harness/control/plans/NEXO-0002-domain-context.md`
- `harness/control/handoffs/HOFF-2026-07-01-purchase-capture-demo.md`
- `harness/control/implementations/NEXO-0002-purchase-cart-shell.md`
- `harness/control/reports/2026-07-01/NEXO-0002-purchase-cart-shell-session-009.md`

## Files To Create Or Modify

- `prototypes/purchase-capture-demo/src/domain/types.ts`
- `prototypes/purchase-capture-demo/src/domain/validation.ts`
- `prototypes/purchase-capture-demo/src/domain/validation.test.ts`
- `prototypes/purchase-capture-demo/src/data/purchaseCartRepository.ts`
- `prototypes/purchase-capture-demo/src/data/purchaseCartRepository.test.ts`
- `prototypes/purchase-capture-demo/src/state/usePurchaseCartStore.ts`
- `prototypes/purchase-capture-demo/src/App.tsx`
- `prototypes/purchase-capture-demo/src/components/CartDetail.tsx`
- `prototypes/purchase-capture-demo/src/components/CartItemForm.tsx`
- `prototypes/purchase-capture-demo/src/components/format.ts`
- `prototypes/purchase-capture-demo/README.md`
- Control-plane records under `harness/control/`

## Implementation Steps

1. Add SQLite tables for `categories` and `purchase_cart_items`, plus
   non-destructive schema metadata bump.
2. Seed a compact formal category catalog: Tops, Bottoms, Dresses, Outerwear,
   Shoes, Accessories.
3. Add domain types for categories, cart items, item inputs, item validation,
   cart detail, and derived cart totals.
4. Generate stable per-cart `Capture ID` values from the highest existing
   sequence for that cart; do not edit capture IDs and do not reuse deleted
   IDs.
5. Add repository methods to list categories/items, load cart detail, create
   items, update items, remove items, seed demo items, and reset items with
   carts.
6. Add validation for required main-photo placeholder and purchase cost greater
   than zero, with optional category.
7. Reject invalid category IDs in the repository.
8. Replace the disabled garment section in cart detail with item cards, empty
   state, add action, remove action, and a totals panel.
9. Add dedicated mobile add/edit item screens.
10. Keep totals demo-only and display-only:
    - subtotal = item costs before tax,
    - tax = subtotal x cart tax rate,
    - expected total = subtotal + tax,
    - MXN equivalent = expected total x exchange rate for USD, or same amount
      for MXN.
11. Use two-decimal formatting only and show provisional copy because `OQ-001`
    rounding policy is unresolved.

## Verification

- `npm run test`
- `npm run build`
- Repository coverage for table initialization, category seeding, item
  create/list/update/remove, capture ID sequencing, reset behavior, and demo
  seed items.
- Validation coverage for required photo placeholder, positive purchase cost,
  optional category, and repository rejection of invalid categories.
- Calculation coverage for subtotal, tax, expected total, USD-to-MXN equivalent,
  MXN behavior, and no stored rounding policy.
- Manual mobile review remains required when a Vite server can be approved; if
  blocked, record it as a verification gap.

## Risks

- Users may mistake `Purchase Cart Items` for inventory if the UI does not
  visibly label the pre-payment state.
- Display formatting may imply a durable rounding policy before `OQ-001` is
  resolved.
- Deletion can corrupt totals or capture ID sequencing if not backed by
  repository tests.
- SQLite schema changes must be non-destructive because existing local demo
  carts may already exist from Feature 1.

## Acceptance Criteria

- Cart detail shows `Purchase Cart Items` with capture ID, photo placeholder,
  cost, category or `Category Review`, edit action, and remove action.
- A cart item cannot be saved without a selected photo placeholder and a
  purchase cost greater than zero.
- Category is optional; missing category marks the item for review, and a
  formal category clears review.
- Removing an item deletes it from SQLite and immediately updates item count and
  totals.
- Capture IDs are generated as per-cart sequential values like `C001`, `C002`
  and deleted IDs are not reused.
- Totals use demo math and display provisional two-decimal values.
- No `Internal Code`, `Purchase Batch`, or `Acquired Stock` behavior is added.

## Required Gates

- QA review: required before treating the demo slice as ready for a meeting.
- Security review: not required for this local-only prototype slice.
- User confirmation: required before commit, push, deploy, external services,
  or conversion into durable product architecture.
