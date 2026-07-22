# Nexo Agents

This directory is the canonical agent registry for Nexo. `nexo` is the
user-facing orchestrator; the other Nexo agents are internal technical roles
for Codex, OpenCode, and humans. `.opencode/` files are adapters and must defer
to these documents.

## Universal Startup

Every agent starts by reading `AGENTS.md`, running the current surface adapter
(`.codex/scripts/` for ChatGPT/Codex or `.opencode/scripts/` for OpenCode), and
reading that surface's validated `state/session-context.json` plus its matching
canonical agent or skill. If compilation fails or the packet is insufficient,
use the complete fallback source list in `AGENTS.md`.

Before changing files, identify the task ID, task status, plan or handoff,
expected verification, and where evidence will be written.

## Model Reasoning Policy

- Use low text verbosity: `gpt-5.6-terra` in ChatGPT/Codex and
  `openai/gpt-5.6-sol` in OpenCode.
- Use `medium` for the `nexo` orchestrator, deterministic resume, binding,
  summary, and compaction work.
- Use `high` for normal specification, planning, design, build, QA, and infra.
- Use `xhigh` for security and when architecture, cross-module data changes,
  stubborn diagnosis, or a final high-risk review requires it.
- Keep deterministic tests and acceptance gates unchanged at every tier.

## Agent Selection

All Nexo requests enter through `nexo`. It routes internally by the next
required artifact:

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
produce the next artifact, validates the result, and then selects the next role.

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
5. Delegation does not remove `nexo`'s responsibility to update live state
   (tasks.md, README.md, state/CURRENT.md, state/NEXT.md, journal).
6. Commit, push, deploy, o cambios en el entorno externo siempre requieren
   confirmación explícita del usuario, incluso cuando son ejecutados por un
   subagente delegado.

## Common Contracts

- Keep `harness/control/` canonical.
- Use stable task IDs such as `NEXO-0004`.
- Do not overwrite historical reports, closeouts, or journals.
- Every non-trivial plan-to-build transition uses a handoff in
  `harness/control/handoffs/HOFF-YYYY-MM-DD-slug.md`.
- Every completed work block writes a report or closeout.
- Code or config changes write an implementation record when the change needs
  future operational context.
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

## FIAD Agent Files

FIAD ecosystem work uses the same operating contract with `fiad-*` role names:

- `fiad-plan.md` - non-mutating FIAD planner.
- `fiad-build.md` - FIAD implementation executor.
- `fiad-spec.md` - FIAD requirements engineer.
- `fiad-design.md` - FIAD UX/UI planner.
- `fiad-qa.md` - FIAD QA and readiness reviewer.
- `fiad-infra.md` - FIAD infrastructure executor.
- `fiad-security.md` - FIAD security reviewer.
