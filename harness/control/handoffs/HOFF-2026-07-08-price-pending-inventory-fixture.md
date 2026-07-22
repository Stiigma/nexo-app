# HOFF-2026-07-08-price-pending-inventory-fixture

## Objective

Build `NEXO-0032`: a prepared inventory fixture from `newstorage` with 39 physical items and price-pending sale pricing.

## Context

The existing imported fixture ends at `NX-0017`. Current `newstorage/item*` folders contain another batch of product photos and sparse markdown notes. Some folders represent ranges with multiple physical products in a single photo.

## Source Docs

- `plans/NEXO-0032-price-pending-inventory-fixture.md`
- `../newstorage/item*/item.md` and `../newstorage/item*/items.md`
- `../fixtures/inventory/manual-stock-2026-07-06/manifest.json`

## Files To Create Or Modify

- Create `../fixtures/inventory/manual-stock-2026-07-08-price-pending/`.
- Update `tasks.md`, `README.md`, journal, report, and closeout records for `NEXO-0032`.
- Do not modify `../back` or `../front`.

## Implementation Steps

1. Copy source photos and notes into fixture `_source/`.
2. Generate one item directory per physical product.
3. Crop range photos according to the multi-product policy.
4. Write stable manifest and README.
5. Validate counts, paths, status, pricing nulls, and missing cost flags.

## Verification

- Manifest item count and canonical photo count equal 39.
- All manifest paths and photos exist.
- All items have `status: price_pending` and null sale prices.
- Items with unknown cost have `review.needs_cost: true`.
- Contact sheet shows one countable product per canonical photo.

## Risks

- App import must wait for real `PRICE_PENDING` enum/status.
- Some visual crops from source group photos remain approximate.

## Acceptance Criteria

- Fixture is complete and self-documenting.
- No app code or DB import is touched.
- Work is recorded in the control plane.

## Receiving Agent

`nexo-build`
