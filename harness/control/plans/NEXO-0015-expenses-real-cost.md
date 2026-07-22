# NEXO-0015 - Expenses And Real Cost

## Feature Metadata

- Feature: F9.
- Depends on: `NEXO-0010`.
- Primary agent: `nexo-build`.
- Required gates: QA review before closeout.
- Linked stories: US-007, US-008.
- Linked SRS requirements: FR-EXP-001, FR-EXP-002, FR-EXP-003, FR-EXP-004,
  FR-INV-005.

## Business Objective

Record general and batch-linked expenses, then allocate batch expenses into
garment total cost for realistic profit reporting.

## Domain Rules

- General expenses affect reports but do not alter garment cost.
- Batch-linked expenses are allocated into garment cost.
- Allocation totals must match source expense amounts subject to rounding
  policy.

## Done When

- General and batch-linked expenses can be recorded.
- Batch expenses are allocated to garments.
- Total cost uses allocated expense values.
- Tests and harness records are complete.

## Scope

- Backend: expense APIs and allocation logic.
- Frontend: minimal expense capture/review workflow.
- Data: expenses and allocation records.
- Infrastructure: none expected.

## Out Of Scope

- Full operational reports and accounting/tax workflows.

## Acceptance Criteria

- US-007 and US-008 acceptance criteria pass.

## Required Tests

- Unit: proportional allocation and rounding behavior.
- API/integration: create general expense and batch expense.
- UI/manual workflow: record batch expense and see allocation.

## Steps

1. Expand this plan after F4 closeout.
2. Resolve rounding policy before closeout.
3. Implement expenses slice and records.

## Progress

- 2026-07-06: Created initial dependency plan from master feature split.

## Decision Log

- 2026-07-06: F9 can run after F4 because it depends on purchase batches and
  garments, not availability.

## Risks

- Rounding policy remains open and directly affects allocation acceptance.

## Verification

- Cannot close until allocation totals are deterministic and tested.
