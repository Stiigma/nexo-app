# nexo-memory-resume

## Purpose

Resume a Nexo work session from the repository memory instead of prior chat.

## Steps

1. Read `AGENTS.md`.
2. When continuing compact normal work, run `nexo-work continuity find`, ask
   for one exact selection when needed, then run `continuity resume --task`.
3. For controlled work, run the current surface adapter from `AGENTS.md`:
   `.codex/scripts/` for ChatGPT/Codex or `.opencode/scripts/` for OpenCode.
4. If it succeeds, read that surface's `state/session-context.json` and use its
   task, source paths, constraints, verification, and next action.
5. If it is expired but task status, links, and hashes validate, continue with
   the warning.
6. If it otherwise fails, conflicts, has changed sources, or is insufficient,
   read the selected manifest/projection first, then its named evidence. Read
   the full index/journal/legacy views only to repair a contradiction.
7. Identify the selected task and required milestone evidence locations.

## Output

A short working summary that names the explicitly selected task ID, status, objective, plan or
handoff, constraints, expected verification, exact next action, and required
milestone evidence.
