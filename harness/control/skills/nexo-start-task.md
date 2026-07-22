# nexo-start-task

## Purpose

Create or activate a task using a stable `NEXO-0000` ID.

## Steps

1. Find the next task ID in `harness/control/tasks.md`.
2. Create a plan under `harness/control/plans/` from
   `harness/control/templates/plan.md`.
3. Add or update the task row in `tasks.md`.
4. For a new non-trivial task, create `state/tasks/TASK-ID.json` with explicit
   requirements and evidence paths, then run the control-engine `inspect`
   command.
5. Update `harness/control/README.md` and `state/CURRENT.md`.
6. Append a journal entry describing the decision and source request.

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
