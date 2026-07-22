# NEXO-0048 Dependency Selection

## Metadata

- Task ID: `NEXO-0048`
- Date: 2026-07-18
- Evaluator: `nexo`
- Scope: implementation dependencies for decision skills and evaluation gates

## Need

The task needs Markdown parsing already performed by the control engine and
structural tests already supported by Node's built-in test runner. It does not
need package discovery, persistence, schema generation, or model grading.

## Options Considered

1. Use existing Node.js standard-library modules and Markdown contracts.
2. Add a schema or Markdown parser package for two headings and one field.
3. Add an agent-evaluation framework to grade decision prose.

## Criteria

- Necessity and unique value.
- Supply-chain and maintenance cost.
- Compatibility with the current runtime and test suite.
- Determinism, offline operation, and rollback simplicity.
- Effect on lockfiles and future upgrades.

## Dependency Decision Evaluation

- Decision: approved
- Selected identity: no new dependency; use the existing Node.js runtime,
  standard-library regular expressions, and `node:test`.
- Rationale: the current runtime already provides bounded text parsing and
  deterministic tests, so a package would add cost without unique value.
- Required user approval: none because no package, service, image, plugin,
  runtime, or external account changes.
- Verification: focused decision-contract tests and the complete harness suite.
- Upgrade path: use the existing governed runtime-upgrade process only when a
  separate task changes the Node baseline.
- Rollback path: revert the plain JavaScript and Markdown contract changes; no
  package or lockfile rollback is needed.
- Source and version: local Node `v26.4.0`; no package or image is selected.
- Supply-chain effect: none; no manifest or lockfile changes.
- Upgrade and rollback: governed by the existing runtime baseline; the task's
  changes are plain Markdown and JavaScript edits.

## Residual Risk

- Regular-expression validation intentionally accepts only the documented
  Markdown contract. A future richer format should be introduced through a new
  governed compatibility decision, not a permissive parser.
