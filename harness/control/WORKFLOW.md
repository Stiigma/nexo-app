# Control Workflow

Use this workflow for all Nexo work. The goal is continuity across agents and
sessions, not process overhead.

## 1. Start Of Session

1. Read `AGENTS.md`.
2. Run the current surface adapter from `AGENTS.md`: `.codex/scripts/` for
   ChatGPT/Codex or `.opencode/scripts/` for OpenCode.
3. If it succeeds, read that surface's `state/session-context.json` plus the
   matching canonical agent/skill and use the packet's exact source links.
4. If it fails or the packet cannot safely answer the current decision, read
   `harness/control/README.md`, this workflow, `tasks.md`, the active plan and
   latest report, today's journal, `state/CURRENT.md`, and `state/NEXT.md`.

Before changing files, identify:

- Current task ID.
- Task status.
- Plan to follow.
- Expected verification.
- Where the session report will be written.

## 2. Creating A Task

Create a stable ID in the format `NEXO-0001`, `NEXO-0002`, and so on. FIAD
ecosystem work uses the `FIAD-0001` prefix and the same status/reporting rules.

For each task:

- Add or update a row in `tasks.md`.
- Create a plan in `plans/` from `templates/plan.md`.
- For new non-trivial tasks after `NEXO-0046`, create
  `state/tasks/TASK-ID.json` using `state/tasks/README.md`. Its status must match
  the task row.
- Update `README.md` if this becomes the active task.
- Append a journal entry for the decision.

## 3. Planning

Plans are living documents while a task is active. They may be edited, but
important changes must be recorded in either:

- The plan's decision log.
- A session report.
- The daily journal.

A plan should state:

- Objective.
- Done when.
- Scope.
- Out of scope.
- Steps.
- Risks.
- Verification.

## 4. Execution

During execution:

- Keep changes scoped to the active task.
- Search for exact symbols/files before reading broadly; use narrow line ranges
  and bounded command output so irrelevant logs do not enter model context.
- Run the narrowest meaningful tests while iterating, then one full relevant
  validation at the acceptance gate. Never remove QA, security, type, schema,
  or test coverage to reduce token use.
- Prefer existing project conventions.
- Record meaningful decisions as they happen.
- Update `tasks.md` and `README.md` when live state changes.
- Do not overwrite historical reports or closeouts.
- Keep `nexo` as the user-facing orchestrator and use its internal routing rules
  in `agents/README.md`.
- Use handoffs for non-trivial plan-to-build transitions.
- Create implementation records for code, config, or operational behavior
  changes that future agents need to understand.
- Require explicit user confirmation before commit, push, deploy, or external
  environment changes.
- When a task has `state/tasks/TASK-ID.json`, run the local control engine before
  build, QA, security, implemented, and closed transitions. Treat exit code `2`
  as a blocked gate and exit code `1` as invalid control state; never bypass
  either by editing the task row.
- Never write real secrets; use placeholders and templates.
- For ChatGPT/Codex, use Terra with `medium` for resume/status/mechanical work,
  `high` for ordinary plan/build/QA, and `xhigh` only for critical risk. Keep
  low verbosity and unchanged acceptance gates at every tier.
- Route Kubernetes, CI/CD, deploy, and security-sensitive changes through QA
  and security review before close.

## 4.1 Agent Routing

All user requests enter through `nexo`, which routes by the next required
artifact:

| Request type | Internal specialist |
| --- | --- |
| Requirements/spec changes | `nexo-spec` |
| Product/technical planning | `nexo-plan` |
| Code/config implementation | `nexo-build` |
| Visible UI/UX | `nexo-design` |
| Test/readiness/release review | `nexo-qa` |
| Docker/Kubernetes/CI/CD/deploy/runbooks | `nexo-infra` |
| Secrets/auth/security/privacy | `nexo-security` |

### 4.1.1 Cross-Agent Delegation

Only `nexo` may invoke Nexo specialists:

| Agente | Puede delegar a | Condición |
|---|---|---|
| `nexo` | Any hidden `nexo-*` specialist | Inputs and expected evidence are explicit |

**Reglas de delegación:**

1. `nexo` provides an actionable handoff, plan, investigation, or bounded task.
2. El agente delegado debe tener criterios de aceptación y verificación claros.
3. Specialists cannot delegate to another agent.
4. `nexo` verifies the returned evidence before selecting the next transition.
5. Delegation does not exempt `nexo` from updating live state.
6. Commit, push, deploy, o cambios externos requieren confirmación explícita
   del usuario, incluso por subagente delegado.

## 4.2 Handoff Contract

Every non-trivial plan-to-build transition uses:

```text
handoffs/HOFF-YYYY-MM-DD-slug.md
```

Required fields:

- Objective.
- Context.
- Source docs.
- Files to create or modify.
- Implementation steps.
- Verification.
- Risks.
- Acceptance criteria.
- Receiving agent.

## 5. Reports

At the end of each session or meaningful work block, create a new report under:

```text
reports/YYYY-MM-DD/
```

Use a unique filename:

```text
NEXO-0001-short-title-session-001.md
```

Each report must include:

- Task ID.
- Date.
- Agent or author.
- What was done.
- Files changed.
- Verification performed.
- Open items.
- Recommended next step.

## 6. Closeout

When a task is complete, create one closeout under `closeouts/`.

For a governed task, populate its report, implementation, QA, security,
closeout, and verification evidence first. Run the `implemented->closed`
control-engine decision while both `tasks.md` and the manifest still say
`implemented`; update both to `closed` only after an allowed decision.

Closeouts are final historical records. Do not edit a closeout after creation
unless the user explicitly asks for a correction.

Each closeout must include:

- Task ID.
- Completion date.
- Objective.
- Outcome.
- Files changed.
- Verification.
- Remaining follow-up.
- Links to reports and plans.

## 7. Daily Journal

Use one file per day:

```text
journal/YYYY-MM-DD.md
```

The journal is append-only. Add entries for:

- Decisions.
- Work completed.
- Plan changes.
- Discoveries.
- Handoffs.

## 8. Live State Updates

The following files are editable current state:

- `README.md`
- `tasks.md`
- Active task plans

The following are historical:

- `journal/`
- `reports/`
- `closeouts/`

Historical records should grow by adding entries or new files, not by replacing
past records.
