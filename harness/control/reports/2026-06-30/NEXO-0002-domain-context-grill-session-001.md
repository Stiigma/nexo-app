# NEXO-0002 Report - Domain Context Grill Session 001

## Metadata

- Date: 2026-06-30
- Agent: Codex
- Task: `NEXO-0002`
- Status: active, grill in progress
- Method: `grill-with-docs` using `domain-modeling`

## Purpose

Record the domain decisions made during the first `NEXO-0002` grill session.
The conversation started with sales modeling, then was intentionally redirected
to prioritize inventory and USA purchase capture because Nexo will soon buy
merchandise in the United States.

## High-Level Direction

- Immediate product priority is inventory control for the upcoming USA buying
  trip.
- Sales and profit remain part of the model, but they are not the immediate
  build priority.
- The first operational slice should help users capture merchandise in-store,
  confirm what was actually purchased, and move it into Nexo stock with strong
  traceability.
- Marketplace/publication readiness is important, but it should be separated
  from physical inventory ownership and stock control.

## Decisions Made

### Sales Model

- Decision: use `Sale + Sale Line`.
- A `Sale` is the transaction header.
- A `Sale Line` represents one garment inside the sale and assigns that garment
  its own final sale price.
- Reason: this keeps garment-level profit deterministic when a sale contains
  multiple garments.
- Priority note: the model is accepted, but detailed sales/profit work should
  wait until the inventory capture flow is stable.

### Inventory And Listing Separation

- Decision: separate physical inventory state from commercial/listing status.
- Inventory state answers whether the garment physically belongs to Nexo and
  what can happen to it operationally.
- Listing status answers whether the garment has enough commercial data to be
  prepared, reviewed, or published.

Working model:

```text
Inventory State:
- Purchase Cart Item
- Acquired Stock
- Available
- Reserved
- Sold

Listing Status:
- Not Listed
- Draft
- Ready
- Published
```

### USA Purchase Capture Priority

- Decision: prioritize `Inventory-Ready`, not full `Marketplace-Ready`, for
  the immediate USA purchase flow.
- Reason: the urgent need is to register and control merchandise quickly while
  buying, then complete commercial details later.

### Purchase Cart

- Decision: before payment, captured garments live in a manual virtual cart on
  the phone.
- The cart represents items being considered while still inside the store.
- Items in this cart are not yet formal Nexo inventory because they have not
  been paid for.
- This concept should be documented as a domain term, likely `Purchase Cart`.

### Purchase Batch Boundary

- Decision: a purchase batch is defined by store/payment.
- One USA trip can contain multiple purchase batches.
- A batch maps to one real store payment or ticket.
- Reason: this keeps tax, receipt evidence, totals, and cost traceability clean
  per actual purchase event.

### Cart Confirmation And Stock Entry

- Decision: everything remaining in the purchase cart at payment confirmation
  becomes `Acquired Stock`.
- The operator must remove any item that was not purchased before confirming.
- A confirmation message must warn that every item in the cart will enter Nexo
  stock.

Recommended confirmation copy:

```text
Todo lo que esta en este carrito se marcara como mercancia comprada por Nexo y
entrara al stock.

Antes de continuar, elimina cualquier prenda que no se haya comprado.
```

### Capture ID And Internal Code

- Decision: use a temporary `Capture ID` before payment.
- Decision: generate the definitive `Internal Code` only after payment.
- Reason: if an item is captured but not bought, it should not consume an
  official Nexo code.
- Decision: `Internal Code` should be a simple global consecutive value, for
  example `NX-000001`.
- Reason: a global code stays stable even if store, batch, date, or other
  metadata is corrected later.

### Required Photo Timing

- Decision: the main photo is mandatory from the purchase cart stage.
- Reason: before a definitive code and QR exist, the photo is the safest
  practical identifier while shopping.

### Purchase Evidence

- Decision: confirming payment requires purchase evidence.
- Recommended domain term: `Purchase Evidence`.
- Required fields discussed:
  - paid total
  - tax total or confirmed tax rate
  - payment method
  - exchange rate applied
  - purchase date/time
- Optional but recommended fields:
  - receipt photo
  - receipt number
  - notes
- Reason: this anchors the batch to the real ticket/payment and improves
  traceability.

### Ticket Difference Policy

- Decision: if the real ticket total does not match the expected cart total,
  Nexo should allow confirmation only with a required reason.
- Decision: use a required `Difference Reason`, not only free text.
- Suggested reasons:
  - rounding
  - store discount
  - extra charge
  - missing item correction
  - price correction
  - tax correction
  - other
- If reason is `other`, a note should be required.

### Acquired Stock And Selling Lock

- Decision: once paid, a garment becomes Nexo stock, but it remains blocked for
  reservation/sale until its minimum commercial file is complete.
- This state was described as `Acquired Stock`.
- Reason: Nexo needs stock control immediately, but should not sell or reserve
  incomplete garment records.

### Draft Requirements

- Decision: `Listing Status: Draft` requires a suggested price.
- Decision: the minimum data to reach `Draft` is:
  - main photo
  - category
  - brand
  - size
  - condition
  - color
  - physical location
  - suggested price
- Decision: when a garment reaches `Draft` with the minimum data complete, it
  can become `Available` for internal reservation/sale.
- Publication remains separate and can wait for `Ready` or `Published`.

### Physical Location

- Decision: physical location is required for the minimum garment file.
- Decision: for v1, physical location is free text.
- Reason: this is faster than creating a structured location catalog before the
  buying trip.
- Suggested convention:

```text
caja-01
caja-02
rack-a
bolsa-roja-01
perchero-front
```

## Open Decisions

- Whether the quick category captured in the purchase cart uses the formal
  category catalog or a simpler provisional category.
- Exact names for final inventory states need to be cleaned up in `CONTEXT.md`
  so `Acquired Stock`, `Available`, `Reserved`, and `Sold` are consistent.
- Exact lifecycle between `Listing Status: Draft`, `Ready`, and `Published`
  needs one more pass.
- Whether `Purchase Cart` and `Purchase Batch` should be separate domain terms
  or if batch should begin as the cart and become confirmed after payment.
- Rounding policy remains unresolved.
- Exchange-rate fallback remains unresolved.
- QR payload remains unresolved.
- Admin correction model remains unresolved.

## Files Changed Before This Report

- `CONTEXT.md`
- `harness/control/README.md`
- `harness/control/tasks.md`
- `harness/control/state/CURRENT.md`
- `harness/control/state/NEXT.md`
- `harness/control/plans/NEXO-0002-domain-context.md`
- `harness/control/journal/2026-06-30.md`

## Verification Performed

- Confirmed `NEXO-0002` is active in `harness/control/tasks.md`.
- Confirmed `CONTEXT.md` exists.
- Confirmed the current `CONTEXT.md` already includes `Sale Line`.
- Confirmed the remaining grill decisions are not fully reflected in
  `CONTEXT.md` yet and should be applied in the next work block.

## Recommended Next Step

Update `CONTEXT.md` with the inventory-first language from this report, then
continue the grill with the next question: whether quick category in the
purchase cart should use the formal category catalog or a provisional capture
category.
