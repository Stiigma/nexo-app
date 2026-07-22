# NEXO-0013 - Customers And Reservations

## Feature Metadata

- Feature: F7.
- Depends on: `NEXO-0011`.
- Primary agent: `nexo-build`.
- Required gates: QA review before closeout.
- Linked stories: US-004, US-014, US-016.
- Linked SRS requirements: FR-RES-001, FR-RES-002, FR-RES-003, FR-RES-004,
  FR-CUS-001, FR-CUS-002, FR-CUS-003.

## Business Objective

Allow operators to create customers and reserve available garments before sale.

## Domain Rules

- Reservation changes an available garment to `Reserved`.
- Releasing a reservation returns the garment to `Available`.
- A reserved garment can be sold by the sales feature.
- Customer name is required; contact fields are optional.

## Done When

- Customers can be created and viewed.
- Available garments can be reserved and released.
- Reservation history is visible enough for later sales.
- Tests and harness records are complete.

## Scope

- Backend: customer and reservation APIs.
- Frontend: customer creation and reservation workflow.
- Data: customer/reservation schema and state transitions.
- Infrastructure: none expected.

## Out Of Scope

- Sales completion and duplicate customer resolution.

## Acceptance Criteria

- US-004, US-014, and US-016 acceptance criteria pass.

## Required Tests

- Unit: reservation state transitions.
- API/integration: reserve/release flows.
- UI/manual workflow: create customer and reserve garment.

## Steps

1. Expand this plan after F5 closeout.
2. Implement customer/reservation slice and records.

## Progress

- 2026-07-06: Created initial dependency plan from master feature split.

## Decision Log

- 2026-07-06: F7 can run after F5 and does not need F6 unless search behavior
  is pulled into the reservation UI.

## Risks

- Duplicate customer handling remains an SRS open question.

## Verification

- Cannot close until state transitions are tested and API-enforced.
