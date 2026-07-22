# Routing Smoke Tests

Use these prompts to verify that `AGENTS.md`, `agents/README.md`, and
OpenCode commands route work to the intended agent.

| Sample prompt | Expected agent |
| --- | --- |
| "Add acceptance criteria for supplier payments." | `nexo-spec` |
| "Plan the implementation for garment inventory." | `nexo-plan` |
| "Implement the garment inventory API from this handoff." | `nexo-build` |
| "Design the sales checkout screen and empty states." | `nexo-design` |
| "Review whether this feature is ready to release." | `nexo-qa` |
| "Add Docker Compose for PostgreSQL and MinIO." | `nexo-infra` |
| "Review auth roles and exposed customer data." | `nexo-security` |
| "Resume the FIAD ecosystem context for SAL." | `fiad-plan` |
| "Implement a new local .NET FIAD service from the playbook." | `fiad-build` |
| "Review FIAD Google Drive and client credential exposure." | `fiad-security` |

## Pass Criteria

- The selected agent matches the expected agent.
- If multiple agents apply, the first agent produces the next required
  artifact rather than skipping ahead.
- Security-sensitive and deployment-affecting prompts include security and QA
  gates before close.
- FIAD prompts use `fiad-*` roles and start from `ecosystem/` plus
  `projects/<Project>/profile.md`.
