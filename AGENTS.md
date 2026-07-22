# Nexo Agent Guide

This repository uses `harness/control/` as the operational control plane for
agent and human work. It is not a test harness. `harness/control/` is the
canonical source of truth for Codex, OpenCode, and humans.

Before starting work:

1. Read this `AGENTS.md`.
2. Run the adapter for the current surface:
   - ChatGPT/Codex app or CLI: `node .codex/scripts/build-session-context.mjs`,
     then read `.codex/state/session-context.json`.
   - OpenCode: `node .opencode/scripts/build-session-context.mjs`, then read
     `.opencode/state/session-context.json`.
3. Read the matching canonical agent or skill under `harness/control/` before
   acting.
4. When compilation fails, is stale/contradictory, or is insufficient for the requested
   decision, use the full fallback: read `harness/control/README.md`,
   `harness/control/WORKFLOW.md`, `harness/control/tasks.md`, the active task
   plan and latest report, today's journal, `state/CURRENT.md`, and
   `state/NEXT.md`.

If OpenCode is used, `.opencode/` provides adapters only. Read the matching
canonical agent or skill under `harness/control/` before acting.

Operational rules:

- Treat `harness/control/README.md` and `harness/control/tasks.md` as editable
  live state.
- Treat `harness/control/reports/`, `harness/control/closeouts/`, and
  `harness/control/journal/` as historical records.
- Do not overwrite historical reports or closeouts to update current state.
  Create a new report, append a journal entry, or make an explicitly requested
  correction.
- Every task must use a stable ID such as `NEXO-0001`.
- New non-trivial tasks created after `NEXO-0046` use a structured manifest at
  `harness/control/state/tasks/TASK-ID.json`. Run the read-only control engine
  before build, review, implemented, and closed transitions; blocked decisions
  must not be bypassed.
- Every work session must end with a report or closeout that records what
  changed, what was verified, what remains, and the recommended next step.
- `NEXO_PROJECT.md` is the product source document. `harness/control/`
  coordinates work on the project; it does not replace the product spec.
- Commit, push, deploy, or external environment changes require explicit user
  confirmation.
- Do not write real secrets. Use placeholders and templates for environment
  and credential examples.
- Search before broad reads, request bounded command output, run focused tests
  during iteration, and run the full relevant acceptance gate once. Token
  savings must never remove QA, security, schema, type, or test requirements.
- In ChatGPT/Codex, use Terra with `medium` for resume/status/mechanical work,
  `high` for normal build/plan/QA, and `xhigh` only for architecture, security,
  cross-module data changes, stubborn diagnosis, or final high-risk review.

## Agent Routing

Use `harness/control/agents/nexo.md` as the sole user-facing Nexo orchestrator.
It selects the next required artifact and may invoke one of the hidden canonical
specialists under `harness/control/agents/`. Specialists return to `nexo` and
must never delegate to another specialist.

## Handoff And Close Rules

- Every non-trivial plan-to-build transition uses a handoff under
  `harness/control/handoffs/HOFF-YYYY-MM-DD-slug.md`.
- Handoffs must include objective, context, source docs, files to create or
  modify, implementation steps, verification, risks, acceptance criteria, and
  receiving agent.
- Durable infrastructure conventions require an ADR.
- Kubernetes, CI/CD, deploy, and security-sensitive changes require QA and
  security review before close.
- Code or config changes that affect future work should create an
  implementation record under `harness/control/implementations/`.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
