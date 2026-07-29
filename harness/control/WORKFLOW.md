# Control Workflow

Use this workflow only when risk or continuity justifies it. Process complexity
must be proportional to risk.

## 1. Classify The Work

| Level | Typical work | Process |
| --- | --- | --- |
| Fast | Questions, analysis, documentation, small reversible edits | One focused inspection, direct execution, and minimum verification. No task, plan, handoff, report, journal, or manifest. |
| Normal | Bounded feature or bug in an existing module | Short conversational plan, direct implementation, and proportional tests. Optionally record one compact continuity manifest when the idea must survive another chat. |
| Controlled | Production, security, secrets, architecture, dependencies, migrations, destructive actions, or possible data loss | Formal task, rollback, approvals, control-engine decisions, and applicable QA/security gates. |

Local reversible operations are normal unless they affect data. Commit, push,
deploy, production, external changes, migrations, secrets, and destructive
operations keep their explicit controls.

## 2. Start Controlled Or Continuing Work

1. Read `AGENTS.md`.
2. Run the current surface adapter from `AGENTS.md`.
3. Read the validated packet and its exact source links.
4. If the packet is merely expired but status, links, and source hashes
   validate, continue with its warning.
5. If state contradicts, a linked source changed, or the packet cannot safely
   answer the current decision, read in tiers: selected manifest/projection;
   selected plan/handoff/report/requirements; then the full index, workflow,
   journal, and legacy CURRENT/NEXT only for recovery.

Before changing controlled work, identify its task ID, status, plan, rollback,
expected verification, required approvals, and milestone evidence.

## 3. Creating A Controlled Task

Create a stable ID in the format `NEXO-0001`, `NEXO-0002`, and so on. FIAD
ecosystem work uses the `FIAD-0001` prefix and the same status/reporting rules.

For each task:

- Add or update a row in `tasks.md`.
- Create a plan in `plans/` from `templates/plan.md`.
- For new controlled tasks after `NEXO-0046`, create
  `state/tasks/TASK-ID.json` using `state/tasks/README.md`. Its status must match
  the task row.
- Update `README.md` if this becomes the active task.
- Append a journal entry when task creation is a durable decision or milestone.

Fast and normal work does not create a task merely to satisfy the workflow.

Normal work may create one compact continuity record:

```bash
node harness/control/scripts/nexo-work.mjs continuity create --title "Idea" --objective "Outcome"
node harness/control/scripts/nexo-work.mjs continuity find --query "objective terms"
node harness/control/scripts/nexo-work.mjs continuity checkpoint --task NEXO-0000 --summary "State" --next-step "Action"
node harness/control/scripts/nexo-work.mjs continuity resume --task NEXO-0000
node harness/control/scripts/nexo-work.mjs continuity promote --task NEXO-0000
```

The JSON manifest is canonical and `harness/control/work/TASK-ID.md` is a
generated readable projection. Checkpoint only at a durable boundary. Resume
requires an explicit selected ID; recency alone never selects work.

## 4. Planning

Plans are living documents while a task is active. They may be edited, but
important changes must be recorded in either:

- The plan's decision log.
- A milestone report.
- The daily journal.

A plan should state:

- Objective.
- Done when.
- Scope.
- Out of scope.
- Steps.
- Risks.
- Verification.
- Requirement-to-acceptance trace.
- Architecture/technology and pattern decisions.
- Boundaries, validation, failure behavior, compatibility, and rollback.
- Maintenance delta and focused tests.

## 5. Execution

During execution:

- Keep changes scoped to the active task.
- Search for exact symbols/files before reading broadly; use narrow line ranges
  and bounded command output so irrelevant logs do not enter model context.
- Run the narrowest meaningful tests while iterating, then one full relevant
  validation at the acceptance gate. Never remove QA, security, type, schema,
  or test coverage to reduce token use.
- Prefer existing project conventions.
- Record durable decisions and milestones, not routine activity.
- Keep structured manifests canonical and `tasks.md` synchronized as their
  index projection. Historical tasks without manifests remain in the index.
- Treat `state/CURRENT.md` and `state/NEXT.md` as legacy views.
- Do not overwrite historical reports or closeouts.
- Keep `nexo` as the user-facing orchestrator and use its internal routing rules
  in `agents/README.md`.
- Use handoffs for controlled, prolonged, or cross-agent plan-to-build
  transitions.
- Create implementation records only for durable milestones or cross-session
  continuity.
- Require explicit user confirmation before commit, push, deploy, or external
  environment changes.
- When a task has `state/tasks/TASK-ID.json`, run the local control engine before
  build, QA, security, release, implemented, and closed transitions. Treat exit code `2`
  as a blocked gate and exit code `1` as invalid control state; never bypass
  either by editing the task row.
- Never write real secrets; use placeholders and templates.
- For ChatGPT/Codex, use `medium` by default, including Plan Mode. Reserve
  `high` and `xhigh` specialists for complex or controlled work. Keep low
  verbosity and unchanged acceptance gates where the risk tier requires them.
- Route Kubernetes, CI/CD, deploy, and security-sensitive changes through QA
  and security review before close.

## 5.1 Agent Routing

All user requests enter through `nexo`. It executes fast and normal work
directly; it routes complex or controlled work by the next required artifact:

| Request type | Internal specialist |
| --- | --- |
| Requirements/spec changes | `nexo-spec` |
| Product/technical planning | `nexo-plan` |
| Code/config implementation | `nexo-build` |
| Visible UI/UX | `nexo-design` |
| Test/readiness/release review | `nexo-qa` |
| Docker/Kubernetes/CI/CD/deploy/runbooks | `nexo-infra` |
| Secrets/auth/security/privacy | `nexo-security` |

### 5.1.1 Cross-Agent Delegation

Only `nexo` may invoke Nexo specialists:

| Agente | Puede delegar a | Condición |
|---|---|---|
| `nexo` | Any hidden `nexo-*` specialist | Inputs and expected evidence are explicit |

**Reglas de delegación:**

1. `nexo` provides an actionable handoff, plan, investigation, or bounded task.
2. El agente delegado debe tener criterios de aceptación y verificación claros.
3. Specialists cannot delegate to another agent.
4. A handoff is an artifact produced directly by `nexo`; it does not start a
   model session and does not authorize delegation.
5. `nexo` proposes only one specialist and discloses purpose, model, reasoning,
   and shared ChatGPT/Codex agentic-quota use before invocation.
6. `nexo` waits for explicit, single-use approval. "Usa un subagente" counts
   for one delegation; "crea un handoff" and "asigna el siguiente rol" do not.
7. `nexo` verifies the returned evidence before selecting the next transition.
8. Delegation does not exempt `nexo` from required milestone evidence.
9. Commit, push, deploy, o cambios externos requieren confirmación explícita
   del usuario, incluso por subagente delegado.

## 5.2 Handoff Contract

Every controlled, prolonged, or cross-agent plan-to-build transition uses:

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

## 6. Milestone Evidence

Create a report for releases, incidents, durable decisions, migrations,
external changes, and controlled task closure. Do not create one for each
session or ordinary work block. Reports live under:

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

## 7. Closeout

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

## 8. Daily Journal

Use one file per day:

```text
journal/YYYY-MM-DD.md
```

The journal is append-only. Add entries only for milestones such as:

- Decisions.
- Releases, incidents, migrations, or external changes.
- Plan changes.
- Discoveries.
- Handoffs.

## 9. Live State Updates

The following files are editable current state:

- `README.md`
- `tasks.md`
- Active task plans

Structured manifests are canonical for registered tasks. `tasks.md` remains a
compatible index and the source for historical rows without manifests.
`state/CURRENT.md` and `state/NEXT.md` are legacy views.

The following are historical:

- `journal/`
- `reports/`
- `closeouts/`

Historical records should grow by adding entries or new files, not by replacing
past records.
