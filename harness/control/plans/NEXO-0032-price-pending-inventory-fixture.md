# NEXO-0032 - Price-Pending Inventory Fixture From newstorage

## Objective

Create a structured inventory fixture from the current `newstorage/item*` folders, expanding every real physical product into one item record and one canonical photo while keeping all sale pricing pending.

## Done When

- Fixture exists at `../fixtures/inventory/manual-stock-2026-07-08-price-pending/`.
- `manifest.json` has `item_count: 39` and `canonical_photo_count: 39`.
- Items continue the existing sequence from `NX-0018` through `NX-0056`.
- Each item has `status: price_pending`, `pricing.target_price_mxn: null`, and `pricing.minimum_price_mxn: null`.
- Source costs are represented as USD purchase cost where known.
- Missing costs are `null` and marked with `review.needs_cost: true`.
- Original source photos and notes are copied under `_source/` for audit.
- No import is run and no app code is modified.

## Scope

- Create fixture metadata, item records, source audit copies, item photos, and a contact sheet.
- Crop multi-product photos where products are visually separable.
- Document that `price_pending` is intentional and not equivalent to review.

## Out Of Scope

- Changes to `../back` or `../front`.
- Database import or object storage upload.
- Implementing the future `PRICE_PENDING` application enum/status.

## Steps

1. Inspect source `newstorage/item*` notes and photos.
2. Map source folders to physical item records, expanding ranges.
3. Generate fixture directory, manifest, README, item markdown files, source audit copies, and photos.
4. Generate a contact sheet and review all final canonical photos.
5. Validate manifest counts, paths, photo existence, price-pending fields, missing-cost flags, and no zero cost placeholders.
6. Record report and closeout.

## Risks

- Some source notes are empty or incomplete; those items remain in the fixture with missing cost flagged.
- Some multi-product crops are inherently approximate because source photos are grouped.
- Fixture must not be imported until app support for `PRICE_PENDING` exists.

## Verification

- Node validation of manifest counts and every item/photo path.
- Field scan for `status: price_pending`, null target/minimum prices, and no `original_amount: 0`.
- Contact sheet review at `../fixtures/inventory/manual-stock-2026-07-08-price-pending/contact-sheet.jpg`.
- Confirm `../back` and `../front` are not part of the write scope.

## Decision Log

- 2026-07-08: Use `price_pending` as fixture-only status pending future real app enum `PRICE_PENDING`.
- 2026-07-08: Split `item31-32` source cost `12 USD` into `6 USD` per physical item.
- 2026-07-08: Keep missing or unclear source costs as `null`; do not use zero placeholders.
