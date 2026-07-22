# NEXO-0002 Report - Requirements Reconciliation Session 004

## Metadata

- Date: 2026-06-30
- Agent: Codex
- Task: `NEXO-0002`
- Status: active
- Route: `nexo-spec`

## What Was Done

- Reconciled `docs/spec/SRS.md` with the current `CONTEXT.md`.
- Updated requirements from the old open/closed batch model to the
  inventory-first `Purchase Cart` and confirmed `Purchase Batch` model.
- Updated inventory requirements from `disponible` / `apartada` / `vendida` to
  `Acquired Stock`, `Available`, `Reserved`, and `Sold`.
- Added P0 requirements for purchase payment confirmation, required difference
  reason, acquired-stock blocking, and category review.
- Updated sales requirements to use one `Sale Line` per garment so
  garment-level profit is deterministic.
- Updated user stories for purchase cart capture, purchase batch confirmation,
  and completing the minimum garment file.
- Updated traceability so new requirements and `US-017` are linked.

## Files Changed

- `docs/spec/SRS.md`
- `docs/spec/user-stories.md`
- `docs/spec/traceability.md`
- `harness/control/README.md`
- `harness/control/tasks.md`
- `harness/control/state/CURRENT.md`
- `harness/control/state/NEXT.md`
- `harness/control/plans/NEXO-0002-domain-context.md`
- `harness/control/journal/2026-06-30.md`
- `harness/control/reports/2026-06-30/NEXO-0002-requirements-reconciliation-session-004.md`

## Verification Performed

- Searched `docs/spec/` for obsolete open/closed batch terms and old Spanish
  inventory states; no active requirement/story usage remains.
- Confirmed `OQ-002` is no longer listed because `Sale Line` resolves
  garment-level sale price splitting.
- Confirmed new requirements `FR-PUR-006`, `FR-INV-008`, and `FR-INV-009` are
  linked in `docs/spec/traceability.md`.
- Confirmed new story `US-017` is linked to its requirements.

## Open Items

- Resolve rounding policy.
- Resolve exchange-rate fallback.
- Resolve admin correction model.
- Resolve duplicate customer handling.
- Resolve QR payload.
- Resolve exact listing lifecycle between `Draft Listing`, `Ready Listing`,
  and `Published Listing`.

## Recommended Next Step

Resolve the remaining SRS open questions, then finalize `CONTEXT.md` and create
the first ADRs before schema work.
