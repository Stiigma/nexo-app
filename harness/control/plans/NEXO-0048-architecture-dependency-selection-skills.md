# NEXO-0048 - Architecture And Dependency Selection Skills

## Objective

Add reusable, deterministic procedures for architecture and dependency
selection, plus machine-checkable decision evaluations that satisfy governed
pre-build evidence without introducing a new evaluation framework.

## Done When

- Canonical architecture and dependency selection skills define triggers,
  inputs, alternatives, criteria, outcomes, and escalation rules.
- Each skill writes a task-bound evaluation from a canonical template with one
  explicit `approved`, `rejected`, or `deferred` decision.
- OpenCode discovers both skills through thin `SKILL.md` adapters that point to
  the canonical control plane.
- The control engine requires an approved, correctly headed evaluation when a
  governed task declares architecture or dependency evidence.
- Focused skill/evaluation tests, control-engine tests, the complete harness
  suite, effective configuration, compact context, QA, security, and Graphify
  pass.

## Scope

- Canonical skills and evaluation templates under `harness/control/`.
- Native OpenCode skill adapters under `.opencode/skills/`.
- Focused structural and decision-gate regression tests.
- A small extension to existing control-engine evidence validation.
- Governed NEXO-0048 evidence and live-state records.

## Out Of Scope

- Choosing or changing Nexo's product architecture or application dependencies.
- Installing an evaluation framework, package, plugin, or runtime service.
- Running paid model-based evaluations or grading prose quality automatically.
- Migrating historical task evidence or changing external systems.
- Commit, push, deploy, or external authentication.

## Steps

1. Register NEXO-0048 with task-bound architecture and dependency evaluations.
2. Pass the governed planned-to-active build decision.
3. Add canonical skills, templates, and native OpenCode adapters.
4. Require approved decision evaluations in the existing control engine.
5. Add focused regression cases for discovery and fail-closed decisions.
6. Run focused and full acceptance checks, then complete QA and security.
7. Close through the control engine and synchronize live state.

## Progress

- 2026-07-18: User selected the next Agent Workflow task rather than the default
  product focus; registered NEXO-0048 from the NEXO-0047 follow-up.
- 2026-07-18: The control engine authorized planned-to-active with synchronized
  state and valid plan, handoff, architecture, and dependency evidence.
- 2026-07-18: Implemented both canonical skills, evaluation templates, native
  adapters, approved-decision gate checks, and regression cases. Focused tests,
  50 complete tests, effective config, skill discovery, compact context, the
  real build gate, and Graphify pass.
- 2026-07-18: The control engine authorized active-to-implemented with the
  implementation record, report, and all seven declared verification commands.
- 2026-07-18: QA/security review blocked close on section-scoped decisions,
  post-build revalidation, manifest ownership, exact task binding, and realpath
  containment. The control engine authorized implemented-to-active rework.
- 2026-07-18: Rework added exact in-section decisions, fenced-content
  exclusion, required fields, external approval, later-gate revalidation,
  orchestrator-owned manifests, normalized/realpath containment, and adversarial
  coverage. All 61 tests and runtime checks pass.
- 2026-07-18: The hardened control engine authorized the second
  active-to-implemented transition after revalidating both decision evaluations
  and all eight recorded verification commands.
- 2026-07-18: Review 002 blocked malformed fence closers, generic QA/security
  review decisions, and incomplete manifest denies across mutating specialists.
  The engine authorized another implemented-to-active rework.
- 2026-07-18: Final rework added strict fence semantics, exact QA/security
  evaluation sections, specialist-wide manifest denies, aligned history/next
  guidance, and all missing adversarial/positive cases. All 67 tests and runtime
  checks pass; session-003 is current evidence.
- 2026-07-18: The control engine revalidated both pre-build evaluations and all
  nine verification commands before authorizing the third
  active-to-implemented transition.
- 2026-07-18: Review 003 found one remaining fence-opener bypass for valid info
  strings beginning with the opposite delimiter. The engine authorized
  implemented-to-active and delimiter-specific parsing plus regressions were
  added.
- 2026-07-18: Delimiter-specific open/closed cases pass with 35 focused
  control-engine and 70 complete harness tests. Runtime checks, compact context,
  the real build gate, and Graphify also pass; session-004 is current evidence.
- 2026-07-18: The engine revalidated both evaluations and all nine commands
  before authorizing the fourth active-to-implemented transition.
- 2026-07-18: Final QA found no remaining issue and passed; final security found
  no remaining vulnerability and approved. Close evidence is ready for the
  implemented-to-closed decision.
- 2026-07-18: The control engine authorized implemented-to-closed after
  revalidating architecture/dependency decisions, nine verification commands,
  exact QA/security evaluations, and the closeout.

## Decision Log

- 2026-07-18: Keep `harness/control/skills/` canonical and use native OpenCode
  `SKILL.md` files only as thin adapters.
- 2026-07-18: Extend the existing evidence validator instead of adding a second
  evaluator. The stable interface remains the task manifest's
  `architectureDecision` and `dependencyApproval` artifact paths.
- 2026-07-18: Use structured Markdown headings and one exact decision field.
  This is sufficient for deterministic gates; model-scored prose evaluation is
  not justified.
- 2026-07-18: Add no dependency. Node standard-library tests and the existing
  control engine cover the required behavior.

## Risks

- Structural validation proves an explicit decision and required sections, not
  that every qualitative tradeoff is objectively correct.
- Stronger gates intentionally do not migrate historical closed evidence. Any
  future correction uses a new governed task and new-format evaluation.
- Over-triggering both skills would add planning overhead; their triggers and
  skip conditions must remain explicit.

## Verification

- `node --test .opencode/tests/decision-skills.test.js`
- `node --test .opencode/tests/control-engine.test.js`
- `node --test .opencode/tests/*.test.js`
- `opencode debug config`
- `opencode debug skill`
- `opencode debug agent nexo-build`
- `opencode debug agent nexo-infra`
- `node .opencode/scripts/build-session-context.mjs`
- `graphify update .`
