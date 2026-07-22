# Manual Stock Fixture - 2026-07-08 Price Pending

This fixture was generated from the current `newstorage/item*` folders. It expands multi-product source folders into one physical item per product and continues the existing inventory sequence after `NX-0017`.

## Counts

- Fixture ID: `manual-stock-2026-07-08-price-pending`
- Items: 39 (`NX-0018` through `NX-0056`)
- Canonical photos: 39 (one `photos/main.jpeg` per item)
- Source photos copied for audit: 25 source groups under `_source/`
- Items with missing cost: 10

## Import Warning

Do not import this fixture yet. Every item is intentionally marked with `status: price_pending`, but the application still needs a real `PRICE_PENDING` enum/status before this data can be loaded safely.

`price_pending` does not mean the item needs review. It means the physical item is identified and photo-ready, while sale pricing is still pending. Future expected transition: `PRICE_PENDING -> AVAILABLE` after sale price capture.

Recommended future UI treatment: `border-amber-200 bg-amber-50 text-amber-700`.

## Pricing and Cost Rules

- `pricing.target_price_mxn`: always `null`.
- `pricing.minimum_price_mxn`: always `null`.
- Source note `costo` values were mapped to `cost.original_currency: USD` and `cost.original_amount`.
- Missing or unclear costs are `null` with `review.needs_cost: true`; no zero placeholders were used.
- `item31-32` source cost was `12 USD` for the Nike set, split as `6 USD` per physical item.

## Multi-Product Photo Handling

- `item10-15`: 6 cropped items from a 2x3 grid.
- `item16-20`: 5 visual crops by garment/accessory; all costs remain pending.
- `item23-24`: Lakers yellow caps cropped left/right.
- `item27-28`: The North Face caps cropped left/right.
- `item31-32`: Nike set split into hoodie and pants crops.
- `item38-39`: Lakers black caps cropped left/right.

No synthetic photos or invented visuals were generated. Photos are copied or cropped from the original `newstorage` source photos only.
