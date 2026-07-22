# nexo-memory-resume

## Purpose

Resume a Nexo work session from the repository memory instead of prior chat.

## Steps

1. Read `AGENTS.md`.
2. Run the current surface adapter from `AGENTS.md`: `.codex/scripts/` for
   ChatGPT/Codex or `.opencode/scripts/` for OpenCode.
3. If it succeeds, read that surface's `state/session-context.json` and use its
   task, source paths, constraints, verification, and next action.
4. If it fails, conflicts, is stale, or is insufficient, read the full fallback
   in `AGENTS.md`: README, workflow, tasks, active plan/latest report, today's
   journal, CURRENT, and NEXT.
5. Identify the focused task, evidence locations, and report destination.

## Output

A short working summary that names the task ID, status, objective, plan or
handoff, constraints, expected verification, exact next action, and where the
session report or closeout will be written.
