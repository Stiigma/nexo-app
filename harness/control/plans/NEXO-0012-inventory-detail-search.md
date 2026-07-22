# NEXO-0012 - Inventory Detail And Search

## Feature Metadata

- Feature: F6.
- Depends on: `NEXO-0011`.
- Primary agent: `nexo-build`.
- Required gates: QA review before closeout.
- Linked stories: US-009, US-015.
- Linked SRS requirements: FR-INV-004, FR-INV-006, FR-INV-007, FR-REP-004.

## Business Objective

Provide usable inventory lookup by state and key fields so operators and admins
can find garments and review traceability.

## Domain Rules

- Inventory state is distinct from listing status.
- Detail views must preserve purchase and sale traceability when present.
- Search includes code, category, brand, size, and customer.

## Done When

- Inventory list filters by `Acquired Stock`, `Available`, `Reserved`, and
  `Sold`.
- Search and detail views expose traceability.
- Tests and harness records are complete.

## Scope

- Backend: inventory query endpoints.
- Frontend: inventory list, filters, search, detail.
- Data: indexes or query support where needed.
- Infrastructure: none expected.

## Out Of Scope

- Reservations, sales, QR printing, and reports beyond inventory lookup.

## Acceptance Criteria

- US-009 and US-015 acceptance criteria pass.

## Required Tests

- Unit: state/filter mapping.
- API/integration: inventory search and detail queries.
- UI/manual workflow: search by code and filter by state.

## Steps

1. Expand this plan after F5 closeout.
2. Implement inventory search/detail slice and records.

## Progress

- 2026-07-06: Created initial dependency plan from master feature split.

## Decision Log

- 2026-07-06: F6 unlocks sales, reports, and QR labels.

## Risks

- Search requirements may expand after real inventory review.

## Verification

- Cannot close until inventory state filters and traceability detail are tested.
