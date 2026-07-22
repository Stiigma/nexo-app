# NEXO-0017 - QR Labels

## Feature Metadata

- Feature: F11.
- Depends on: `NEXO-0012`.
- Primary agent: `nexo-build`.
- Required gates: QA review before closeout.
- Linked stories: US-012.
- Linked SRS requirements: FR-QR-001, FR-QR-002.

## Business Objective

Generate printable QR labels so physical garments can be matched to system
records by internal code.

## Domain Rules

- QR labels identify garments by stable internal code or a stable resolver.
- Scanning a QR opens or locates the matching garment.
- Label printing must remain usable for selected garments, not only one item.

## Done When

- Operators can select garments and generate a printable label sheet.
- QR scans resolve to garment detail or a lookup result.
- Tests and harness records are complete.

## Scope

- Backend: QR resolver endpoint if required.
- Frontend: label generation/print view and scan resolution route.
- Data: stable QR payload policy.
- Infrastructure: none expected unless public/deployed URL behavior is required.

## Out Of Scope

- Hardware printer integration and external label services.

## Acceptance Criteria

- US-012 acceptance criteria pass.

## Required Tests

- Unit: QR payload/resolver rules.
- API/integration: resolver lookup.
- UI/manual workflow: printable label sheet and scan/open behavior.

## Steps

1. Expand this plan after F6 closeout.
2. Resolve QR payload policy before implementation.
3. Implement QR slice and records.

## Progress

- 2026-07-06: Created initial dependency plan from master feature split.

## Decision Log

- 2026-07-06: F11 waits for inventory search/detail because QR resolves to
  garment records.

## Risks

- QR payload remains an SRS open question.

## Verification

- Cannot close until QR output is printable and resolves to the correct
  garment.
