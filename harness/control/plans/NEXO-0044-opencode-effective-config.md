# NEXO-0044 - Repair And Validate Effective OpenCode Configuration

## Objective

Restore the active OpenCode executable and make the project configuration,
runtime resolution, and regression tests agree on one available model and one
valid Graphify plugin origin.

## Done When

- The active `opencode` executable reports its version successfully.
- The project defaults to `openai/gpt-5.6-sol` with the existing risk-tiered
  variants and low text verbosity.
- Effective config contains no nonexistent or duplicate Graphify plugin path.
- `nexo-plan` can write control-plane artifacts without editing product code.
- OpenCode config tests and the complete local harness test suite pass.
- `opencode debug config` resolves the expected model, plugins, and planner
  permissions without startup errors.

## Scope

- Repair the already-installed active OpenCode package by running its bundled
  postinstall script.
- Update project OpenCode configuration and its regression tests.
- Correct the OpenCode planner adapter permission contradiction.
- Record verification and operational evidence.

## Out Of Scope

- Creating the single-chat orchestrator.
- Replacing GitHub or browser MCP servers.
- Migrating the Markdown control plane to a structured state machine.
- Running paid model inference or an A/B benchmark.
- Changing ChatGPT/Codex model defaults.

## Steps

1. Reproduce the executable and configuration failures independently.
2. Repair the active OpenCode binary without changing its installed version.
3. Align project config and tests with an available Sol model.
4. Remove the invalid nested Graphify declaration and restrict planner writes.
5. Run focused tests, the full harness suite, and runtime config diagnostics.
6. Write the report, implementation record, closeout, and journal evidence.

## Progress

- 2026-07-18: Reproduced the missing postinstall binary and the failing model
  assertion; repaired the active binary and began the scoped config correction.
- 2026-07-18: Configured Sol, removed the invalid Graphify origin, scoped
  planner writes to the control plane, and passed all static and runtime gates.

## Decision Log

- 2026-07-18: Keep the installed OpenCode dev version and run its own
  `postinstall.mjs` rather than reinstalling or changing versions.
- 2026-07-18: Use `openai/gpt-5.6-sol`, which the repaired runtime advertises,
  instead of preserving the stale `opencode/gpt-5.6-terra` test expectation.
- 2026-07-18: Rely on project plugin auto-discovery for Graphify instead of
  maintaining a duplicate explicit plugin path in nested config.

## Risks

- OpenCode configuration is loaded only at process startup, so existing
  sessions will not receive the corrected config until restart.
- The project still has globally enabled, unpinned MCP servers; replacement is
  intentionally deferred to a separate task.

## Verification

- `opencode --version`
- `node --test .opencode/tests/opencode-config.test.js`
- `node --test .opencode/tests/*.test.js`
- `opencode debug config`
- `opencode models`
- `opencode mcp list`
