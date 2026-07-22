# NEXO-0045 Implementation - Single-Chat Orchestrator

## Metadata

- Task ID: `NEXO-0045`
- Date: 2026-07-18
- Agent: `nexo-build`
- Related plan: `../plans/NEXO-0045-single-chat-orchestrator.md`
- Related handoff: `../handoffs/HOFF-2026-07-18-single-chat-orchestrator.md`
- Related report: `../reports/2026-07-18/NEXO-0045-single-chat-orchestrator-session-001.md`

## Summary

Nexo now presents one OpenCode primary interface. The orchestrator owns routing,
validation, and the final response; existing roles remain deep internal modules
with hidden adapters and no ability to delegate further.

## Architecture And Pattern

- Architecture/technology: native OpenCode primary/subagent configuration over
  the existing Markdown control plane because current runtime features satisfy
  the topology; no orchestration framework was added.
- Pattern: Facade. `nexo` provides a narrow user interface over the specialist
  workflow while role knowledge stays in canonical specialist modules.
- Rejected Mediator and LangGraph because no peer coordination, resumable graph,
  or durable workflow execution is required in this slice.

## Behavior Changed

- `nexo` is the only selectable Nexo primary and runs at `medium`.
- Role specialists are hidden and use `medium`, `high`, or `xhigh` by risk.
- All Nexo commands enter through `nexo`.
- Only `nexo` may invoke specialists; specialists have Task denied.
- Budget command bindings identify the root agent as `nexo` and preserve phase
  attribution.

## Performance

- Simple status and mechanical work remain in the `medium` orchestrator to avoid
  an extra model turn.
- Non-trivial work pays one delegation turn to obtain role-specific `high` or
  `xhigh` reasoning.
- Runtime startup remained approximately 823 ms; no performance optimization or
  cache was introduced.

## Verification

- 4/4 focused topology tests and 23/23 complete harness tests pass.
- Effective config, representative agent permissions, context compilation, and
  startup diagnostics pass.

## Follow-Up

- Implement executable structured transition gates.
- Pin or replace mutable/deprecated MCP commands.
