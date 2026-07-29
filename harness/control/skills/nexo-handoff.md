# nexo-handoff

## Purpose

Create a handoff that lets another agent execute without guessing.

A handoff is only an artifact written by `nexo`. Creating it does not invoke
another model and does not authorize delegation.

## File Name

Use:

```text
harness/control/handoffs/HOFF-YYYY-MM-DD-slug.md
```

## Required Fields

- Objective.
- Context.
- Source docs.
- Files to create or modify.
- Implementation steps.
- Verification.
- Risks.
- Acceptance criteria.
- Receiving agent.

## Rules

- Controlled, prolonged, or cross-agent plan-to-build transitions require a
  handoff.
- Return the completed handoff to `nexo`; do not start its receiving agent.
- Handoffs should be specific enough for `nexo-build`, `nexo-qa`,
  `nexo-infra`, or `nexo-security` to act without re-planning.
- Link requirements, ADRs, reports, investigations, and design specs when they
  are relevant.
- State explicit non-goals and user confirmations needed.
