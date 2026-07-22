# NEXO-0002 - Domain Context Document

## Objective

Create `CONTEXT.md` as the durable domain reference for Nexo terminology,
business rules, workflows, and implementation vocabulary.

## Done When

- `CONTEXT.md` exists at the repository root.
- It summarizes the domain model from `NEXO_PROJECT.md`.
- It captures key rules for purchases, garments, sales, expenses, reservations,
  currency, tax, exchange rates, and profit.
- It distinguishes confirmed v1 scope from out-of-scope items.
- `harness/control/README.md`, `tasks.md`, and the daily journal are updated.
- A session report is created.

## Scope

- Read and synthesize `NEXO_PROJECT.md`.
- Create a concise domain context document for future agents and implementers.
- Preserve `NEXO_PROJECT.md` as the product source document.

## Out Of Scope

- Creating ADRs.
- Defining database schema.
- Scaffolding backend or frontend projects.
- Changing product scope.

## Steps

1. Read `NEXO_PROJECT.md`.
2. Draft `CONTEXT.md` with domain language and business rules.
3. Update live control-plane state.
4. Write a report and, if complete, a closeout.

## Progress

- 2026-06-30: Activated with `grill-with-docs` and `domain-modeling`.
- 2026-06-30: Created first `CONTEXT.md` glossary from confirmed project and
  SRS language.
- 2026-06-30: Created first grill report summarizing inventory-first domain
  decisions.
- 2026-06-30: Applied the inventory-first purchase cart, purchase evidence,
  inventory state, listing status, and traceability language to `CONTEXT.md`.
- 2026-06-30: Resolved quick category behavior and applied catalog language to
  `CONTEXT.md`.
- 2026-06-30: Reconciled `docs/spec/SRS.md`, `docs/spec/user-stories.md`, and
  `docs/spec/traceability.md` with the inventory-first domain language.
- 2026-07-01: Re-entered the task and identified the first safe demo slice as
  purchase cart capture through purchase batch confirmation and acquired-stock
  review.
- 2026-07-01: Created a draft handoff for the purchase-cart to acquired-stock
  meeting demo.
- 2026-07-01: Accepted React, SQLite WASM, and Zustand as the disposable
  prototype stack, explicitly separate from the final NestJS/PostgreSQL target
  architecture.
- 2026-07-01: Saved the user-provided Nexo logo as `docs/brand/nexo-logo.png`
  and added brand notes for the disposable prototype.
- 2026-07-01: Registered the user's external design harness as a process
  reference and created `docs/design/purchase-capture-demo-brief.md`.
- 2026-07-01: Implemented Feature 1 of the disposable prototype under
  `prototypes/purchase-capture-demo/`: basic purchase cart list/create/detail/
  edit plus SQLite persistence, seed/reset, validation, and demo FX provider.
- 2026-07-01: Created the scoped Feature 2 build handoff for pre-payment
  `Purchase Cart Item` capture in the disposable prototype.
- 2026-07-01: Implemented Feature 2 of the disposable prototype: SQLite-backed
  categories, purchase cart items, per-cart capture IDs, category review,
  item add/edit/remove screens, demo totals, seed/reset behavior, and focused
  tests.
- 2026-07-01: Verified Feature 2 with `npm run test` and `npm run build`;
  Vite served HTTP 200 at `http://127.0.0.1:5174/`, but full visual mobile
  review remains a gap because no local headless browser was available.
- 2026-07-01: Implemented Feature 3 of the disposable prototype: payment
  confirmation creates Purchase Batches, converts items to Garments with
  deterministic Internal Codes, and provides batch summary and acquired-stock
  inventory views. Fixed delete confirmation gap from Feature 2.

## Decision Log

- 2026-06-29: Planned as the next task because `NEXO_PROJECT.md` lists domain
  documentation as the first suggested next step.
- 2026-06-30: Use English technical terms as canonical implementation
  language, with Spanish business synonyms listed under `_Avoid_` where useful.
- 2026-06-30: Keep `CONTEXT.md` as domain language/glossary rather than an
  implementation spec, following `domain-modeling` format.
- 2026-06-30: Prioritize inventory capture for the upcoming USA buying trip
  before detailed sales/profit workflows.
- 2026-06-30: Separate inventory state from listing status.
- 2026-06-30: Treat a purchase batch as one store/payment.
- 2026-06-30: Use a purchase cart before payment; everything remaining in the
  cart at confirmation becomes acquired stock.
- 2026-06-30: Require purchase evidence to confirm payment.
- 2026-06-30: Require a reason when real ticket total differs from expected
  cart total.
- 2026-06-30: Use `Purchase Cart` and `Purchase Cart Item` before payment, and
  reserve `Purchase Batch` for the confirmed store payment.
- 2026-06-30: Use `Capture ID` before payment and `Internal Code` after
  payment confirmation.
- 2026-06-30: Use separate `Inventory State` and `Listing Status` term
  families.
- 2026-06-30: Use the formal `Category` catalog for garment classification,
  allow missing category during fast purchase cart capture, and use `Category
  Review` until a formal category is assigned.
- 2026-06-30: Do not use free-text or provisional categories as catalog
  entries during purchase capture.
- 2026-06-30: Requirements now model purchase carts before payment, confirmed
  purchase batches after payment, acquired stock before availability, sale
  lines for garment-level sale price, and category review before formal
  category assignment.
- 2026-07-01: Do not scaffold product code until the demo slice has a handoff
  and the remaining high-impact business rules are either resolved or explicitly
  deferred from the slice.
- 2026-07-01: Use `prototypes/purchase-capture-demo/` for the disposable demo;
  do not create `front/` unless the user changes direction to a durable
  frontend foundation.
- 2026-07-01: Feature 1 deliberately stops before garment capture, payment
  confirmation, purchase batches, acquired stock, QR, sales, reservations,
  deployment, auth, object storage, and real exchange-rate integration.
- 2026-07-01: Feature 2 remains pre-inventory only: cart items may have
  capture IDs, photo placeholders, costs, optional category, and category
  review, but not internal codes, purchase batches, or acquired-stock records.
- 2026-07-01: Store the next capture sequence on each demo purchase cart so
  generated `Capture ID` values are not reused after item deletion.
- 2026-07-01: Keep Feature 2 totals as derived demo values only; display to two
  decimals but do not store or imply a final rounding policy while `OQ-001`
  remains unresolved.
- 2026-07-01: Feature 3 completes the demo purchase-inventory loop: carts
  confirmed as batches, items converted to garments with internal codes,
  garments visible as Acquired Stock with blocked-availability indicators.
- 2026-07-01: Internal codes use deterministic store prefixes (GW, BUR, ROS,
  SAL) + sequential numbers; they are assigned at confirmation time and are
  stable.
- 2026-07-01: Difference reasons are cataloged (Descuento, Redondeo, Impuesto
  adicional, Otro); "Otro" requires a free-text note.
- 2026-07-01: Batch creation is irreversible in the demo prototype.

## Risks

- Accidentally expanding product scope beyond `NEXO_PROJECT.md`.
- Duplicating too much of the product spec instead of creating an implementer
  reference.

## Verification

- A new agent can read `CONTEXT.md` and explain the core entities, states,
  money rules, and v1 boundaries without reading the chat history.
