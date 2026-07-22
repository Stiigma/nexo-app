# NEXO-0045 - Single-Chat Nexo Orchestrator

## Objective

Make one visible Nexo agent own the user conversation, route work to hidden
specialists, enforce the existing control-plane gates, and return one coherent
result without nested delegation.

## Done When

- `nexo` is the only selectable Nexo primary agent in OpenCode.
- Built-in `build` and `plan` primaries are disabled for this project.
- Nexo role agents are hidden subagents and cannot invoke other subagents.
- Every `nexo:*` command enters through `nexo` while preserving its intent.
- The canonical agent registry defines routing, approval gates, delegation
  ownership, and failure behavior.
- Static topology tests, the complete harness suite, session-context
  compilation, and effective OpenCode agent diagnostics pass.

## Scope

- Add the canonical and OpenCode adapter definitions for `nexo`.
- Convert Nexo role adapters from selectable agents to hidden subagents.
- Remove plan/QA nested delegation and centralize delegation in `nexo`.
- Route existing Nexo commands through the orchestrator.
- Add regression tests for visibility, routing, and delegation constraints.
- Record implementation, QA, security, report, and closeout evidence.

## Out Of Scope

- Changing FIAD agent topology or commands.
- Replacing GitHub or Chrome DevTools MCP servers.
- Migrating all Markdown live state to a structured state machine.
- Changing product code, deployment state, or external environments.
- Running paid model inference or an orchestration quality benchmark.

## Steps

1. Register the task and create an implementation-ready handoff.
2. Define the canonical orchestrator interface and gate policy.
3. Add the OpenCode primary adapter and hide Nexo specialists.
4. Route Nexo commands through the orchestrator and disable built-in primaries.
5. Add focused topology and routing regression tests.
6. Run static, runtime, context, and Graphify verification.
7. Record QA/security decisions and close the task.

## Progress

- 2026-07-18: Registered the task and prepared the plan-to-build handoff.
- 2026-07-18: Added the native `nexo` primary facade, converted all Nexo roles
  to hidden non-delegating subagents, and routed all Nexo commands through the
  facade.
- 2026-07-18: Passed 23/23 harness tests, effective configuration diagnostics,
  compact-context compilation, QA, security review, and Graphify refresh.

## Decision Log

- 2026-07-18: Use OpenCode's native primary/subagent model because it directly
  supports one selectable agent, hidden specialists, and task allowlists;
  reject an additional orchestration framework because no durable or resumable
  graph execution is required for this slice.
- 2026-07-18: Use the Facade pattern for the user-facing `nexo` interface;
  avoid a Mediator implementation because direct, one-level delegation is
  easier to inspect and does not need peer-to-peer coordination.
- 2026-07-18: Preserve the existing validated context compiler as the
  deterministic startup gate and defer structured state migration.
- 2026-07-18: Run the orchestration facade at `medium`, with ordinary
  specialists at `high` and security at `xhigh`, so routing does not consume
  the same reasoning budget as execution.

## Risks

- Prompt-owned approval gates remain less strict than executable policy until
  the later structured control-engine task.
- Existing sessions require an OpenCode restart to load agent topology changes.
- One orchestrator turn adds model overhead when it delegates; simple status
  and mechanical requests should therefore be handled directly.

## Verification

- `node --test .opencode/tests/orchestrator-config.test.js`
- `node --test .opencode/tests/*.test.js`
- `node .opencode/scripts/build-session-context.mjs`
- `opencode debug config`
- `opencode debug agent nexo`
- `opencode debug agent nexo-build`
- `graphify update .`
