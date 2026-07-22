# NEXO-0002 Report - Batch Multi-Payment Grill Session 013

## Metadata

- Date: 2026-07-01
- Agent: `nexo-plan` with `domain-modeling`
- Task: `NEXO-0002` - create domain context document
- Status: Domain model updated; full-rewrite handoff created for next session.

## What Was Done

- Conducted a `grill-with-docs` session to resolve the post-payment domain model.
- User scenario: after confirming payment, what if the operator returns to the
  same store on the same day? Should multiple carts aggregate into one batch?
- Decisions reached (11 questions, one at a time):

  1. **Batch = 1 payment session** (each cash register transaction is a
     distinct event) — but user reconsidered after Q4.
  2. **Home screen shows batches, not carts** — operator lives in the batch
     world.
  3. **Cart disappears after confirmation** — ephemeral capture tool.
  4. **Multi-payment batch** — a batch can receive additional payments from
     the same store+day.
  5. **Same-day aggregation only** — you can only add to batches from the
     same calendar date.
  6. **Explicit batch selector** — operator chooses "add to existing" or
     "create new batch" at confirmation time.
  7. **Per-payment data independence** — each payment keeps its own tax, FX,
     evidence, and difference reason.
  8. **Batch shows consolidated totals** — sum of payments, total garments.
  9. **Payment as canonical term** — the sub-entity inside a batch.
  10. **Internal codes global per store** — GW-001, GW-002... independent of
      batch or payment grouping.
  11. **Model confirmed** by user: Batch > Payment > Garments.

- Created ADR: `docs/adr/ADR-2026-07-01-purchase-batch-multi-payment.md`
- Updated `CONTEXT.md`: Purchase Batch redefined, Payment term added,
  Purchase Cart marked ephemeral.
- Created handoff:
  `harness/control/handoffs/HOFF-2026-07-01-purchase-batch-multi-payment.md`
- Created implementation steps:
  `harness/control/handoffs/HOFF-2026-07-01-batch-multi-payment-steps.md`
- Updated control plane: `CURRENT.md`, `NEXT.md`, journal.

## New Canonical Domain Model

```
Purchase Batch (1 store, 1 day, N payments)
  └── Payment (1 confirmed cart)
        ├── Own evidence, tax, FX, totals, difference reason
        └── Garments (Internal Codes, Acquired Stock)
```

## Verification

- ADR, CONTEXT.md, and handoffs exist and are internally consistent.
- The handoff contains a complete 8-phase implementation plan for a clean
  `nexo-build` session.

## Recommended Next Step

Start a clean `nexo-build` session. Read the two handoff files under
`harness/control/handoffs/HOFF-2026-07-01-batch-multi-payment*.md` and
execute the full prototype rewrite.
