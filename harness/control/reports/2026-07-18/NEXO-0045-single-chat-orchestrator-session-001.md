# NEXO-0045 Report - Single-Chat Orchestrator Session 001

## Metadata

- Date: 2026-07-18
- Agent: `nexo-build`
- Task: `NEXO-0045`
- Status: closed

## What Was Done

- Added `nexo` as the sole selectable Nexo primary agent.
- Disabled the project-level built-in `build` and `plan` primaries.
- Converted eight Nexo role adapters to hidden subagents and denied Task for
  every specialist.
- Added an explicit orchestrator allowlist for resume, spec, plan, design,
  build, QA, infrastructure, and security.
- Routed all 12 existing `nexo:*` commands through `nexo` while preserving FIAD
  routing.
- Centralized delegation ownership in the canonical `nexo` module and removed
  delegation from plan and QA.
- Scoped spec/design writes to their document areas, QA/security writes to the
  control plane, and planner writes to the control plane.
- Updated budget attribution so command sessions are recorded against `nexo`
  while preserving the requested phase.
- Added topology, routing, no-nested-delegation, and document-scope tests.

## Files Changed

- `opencode.json`
- `.opencode/agents/nexo.md`
- `.opencode/agents/nexo-*.md`
- `.opencode/plugins/nexo-budget-guard.js`
- `.opencode/tests/orchestrator-config.test.js`
- `.opencode/tests/opencode-config.test.js`
- `.opencode/tests/nexo-budget-guard.test.js`
- `AGENTS.md`
- `harness/control/WORKFLOW.md`
- `harness/control/README.md`
- `harness/control/agents/*.md`
- NEXO-0045 plan, handoff, QA, security, implementation, closeout, journal, and
  live-state records
- Derived `graphify-out/` artifacts

## Verification Performed

- `node --test .opencode/tests/orchestrator-config.test.js`: 4 passed.
- `node --test .opencode/tests/*.test.js`: 23 passed, 0 failed.
- `node .opencode/scripts/build-session-context.mjs`: 4,148 characters,
  approximately 1,037 tokens.
- `opencode debug config`: built-in primaries disabled; `nexo` primary at
  `medium`; eight Nexo specialists hidden with `medium`, `high`, or `xhigh`;
  all 12 Nexo commands route to `nexo`.
- `opencode debug agent nexo`: explicit specialist allowlist, local edit/bash,
  external-directory approval, question access, and common publish/push asks.
- `opencode debug agent nexo-plan`, `nexo-build`, `nexo-spec`, and
  `nexo-security`: expected hidden modes, no Task, role-specific write scopes,
  and model variants.
- `opencode debug startup`: approximately 823 ms.
- `graphify update .`: 8,820 nodes, 10,782 edges, 903 communities.

## Open Items

- Restart OpenCode before relying on the new selectable-agent topology.
- Hidden subagents are removed from autocomplete but OpenCode does not provide a
  hard prohibition against a user invoking a known subagent name directly.
- Approval gates remain partly prompt-enforced until a structured control
  engine owns transitions and external-action policy.
- Existing mutable/deprecated MCP commands remain out of scope.
- No paid model invocation was used to benchmark delegation quality.

## Recommended Next Step

Implement a small structured control engine that validates task transitions and
required evidence before build, QA, security, and close operations.
