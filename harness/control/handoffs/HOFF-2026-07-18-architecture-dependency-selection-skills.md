# HOFF-2026-07-18-architecture-dependency-selection-skills

## Metadata

- Task ID: `NEXO-0048`
- Date: 2026-07-18
- Authoring agent: `nexo`
- Receiving agent: `nexo-build`
- Status: ready

## Objective

Implement canonical architecture and dependency selection skills, native
OpenCode adapters, and deterministic evaluation checks in the existing
governed build gate.

## Context

NEXO-0046 introduced manifest fields for architecture and dependency evidence,
but NEXO-0047 satisfied them with plan prose because no dedicated selection
procedure or decision format existed. NEXO-0047 explicitly queued these skills
and evaluations as the next Agent Workflow task.

## Source Docs

- `AGENTS.md`
- `harness/control/agents/nexo.md`
- `harness/control/skills/README.md`
- `harness/control/state/tasks/README.md`
- `harness/control/scripts/control-engine.mjs`
- `harness/control/closeouts/NEXO-0047-hardened-mcp-integrations.md`
- `harness/control/plans/NEXO-0048-architecture-dependency-selection-skills.md`
- `harness/control/decisions/NEXO-0048-architecture-selection.md`
- `harness/control/decisions/NEXO-0048-dependency-selection.md`

## Files To Create Or Modify

- `harness/control/skills/nexo-select-architecture.md`
- `harness/control/skills/nexo-select-dependency.md`
- `harness/control/templates/architecture-decision-evaluation.md`
- `harness/control/templates/dependency-decision-evaluation.md`
- `harness/control/scripts/control-engine.mjs`
- `harness/control/state/tasks/README.md`
- `.opencode/skills/nexo-select-architecture/SKILL.md`
- `.opencode/skills/nexo-select-dependency/SKILL.md`
- `.opencode/tests/decision-skills.test.js`
- `.opencode/tests/control-engine.test.js`
- NEXO-0048 implementation, review, report, closeout, and live-state records

## Implementation Steps

1. Define narrow trigger and skip conditions for each canonical skill.
2. Define evidence-first option comparison and explicit decision outcomes.
3. Add reusable evaluation templates with exactly one decision field.
4. Add thin native OpenCode adapters with valid skill frontmatter.
5. Extend pre-build evidence checks to require approved evaluations.
6. Test skill discovery, canonical references, required sections, approved
   decisions, negative decisions, and ambiguous decisions.
7. Run all declared verification and record exact results.

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

## Risks

- Do not turn the skills into mandatory ceremony for local, reversible choices.
- Do not imply approval when evidence is incomplete; use `deferred` or
  `rejected` and stop the build gate.
- Do not install dependencies or perform network research merely to validate
  the skill mechanics.
- Preserve historical evidence rather than rewriting NEXO-0046 or NEXO-0047.

## Acceptance Criteria

- Both skills are canonical, bounded, reusable, and natively discoverable.
- Both templates bind evaluations to a task and support one unambiguous outcome.
- Required architecture and dependency evidence fails closed unless its
  evaluation is exactly approved.
- Existing task lifecycle, orchestrator, MCP, context, budget, and FIAD tests do
  not regress.
- No dependency, product code, external account, or external environment is
  changed.

## Required Gates

- QA review: required
- Security review: required because decision gates affect future supply-chain
  and architecture authorization
- User confirmation: required only for commit, push, deploy, authentication,
  paid inference, dependency installation, or external mutation
