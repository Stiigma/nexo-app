# Nexo Agents

This directory is the canonical agent registry for Nexo. `nexo` is the
user-facing orchestrator; the other Nexo agents are internal technical roles
for Codex, OpenCode, and humans. `.opencode/` files are adapters and must defer
to these documents.

## Risk-Tiered Startup

Every agent starts by reading `AGENTS.md` and classifying the request. `nexo`
handles self-contained fast and normal work directly without context
compilation. Registered, prolonged, controlled, or cross-agent work runs the
current surface adapter and reads its validated packet. Expiry is a warning
when status, links, and hashes remain valid; contradictions or changed sources
require the complete fallback source list in `AGENTS.md`.

Before controlled work, identify the task ID, status, plan or handoff,
verification, rollback, approvals, and milestone evidence.

## Model Reasoning Policy

- Use low text verbosity: `gpt-5.6-terra` in ChatGPT/Codex and
  `openai/gpt-5.6-sol` in OpenCode.
- Use `medium` by default, including Plan Mode and direct fast/normal work.
- Reserve `high` specialists for complex or controlled specification,
  planning, design, build, QA, and infrastructure.
- Reserve `xhigh` for controlled security, architecture, cross-module data
  changes, stubborn diagnosis, or a final high-risk review.
- Keep deterministic tests and acceptance gates unchanged at every tier.

## Agent Selection

All Nexo requests enter through `nexo`. It handles fast and normal work
directly, and routes complex or controlled work by the next required artifact:

| Request type | Specialist |
| --- | --- |
| Requirements, stories, acceptance criteria, traceability | `nexo-spec` |
| Product or technical planning | `nexo-plan` |
| Code or config implementation | `nexo-build` |
| Visible UI, UX, screens, flows, forms, states, accessibility | `nexo-design` |
| Test, readiness, release, data quality, acceptance review | `nexo-qa` |
| Docker, Kubernetes, CI/CD, deploy, scripts, runbooks | `nexo-infra` |
| Secrets, auth, permissions, privacy, data exposure, security posture | `nexo-security` |

When multiple roles apply, `nexo` invokes the narrowest specialist that can
produce the next artifact, but only after the delegation consent contract
below. It validates the result before selecting another role.

## Delegation Rules

Only `nexo` delegates Nexo work:

| Agente | Puede delegar a |
|---|---|
| `nexo` | `nexo-resume`, `nexo-spec`, `nexo-plan`, `nexo-design`, `nexo-build`, `nexo-qa`, `nexo-infra`, `nexo-security` |

**Reglas de delegación:**

1. `nexo` must provide an actionable task and expected output before delegating.
2. El agente delegado debe tener un handoff, investigation, o tarea clara con
   criterios de aceptación y verificación conocidos.
3. Specialists must not delegate; they return evidence to `nexo`.
4. `nexo` verifies delegated work before continuing or reporting completion.
5. Before invocation, `nexo` discloses one specialist's purpose, exact model,
   reasoning effort, and shared ChatGPT/Codex agentic-quota consumption, then
   waits for explicit approval.
6. An explicit "usa un subagente" request approves one delegation after that
   disclosure. A handoff or next-role assignment is not approval.
7. Each approval is single-use and does not authorize follow-on delegation.
8. Delegation does not remove `nexo`'s responsibility for required milestone
   evidence. README/CURRENT/NEXT change only when the actual focus changes.
9. Commit, push, deploy, o cambios en el entorno externo siempre requieren
   confirmación explícita del usuario, incluso cuando son ejecutados por un
   subagente delegado.

A handoff is an artifact created by `nexo`; delegation is a separate model
session with its own context and consumption. Codex delegates with Terra
`medium` and a one-thread cap. OpenCode keeps Sol `high`/`xhigh` specialists
behind `task: ask`; OpenAI OAuth draws from the shared agentic quota, while an
API key would be billed separately.

## Common Contracts

- Keep `harness/control/` canonical.
- Use stable task IDs such as `NEXO-0004` for controlled, prolonged, or
  cross-agent work.
- Do not overwrite historical reports, closeouts, or journals.
- Controlled, prolonged, or cross-agent plan-to-build transitions use a handoff in
  `harness/control/handoffs/HOFF-YYYY-MM-DD-slug.md`.
- Reports, closeouts, journals, and implementation records are milestone
  evidence, not per-session requirements.
- Durable infrastructure conventions require an ADR.
- Commit, push, deploy, or external environment changes require explicit user
  confirmation.
- Never write real secrets. Use placeholders and templates.
- Kubernetes, CI/CD, deploy, and security-sensitive changes require QA and
  security review before close.

## Agent Files

- `nexo.md` - sole user-facing orchestrator and gate owner.
- `nexo-plan.md` - non-mutating planner.
- `nexo-build.md` - implementation executor.
- `nexo-spec.md` - requirements engineer.
- `nexo-design.md` - UX/UI planner.
- `nexo-qa.md` - QA and release readiness reviewer.
- `nexo-infra.md` - infrastructure executor with strict guardrails.
- `nexo-security.md` - security reviewer and threat-modeling agent.
