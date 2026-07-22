# Handoff - NEXO-0044 OpenCode Effective Configuration

## Objective

Repair and verify the effective OpenCode project configuration without changing
product code or expanding into the later harness-orchestrator work.

## Context

The active pnpm-installed OpenCode command failed because its platform binary
postinstall had not run. After repairing that installation in place, runtime
inspection showed that the project had no configured model and loaded one
nonexistent Graphify plugin origin from nested config. The existing test also
expected a stale provider/model ID.

## Source Documents

- `AGENTS.md`
- `harness/control/WORKFLOW.md`
- `harness/control/agents/README.md`
- `harness/control/plans/NEXO-0044-opencode-effective-config.md`
- `https://opencode.ai/config.json`

## Files To Create Or Modify

- `opencode.json`
- `.opencode/opencode.json`
- `.opencode/agents/nexo-plan.md`
- `.opencode/tests/opencode-config.test.js`
- NEXO-0044 control-plane records

## Implementation Steps

1. Configure the available `openai/gpt-5.6-sol` model globally and for the
   existing risk-tiered Nexo agents.
2. Remove the nested explicit Graphify plugin entry and rely on auto-discovery.
3. Permit `nexo-plan` edits only under `harness/control/**`.
4. Update regression tests to validate Sol and the absence of duplicate plugin
   configuration.
5. Run static and effective-runtime validation.

## Verification

- Focused OpenCode config tests pass.
- Complete `.opencode/tests` suite passes.
- Effective config has the configured Sol model, one Graphify origin, and
  scoped planner edit permission.
- MCP discovery remains operational.

## Risks

- Existing OpenCode sessions retain their startup config until restarted.
- No paid inference should be invoked as part of this task.

## Acceptance Criteria

- The executable starts and reports its installed version.
- Static config and effective runtime config agree.
- No invalid Graphify plugin origin remains.
- Planner writes are confined to the control plane.

## Receiving Agent

- `nexo-build`

## Required Gates

- QA: focused and complete harness tests.
- Security: no credentials, provider secrets, or external mutations introduced.
- User confirmation: already provided for repairing and validating the first
  harness task; commit, push, deploy, and paid inference remain unauthorized.
