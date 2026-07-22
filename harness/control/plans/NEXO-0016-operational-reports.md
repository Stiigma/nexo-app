# NEXO-0016 - Operational Reports

## Feature Metadata

- Feature: F10.
- Depends on: `NEXO-0012`, `NEXO-0014`, `NEXO-0015`.
- Primary agent: `nexo-build`.
- Required gates: QA review before closeout.
- Linked stories: US-010.
- Linked SRS requirements: FR-REP-001, FR-REP-002, FR-REP-003, FR-REP-004,
  FR-REP-005.

## Business Objective

Provide core operational reports for purchases, sales, expenses, inventory, cost
sold, profit, and margin.

## Domain Rules

- Reports use stored historical financial values, not recalculated external
  exchange rates.
- Report currency is MXN.
- Inventory reports separate acquired, available, reserved, and sold states.

## Done When

- Admin can filter reports by period.
- Purchase, sale, expense, inventory, and profit views are available.
- Tests and harness records are complete.

## Scope

- Backend: report query services/endpoints.
- Frontend: minimal report views.
- Data: query indexes or views if needed.
- Infrastructure: none expected.

## Out Of Scope

- Formal accounting, fiscal reports, and invoicing.

## Acceptance Criteria

- US-010 acceptance criteria pass.

## Required Tests

- Unit: report aggregation calculations.
- API/integration: period filters and role checks.
- UI/manual workflow: view core reports.

## Steps

1. Expand this plan after F6, F8, and F9 closeout.
2. Implement report slice and records.

## Progress

- 2026-07-06: Created initial dependency plan from master feature split.

## Decision Log

- 2026-07-06: F10 waits for inventory, sales, and real-cost data.

## Risks

- Report expectations may shift once real transactions exist.

## Verification

- Cannot close until report numbers trace back to stored source records.
