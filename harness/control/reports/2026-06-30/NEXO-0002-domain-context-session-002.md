# NEXO-0002 Report - Domain Context Session 002

## Metadata

- Date: 2026-06-30
- Agent: Codex
- Task: `NEXO-0002`
- Status: active
- Method: `domain-modeling` with `nexo-spec` routing

## What Was Done

- Updated `CONTEXT.md` with the inventory-first decisions from the prior grill
  session.
- Replaced the old open/closed batch language with `Purchase Cart`, `Purchase
  Cart Item`, and confirmed `Purchase Batch` language.
- Added domain terms for `Inventory State`, `Acquired Stock`, `Listing Status`,
  `Not Listed`, `Draft Listing`, `Ready Listing`, `Published Listing`, and
  `Minimum Garment File`.
- Added purchase confirmation language for `Expected Cart Total`, `Paid Total`,
  `Purchase Evidence`, and `Difference Reason`.
- Added traceability language for `Capture ID`, post-payment `Internal Code`,
  `Main Photo`, and `Physical Location`.
- Updated live control-plane state to point at this report and the next
  unresolved question.

## Files Changed

- `CONTEXT.md`
- `harness/control/README.md`
- `harness/control/tasks.md`
- `harness/control/state/CURRENT.md`
- `harness/control/state/NEXT.md`
- `harness/control/plans/NEXO-0002-domain-context.md`
- `harness/control/journal/2026-06-30.md`
- `harness/control/reports/2026-06-30/NEXO-0002-domain-context-session-002.md`

## Verification Performed

- Read `CONTEXT.md` after the edit and checked that the new terms are present.
- Searched `CONTEXT.md` for old `Open Batch` and `Closed Batch` headings; none
  remain.
- Confirmed `NEXO-0002` remains active in `harness/control/tasks.md`.

## Open Items

- Decide whether quick category in the purchase cart uses the formal category
  catalog or a provisional capture category.
- Cleanly resolve the lifecycle between `Draft Listing`, `Ready Listing`, and
  `Published Listing`.
- Resolve rounding policy, exchange-rate fallback, QR payload, and admin
  correction model.
- Reconcile `docs/spec/SRS.md` open questions after the domain language is
  finalized, including the now-modeled `Sale Line` decision.

## Recommended Next Step

Continue the `NEXO-0002` grill with the quick category decision, then finalize
the remaining domain-language questions before moving to ADRs or schema work.
