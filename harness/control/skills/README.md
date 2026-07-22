# Nexo Skills

This directory defines reusable control-plane skills. They are canonical for
Codex, OpenCode, and humans. OpenCode skill files are adapters and should point
back here instead of redefining behavior.

## Skill Index

| Skill | Purpose |
| --- | --- |
| `nexo-memory-resume.md` | Resume from the control-plane memory. |
| `nexo-start-task.md` | Create or activate a task. |
| `nexo-log-work.md` | Record meaningful work and decisions. |
| `nexo-handoff.md` | Create implementation-ready handoffs. |
| `nexo-close-task.md` | Close completed tasks with evidence. |
| `nexo-select-architecture.md` | Select the smallest justified architecture and record its decision evaluation. |
| `nexo-select-dependency.md` | Select or reject dependencies with exact identity and supply-chain evidence. |
| `nexo-requirements-trace.md` | Maintain requirements and traceability. |
| `nexo-qa-review.md` | Perform QA and release-readiness review. |
| `nexo-security-review.md` | Perform security review and risk recording. |
| `nexo-design-spec.md` | Produce UX/UI design specs for visible work. |
| `nexo-infra-guardrails.md` | Apply infrastructure and deployment guardrails. |
| `fiad-memory-resume.md` | Resume from FIAD ecosystem context. |
| `fiad-log-work.md` | Record FIAD work and decisions. |
| `fiad-handoff.md` | Create FIAD implementation-ready handoffs. |
| `fiad-close-task.md` | Close FIAD tasks with evidence. |
| `fiad-qa-review.md` | Review FIAD readiness and acceptance. |
| `fiad-security-review.md` | Review FIAD secrets, auth, permissions, and exposure. |

## Common Rule

Skills may update live control-plane state, but reports, closeouts, and journals
are historical. Add new records or append entries instead of overwriting past
evidence.
