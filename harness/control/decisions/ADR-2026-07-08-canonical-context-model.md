# ADR-2026-07-08-canonical-context-model

## Status

Accepted

## Context

FIAD historical context existed in legacy memory and scattered operational
records. That was useful for history but too noisy for daily local .NET service
development. Agents need a stable entrypoint that explains CEF, HU, SAL, and
Harness from source evidence without relying on prior chat.

## Decision

The canonical FIAD context lives in:

- `harness/control/ecosystem/` for cross-project architecture, integrations,
  local service playbooks, tools/scripts, and safe credential inventory.
- `harness/control/projects/<Project>/` for project-specific profiles,
  endpoints, domain models, code maps, integrations, runbooks, and auth/security.

Legacy FIAD memory under `/home/otomi/isyte-backup/Isyte/harness/memory/` is
source/historical context only. It is not the normal live-state workspace.

## Consequences

- `fiad:resume` can begin from a small canonical surface.
- Project-specific differences are recorded in Project Profiles instead of
  creating project-specific agents or workflow variants.
- Historical reports remain immutable; updates create new reports, journal
  entries, implementation records, or new tasks.
- Credential handling is safer: docs list variable names and owners, never
  values.

## Alternatives Considered

- Keep using legacy `harness/memory/`: rejected because it mixes history,
  decisions, drafts, and operational state.
- Copy the backup control plane wholesale: rejected because the user requested a
  clean canonical memory and source-code-derived inventory.
- Put all context in one large file: rejected because future agents need
  project-level entrypoints and source-path traceability.

## Verification

- `tasks.md` links to plan, latest report, and closeout.
- Project Profiles point to ecosystem docs and source paths.
- `opencode.json` exposes `fiad:*` commands.
- JSON and internal links are validated in the FIAD-0003 report.

## Related Records

- Task: `FIAD-0003`
- Plan: `plans/FIAD-0003-canonical-ecosystem-context.md`
- Handoff: `handoffs/HOFF-2026-07-08-canonical-ecosystem-context.md`
- Report: `reports/2026-07-08/FIAD-0003-canonical-ecosystem-context-session-001.md`
