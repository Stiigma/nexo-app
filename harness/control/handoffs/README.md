# Handoffs

Handoffs transfer work between agents without relying on chat history.

## File Name

```text
HOFF-YYYY-MM-DD-slug.md
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

## Usage

- `nexo-plan`, `nexo-spec`, `nexo-design`, and `nexo-infra` create handoffs.
- `nexo-build`, `nexo-qa`, `nexo-infra`, and `nexo-security` consume handoffs.
- Handoffs for security-sensitive or deployment-affecting work must name the
  QA and security gates required before close.
