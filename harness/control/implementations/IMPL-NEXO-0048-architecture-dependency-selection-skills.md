# NEXO-0048 Implementation - Architecture And Dependency Selection Skills

## Metadata

- Task ID: `NEXO-0048`
- Date: 2026-07-18
- Agent: `nexo-build`
- Related plan:
  `../plans/NEXO-0048-architecture-dependency-selection-skills.md`
- Related handoff:
  `../handoffs/HOFF-2026-07-18-architecture-dependency-selection-skills.md`
- Related report:
  `../reports/2026-07-18/NEXO-0048-architecture-dependency-selection-skills-session-001.md`
- Final rework report:
  `../reports/2026-07-18/NEXO-0048-architecture-dependency-selection-skills-session-002.md`
- Final acceptance report:
  `../reports/2026-07-18/NEXO-0048-architecture-dependency-selection-skills-session-003.md`
- Final delimiter-specific report:
  `../reports/2026-07-18/NEXO-0048-architecture-dependency-selection-skills-session-004.md`

## Summary

Nexo now has canonical architecture and dependency selection procedures,
reusable decision-evaluation templates, native OpenCode skill adapters, and a
fail-closed pre-build contract for required decisions.

## Architecture And Pattern

- Architecture: deepen the existing control plane. Canonical procedures and
  templates live under `harness/control/`; OpenCode adapters only expose them;
  the existing read-only control engine validates their outcomes.
- Interface: the existing manifest fields `architectureDecision` and
  `dependencyApproval` remain stable. Each points to task-bound Markdown
  evidence with its exact evaluation heading and one decision field.
- Pattern decision: none. Direct data-driven options passed to the existing
  artifact validator are clearer than introducing Strategy, a rule engine, or a
  second evaluation pipeline for two stable evidence types.

## Behavior Changed

- `nexo-select-architecture` triggers for durable module, integration, storage,
  deployment, and convention choices; it explicitly skips local reversible
  implementation details.
- `nexo-select-dependency` triggers for package, image, service, SDK, plugin,
  runtime, and toolchain changes; it evaluates no new dependency first.
- Both skills distinguish `approved`, `rejected`, and `deferred`. Only one exact
  approved decision can satisfy a required build artifact.
- Missing headings, non-approved outcomes, and duplicate decision fields fail
  closed through the control engine.
- The planner and orchestrator point to the canonical skills, while native
  `SKILL.md` adapters make both procedures discoverable in OpenCode.

## Decision Evaluations

- Architecture evaluation:
  `../decisions/NEXO-0048-architecture-selection.md` approved reuse of the
  existing control-plane and engine seams.
- Dependency evaluation:
  `../decisions/NEXO-0048-dependency-selection.md` approved no new dependency.
- Reusable templates live under `../templates/` and deliberately contain one
  placeholder decision field so an unedited template cannot approve build.

## Dependency Decision

- No package, image, service, plugin, lockfile, or runtime dependency changed.
- Existing Node `v26.4.0`, standard-library regular expressions, and `node:test`
  provide all required mechanics.
- No model-scored eval framework is justified for deterministic heading and
  outcome validation.

## Security And Trust Boundaries

- The evaluations authorize only the recorded architecture or dependency
  choice; they do not authorize installs, migrations, credentials, OAuth,
  external mutation, commit, push, or deploy.
- Dependency selection requires exact identity, source, compatibility,
  transitive, secret/scope, network/data, upgrade, and rollback review.
- Material stack or supply-chain changes retain explicit user-approval and
  security-review requirements.
- Evaluation parsing ignores fenced examples and requires one exact task-bound
  section, one in-section approved decision, and non-placeholder fields.
- Every later lifecycle/review decision revalidates pre-build approvals.
- Canonical artifact realpaths must remain inside the directories allowed for
  their artifact type.
- The effective `nexo-build` adapter denies structured task manifest edits;
  planner/orchestrator policy owns requirement classification and state.
- All mutating specialists except the planner deny structured task manifest
  edits; build and infrastructure also deny the legacy write-tool surface.
- QA and security close evidence uses the same exact task-bound, section-scoped,
  fenced-content-aware contract as pre-build evaluations.

## Performance

- The added gate work reads only already-declared evidence and applies two
  bounded regular expressions. There is no recursive search, network call,
  model inference, cache, daemon, or application hot-path change.

## Verification

- Four focused decision-skill tests pass.
- Seventeen focused control-engine tests pass, including rejected, deferred,
  malformed, and ambiguous decision evidence.
- Fifty complete OpenCode harness tests pass.
- Effective OpenCode configuration resolves and both skills are discovered at
  their native project paths.
- Compact startup context remains 4,148 characters, approximately 1,037 tokens.
- Graphify updated to 9,264 nodes, 11,252 edges, and 922 communities.

Final governed rework raises focused control-engine coverage to 27 tests and the
complete harness to 61 tests. Effective build-agent permissions, skill
discovery, compact context, the hardened real build gate, and Graphify at 9,318
nodes, 11,309 edges, and 944 communities all pass.

Final review-002 rework raises focused decision-skill coverage to 5 tests,
control-engine coverage to 32 tests, and the complete harness to 67 tests.
Strict fence semantics, exact QA/security decisions, specialist-wide manifest
denies, runtime discovery, compact context, and Graphify at 9,355 nodes, 11,344
edges, and 950 communities pass.

Delimiter-specific fence opener rework raises control-engine coverage to 35
tests and the complete harness to 70 tests. Backtick/tilde opposite-delimiter
info strings, runtime configuration, compact context, the real build gate, and
Graphify at 9,384 nodes, 11,370 edges, and 957 communities pass.

## Operational Notes

- Restart OpenCode so an already-running application session reloads the new
  skill catalog.
- Historical NEXO-0046/NEXO-0047 evidence remains unchanged and closed tasks do
  not reopen. Any future correction uses a new governed task with new-format
  evaluations rather than rewriting historical records.
