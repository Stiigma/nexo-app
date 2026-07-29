# NEXO-0050 Report - Garment Business Rules Planning Session 001

## Metadata

- Task ID: `NEXO-0050`
- Date: 2026-07-25
- Agent: `nexo-plan`
- Status: planned; product-owner approval and build handoff pending

## What Was Done

- Analyzed why garment edits do not currently change state and recorded the
  create-path `RETURNED` loophole.
- Defined exhaustive inventory and commercial state machines, readiness facts,
  automatic derivation boundaries, role guards, maker-checker price approval,
  transaction guards, audit records, migration, API commands, implementation
  phases, and acceptance verification.
- Selected the smallest durable architecture: two state dimensions and
  append-only review/audit records inside the inventory modular-monolith
  boundary, without a new dependency or service.
- Registered the new P0 planned task and governed manifest without changing the
  current product focus or modifying product code/configuration.

## Files Changed

- `harness/control/plans/NEXO-0050-garment-business-rules.md`
- `harness/control/state/tasks/NEXO-0050.json`
- `harness/control/tasks.md`
- `harness/control/README.md`
- `harness/control/journal/2026-07-25.md`
- This planning report.

## Verification Performed

- Compared the plan against NEXO-0037, FR-INV-003/004/008/011,
  FR-LST-001/002, the Prisma `Item` model, current `ItemStatus` transition map,
  and `ItemService` create/update/editor behavior.
- Confirmed the plan contains objective, done-when criteria, scope, out of
  scope, every valid transition and guard, derivation rules, approval flow,
  audit, migration, implementation phases, risks, dependencies, acceptance
  criteria, verification, and receiving-agent recommendation.
- Confirmed no product code, schema, dependency, or durable product
  configuration was changed.

## Open Items

- Product owner must approve the strict different-user workflow, cost
  exception, reserved-listing behavior, return quarantine, and publication
  policy.
- A durable ADR and external-approval evidence are required before build.
- NEXO-0037 ownership must be aligned so its safe editor is reused and its
  remaining listing scope is not implemented twice.
- A plan-to-build handoff is intentionally absent while those gates remain
  open.

## Recommended Next Step

Have `nexo` present the policy decisions for owner approval. After approval,
record the ADR/evidence, create the NEXO-0050 handoff, run the governed build
gate, and route the first P0 slice to `nexo-build`.
