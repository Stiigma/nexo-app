# HOFF-2026-07-18-single-chat-orchestrator

## Metadata

- Task ID: `NEXO-0045`
- Date: 2026-07-18
- Authoring agent: `nexo-plan`
- Receiving agent: `nexo-build`
- Status: completed

## Objective

Implement one visible Nexo orchestrator that owns routing and verification while
keeping each existing specialist internal and unable to delegate further.

## Context

`NEXO-0044` repaired and validated OpenCode but left multiple Nexo primary/all
agents and direct command-to-role routing. OpenCode now supports `mode:
subagent`, `hidden: true`, and ordered `permission.task` allowlists natively.
The existing context compiler already provides a deterministic, fail-closed
startup gate and must be reused rather than replaced in this task.

## Source Docs

- `AGENTS.md`
- `opencode.json`
- `harness/control/WORKFLOW.md`
- `harness/control/agents/README.md`
- `harness/control/agents/nexo-plan.md`
- `harness/control/agents/nexo-qa.md`
- `harness/control/plans/NEXO-0045-single-chat-orchestrator.md`
- OpenCode agent and command documentation retrieved on 2026-07-18

## Files To Create Or Modify

- `opencode.json`
- `.opencode/agents/nexo.md`
- `.opencode/agents/nexo-*.md`
- `.opencode/tests/orchestrator-config.test.js`
- `AGENTS.md`
- `harness/control/README.md`
- `harness/control/WORKFLOW.md`
- `harness/control/agents/README.md`
- `harness/control/agents/nexo.md`
- `harness/control/agents/nexo-plan.md`
- `harness/control/agents/nexo-qa.md`
- NEXO-0045 operational evidence files

## Implementation Steps

1. Add a canonical `nexo` role that owns classification, gate checks,
   delegation, specialist result validation, and the final user response.
2. Add the `nexo` OpenCode primary adapter with an explicit specialist
   allowlist.
3. Set all `nexo-*` adapters to hidden subagents and deny their Task tool.
4. Disable project-level built-in `build` and `plan` agents.
5. Route every `nexo:*` command to `nexo`; leave FIAD and compatibility commands
   unchanged.
6. Update canonical routing language so only `nexo` delegates.
7. Add focused tests and run all required verification.

## Verification

- Focused topology tests prove exactly one Nexo primary and no nested
  specialist delegation.
- Config tests prove every `nexo:*` command routes through `nexo`.
- Effective OpenCode diagnostics resolve the expected modes, models, and
  permissions.
- The full harness suite and context compiler remain green.

## Risks

- An overly broad orchestrator prompt could become a god object; keep role
  knowledge in canonical specialist modules and expose only routing policy.
- Disabling built-in primaries changes the selectable-agent list after restart.
- Runtime behavior cannot be model-smoke-tested without paid inference; use
  static and effective-config checks in this task.

## Acceptance Criteria

- The user interacts with one selectable Nexo agent.
- Specialists are hidden and can only be invoked by the orchestrator.
- Specialists cannot delegate to each other.
- Existing Nexo command names remain available and enter through `nexo`.
- FIAD configuration is unchanged.
- No dependency, product, deployment, or external environment changes occur.

## Required Gates

- QA review: required for routing and regression verification.
- Security review: required for tool and delegation permission changes.
- User confirmation: required only for commit, push, deploy, paid inference, or
  external changes; none are part of this handoff.
