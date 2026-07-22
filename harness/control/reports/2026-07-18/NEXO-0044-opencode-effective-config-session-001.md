# NEXO-0044 Report - OpenCode Effective Configuration Session 001

## Metadata

- Date: 2026-07-18
- Agent: `nexo-build`
- Task: `NEXO-0044`
- Status: closed

## What Was Done

- Reproduced the active OpenCode CLI failure caused by a missing platform
  binary postinstall.
- Ran the installed package's bundled postinstall without changing its version.
- Reproduced the stale Terra model assertion in the OpenCode config tests.
- Configured `openai/gpt-5.6-sol` globally and for the existing Nexo reasoning
  tiers.
- Removed the invalid nested Graphify declaration and retained automatic plugin
  discovery.
- Scoped `nexo-plan` edits to `harness/control/**` while keeping shell access
  denied and delegation restricted to build and infra.
- Updated the model and plugin regression tests.

## Files Changed

- `opencode.json`
- `.opencode/opencode.json`
- `.opencode/agents/nexo-plan.md`
- `.opencode/tests/opencode-config.test.js`
- `harness/control/agents/README.md`
- `harness/control/tasks.md`
- `harness/control/plans/NEXO-0044-opencode-effective-config.md`
- `harness/control/handoffs/HOFF-2026-07-18-opencode-effective-config.md`
- NEXO-0044 report, QA, security, implementation, closeout, journal, and live
  state records
- Derived `graphify-out/` code graph artifacts

## Verification Performed

- `opencode --version`: `0.0.0-dev-202607181600`.
- `node --test .opencode/tests/opencode-config.test.js`: 4 passed, 0 failed.
- `node --test .opencode/tests/*.test.js`: 19 passed, 0 failed.
- `opencode debug config`: resolves `openai/gpt-5.6-sol`, three valid local
  plugins, and no duplicate/nonexistent Graphify origin.
- `opencode debug agent nexo-plan`: resolves Sol/High and edit deny-all followed
  by allow `harness/control/**`.
- `opencode debug startup`: completed in approximately 798 ms.
- `opencode mcp list`: Chrome DevTools and GitHub connected.
- `node .opencode/scripts/build-session-context.mjs`: succeeded with 4,148
  characters and an estimated 1,037 tokens.
- `graphify update .`: rebuilt the AST graph with 8,768 nodes and 10,732 edges.
  It reported non-blocking existing coverage gaps for 11 zero-node files and
  nine SQL files without the optional SQL parser.

## Open Items

- Restart the current OpenCode application before expecting config-time changes
  in a new session.
- Replace unpinned/deprecated MCP commands in a separate task.
- Build the single-chat orchestrator and structured state engine in later tasks.
- Run any paid model A/B benchmark only after separate user approval.

## Recommended Next Step

Restart OpenCode, then begin the next harness tracer-bullet task without
combining it with MCP replacement or control-engine migration.
