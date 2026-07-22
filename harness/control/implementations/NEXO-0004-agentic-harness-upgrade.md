# NEXO-0004 Implementation - Agentic Harness Upgrade

## Metadata

- Task ID: `NEXO-0004`
- Date: 2026-06-30
- Agent: Codex
- Related plan: `../plans/NEXO-0004-agentic-harness-upgrade.md`
- Related handoff: none; user supplied the implementation plan directly.
- Related report: `../reports/2026-06-30/NEXO-0004-agentic-harness-upgrade-session-001.md`

## Summary

Upgraded `harness/control/` from a task ledger into the canonical agent
operating system for Nexo. Added canonical agents, skills, state files,
indexes, handoff and operational record directories, templates, OpenCode
adapters, and shared routing rules.

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
- `harness/control/journal/2026-06-30.md`

## Behavior Changed

- New sessions now route through canonical Nexo agents and skills.
- OpenCode is supported through adapters and `opencode.json` commands.
- Non-trivial plan-to-build work now has an explicit handoff contract.
- Completed code/config work now has an implementation-record location.
- QA, security, and infrastructure guardrails are explicit before close.
- Control-plane state is split into current and next-work summaries.

## Verification

- Confirmed all expected agent, skill, template, state, index, handoff,
  OpenCode, implementation, investigation, runbook, and security files exist.
- Confirmed `opencode.json` is valid JSON with `python3 -m json.tool`.
- Confirmed `opencode.json` includes `nexo:resume`, `nexo:doctor`,
  `nexo:plan`, `nexo:spec`, `nexo:design`, `nexo:build`, `nexo:qa`,
  `nexo:security`, `nexo:infra`, `nexo:handoff`, and `nexo:close`.
- Confirmed routing rules exist in `AGENTS.md`, `harness/control/README.md`,
  `harness/control/WORKFLOW.md`, and `harness/control/agents/README.md`.
- Confirmed continuity pointers exist in `README.md`, `tasks.md`,
  `state/CURRENT.md`, and `state/NEXT.md`.
- Confirmed handoff template and dry-run example contain the required fields.
- Confirmed QA and security templates/checklists cover required gates.
- Confirmed no non-ASCII characters were found in `AGENTS.md`,
  `opencode.json`, `.opencode/`, or `harness/control/`.
- Confirmed no obvious secret-like assignments, private key blocks, database
  URLs, or copied reference-system credential references were found in the new
  control-plane files.
- `git status --short` could not run because this workspace is not recognized
  as a Git repository.

## Operational Notes

- `harness/control/` is canonical. `.opencode/` files are adapters.
- The dry-run handoff at
  `../handoffs/HOFF-2026-06-30-dry-run-example.md` is not executable work.
- Commit, push, deploy, and external environment changes remain out of scope
  unless explicitly confirmed by the user.

## Follow-Up

- Review open questions in `docs/spec/SRS.md`.
- Continue `NEXO-0002` and create `CONTEXT.md` from `NEXO_PROJECT.md`.
