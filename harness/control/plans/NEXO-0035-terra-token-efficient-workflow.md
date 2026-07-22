# NEXO-0035 - Terra Token-Efficient Agent Workflow

## Objective

Reduce paid token usage in Nexo OpenCode sessions that use GPT 5.6 Terra while
preserving deep reasoning for risky decisions and preserving code quality
through deterministic context assembly, scoped tool output, and unchanged
verification gates.

## Baseline Findings

- The current `nexo:resume` path asks the agent to read roughly 48,700
  characters across startup, live-state, agent, plan, and journal files. Using
  the conservative four-characters-per-token estimate, this is about 12,200
  input tokens before code or tool results.
- `README.md`, `tasks.md`, and `state/CURRENT.md` currently disagree about the
  focused task. Resolving that conflict consumes reasoning and also makes cost
  attribution unreliable.
- `.opencode/plugins/isyte-ops.js` injects up to 2,800 characters of FIAD
  context through `experimental.chat.system.transform` for every OpenCode
  session, including Nexo-only sessions.
- The budget guard records input, output, reasoning, cache-read, and cache-write
  tokens, but enforces only USD limits and assigns cost to the last active
  `NEXO-*` row when several tasks are active.
- No local `.opencode/state/budget-ledger.json` exists, so there is not yet a
  real paid-run baseline.
- The local `opencode` executable cannot currently start because its package
  postinstall step was not run. Repairing the local installation is a separate
  environment change and should be explicitly approved.
- OpenCode Zen documents Terra as `opencode/gpt-5.6-terra`. At the time of this
  plan, the published price at up to 272K context is $2.50/M input, $15/M
  output, $0.25/M cached read, and $3.125/M cached write.

## Done When

- The default Nexo OpenCode model is `opencode/gpt-5.6-terra`, or the exact
  account-visible Terra ID discovered by `/models` if it differs.
- Agent profiles use low text verbosity and risk-based reasoning effort:
  `medium` for deterministic resume/report work, `high` for normal
  plan/build/QA, and `xhigh` only for architecture, security, cross-module data
  changes, stubborn diagnosis, or a final high-risk review.
- Startup uses one deterministic focus record and a generated session context
  packet capped at 10,000 characters (approximately 2,500 tokens), rather than
  loading all live-state files by default.
- The context packet identifies the task, plan/handoff, acceptance criteria,
  constraints, latest evidence, verification commands, and exact source paths;
  it fails closed when those sources conflict or are stale.
- FIAD context is injected only for FIAD/Isyte sessions and never into an
  ordinary Nexo session.
- Budget attribution binds each OpenCode session to an explicit task ID rather
  than selecting the last active row.
- The ledger reports cost and token classes by session, task, model, agent, and
  phase so regressions can be found without asking the model to analyze raw
  logs.
- Agent instructions require search-first, narrow file reads, bounded command
  output, targeted tests during iteration, and one full relevant validation at
  the acceptance gate.
- Synthetic tests cover context generation, stale/conflicting state, FIAD
  isolation, explicit session/task binding, token accounting, and the existing
  soft/hard cost behavior.
- A paid A/B benchmark is run only after explicit user approval and shows a
  smaller bootstrap context without lowering the acceptance pass rate or
  removing any required QA/security gate.

## Scope

- Nexo/OpenCode model and agent profiles.
- Deterministic focus/session-context generation.
- OpenCode Nexo and FIAD context plugins.
- Budget ledger attribution and reporting.
- Startup and tool-output guidance in canonical agent workflow docs.
- Synthetic verification and an optional, separately approved paid benchmark.

## Out Of Scope

- Backend, frontend, database, fixture, or production infrastructure changes.
- Reducing or skipping tests, type checks, schema validation, QA, or security
  review to save tokens.
- Using a weaker model for implementation.
- Reinstalling OpenCode or running paid Terra requests without explicit user
  approval.
- Commit, push, deploy, or external provider budget changes.

## Steps

1. Add a small canonical focus record with one default focused task and links
   to the plan, handoff, latest report, constraints, and next action.
2. Build a deterministic context compiler that validates the focus record
   against `tasks.md` and its linked sources, then emits a bounded local packet
   under `.opencode/state/` without invoking an LLM.
3. Change Nexo resume/startup adapters to read `AGENTS.md` plus the compiled
   packet first, and open full control-plane sources only when the packet is
   missing, stale, contradictory, or insufficient for the current decision.
4. Remove unconditional FIAD system injection; mark FIAD sessions at command
   start and inject FIAD context only for those sessions and their compactions.
5. Bind budget ledger entries to an explicit task per session and add
   model/agent/phase token summaries while keeping current USD soft/hard
   enforcement.
6. Configure Terra per agent with low text verbosity and the risk-based
   reasoning policy. Verify supported effort variants from `/models` after the
   local OpenCode installation is repaired.
7. Add a canonical tool-output policy: use targeted search before reads, avoid
   repository-wide dumps, cap logs, keep full logs outside model context, run
   focused tests while iterating, and run the full relevant gate once.
8. Add synthetic tests and validate config/agents without a paid model call.
9. After separate approval, benchmark one small diagnosis and one cross-module
   change against the current workflow. Compare accepted-result cost, input,
   cached input, reasoning, output, tool turns, and validation outcome.
10. Complete QA and security review before closing the task.

## Progress

- 2026-07-15: Repository-specific baseline reviewed; plan and implementation
  handoff created. No OpenCode configuration or plugin behavior changed.
- 2026-07-15: User approved local implementation. Added deterministic focus
  compilation, compact startup/fallback rules, FIAD session isolation, explicit
  session/task budget attribution, model/agent/phase summaries, and Terra
  risk tiers. All 18 synthetic tests pass without a paid model call. Runtime
  `opencode debug config` remains gated by repair of the broken local CLI.

## Decision Log

- 2026-07-15: Optimize context before lowering reasoning effort. The main
  target is duplicated/stale input, not useful deliberation.
- 2026-07-15: Keep Terra for all reasoning tiers. Change effort by risk instead
  of switching implementation to a weaker model.
- 2026-07-15: Prefer deterministic context compilation over an extra summarizer
  agent, because a summarizer adds another paid turn and can lose constraints.
- 2026-07-15: Measure cost per accepted result, not token count alone.
- 2026-07-15: Treat tests and validation as quality gates, not token-saving
  candidates.

## Risks

- A context packet that is short but stale can produce confident bad changes;
  freshness and source-link validation must fail closed.
- Provider-supported reasoning variants may differ for Terra; configuration
  must be validated against the account-visible model metadata.
- Prompt-cache behavior changes the dollar savings even when token reduction is
  stable; report cached and uncached input separately.
- Removing unconditional FIAD injection could harm FIAD sessions unless session
  marking and compaction tests cover the full lifecycle.
- Existing multiple-active-task state can misattribute baseline data until
  explicit session/task binding is implemented.

## Verification

- Measure generated startup packet size and require `<= 10,000` characters.
- Run all `.opencode/tests/*.test.js` synthetic tests.
- Run `opencode debug config` and agent-resolution checks after the local CLI is
  repaired.
- Verify a Nexo session contains no `FIAD canonical context` block.
- Verify a FIAD session retains canonical context before and after compaction.
- Verify two concurrent sessions bound to different task IDs are accounted
  separately.
- Compare targeted and full validation results before/after; no required gate
  may be removed.
- Paid benchmark requires explicit approval and a new session report.

## External References

- OpenCode Zen model ID and pricing: <https://opencode.ai/docs/zen>
- OpenCode per-agent model/options: <https://dev.opencode.ai/docs/agents/>
- OpenCode model variants: <https://dev.opencode.ai/docs/models/>
