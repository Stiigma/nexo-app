# NEXO-0004 Closeout - Agentic Harness Upgrade

## Metadata

- Task ID: `NEXO-0004`
- Completion date: 2026-06-30
- Agent: Codex
- Final status: closed

## Objective

Upgrade `harness/control/` from a control ledger into an agent operating system
for Nexo while keeping it as the canonical source for Codex, OpenCode, and
human work.

## Outcome

Completed. `harness/control/` now defines canonical agents, skills, state,
indexes, handoff and operational record locations, templates, and routing
rules. `.opencode/` and `opencode.json` provide OpenCode adapters and commands
that point back to the canonical control plane. `AGENTS.md` routes Codex,
OpenCode, and humans through the same workflow and guardrails.

## Files Changed

- `AGENTS.md`
- `opencode.json`
- `.opencode/`
- `harness/control/README.md`
- `harness/control/WORKFLOW.md`
- `harness/control/tasks.md`
- `harness/control/agents/`
- `harness/control/skills/`
- `harness/control/state/`
- `harness/control/indexes/`
- `harness/control/handoffs/`
- `harness/control/implementations/`
- `harness/control/investigations/`
- `harness/control/runbooks/`
- `harness/control/security/`
- `harness/control/templates/`
- `harness/control/plans/NEXO-0004-agentic-harness-upgrade.md`
- `harness/control/reports/2026-06-30/NEXO-0004-agentic-harness-upgrade-session-001.md`
- `harness/control/journal/2026-06-30.md`

## Verification

- Expected control-plane and OpenCode files exist.
- `opencode.json` is valid JSON.
- OpenCode commands exist for resume, doctor, plan, spec, design, build, QA,
  security, infra, handoff, and close workflows.
- Routing rules point to the intended Nexo agents.
- A fresh agent can find current state, next work, task index, workflow, and
  evidence locations from `AGENTS.md` plus `harness/control/README.md`.
- Handoff template and dry-run example include the required contract fields.
- QA and security templates cover the required gates.
- ASCII, secret-pattern, private-key, database-URL, and copied
  reference-system credential scans found no matches in the checked
  control-plane and OpenCode docs.
- `git status --short` could not run because this workspace is not recognized
  as a Git repository.

## Remaining Follow-Up

- Review open questions in `docs/spec/SRS.md`.
- Continue `NEXO-0002` and create `CONTEXT.md` from `NEXO_PROJECT.md`.
- Keep `.opencode/` adapters synchronized with canonical `harness/control/`
  docs when agent or skill behavior changes.

## Links

- Plan: `../plans/NEXO-0004-agentic-harness-upgrade.md`
- Report: `../reports/2026-06-30/NEXO-0004-agentic-harness-upgrade-session-001.md`
- Implementation: `../implementations/NEXO-0004-agentic-harness-upgrade.md`
- Agents: `../agents/README.md`
- Skills: `../skills/README.md`
