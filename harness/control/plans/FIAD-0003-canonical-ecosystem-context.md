# FIAD-0003 - Canonical Ecosystem Context For Local .NET Service Development

## Objective

Create a clean canonical FIAD operating memory in `harness/control/` so a new
agent or person can understand CEF, HU, SAL, and Harness without reading prior
chat or legacy memory.

## Done When

- `FIAD-0003` is registered in `tasks.md` with plan, handoff, reports,
  implementation record, and closeout.
- Canonical ecosystem docs exist under `ecosystem/`.
- Per-project context exists under `projects/CEF`, `projects/HU`,
  `projects/SAL`, and `projects/Harness`.
- OpenCode adapters and commands can resume through the FIAD context.
- New docs record variable names and sources only; no real secrets are written.

## Scope

- Use `/home/otomi/isyte-backup/Isyte` as read-only historical/source context.
- Inventory code from CEF, HU, SAL, and Harness: controllers/routes, DbContext,
  entities, DTOs, clients, `Program.cs`, Docker, Traefik, workflows, scripts,
  and OpenCode plugin behavior.
- Create canonical docs in the current `harness/control/`.
- Add state JSON and OpenCode adapters needed for `fiad:*`.

## Out Of Scope

- Changing application code in CEF, HU, or SAL.
- Running deploys, pushes, package publishes, or external environment changes.
- Opening real `.env`, SQL dumps, credential PDFs/XLSX, service account JSON,
  or secret stores.
- Migrating or deleting legacy `harness/memory/`.

## Steps

1. Read current Nexo control workflow and today's journal.
2. Locate FIAD source repositories and legacy control/memory.
3. Inventory CEF, HU, SAL, and Harness from source code and config.
4. Create `ecosystem/` docs.
5. Create per-project `projects/<Project>/` docs and profiles.
6. Add FIAD agents, checklists, skills, state JSON, and OpenCode commands.
7. Create ADR, handoff, reports, implementation record, and closeout.
8. Verify JSON, links, command adapters, source-path samples, and secret scan.

## Progress

- 2026-07-08: Implemented canonical FIAD context, OpenCode adapters, reports,
  implementation record, and closeout.

## Decision Log

- 2026-07-08: Canonical FIAD context lives in `harness/control/ecosystem/` and
  `harness/control/projects/`; legacy memory remains source context only.
- 2026-07-08: Credential handling is inventory-only: variable names, owners,
  consumers, and source locations without values.
- 2026-07-08: Work remains one task, `FIAD-0003`; future implementation work
  becomes `FIAD-0004+`.

## Risks

- Source repos are outside the current writable workspace and were read from
  `/home/otomi/isyte-backup/Isyte`; project docs point to absolute source paths.
- Some historical templates and workflows disagree with current source code,
  especially SAL Google Drive variable names and branch/deploy labels.
- Existing Nexo budget guard only detects `NEXO-*` active tasks; FIAD context
  uses a separate local `isyte-ops` context plugin.

## Verification

- `opencode debug config`
- `opencode debug agent fiad-plan`
- `opencode debug agent fiad-build`
- JSON validation for profiles and state JSON.
- Internal link/path check for FIAD docs.
- Secret scan over new/edited FIAD docs and OpenCode adapters.
- Source-path sampling for endpoints, entities, scripts, Traefik, and workflows.
- `fiad:doctor` attempted or recorded with gap if the CLI does not support
  direct command execution in this environment.
