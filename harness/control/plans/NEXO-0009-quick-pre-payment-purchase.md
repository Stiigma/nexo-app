# NEXO-0009 - Quick Pre-Payment Purchase

## Feature Metadata

- Feature: F3.
- Depends on: `NEXO-0008`.
- Primary agent: `nexo-build`.
- Required gates: QA review before closeout.
- Linked stories: US-001, US-002.
- Linked SRS requirements: FR-PUR-001, FR-PUR-002, FR-PUR-003, FR-PUR-004,
  FR-INV-002, IR-001.

## Business Objective

Enable operators to start a purchase cart and capture purchase cart items
quickly before payment while shopping in-store.

## Domain Rules

- Purchase cart items have capture IDs before payment, not internal codes.
- Main photo and captured purchase cost are required.
- Category may be missing during quick capture and then flagged for review.
- Removed cart items must not enter inventory.

## Done When

- Operators can create carts and add/remove items.
- Store tax and exchange-rate fields are captured.
- Photo references use the planned storage boundary, with local placeholders if
  object storage is not yet implemented.
- Tests and harness records are complete.

## Scope

- Backend: purchase cart and item APIs.
- Frontend: mobile-first cart/item capture workflow.
- Data: cart/item schema and capture ID sequencing.
- Infrastructure: storage boundary only; no production storage setup unless
  explicitly approved.

## Out Of Scope

- Payment confirmation, acquired inventory, availability, and sales.

## Acceptance Criteria

- US-001 and US-002 acceptance criteria pass.

## Required Tests

- Unit: capture ID and category review rules.
- API/integration: create cart, add item, remove item.
- UI/manual workflow: mobile cart capture.

## Steps

1. Expand this plan after F2 closeout.
2. Create a build/design handoff.
3. Implement purchase cart slice, tests, report, implementation, and closeout.

## Progress

- 2026-07-06: Created initial dependency plan from master feature split.

## Decision Log

- 2026-07-06: F3 is the first business workflow and waits for catalogs.

## Risks

- Exchange-rate fallback and rounding open questions may affect exact
  calculations.

## Verification

- Cannot close until a cart item can be captured on a mobile workflow with API
  persistence and tests.
