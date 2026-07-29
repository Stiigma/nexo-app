# HOFF-2026-07-26-garment-lifecycle-business-rules

## Metadata

- Task ID: NEXO-0050
- Date: 2026-07-26
- Authoring agent: nexo (orchestrator)
- Receiving agent: nexo-build
- Status: approved for implementation
- Source ADR: `harness/control/decisions/ADR-2026-07-26-garment-lifecycle-business-rules.md`

## Objective

Implement the garment lifecycl e business rules defined in NEXO-0050: two independent state dimensions (Inventory + Listing), deterministic readiness evaluation, collective signature approval, append-only audit trail, explicit lifecycle commands, and a Prisma migration with conservative backfill.

## Context

Product-owner Gerardo approved the full policy through a structured interview and traceability review on 2026-07-26. Key deviations from the original NEXO-0050 plan:

- **Collective sign-off replaces strict different-user approval.** Single round of signatures from all operators/admins in `READY_FOR_REVIEW`. Simple majority (>50%). 48-hour timeout for absent reviewers.
- **New `APPROVED` listing state** between `READY_FOR_REVIEW` and `PUBLISHED`. Listing dimension now has 6 states (was 5).
- **System validates, human confirms.** The system evaluates file completeness, but an operator/admin must explicitly press "Enviar a revisión" to transition `DRAFT → READY_FOR_REVIEW`.
- **Physical location never required** for any gate (approval, publication, or otherwise).
- **Both operators and admins edit financial data.** The collective sign-off is the control point, not field-level restrictions.
- **Cost exception** approved by admin before entering `READY_FOR_REVIEW`.
- **Editing during review invalidates all signatures** and drops to `DRAFT`.
- **Cascada instantánea:** garments created with all data skip through `DRAFT` to `READY_FOR_REVIEW` transparently.
- **Operator inspects and restocks returns.** Admin only for exceptions.
- **Waiting list for reservations.**
- **Everything editable on AVAILABLE.** System recalculates and demotes on protected-data changes.
- **Return types (required):** customer, supplier, admin correction.

## Source Docs

- `NEXO_PROJECT.md`
- `harness/control/decisions/ADR-2026-07-26-garment-lifecycle-business-rules.md` (canonical)
- `harness/control/plans/NEXO-0050-garment-business-rules.md` (initial plan; ADR supersedes where they differ)
- `docs/spec/SRS.md` — FR-INV-004, FR-INV-008, FR-INV-010, FR-INV-011, FR-LST-001, FR-LST-002
- `docs/spec/user-stories.md` — US-023, US-024
- Current `Item` Prisma model and `ItemStatus` enum

## Architecture Seam

Two state dimensions inside the existing inventory bounded context. No new dependency, service, or workflow engine. Policy lives in pure domain functions:

- `GarmentReadinessEvaluator`: pure function → `missingFields`, `blockers`, `eligibleActions`
- `GarmentLifecyclePolicy`: pure state machines (Inventory + Listing), role/invariant/related-record guards
- `PriceApprovalPolicy`: collective signature, revision/snapshot, invalidation rules

Explicit application commands: submit, sign-off, publish, pause, resume, reopen, reserve, release, sell, return, restock.

Controllers do auth/DTO only. Policy must not live in controllers.

## Files To Create Or Modify

### Backend — Schema
- `back/prisma/schema.prisma` — Add `ListingStatus` enum, `listingStatus` field, `lifecycleVersion`, `commercialRevision`, `financialRevision`. Add `ItemStateTransition` model. Add `PriceReview` model. Add `CostException` model. Add `Reservation` references (coordinate with NEXO-0013).

### Backend — Domain
- `back/src/modules/inventory/domain/garment-readiness-evaluator.ts` — pure readiness evaluator
- `back/src/modules/inventory/domain/garment-lifecycle-policy.ts` — inventory + listing state machines
- `back/src/modules/inventory/domain/price-approval-policy.ts` — collective sign-off and revision rules
- `back/src/modules/inventory/domain/__tests__/` — exhaustive table-driven tests for every allowed/rejected transition, role, guard, blocker code, revision invalidation, and maker-checker rule

### Backend — Application
- `back/src/modules/inventory/application/item.service.ts` — update with lifecycle commands and transactional repository boundary
- `back/src/modules/inventory/application/commands/` — submit, sign-off, publish, pause, resume, reopen, reserve, release, sell, return, restock use cases
- `back/src/modules/inventory/application/__tests__/` — integration tests

### Backend — Interface
- `back/src/modules/inventory/interface/http/dto/` — command DTOs with `expectedLifecycleVersion`
- `back/src/modules/inventory/interface/http/items.controller.ts` — new endpoints (see API surface below)
- Keep `PUT /items/:id/editor` for non-lifecycle data; remove status mutation from generic update

### Backend — Migration
- `back/prisma/migrations/` — new migration with listing status, versions, audit/approval tables, backfill to `NOT_LISTED`, dry-run data-quality report

### Frontend
- `front/src/features/inventory/` — lifecycle action buttons, signature panel, readiness indicators, approval queue
- `front/src/features/inventory/components/` — ReadinessChecklist, SignaturePanel, LifecycleHistory, PriceReviewDialog, PublishButton
- `front/src/features/inventory/hooks/` — mutation hooks for each lifecycle command

## API Surface

- `GET /items/:id/readiness` — computed blockers, recommended states, eligible actions
- `GET /items/:id/lifecycle-history` — transition audit timeline
- `POST /items/:id/listing/submit` — DRAFT → READY_FOR_REVIEW (system validates, user confirms)
- `POST /items/:id/listing/sign` — add signature to current review
- `POST /items/:id/listing/publish` — APPROVED → PUBLISHED (admin only)
- `POST /items/:id/listing/pause` — PUBLISHED → PAUSED
- `POST /items/:id/listing/resume` — PAUSED → PUBLISHED
- `POST /items/:id/listing/reopen` — APPROVED/PUBLISHED → DRAFT
- `POST /items/:id/cost-exception` — admin approve cost exception (before review)
- Reservation, sale, return, restock commands under their owning modules

Every command carries `expectedLifecycleVersion`. Return `403` for role failures, `409` for stale conflicts, `422` for unmet business facts with stable blocker codes.

## Implementation Phases

### Phase 0 — Pure policy and bug repair (P0 slice)
1. Write exhaustive table-driven unit tests for readiness, both state machines, roles, collective sign-off, revisions, invalidation, and blocker codes.
2. Implement domain policies (`GarmentReadinessEvaluator`, `GarmentLifecyclePolicy`, `PriceApprovalPolicy`).
3. Implement explicit initial-state derivation (create → `PRICE_PENDING` or `ACQUIRED_STOCK`; never `RETURNED`, `AVAILABLE`, `RESERVED`, `SOLD`).
4. Remove status from generic mutation contracts.
5. Reconcile editor saves synchronously and return readiness/results.

### Phase 1 — Persistence, migration, and audit
1. Implement Prisma migration with `ListingStatus`, `lifecycleVersion`, `commercialRevision`, `financialRevision`, `ItemStateTransition`, `PriceReview`, `CostException`.
2. Dry-run on restored database copy.
3. Backfill all existing items to `listingStatus = NOT_LISTED` with `MIGRATION` audit events.
4. Produce data-quality quarantine report (invalid money, missing photo, inactive catalogs, suspicious `RETURNED` rows).
5. Add transactional repository and concurrency tests.

### Phase 2 — Review and publication workflow
1. Implement submit, sign, publish, pause, resume, reopen commands/endpoints.
2. Add role-safe responses, queues, stable blockers, audit history.
3. Implement cost exception admin approval endpoint.
4. Add UI: readiness indicators, signature panel, lifecycle history, publish/pause buttons.

### Phase 3 — Reservation, sale, return, and restock (blocked by NEXO-0013/0014)
1. Integrate reservation commands with NEXO-0013 customer/reservation records.
2. Integrate sale commands with NEXO-0014 sale records.
3. Add return/restock records and atomic lifecycle consequences.

Phases 0-2 form the first executable P0 slice. Phase 3 is contractually blocked where reservation/sale persistence does not yet exist.

## Acceptance Criteria

1. New garments with incomplete financials enter `PRICE_PENDING`; completing finances moves to `ACQUIRED_STOCK` automatically.
2. New garments cannot be created as `AVAILABLE`, `RESERVED`, `SOLD`, or `RETURNED`.
3. System validates file completeness; operator/admin presses "Enviar a revisión" to enter `READY_FOR_REVIEW`.
4. Every valid transition passes with its complete guard set; every unlisted edge and missing guard is rejected with a stable blocker code.
5. Collective sign-off reaches majority → `APPROVED` + `AVAILABLE` atomically. Edit during review invalidates signatures → `DRAFT`.
6. Admin explicitly publishes (`APPROVED → PUBLISHED`). Publication fails on stale revision, missing/inactive data, or non-`AVAILABLE` inventory.
7. Protected edit on `AVAILABLE` invalidates approval and demotes (`ACQUIRED_STOCK` or `PRICE_PENDING`).
8. Reservation fails without customer, non-`PUBLISHED`/non-`AVAILABLE`, or when another active reservation exists (waiting list captures additional interest).
9. Sale requires `PUBLISHED` listing and `AVAILABLE`/`RESERVED` inventory.
10. Sale and return atomically update both dimensions and preserve original history.
11. Every state transition creates an append-only audit row.
12. Concurrent requests against the same `lifecycleVersion` allow at most one winner.
13. Existing rows migrate to `NOT_LISTED` without losing inventory status.
14. Domain tests prove all rules without controllers or UI.

## Verification

- `pnpm --dir back test:unit` — domain policy unit tests
- `pnpm --dir back test:e2e` — lifecycle endpoint tests
- `pnpm --dir back test`
- `pnpm --dir back db:validate`
- `pnpm --dir back build`
- `pnpm --dir front test`
- `pnpm --dir front build`
- Migration dry run with row counts, enum distribution, audit initialization, and FK/orphan checks
- Manual acceptance: operator submit, collective sign-off, admin publish, reserve, sale, return, restock
- Run control engine gate before build and before marking implemented

## Risks

| Risk | Mitigation |
|---|---|
| Scope overlaps NEXO-0037 | Preserve its editor; lifecycle execution is NEXO-0050 ownership |
| Existing `RETURNED` rows from create bug | Quarantine in report, don't silently repair |
| Only one admin can't form a majority | Single admin self-approves with reason |
| Phase 3 deps (NEXO-0013/14) incomplete | Contract-only until records exist; no fake data |
| Automatic demotion surprises operators | Show resulting transitions before save; audit initiating user |

## Receiving Agent Instructions

`nexo-build` should read the ADR at `harness/control/decisions/ADR-2026-07-26-garment-lifecycle-business-rules.md` as the canonical policy source, then implement Phases 0 through 2 in order. Do not modify product code until the control engine build gate passes. Return to `nexo` with implementation evidence, test results, and remaining risk for QA/security review.
