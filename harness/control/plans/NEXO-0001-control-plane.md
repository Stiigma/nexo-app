# NEXO-0001 - Enriched Operational Control Plane

## Objective

Create `harness/control/` as the operational command center for Nexo work so a
new agent or human can continue the project without relying on prior chat.

## Done When

- `AGENTS.md` points Codex and OpenCode to the control workflow.
- `harness/control/README.md` shows current state and next steps.
- `harness/control/WORKFLOW.md` defines operating rules.
- `harness/control/tasks.md` lists task state.
- Plans, reports, closeouts, journal, and templates exist.
- The initial task has a report and closeout.

## Scope

- Create the control-plane directory structure.
- Create initial live-state documents.
- Create reusable templates.
- Record this task as closed.

## Out Of Scope

- Building the application backend, frontend, infrastructure, or test harness.
- Replacing `NEXO_PROJECT.md` as the product source document.
- Adding automation around the control plane.

## Steps

1. Inspect existing repository structure and project source document.
2. Create `AGENTS.md`.
3. Create `harness/control/` directories.
4. Create README, workflow, tasks, plan, report, closeout, journal, and
   templates.
5. Verify a fresh session can find active state, closed tasks, and next steps.

## Progress

- 2026-06-29: Repository inspected. Only `NEXO_PROJECT.md` contained product
  source context.
- 2026-06-29: Control plane files created.
- 2026-06-29: Task closed after file-level verification.

## Decision Log

- 2026-06-29: Use `NEXO-0001` for the control-plane setup task.
- 2026-06-29: Use ASCII-only documentation to match the existing repository
  style.
- 2026-06-29: Treat `README.md` and `tasks.md` as live state; treat reports,
  closeouts, and journal as historical records.

## Verification

- Confirm required files exist.
- Confirm a reader can answer:
  - What is the current state?
  - What task was completed?
  - What is the recommended next step?
  - Where are the latest report, closeout, and journal?

