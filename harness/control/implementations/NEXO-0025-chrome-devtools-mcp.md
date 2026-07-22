# NEXO-0025 Implementation - Chrome DevTools MCP For OpenCode

## Metadata

- Task ID: `NEXO-0025`
- Date: 2026-07-07
- Agent: `nexo-build`
- Related plan: `../plans/NEXO-0025-opencode-budget-guard-delegation.md`
- Related handoff: user-provided implementation plan in session
- Related report: `../reports/2026-07-07/NEXO-0025-chrome-devtools-mcp-session-002.md`

## Summary

OpenCode now has a project-local `chrome-devtools` MCP configured in
`opencode.json`. It connects to a dedicated Chrome instance on
`127.0.0.1:9222` and uses a temporary browser profile under
`/tmp/chrome-nexo-mcp`.

## Files Changed

- `opencode.json`
- `harness/control/runbooks/NEXO-0025-chrome-devtools-mcp.md`
- `harness/control/reports/2026-07-07/NEXO-0025-chrome-devtools-mcp-session-002.md`
- `harness/control/plans/NEXO-0025-opencode-budget-guard-delegation.md`
- `harness/control/journal/2026-07-07.md`
- `harness/control/tasks.md`
- `harness/control/README.md`
- `harness/control/state/CURRENT.md`

## Behavior Changed

- OpenCode resolves `mcp.chrome-devtools` as a local MCP server.
- The MCP command runs:

  ```json
  [
    "npx",
    "-y",
    "chrome-devtools-mcp@latest",
    "--browser-url=http://127.0.0.1:9222",
    "--no-usage-statistics",
    "--no-performance-crux"
  ]
  ```

- OpenCode can inspect a Chrome session that was started separately with:

  ```bash
  google-chrome-stable --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-nexo-mcp
  ```

## Verification

- `opencode debug config` passed and showed `mcp.chrome-devtools` enabled.
- The dedicated Chrome process was not started during this session.
- `chrome-devtools-mcp` was not downloaded or executed during this session.

## Operational Notes

- Use the dedicated temporary profile instead of a personal Chrome profile.
- Keep the DevTools endpoint bound to `127.0.0.1`.
- The MCP package is invoked through `npx -y`, so first real use may require
  network access to download/cache the package.

## Follow-Up

- Start the dedicated Chrome instance and run an OpenCode browser smoke test
  against `http://127.0.0.1:5173` when the frontend dev server is available.
