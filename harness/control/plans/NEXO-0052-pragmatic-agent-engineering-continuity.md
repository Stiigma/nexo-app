# NEXO-0052 - Pragmatic Agent Engineering And Continuity

## Objective

Improve Nexo's planning, implementation, QA, release, and cross-chat continuity
contracts so agents produce maintainable changes with proportional governance
and lower token overhead.

## Done When

- Planning traces requirement sources to acceptance criteria and evaluates
  architecture, boundaries, validation, failure behavior, maintenance, and
  scalability without speculative design.
- Implementation uses a narrow slice, focused tests, and a final code-smell
  gate with explicit debt revisit triggers.
- QA independently checks requirements and evidence, does not repair its own
  findings, and can evaluate release readiness before an authorized deploy.
- Normal work can create, find, checkpoint, resume, and promote one compact
  continuity record without requiring reports, journals, or legacy focus files.
- Budget thresholds warn without aborting useful work or generating automatic
  reports under the default policy.
- Graphify is optional and disabled by default.
- Behavioral contract checks and architecture fitness tests pass.
- Versioned configuration contains no literal provider token.

## Scope

- Nexo's canonical agents, skills, templates, control engine, compact context,
  OpenCode adapters, budget policy, and harness tests.
- A small file-backed continuity command for `NEXO-*` work.
- Removal of literal credentials from versioned OpenCode configuration.

## Out Of Scope

- Product features in `back/` or `front/`.
- Product architecture or database migrations.
- Commit, push, deploy, paid inference, or external account mutation.
- Semantic model grading, graph databases, or a new telemetry service.

## Steps

1. Add compatible continuity and contract fields to governed manifests.
2. Implement compact continuity create/find/checkpoint/resume/promote commands.
3. Strengthen planning, build, QA, and release contracts.
4. Make monetary budgets advisory and Graphify opt-in.
5. Add provider-neutral behavioral evaluations and architecture fitness tests.
6. Remove literal credentials and validate the complete harness.

## Progress

- 2026-07-29: Registered the user-requested Nexo harness improvement and
  selected a compatible file-backed extension.

## Decision Log

- 2026-07-29: Keep the local modular file-backed control plane. Existing JSON,
  Markdown, atomic file operations, and Node tests already cover the required
  boundary; a graph, database, or service has no present consistency or scale
  force.
- 2026-07-29: Use direct transition functions behind the existing `nexo`
  facade. A State hierarchy would add indirection to a small closed lifecycle.
- 2026-07-29: Keep regex behavioral checks as contract smoke tests only; human
  QA remains responsible for semantic quality.

## Risks

- Existing uncommitted product and harness changes must remain untouched.
- Structural evaluations can detect missing evidence language but cannot prove
  that a design is objectively correct.
- A credential already exposed in local history or another copy still requires
  external revocation even after removal from this worktree.

## Verification

- `node --check harness/control/scripts/nexo-work.mjs`
- `node --check harness/control/scripts/control-engine.mjs`
- `node --check harness/control/scripts/evaluate-agent-response.mjs`
- `node --test .opencode/tests/*.test.js`
- `node harness/control/scripts/nexo-work.mjs doctor`
- `node .opencode/scripts/opencode2-doctor.mjs`
- `git diff --check`

