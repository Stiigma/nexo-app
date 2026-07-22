# Nexo Purchase Cart Demo

Disposable local prototype for `NEXO-0002`.

This app demonstrates draft purchase-cart capture before payment:

- create purchase carts,
- list carts,
- view cart details,
- edit basic cart fields,
- add, edit, list, and remove `Purchase Cart Items`,
- generate per-cart `Capture ID` values,
- select photo placeholders and optional formal categories,
- show `Category Review` when category is missing,
- show provisional expected cart totals,
- confirm payment with purchase evidence, paid total, and difference reasons,
- create purchase batches and assign deterministic internal codes,
- review acquired-stock inventory with blocked-availability indicators,
- reset or seed demo data.

It intentionally stops before payment confirmation, purchase batches, acquired
stock, internal codes, QR, sales, reservations, auth, object storage,
deployment, and real exchange-rate integration.

## Run

```bash
npm install
npm run dev
```

## Verify

```bash
npm run test
npm run build
```

The SQLite database is stored locally in the browser through SQLite WASM
prototype persistence. Use the in-app reset action to clear demo carts and
items while keeping seeded stores and categories available.

Totals are demo-only display values with two decimal formatting. They do not
set the final rounding policy while `OQ-001` remains unresolved.
