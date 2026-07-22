# FIAD-0003 Implementation - Canonical Ecosystem Context

## Metadata

- Task ID: FIAD-0003
- Date: 2026-07-08
- Agent: Codex / fiad-build
- Related plan: `harness/control/plans/FIAD-0003-canonical-ecosystem-context.md`
- Related handoff: `harness/control/handoffs/HOFF-2026-07-08-canonical-ecosystem-context.md`
- Related report: `harness/control/reports/2026-07-08/FIAD-0003-canonical-ecosystem-context-session-001.md`

## Summary

Created a canonical FIAD operating memory in `harness/control/`, following the
Nexo control-plane pattern. The normal context entry points are now
`ecosystem/` and `projects/`; legacy `harness/memory/` remains historical
source context only.

## Files Changed

- Added ecosystem docs for overview, integrations, local .NET service
  playbook, tools/scripts and credential inventory.
- Added project context for CEF, HU, SAL and Harness.
- Added FIAD agents, checklists and skills under `harness/control/`.
- Added Project Profiles and workspace/policy state JSON.
- Added OpenCode adapters, `isyte-ops` plugin and `fiad:*` commands.
- Added ADR, reports and closeout records for `FIAD-0003`.
- Updated README, WORKFLOW, task index, indexes, current/next state and
  journal.

## Behavior Changed

- New FIAD/OpenCode sessions can start from `fiad:resume` and receive canonical
  ecosystem context.
- `fiad-plan` is non-mutating by configuration: `bash`, `write` and `edit` are
  denied while delegation to `fiad-build` and `fiad-infra` is allowed.
- `harness/control/projects/<Project>/profile.json` provides machine-readable
  entry points for CEF, HU, SAL and Harness.

## Verification

- JSON validation passed for control state and project profiles.
- `opencode debug config`, `opencode debug agent fiad-plan` and
  `opencode debug agent fiad-build` passed.
- Internal FIAD file/link checks passed.
- Source-path samples passed.
- Secret scan returned no real secret matches.
- `fiad:doctor` passed read-only after closeout/report records were present;
  it reported no blocking findings.

## Operational Notes

- Real credentials remain outside canonical memory and must come from approved
  secret sources.
- Branch/deploy drift and SAL Google Drive env-template drift are documented
  risks for future FIAD tasks.
- The current root directory is not a Git repo; `harness/` is a nested repo
  with existing unrelated dirty state that was not reverted.

## Follow-Up

- Open `FIAD-0004+` for any concrete implementation discovered from the new
  context, especially CI/CD branch alignment or SAL Drive env-template cleanup.
