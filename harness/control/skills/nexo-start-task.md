# nexo-start-task

## Purpose

Create or activate a controlled, prolonged, or cross-agent task using a stable
`NEXO-0000` ID. Fast and normal work does not use this skill.

## Steps

1. Find the next task ID in `harness/control/tasks.md`.
2. Create a plan under `harness/control/plans/` from
   `harness/control/templates/plan.md`.
3. Add or update the task row in `tasks.md`.
4. For a new controlled task, create `state/tasks/TASK-ID.json` with explicit
   requirements and evidence paths, then run the control-engine `inspect`
   command.
5. Update `harness/control/README.md`, `state/CURRENT.md`, and `state/NEXT.md`
   only if the actual focus changes.
6. Append a journal entry only when task creation is a durable decision or
   milestone.

## Required Plan Fields

- Objective.
- Done When.
- Scope.
- Out Of Scope.
- Steps.
- Risks.
- Verification.

## Verification

Confirm the task row, plan path, README active state, and journal entry all use
the same task ID. For a governed task, confirm manifest/task status and plan
synchronization are allowed by the control engine.
