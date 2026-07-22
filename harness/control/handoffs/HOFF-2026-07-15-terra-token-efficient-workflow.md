# HOFF-2026-07-15-terra-token-efficient-workflow

## Metadata

- Task ID: `NEXO-0035`
- Date: 2026-07-15
- Authoring agent: `nexo-plan`
- Receiving agent: `nexo-build`
- Status: Ready for user-approved implementation

## Objective

Implement the deterministic, token-efficient OpenCode workflow described in
`NEXO-0035`, using GPT 5.6 Terra without weakening reasoning or code-quality
gates.

## Context

Current startup guidance loads approximately 12,200 tokens before code, FIAD
context is injected into unrelated Nexo sessions, live-state sources disagree,
and the budget guard assigns work to the last active task row. The solution is
a small validated focus contract, a deterministic context packet, scoped
context injection, explicit task binding, and risk-tiered Terra effort.

## Source Docs

- `AGENTS.md`
- `harness/control/README.md`
- `harness/control/WORKFLOW.md`
- `harness/control/agents/README.md`
- `harness/control/agents/nexo-build.md`
- `harness/control/skills/nexo-memory-resume.md`
- `harness/control/plans/NEXO-0035-terra-token-efficient-workflow.md`
- `harness/control/implementations/NEXO-0025-opencode-budget-guard-delegation.md`
- `harness/control/state/budget-policy.json`
- `.opencode/plugins/nexo-budget-guard.js`
- `.opencode/plugins/isyte-ops.js`
- `.opencode/tests/nexo-budget-guard.test.js`
- `opencode.json`
- OpenCode model and agent docs linked from the plan.

## Files To Create Or Modify

- Create `harness/control/state/focus.json`.
- Create `.opencode/scripts/build-session-context.mjs`.
- Create `.opencode/tests/session-context.test.js`.
- Create `.opencode/tests/isyte-ops.test.js`.
- Modify `.opencode/.gitignore` for generated session context only.
- Modify `.opencode/plugins/isyte-ops.js`.
- Modify `.opencode/plugins/nexo-budget-guard.js`.
- Modify `.opencode/tests/nexo-budget-guard.test.js`.
- Modify `.opencode/agents/nexo-*.md` only where model/effort or startup rules
  require it.
- Modify `opencode.json`.
- Modify `harness/control/state/budget-policy.json`.
- Modify `harness/control/skills/nexo-memory-resume.md`.
- Modify `harness/control/WORKFLOW.md`, `harness/control/agents/README.md`, and
  `AGENTS.md` only after the compiled-context fallback preserves every current
  governance rule.
- Create an implementation record and session report; update live state.

## Implementation Steps

1. Preserve all unrelated dirty work and snapshot the exact relevant diffs.
2. Define and validate the `focus.json` schema. It must name one default task,
   links, constraints, freshness time, and the expected verification/report.
3. Implement the deterministic context builder with a hard 10,000-character
   output cap and source/freshness checks. Generated output stays ignored under
   `.opencode/state/`.
4. Update Nexo startup to prefer the validated packet, with an explicit
   full-control-plane fallback on missing/stale/conflicting data.
5. Gate FIAD system and compaction context by an explicit FIAD session marker;
   retain `fiad:*` and `isyte:*` command behavior.
6. Replace last-active-row budget attribution with an explicit session/task
   binding and aggregate token/cost metrics by model, agent, and phase.
7. Configure `opencode/gpt-5.6-terra`, low text verbosity, and supported
   risk-tiered reasoning effort. Do not guess unsupported variants.
8. Add search-first, narrow-read, bounded-output, and targeted-then-full-test
   guidance without removing any acceptance, QA, or security requirement.
9. Run synthetic tests and local config checks. Do not invoke a paid model.
10. Create implementation/report records and request QA plus security review.
11. If the user separately approves a paid benchmark, run it and record results
    in a new report rather than editing the implementation report.

## Verification

- Generated context is valid, deterministic, and no more than 10,000
  characters.
- Stale, missing, or contradictory focus sources fail closed to full resume.
- Existing budget-guard tests remain green; new multi-task/session tests pass.
- Nexo context contains no FIAD block; FIAD context survives compaction.
- OpenCode config resolves Terra and each configured agent after the local CLI
  is repaired.
- Existing cost soft/hard limits still behave as documented.
- No product tests or quality gates are removed.

## Risks

- `experimental.*` OpenCode plugin hooks can change; validate against the
  installed version before relying on lifecycle details.
- The root and `harness/` worktrees already contain extensive user changes;
  implementation must use narrow patches and avoid cleanup/reverts.
- Fixing the current OpenCode postinstall changes the local environment and is
  not authorized by this handoff alone.
- A paid benchmark can exceed the current $0.50 session hard limit if reasoning
  is unconstrained; approve the benchmark design before the call.

## Acceptance Criteria

- Bootstrap context is reduced from the measured approximately 12,200 tokens
  to at most approximately 2,500 tokens in the normal path.
- Terra remains the implementation model and high reasoning remains the normal
  plan/build setting.
- `xhigh` is automatically or explicitly selected for documented high-risk
  categories, subject to model support.
- Context conflicts stop the compact path rather than being silently resolved.
- Budget attribution is correct with multiple active tasks and sessions.
- All synthetic tests and OpenCode config/agent checks pass.
- QA finds no reduction in acceptance coverage; security confirms context
  scoping does not expose unrelated project data.

## Required Gates

- QA review: Required before close.
- Security review: Required before close because context selection changes what
  repository data may be sent to the provider.
- User confirmation: Required before implementation, repairing/reinstalling the
  local OpenCode executable, any paid Terra benchmark, commit, push, or deploy.
