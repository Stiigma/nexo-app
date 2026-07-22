# NEXO-0004 - Agentic Harness Upgrade

## Objective

Upgrade `harness/control/` from a control ledger into an agent operating system
for Nexo while keeping it as the canonical source for Codex, OpenCode, and
human work.

## Done When

- Canonical agent guides exist under `harness/control/agents/`.
- Canonical skill guides exist under `harness/control/skills/`.
- Control-plane state, index, handoff, implementation, investigation, runbook,
  and security directories exist and explain how to use them.
- Templates exist for handoffs, implementations, investigations, QA reviews,
  security reviews, ADRs, and runbooks.
- `.opencode/` contains adapter agents and skills that defer to the canonical
  `harness/control/` docs.
- `opencode.json` exposes Nexo commands for resume, doctor, planning, spec,
  design, build, QA, security, infra, handoff, and close workflows.
- `AGENTS.md` routes Codex, OpenCode, and humans through the same control
  workflow and agent selection rules.
- Control-plane live state, report, closeout, and journal are updated.

## Scope

- Extend the current control plane without replacing existing reports,
  closeouts, plans, or journals.
- Define English technical agents for planning, implementation, requirements,
  design, QA, infrastructure, and security.
- Define reusable control skills for memory/resume, task start, work logging,
  handoff, closeout, requirements trace, QA review, security review, design
  spec, and infra guardrails.
- Add OpenCode adapters that mirror the canonical control-plane agents and
  skills.
- Add state, index, handoff, implementation, investigation, runbook, and
  security scaffolding.

## Out Of Scope

- Scaffolding `back/`, `front/`, or production infrastructure.
- Copying credentials, dumps, PDFs, XLSX, `.env` files, or other sensitive
  content from reference systems.
- Installing global Codex skills under `~/.codex/skills`.
- Committing, pushing, deploying, or making any external system change.

## Steps

1. Register `NEXO-0004` in the control plane.
2. Create canonical agent and skill documentation under `harness/control/`.
3. Create state, index, handoff, implementation, investigation, runbook, and
   security scaffolding.
4. Add templates for handoffs, implementations, investigations, QA reviews,
   security reviews, ADRs, and runbooks.
5. Add `.opencode/` adapters and `opencode.json` commands.
6. Update `AGENTS.md`, `README.md`, and `tasks.md`.
7. Verify expected structure, JSON validity, routing, continuity, handoff
   completeness, QA/security gates, and obvious secret leakage.
8. Create report, closeout, and journal records.

## Progress

- 2026-06-30: Task registered from supplied implementation plan.
- 2026-06-30: Canonical agents, skills, state, indexes, templates, handoff,
  implementation, investigation, runbook, and security scaffolding created.
- 2026-06-30: OpenCode adapters and command configuration created.
- 2026-06-30: Shared AGENTS and workflow routing rules updated.
- 2026-06-30: Structure, JSON, routing, continuity, handoff, QA/security,
  ASCII, and secret-pattern verification completed.
- 2026-06-30: Task closed with report, implementation record, closeout, and
  journal entry.

## Decision Log

- 2026-06-30: Keep `harness/control/` as the canonical source of truth.
- 2026-06-30: Keep OpenCode support as adapters under `.opencode/`.
- 2026-06-30: Keep Codex support repo-contained through `AGENTS.md` and
  `harness/control/`.
- 2026-06-30: Use English technical agent and skill documentation.
- 2026-06-30: Treat `nexo-infra` as a full-stack executor with stricter
  guardrails for durable infrastructure and deployment changes.
- 2026-06-30: Keep security work in a separate `nexo-security` agent.

## Risks

- Adapters can drift from the canonical control-plane docs if future changes do
  not update both.
- Overly broad agent scopes can blur responsibility, so each agent needs clear
  entry conditions, outputs, and handoff requirements.
- Infrastructure and security workflows can imply external effects; the docs
  must require explicit user confirmation before commit, push, deploy, or real
  environment changes.

## Verification

- Confirm all expected agent, skill, template, state, index, handoff, OpenCode,
  implementation, investigation, runbook, and security files exist.
- Confirm `opencode.json` is valid JSON.
- Confirm no new files contain obvious real secrets or copied credential names.
- Confirm routing examples in `AGENTS.md` and OpenCode commands route to the
  intended agent.
- Confirm a fresh agent can identify current state, next task, active/closed
  tasks, workflow, and evidence locations from `AGENTS.md` plus
  `harness/control/README.md`.
- Confirm the handoff template gives `nexo-build`, `nexo-qa`, `nexo-infra`, and
  `nexo-security` enough fields to act.
- Confirm QA and security checklists cover the required gates.

## Result

Completed on 2026-06-30. See
`../reports/2026-06-30/NEXO-0004-agentic-harness-upgrade-session-001.md` and
`../closeouts/NEXO-0004-agentic-harness-upgrade.md`.
