# NEXO-0010 - Payment Confirmation And Acquired Inventory

## Feature Metadata

- Feature: F4.
- Depends on: `NEXO-0009`.
- Primary agent: `nexo-build`.
- Required gates: QA review before closeout.
- Linked stories: US-003.
- Linked SRS requirements: FR-PUR-005, FR-PUR-006, FR-INV-001, FR-INV-004,
  FR-INV-005, DR-001, DR-002, DR-004.

## Business Objective

Confirm paid purchase carts into purchase batches and convert remaining cart
items into acquired stock with stable internal codes and total cost data.

## Domain Rules

- Purchase evidence is required to confirm payment.
- Internal codes are assigned only after payment confirmation.
- Paid total mismatches require a difference reason; `Other` requires a note.
- Confirmed garments enter `Acquired Stock`.

## Done When

- Confirmed payment creates a batch and garments.
- Total cost inputs are stored in MXN with original-currency audit fields.
- Garments are traceable to their source batch.
- Tests and harness records are complete.

## Scope

- Backend: confirmation transaction, batch/garment creation, cost fields.
- Frontend: payment confirmation and acquired-stock review.
- Data: batch, payment/evidence, garment, and internal-code persistence.
- Infrastructure: storage boundary for evidence/photo references.

## Out Of Scope

- Minimum garment file completion, reservations, sales, expenses, and reports.

## Acceptance Criteria

- US-003 acceptance criteria pass.

## Required Tests

- Unit: internal code assignment, mismatch reason validation, cost calculations.
- API/integration: confirmation transaction and rollback behavior.
- UI/manual workflow: confirm payment and review acquired stock.

## Steps

1. Expand this plan after F3 closeout.
2. Resolve or explicitly defer rounding/fallback questions touched by cost.
3. Implement confirmation slice and records.

## Progress

- 2026-07-06: Created initial dependency plan from master feature split.

## Decision Log

- 2026-07-06: F4 unlocks inventory, expenses, and availability work.

## Risks

- Cost calculation policy gaps may block closeout.

## Verification

- Cannot close until confirmation is tested as an atomic backend operation.
