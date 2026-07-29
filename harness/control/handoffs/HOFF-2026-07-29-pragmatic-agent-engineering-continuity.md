# HOFF-2026-07-29-pragmatic-agent-engineering-continuity

## Metadata

- Task ID: `NEXO-0052`
- Date: 2026-07-29
- Authoring agent: `nexo`
- Receiving agent: `nexo-build`
- Status: ready

## Objective

Implement a maintainability-focused, token-proportional agent workflow with
compact cross-chat continuity and deterministic evidence gates.

## Context

Nexo already has a local control plane, specialist roles, task manifests, and
tests. Its normal workflow still depends on manually synchronized live files,
its budget guard can abort sessions and generate reports, Graphify is mandatory
for code work, and planning/build/QA contracts do not consistently require
maintenance impact, validation, smell review, or requirement traceability.

## Source Docs

- `AGENTS.md`
- `NEXO_PROJECT.md`
- `harness/control/README.md`
- `harness/control/WORKFLOW.md`
- `harness/control/agents/nexo.md`
- `harness/control/scripts/control-engine.mjs`
- `harness/control/state/tasks/README.md`
- `harness/control/plans/NEXO-0052-pragmatic-agent-engineering-continuity.md`
- `harness/control/decisions/NEXO-0052-pragmatic-agent-engineering-continuity.md`

## Files To Create Or Modify

- Canonical Nexo agent, skill, checklist, template, and workflow files.
- `harness/control/scripts/nexo-work.mjs`
- `harness/control/scripts/control-engine.mjs`
- `harness/control/scripts/build-session-context.mjs`
- `.opencode/` configuration, adapters, budget guard, doctor, and tests.
- `opencode.json`

## Implementation Steps

1. Add optional compatible continuity and requirement contract fields.
2. Add an atomic compact continuity command and Markdown projection.
3. Add architecture, maintenance, validation, smell, test, QA, and release
   checks to canonical role contracts.
4. Make monetary limits one-time advisory warnings by default.
5. Make Graphify opt-in and remove the literal Vercel credential.
6. Add contract evaluations and architecture fitness regression tests.
7. Run focused and full harness verification without changing product code.

## Verification

- `node --check harness/control/scripts/nexo-work.mjs`
- `node --check harness/control/scripts/control-engine.mjs`
- `node --check harness/control/scripts/evaluate-agent-response.mjs`
- `node --test .opencode/tests/*.test.js`
- `node harness/control/scripts/nexo-work.mjs doctor`
- `node .opencode/scripts/opencode2-doctor.mjs`
- `git diff --check`

## Risks

- Preserve all pre-existing worktree changes.
- Do not migrate historical task records or rewrite evidence.
- Do not claim semantic quality from regex checks alone.
- Do not activate Graphify or external services implicitly.

## Acceptance Criteria

- Normal work continuity uses one canonical JSON record plus a generated
  readable projection.
- Resume requires an explicit selected task and never chooses solely by recency.
- Controlled work retains fail-closed security and evidence gates.
- Planning, build, and QA explicitly cover requirements and long-term
  maintenance.
- Default budget behavior never aborts a useful session.
- No literal token remains in versioned OpenCode configuration.

## Required Gates

- QA review: required
- Security review: required because credential and authorization behavior change
- User confirmation: required only for commit, push, deploy, or external token
  revocation

