# nexo-log-work

## Purpose

Record milestone evidence: releases, incidents, durable decisions, migrations,
external changes, and task closure. Routine fast and normal work is not logged
in the control plane.

## Where To Log

- Live state: `harness/control/README.md`, `tasks.md`, `state/CURRENT.md`,
  `state/NEXT.md`.
- Session evidence: `harness/control/reports/YYYY-MM-DD/`.
- Final evidence: `harness/control/closeouts/`.
- Append-only notes: `harness/control/journal/YYYY-MM-DD.md`.
- Durable implementation context: `harness/control/implementations/`.
- Investigations: `harness/control/investigations/`.

## Rules

- Do not rewrite historical reports or closeouts unless explicitly correcting
  them.
- Create a new report only for a milestone or required controlled-task gate.
- Include commands, checks, files changed, open items, and recommended next
  step.
- Record skipped checks with the reason.
