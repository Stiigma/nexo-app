# NEXO-0048 QA Review 001 - Architecture And Dependency Selection Skills

## Metadata

- Task ID: `NEXO-0048`
- Date: 2026-07-18
- QA agent: `nexo-qa`
- Reviewed artifact: initial implementation and session-001 evidence
- Decision: blocked

## Scope

Review acceptance coverage, decision-contract behavior, skill triggers, native
discovery, regression evidence, historical compatibility, and close readiness.

## Verification Reviewed

- Focused decision-skill tests: 4/4 passed.
- Focused control-engine tests: 17/17 passed.
- Complete harness tests: 50/50 passed.
- Effective configuration, native skill discovery, compact context, real build
  gate, and Graphify were recorded as passing.

## Findings

### QA-001 - Decision Is Not Scoped To One Evaluation Section

Severity: high, blocking.

The engine requires a heading somewhere and one canonical decision field
somewhere else in the document. Duplicate evaluation headings or an approved
decision outside the intended section can therefore pass. Existing tests do not
cover these adversarial structures.

Required mitigation:

- Require exactly one evaluation heading.
- Require exactly one decision inside that section and reject decision fields
  elsewhere.
- Add duplicate-heading, out-of-section, fenced-example, and exact-task-binding
  tests.

### QA-002 - Dependency Trigger Is Inconsistent

Severity: medium, blocking for contract consistency.

The skill and adapter cover add, upgrade, replace, remove, service, runtime, and
toolchain changes, but the canonical orchestrator mentions only new or upgraded
dependencies.

Required mitigation:

- Align the orchestrator wording with every material add, upgrade, replacement,
  removal, or supply-chain change.

## Residual Risks

- Structural validation cannot prove qualitative architecture correctness.
- Historical NEXO-0046/NEXO-0047 evidence uses the older format and must remain
  historical rather than being silently rewritten.

## Required Follow-Up

Return NEXO-0048 to active through the control engine, implement the mitigations,
rerun all acceptance checks, and submit new QA evidence.
