# nexo-close-task

## Purpose

Close a completed task with durable evidence and correct live state.

## Steps

1. Confirm done-when criteria and verification are satisfied.
2. Create a session report if the final work block has no report.
3. Create one closeout under `harness/control/closeouts/`.
4. For a governed task, update its evidence paths and verification list, then
   run `control-engine.mjs transition --task TASK-ID --to closed` while the task
   and manifest both remain `implemented`.
5. Only after an allowed decision, update `tasks.md` and the manifest to
   `closed`.
6. Synchronize the manifest and task index. Do not use legacy CURRENT/NEXT as
   resume sources.
7. Append a journal entry only when closure is a durable milestone.

## Rules

- Do not close if verification is missing and the task required it.
- Do not close gated infra or security-sensitive work without QA/security
  review records.
- Do not bypass a blocked or invalid control-engine decision.
- Record remaining follow-up instead of silently carrying it forward.
