# NEXO-0025 Report - OpenCode Bad Gateway Retry Session 002

## Metadata

- Date: 2026-07-07
- Agent: Codex
- Task: `NEXO-0025` - OpenCode Budget Guard and Real Delegation
- Status: retry diagnosis completed

## What Was Done

- Rechecked OpenCode logs after the user retried in Desktop.
- Confirmed the new failing session still uses `opencode/hy3-free`.
- Checked recent session metadata in `opencode.db`.
- Checked OpenCode CLI help for model selection syntax.

## Files Changed

- `harness/control/reports/2026-07-07/NEXO-0025-opencode-bad-gateway-retry-session-002.md`
- `harness/control/journal/2026-07-07.md`

## Verification Performed

- New session `ses_0c0f18b92ffe3OF61G8dFPDSO6` selected:
  `{"id":"hy3-free","providerID":"opencode","variant":"high"}`.
- New log entries show repeated:
  `AI_APICallError: Bad Gateway` for `providerID=opencode modelID=hy3-free`.
- Title generation also failed with:
  `AI_RetryError: Failed after 3 attempts. Last error: Bad Gateway`.
- `opencode --help` confirms CLI model override syntax:
  `-m, --model` using `provider/model`.

## Open Items

- No paid/live model prompt was run from Codex.
- The Desktop plugin loader warning remains secondary.

## Recommended Next Step

Stop using `Hy3 Free` for this session. Select a different model/provider in
Desktop, or launch OpenCode with `-m opencode-go/deepseek-v4-pro` if using CLI.
