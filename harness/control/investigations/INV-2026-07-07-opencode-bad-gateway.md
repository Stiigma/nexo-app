# INV-2026-07-07 - OpenCode Bad Gateway

## Summary

OpenCode Desktop is failing during LLM streaming, not during repository
configuration or AWS Lightsail access.

The blocking symptom shown in the UI maps to repeated provider stream errors in
`/home/otomi/.local/share/opencode/log/opencode.log` for session
`ses_0c1710762ffeGrRueRcoMZrj9F`.

## Evidence

- OpenCode CLI path: `/home/otomi/.opencode/bin/opencode`.
- OpenCode version: `1.17.15`.
- Project config resolves with `opencode debug config`.
- `opencode debug agent nexo-infra` resolves agent mode and permissions.
- Session metadata in `opencode.db`:
  - Session: `ses_0c1710762ffeGrRueRcoMZrj9F`
  - Agent: `nexo-infra`
  - Final model: `opencode/hy3-free` variant `high`
  - Cost recorded: `$0.2348120992`
  - Tokens: `183478` input, `19302` output
- Log stream failures:
  - `2026-07-07T23:55:11Z` through `23:55:18Z`:
    `opencode-go/deepseek-v4-pro` returned `Service Unavailable`.
  - `2026-07-07T23:55:28Z` onward:
    `opencode-go/deepseek-v4-pro` returned `Bad Gateway`.
  - `2026-07-07T23:57:31Z` onward:
    `opencode/hy3-free` returned repeated `Bad Gateway`.

## Secondary Finding

OpenCode Desktop also logged:

```text
failed to load plugin ... .opencode/plugins/nexo-budget-guard.js error="Plugin export is not a function"
```

Local Node checks show the plugin exports a callable function through both
`require()` and dynamic `import()`. This suggests either an OpenCode Desktop
plugin loader compatibility issue or a stale Desktop process/cache path. It is
not the direct cause of the Bad Gateway stream failures, because those failures
are provider stream errors after the session starts.

## Ruled Out

- AWS Lightsail account activation is unrelated to this OpenCode provider
  stream unless OpenCode is explicitly routed through AWS infrastructure, which
  this project config does not show.
- The project `opencode.json` is syntactically valid and resolves.
- No active OpenCode process was found during the investigation.

## Likely Cause

The primary failure is upstream of OpenCode Desktop: OpenCode's provider gateway
or the selected free/pro model backend returned transient 503/502 responses.

## Recommended Next Step

1. Restart OpenCode Desktop to clear any stale plugin/runtime state.
2. Retry with a different non-free provider/model if available.
3. If `hy3-free` still returns `Bad Gateway`, treat it as provider-side outage
   or free-tier capacity failure.
4. Separately investigate the plugin loader warning if the budget guard is
   required inside Desktop, because the CLI-level Node export shape appears
   valid.
