# NEXO-0002 Implementation - Purchase Cart Item Capture

## Metadata

- Task ID: `NEXO-0002`
- Date: 2026-07-01
- Agent: `nexo-build`
- Related plan: `harness/control/plans/NEXO-0002-domain-context.md`
- Related handoff:
  `harness/control/handoffs/HOFF-2026-07-01-purchase-cart-item-capture.md`
- Related report:
  `harness/control/reports/2026-07-01/NEXO-0002-purchase-cart-item-capture-session-010.md`

## Summary

Implemented Feature 2 in the disposable purchase-capture prototype. Draft
`Purchase Cart` detail screens now manage pre-payment `Purchase Cart Items`
with generated per-cart `Capture ID` values, required photo placeholders,
required purchase costs, optional formal categories, derived `Category Review`,
real SQLite deletion, and provisional expected cart totals.

The slice remains pre-inventory only. It does not add `Internal Code`,
`Purchase Batch`, `Acquired Stock`, payment confirmation, QR, sales,
reservations, auth, deployment, object storage, or real exchange-rate
integration.

## Files Changed

- `prototypes/purchase-capture-demo/src/domain/types.ts`
  - Added category, item, item input, cart detail, photo placeholder, and totals
    domain types.
- `prototypes/purchase-capture-demo/src/domain/validation.ts`
  - Added item validation and item validation errors.
- `prototypes/purchase-capture-demo/src/domain/cartTotals.ts`
  - Added derived demo subtotal, tax, expected total, and MXN equivalent math.
- `prototypes/purchase-capture-demo/src/data/purchaseCartRepository.ts`
  - Bumped demo schema metadata to version 2.
  - Added categories and purchase cart item tables.
  - Added per-cart `next_capture_sequence` migration.
  - Added category seeding, item CRUD, cart detail loading, demo item seeding,
    and item reset behavior.
- `prototypes/purchase-capture-demo/src/state/usePurchaseCartStore.ts`
  - Added item add/edit/remove workflow state and actions.
- `prototypes/purchase-capture-demo/src/App.tsx`
  - Routed dedicated item add/edit screens.
- `prototypes/purchase-capture-demo/src/components/CartDetail.tsx`
  - Replaced disabled garment placeholder with item list, item cards, empty
    state, add/edit/remove actions, and totals panel.
- `prototypes/purchase-capture-demo/src/components/CartItemForm.tsx`
  - Added mobile item form with photo placeholder selection, cost, and optional
    category.
- `prototypes/purchase-capture-demo/src/components/format.ts`
  - Added two-decimal money display helper.
- `prototypes/purchase-capture-demo/src/data/purchaseCartRepository.test.ts`
- `prototypes/purchase-capture-demo/src/domain/validation.test.ts`
- `prototypes/purchase-capture-demo/src/domain/cartTotals.test.ts`
- `prototypes/purchase-capture-demo/README.md`

## Behavior Changed

- Cart detail now shows item count and a pre-inventory note.
- Empty cart detail offers `Agregar item`.
- Add/edit item screens require a photo placeholder and purchase cost greater
  than zero.
- Category selection is optional; empty category derives `Category Review`.
- Selecting a seeded formal category clears category review.
- Item cards show `Purchase Cart Item`, capture ID, photo placeholder, cost,
  category or category review, edit, and remove.
- Remove deletes the row from SQLite and reloads derived cart totals.
- Demo seed now creates sample items for the Goodwill and Ross carts.
- Reset deletes cart items along with carts while preserving seeded stores and
  categories.

## Verification

- `npm run test` passed: 4 test files, 20 tests.
- `npm run build` passed.
- Escalated Vite server started at `http://127.0.0.1:5174/` after sandboxed
  bind failed with `EPERM` on `127.0.0.1:5173`.
- Escalated `curl -I http://127.0.0.1:5174/` returned HTTP 200.

## Operational Notes

- `Capture ID` generation uses `purchase_carts.next_capture_sequence`, not
  `MAX(capture_sequence)` from remaining items, so deleted capture IDs are not
  reused during normal item creation.
- `Category Review` is derived from `category_id IS NULL`; it is not manually
  editable.
- Totals are derived demo values only. They are displayed with two decimals,
  but no rounding policy is stored while `OQ-001` is unresolved.
- SQLite schema version 2 is a prototype schema only, not the target
  PostgreSQL product schema.
- Manual visual mobile review remains incomplete because this environment has
  no local Chromium/Chrome binary or Playwright package.

## Follow-Up

- Complete a browser/mobile viewport review using the running Vite server or a
  local browser.
- After visual review, decide whether Feature 3 should cover payment
  confirmation and `Purchase Batch` creation or return to resolving the
  remaining SRS open questions first.
