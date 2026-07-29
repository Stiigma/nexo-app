# Structured Task Manifests

Structured task manifests are canonical for registered work and let the control
engine validate lifecycle decisions. `harness/control/tasks.md` is their index
projection and remains the legacy source for historical tasks without a
manifest.

## Interface

Each governed task uses `TASK-ID.json` with:

- `schemaVersion`: currently `1`.
- `taskId`: exact Nexo or FIAD task ID.
- `status`: must equal the canonical `tasks.md` row.
- `updatedAt`: ISO date-time for the manifest decision.
- `requirements`: explicit booleans for architecture, dependency, migration,
  QA, security, and external-approval gates.
- `artifacts`: repository-relative evidence paths or `null`.
- `verification`: commands whose successful execution is recorded by the task
  report.
- optional `title` and `priority` for compact continuity records.
- optional `controlLevel`: `normal` or `controlled`; missing means legacy
  controlled behavior.
- optional `continuity`: objective, current summary, decisions, open questions,
  next step, and last checkpoint.
- optional `contract`: requirement sources and acceptance criteria.
- optional `releaseReadiness` requirement/artifact for pre-deploy evaluation.

Status duplication with `tasks.md` is a compatibility conflict detector. A
mismatch blocks every gate and transition.

Requirement classification is planner/orchestrator policy. An implementation
specialist may return new evidence paths but must not downgrade requirements or
change manifest lifecycle state; `nexo` owns synchronization after checking the
specialist's result.

## Commands

```bash
node harness/control/scripts/control-engine.mjs inspect --task NEXO-0000
node harness/control/scripts/control-engine.mjs gate --task NEXO-0000 --name build
node harness/control/scripts/control-engine.mjs gate --task NEXO-0000 --name qa
node harness/control/scripts/control-engine.mjs gate --task NEXO-0000 --name security
node harness/control/scripts/control-engine.mjs gate --task NEXO-0000 --name release
node harness/control/scripts/control-engine.mjs transition --task NEXO-0000 --to implemented
node harness/control/scripts/control-engine.mjs transition --task NEXO-0000 --to closed
```

Allowed decisions are written as JSON to stdout with exit code `0`. Blocked
decisions are also JSON and use exit code `2`. Invalid CLI input or malformed
manifests use exit code `1` and JSON on stderr.

## Rules

- The engine is read-only.
- Artifact paths must stay inside the repository.
- Each artifact type is restricted to its canonical control-plane directory;
  symlinks resolving outside the repository are rejected before reading.
- Every required artifact must reference its task ID.
- Required architecture evidence must contain one
  `## Architecture Decision Evaluation` heading and exactly one approved
  decision. Required dependency evidence follows the same rule with
  `## Dependency Decision Evaluation`.
- Evaluation decisions must be inside their single expected section, outside
  fenced examples, bound by one exact Task ID metadata field, and include the
  template's non-placeholder fields. External approval, when required, follows
  `## External Approval Evaluation` and the same exact approved-decision rule.
- Pre-build requirements are revalidated before implemented, QA, security, and
  close decisions so changed evidence fails closed.
- Reports need a verification heading and manifests need at least one
  verification command before `implemented`.
- Required QA must record exactly `pass`; required security must record exactly
  `approved` before `closed`. Each review must bind one exact Task ID and keep
  its single decision plus required review fields inside its exact QA or
  security evaluation section.
- Conditional and blocked reviews do not satisfy close.
- Required release readiness must contain exactly one passing
  `## Release Readiness Evaluation` with reviewed evidence, health/smoke checks,
  rollback trigger, recovery owner, and residual risk. It runs before a
  separately authorized deploy and never fabricates post-deploy evidence.
- Implemented work may return to `active` or `blocked` when review discovers
  rework; it must pass `active->implemented` again afterward.
