# NEXO-0002 Implementation - Purchase Cart Prototype Shell

## Metadata

- Task ID: `NEXO-0002`
- Date: 2026-07-01
- Agent: `nexo-build`
- Related plan: `harness/control/plans/NEXO-0002-domain-context.md`
- Related handoff: `harness/control/handoffs/HOFF-2026-07-01-purchase-capture-demo.md`
- Related report:
  `harness/control/reports/2026-07-01/NEXO-0002-purchase-cart-shell-session-009.md`

## Summary

Created the first disposable React prototype shell under
`prototypes/purchase-capture-demo/`. The feature covers `Purchase Cart`
records only: list, create, detail, edit, seed, and reset. It intentionally
stops before garment capture, payment confirmation, purchase batches, acquired
stock, QR, sales, reservations, auth, deployment, object storage, and real
exchange-rate integration.

## Files Changed

- `prototypes/purchase-capture-demo/`
  - Vite + React + TypeScript app.
  - Tailwind via `@tailwindcss/vite`.
  - Zustand workflow state.
  - SQLite WASM browser database adapter.
  - SQL repository/data-access layer.
  - Validation and demo exchange-rate provider.
  - Mobile-first Spanish operational UI.
  - Vitest coverage for repository behavior, seed/reset, validation, and FX.
  - Prototype README and local `.gitignore`.
- `prototypes/purchase-capture-demo/public/nexo-logo.png`
  - Copy of `docs/brand/nexo-logo.png` for the prototype header.

## Behavior Changed

- App starts at the cart list.
- Empty state offers `Crear carrito`.
- Create form defaults to USA purchase behavior: seeded store, current date,
  USD, store tax, and editable demo USD/MXN exchange rate.
- Creating a cart saves to SQLite and opens detail.
- Detail shows store, date, currency, tax, exchange rate, status, and a disabled
  future CTA for garment capture.
- Edit flow updates basic cart fields in SQLite and returns to detail.
- Reset clears demo carts while preserving seeded stores.
- Seed creates two sample draft carts for meeting demos.

## Verification

- `npm run test` passed.
- `npm run build` passed.
- `npm install` completed with explicit network approval and found
  0 vulnerabilities.
- Local dev server startup without escalation failed with sandbox `EPERM` when
  binding `127.0.0.1:5173`; escalation was requested but then interrupted by
  the user. No Vite server remained running.

## Operational Notes

- The prototype is disposable and local. Do not treat its SQLite schema as the
  final PostgreSQL schema.
- React components do not contain inline SQL; SQL is isolated in
  `PurchaseCartRepository`.
- Exchange rate is a local simulated value only and is labeled as editable demo
  data, not official data.
- `node_modules/`, `dist/`, and `*.tsbuildinfo` are ignored inside the
  prototype folder.

## Follow-Up

- Plan Feature 2 before implementation. Recommended next slice: add
  `Purchase Cart Item` capture to the prototype with capture ID, cost, photo
  placeholder, optional category, category review state, item list, item edit,
  item remove, and expected cart total.
- Re-run the mobile checklist manually once a browser review session is allowed
  to start the Vite server.
