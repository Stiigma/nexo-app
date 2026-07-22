# NEXO-0014 - MXN/USD Sales

## Feature Metadata

- Feature: F8.
- Depends on: `NEXO-0012`, `NEXO-0013`.
- Primary agent: `nexo-build`.
- Required gates: QA review before closeout.
- Linked stories: US-005, US-006.
- Linked SRS requirements: FR-SAL-001, FR-SAL-002, FR-SAL-003, FR-SAL-004,
  FR-SAL-005, FR-SAL-006, DR-001, DR-002.

## Business Objective

Record sales in MXN and USD, mark garments sold, and preserve sale-line profit
data for reports.

## Domain Rules

- A sale has one or more sale lines.
- Each sale line stores its own final sale price.
- USD sales store original amount, exchange rate, and MXN equivalent.
- Completing a sale changes included garments to `Sold`.

## Done When

- Available or reserved garments can be sold.
- MXN and USD sale data is persisted and auditable.
- Profit is calculated from stored total cost and sale-line MXN value.
- Tests and harness records are complete.

## Scope

- Backend: sale and sale-line APIs, state transitions, profit calculation.
- Frontend: minimal sale workflow.
- Data: sale/sale-line schema.
- Infrastructure: none expected.

## Out Of Scope

- Full reporting dashboards and invoice/tax accounting.

## Acceptance Criteria

- US-005 and US-006 acceptance criteria pass.

## Required Tests

- Unit: USD conversion, profit calculation, sale state transitions.
- API/integration: create sale with available/reserved garments.
- UI/manual workflow: complete MXN and USD sale.

## Steps

1. Expand this plan after F6 and F7 closeout.
2. Implement sales slice and records.

## Progress

- 2026-07-06: Created initial dependency plan from master feature split.

## Decision Log

- 2026-07-06: F8 waits for inventory lookup and reservations.

## Risks

- Exchange-rate fallback policy may block USD sale behavior.

## Verification

- Cannot close until sold state and profit data are API-tested.
