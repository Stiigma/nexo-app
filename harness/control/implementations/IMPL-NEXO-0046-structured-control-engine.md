# NEXO-0046 Implementation - Structured Control Engine

## Metadata

- Task ID: `NEXO-0046`
- Date: 2026-07-18
- Agent: `nexo-build`
- Related plan: `../plans/NEXO-0046-structured-control-engine.md`
- Related handoff: `../handoffs/HOFF-2026-07-18-structured-control-engine.md`
- Related reports:
  `../reports/2026-07-18/NEXO-0046-structured-control-engine-session-001.md`,
  `../reports/2026-07-18/NEXO-0046-structured-control-engine-session-002.md`,
  `../reports/2026-07-18/NEXO-0046-structured-control-engine-session-003.md`

## Summary

The local control engine validates governed task state, evidence, operational
gates, and lifecycle transitions without mutating the Markdown control plane.
Its interface is three operations: inspect state, evaluate a named gate, or
evaluate a target status.

## Architecture And Pattern

- Architecture/technology: one cohesive standard-library ESM module plus a
  versioned JSON manifest because the current workflow needs deterministic local
  decisions, not persistence or distributed execution.
- Pattern: none. A closed transition table and direct validation functions are
  clearer than State objects for five stable lifecycle states.
- `tasks.md` remains canonical; duplicated manifest status exists only to detect
  stale or contradictory state.

## Behavior Changed

- New non-trivial tasks use `state/tasks/TASK-ID.json`.
- Governed build, review, implemented, and closed operations fail closed on
  invalid or blocked engine output.
- Close accepts exact QA `pass` and security `approved` decisions only.
- Declared verification commands must also appear in the task report.
- Artifact types are restricted to canonical evidence directories and symlinks
  are resolved before reads.
- Review evidence must contain exactly one canonical decision field.
- Implemented work may return to active or blocked for governed review rework.
- The engine has no repository write path.

## Performance

- Work is bounded by one task-table scan and only the explicitly declared
  evidence files, with no recursive search, network I/O, cache, or daemon.

## Verification

- Fourteen focused control-engine tests pass.
- Thirty-eight complete harness tests pass.
- Real build and negative transition tracers behave as specified.

## Follow-Up

- Migrate an existing product task only when it next becomes active; no bulk
  migration is required.
- Consider safe mutation only after read-only decisions have operational use.
