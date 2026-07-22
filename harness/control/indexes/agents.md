# Agent Index

| Agent | File | Primary responsibility |
| --- | --- | --- |
| `nexo-plan` | `../agents/nexo-plan.md` | Non-mutating product and technical planning. |
| `nexo-build` | `../agents/nexo-build.md` | Code and config implementation from handoff or diagnosis. |
| `nexo-spec` | `../agents/nexo-spec.md` | Requirements, stories, acceptance criteria, traceability. |
| `nexo-design` | `../agents/nexo-design.md` | UX/UI screens, flows, states, forms, accessibility. |
| `nexo-qa` | `../agents/nexo-qa.md` | QA, acceptance, data quality, release readiness. |
| `nexo-infra` | `../agents/nexo-infra.md` | Docker, Kubernetes, CI/CD, deploy, scripts, runbooks. |
| `nexo-security` | `../agents/nexo-security.md` | Secrets, auth, permissions, privacy, data exposure. |
| `fiad-plan` | `../agents/fiad-plan.md` | FIAD product and technical planning. |
| `fiad-build` | `../agents/fiad-build.md` | FIAD code and config implementation from handoff or diagnosis. |
| `fiad-spec` | `../agents/fiad-spec.md` | FIAD requirements, stories, acceptance criteria, traceability. |
| `fiad-design` | `../agents/fiad-design.md` | FIAD UX/UI screens, flows, states, forms, accessibility. |
| `fiad-qa` | `../agents/fiad-qa.md` | FIAD QA, acceptance, data quality, release readiness. |
| `fiad-infra` | `../agents/fiad-infra.md` | FIAD Docker, Kubernetes, CI/CD, deploy, scripts, runbooks. |
| `fiad-security` | `../agents/fiad-security.md` | FIAD secrets, auth, permissions, privacy, data exposure. |

## Selection Rules

- Requirements/spec changes route to `nexo-spec`.
- Product/technical planning routes to `nexo-plan`.
- Code/config implementation routes to `nexo-build`.
- Visible UI/UX routes to `nexo-design`.
- Test/readiness/release review routes to `nexo-qa`.
- Docker/Kubernetes/CI/CD/deploy/runbooks route to `nexo-infra`.
- Secrets/auth/security/privacy route to `nexo-security`.
