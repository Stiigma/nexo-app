# NEXO-0025 Report - OpenCode Bad Gateway Investigation

## Metadata

- Date: 2026-07-07
- Agent: Codex
- Task: `NEXO-0025` - OpenCode Budget Guard and Real Delegation
- Status: investigation completed

## What Was Done

- Inspected Nexo control-plane context for `NEXO-0025`.
- Ran OpenCode debug commands for project config and `nexo-infra` agent.
- Checked OpenCode CLI path and version.
- Reviewed `opencode.json`, the Desktop update report, OpenCode logs, and
  local session metadata.
- Confirmed the visible `Bad Gateway` UI state maps to provider stream errors.
- Checked the local budget guard plugin export shape.

## Files Changed

- `harness/control/investigations/INV-2026-07-07-opencode-bad-gateway.md`
- `harness/control/reports/2026-07-07/NEXO-0025-opencode-bad-gateway-investigation.md`
- `harness/control/journal/2026-07-07.md`

## Verification Performed

- `opencode --version` returned `1.17.15`.
- `opencode debug config` resolved project config.
- `opencode debug agent nexo-infra` resolved the agent.
- `tail` and targeted `rg` over
  `/home/otomi/.local/share/opencode/log/opencode.log` found repeated
  `AI_APICallError: Service Unavailable` and `AI_APICallError: Bad Gateway`.
- `sqlite3 /home/otomi/.local/share/opencode/opencode.db` confirmed session
  `ses_0c1710762ffeGrRueRcoMZrj9F` used `opencode/hy3-free` at the end.
- Node `require()` and dynamic `import()` both saw the local plugin default as a
  function.

## Open Items

- No provider-status check was run, and no paid/live prompt retry was attempted.
- Desktop logged `Plugin export is not a function`; this is secondary to the
  provider stream failure but should be cleaned up if the budget guard must run
  inside Desktop.

## Recommended Next Step

Restart OpenCode Desktop, retry with a non-free model/provider if available, and
treat continued `hy3-free` `Bad Gateway` responses as provider-side outage or
free-tier capacity failure.
