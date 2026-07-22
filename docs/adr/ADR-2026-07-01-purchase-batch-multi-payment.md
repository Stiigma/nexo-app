# ADR-2026-07-01-purchase-batch-multi-payment

**Status:** Accepted.

## Context

The initial prototype modeled a `Purchase Batch` as a 1:1 result of confirming a
single `Purchase Cart`. The operator workflow was cart-centric: open the app, see
carts, enter a cart, add items, confirm payment, see a batch summary.

During a domain grill session on 2026-07-01, the operational reality surfaced:
an operator may visit the same store multiple times in a single day, paying
separately each time. The operator wanted those separate payments grouped under
one batch per store per day, and wanted batches—not carts—to be the primary
entity they work with.

## Decision

A `Purchase Batch` is a store-day aggregate that contains one or more
`Payments`. Each `Payment` represents a single confirmed cart payment with its
own evidence, tax rate, exchange rate, paid total, and difference reason. The
`Purchase Cart` is a temporary capture tool that disappears after confirmation.

The canonical entity hierarchy is:

```
Buying Trip (future)
  └── Purchase Batch (1 store, 1 day)
        └── Payment (1 confirmed cart, with own evidence/tax/FX/difference)
              └── Garments (assigned Internal Codes)
```

Key rules:

- **Batch visibility**: The operator's home screen shows batches, not carts.
- **Batch creation**: A batch is created implicitly when the first cart of a
  store+day is confirmed, or explicitly when the operator chooses "new batch" at
  confirmation time.
- **Multi-payment aggregation**: When confirming a cart, if a batch already
  exists for that store+day, the operator can add the payment to the existing
  batch or create a new one.
- **Per-payment data**: Each payment retains its own tax rate, exchange rate,
  evidence, expected total, paid total, and difference reason. The batch
  displays consolidated totals (sum, count) but does not enforce homogeneity
  across payments.
- **Cart lifecycle**: A cart is ephemeral. It exists only during item capture.
  Confirmation consumes it into a payment within a batch, and the cart is
  removed from all active views.
- **Internal codes**: Assigned globally per store (e.g., `GW-001`, `GW-002`),
  independent of batch or payment grouping. Codes are sequential, stable, and
  never reused.

## Alternatives Considered

- **1:1 cart-to-batch (current prototype)**: Simpler to implement, but forces
  the operator to manage many small batches for the same store-day. Rejected
  because it doesn't match the operator's mental model.
- **Batch with enforced homogeneity**: All payments in a batch must share the
  same tax rate and exchange rate. Rejected because real-world same-store
  payments on the same day can have different tax rates and the batch should
  accommodate that.
- **Batch as a Buying Trip container**: A batch spans multiple stores. Rejected
  because `Buying Trip` is already the correct term for that grouping; `Purchase
  Batch` stays scoped to one store.

## Consequences

- The prototype must be rewritten: the current 1:1 cart-to-batch model does not
  support multi-payment batches, batch-centric home screen, or ephemeral carts.
- The schema gains a `payments` table between `purchase_batches` and `garments`.
- The `purchase_carts` table remains but carts become an implementation detail
  of the capture flow, not a persistent entity visible in the main list.
- The batch home screen must compute consolidated totals from its payments.
- Internal code generation must remain global per store, not per batch or
  payment.
