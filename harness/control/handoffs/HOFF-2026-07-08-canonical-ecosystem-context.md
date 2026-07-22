# HOFF-2026-07-08-canonical-ecosystem-context

## Metadata

- Task ID: FIAD-0003
- Date: 2026-07-08
- Authoring agent: fiad-plan
- Receiving agent: fiad-build
- Status: executed

## Objective

Create the canonical FIAD ecosystem context for local .NET service development
under `harness/control/`, using source code and legacy memory as evidence while
writing no real secrets.

## Context

The existing Nexo control plane is the local operational model. FIAD historical
state exists under `/home/otomi/isyte-backup/Isyte`, including repositories,
legacy `harness/memory/`, legacy `harness/control/`, Docker/K8s/Traefik files,
scripts, workflows, and OpenCode plugin/adapters.

## Source Docs

- `AGENTS.md`
- `harness/control/README.md`
- `harness/control/WORKFLOW.md`
- `harness/control/tasks.md`
- `/home/otomi/isyte-backup/Isyte/harness/control/`
- `/home/otomi/isyte-backup/Isyte/harness/memory/`
- `/home/otomi/isyte-backup/Isyte/repos/CEF`
- `/home/otomi/isyte-backup/Isyte/repos/HU`
- `/home/otomi/isyte-backup/Isyte/repos/SAL`
- `/home/otomi/isyte-backup/Isyte/harness/docker`
- `/home/otomi/isyte-backup/Isyte/harness/traefik`
- `/home/otomi/isyte-backup/Isyte/harness/.github/workflows`

## Files To Create Or Modify

- `tasks.md`, `README.md`, `WORKFLOW.md`, `state/CURRENT.md`, `state/NEXT.md`
- `plans/FIAD-0003-canonical-ecosystem-context.md`
- `decisions/ADR-2026-07-08-canonical-context-model.md`
- `ecosystem/*.md`
- `projects/{CEF,HU,SAL,Harness}/*`
- `agents/fiad-*.md`, `checklists/fiad-*.md`, `skills/fiad-*.md`
- `.opencode/agents/fiad-*.md`, `.opencode/plugins/isyte-ops.js`,
  `opencode.json`
- `state/workspace-map.json`, `state/project-policy.json`
- `reports/2026-07-08/FIAD-0003-*.md`
- `implementations/FIAD-0003-canonical-ecosystem-context.md`
- `closeouts/FIAD-0003-canonical-ecosystem-context.md`

## Implementation Steps

1. Create FIAD control-plane structure and live-state records.
2. Extract inventory from code and infrastructure without opening sensitive
   files.
3. Write global ecosystem docs.
4. Write project profiles and operational docs.
5. Add FIAD OpenCode adapters and context plugin.
6. Run verification and record gaps.
7. Close `FIAD-0003` only after the context is usable from `fiad:resume`.

## Verification

- Validate JSON.
- Run OpenCode debug config and agents.
- Check internal links and source paths.
- Scan new/edited docs for secret-like values.
- Sample endpoints/entities/scripts against source files.

## Risks

- Legacy FIAD source is outside this writable workspace.
- Historical config contains insecure placeholders or literal secret-like values;
  new docs must not repeat them.
- Some historical CI/CD metadata is inconsistent with project profiles and
  plugin assumptions.

## Acceptance Criteria

- A new agent can start from `fiad:resume` and locate CEF, HU, SAL, Harness,
  auth, integrations, runbooks, and credentials inventory without prior chat.
- Adding a new local .NET service has a documented playbook.
- No real secrets are written.
- Future implementation work can be split into `FIAD-0004+`.

## Required Gates

- QA review: self-check required before close.
- Security review: required for credential map and secret-scan result.
- User confirmation: required for any future commit, push, deploy, or external
  environment mutation.
