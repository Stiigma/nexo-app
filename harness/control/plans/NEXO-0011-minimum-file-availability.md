# NEXO-0011 - Minimum Garment File And Availability

## Feature Metadata

- Feature: F5.
- Depends on: `NEXO-0010`.
- Primary agent: `nexo-build`.
- Required gates: QA review before closeout.
- Linked stories: US-017.
- Linked SRS requirements: FR-INV-003, FR-INV-008, FR-INV-009, FR-CAT-002.

## Business Objective

Let operators complete the minimum garment file required to move acquired stock
into available inventory.

## Domain Rules

- Acquired stock is blocked from reservation and sale until the minimum file is
  complete.
- Required fields include category, brand, size, condition, color, physical
  location, suggested price, purchase cost, and notes where applicable.
- Category review remains visible until a formal category is assigned.

## Done When

- Garment details can be completed and validated.
- Complete garments can transition from `Acquired Stock` to `Available`.
- Incomplete garments remain blocked.
- Tests and harness records are complete.

## Scope

- Backend: garment detail validation and state transition.
- Frontend: garment file completion workflow.
- Data: required garment fields and review flags.
- Infrastructure: none expected.

## Out Of Scope

- Inventory search, reservation, sales, and reports.

## Acceptance Criteria

- US-017 acceptance criteria pass.

## Required Tests

- Unit: minimum-file completeness and transition rules.
- API/integration: update garment detail and availability transition.
- UI/manual workflow: complete file and make available.

## Steps

1. Expand this plan after F4 closeout.
2. Implement minimum-file workflow and tests.

## Progress

- 2026-07-06: Created initial dependency plan from master feature split.

## Decision Log

- 2026-07-06: F5 gates reservations and sales.

## Risks

- Required garment fields may need refinement from real stock examples.

## Verification

- Cannot close until incomplete acquired stock is blocked from reservation and
  sale.
