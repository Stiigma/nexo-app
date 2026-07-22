# Runbook - OpenCode Chrome DevTools MCP

## Purpose

Use a dedicated Chrome instance for OpenCode browser inspection through
`chrome-devtools-mcp`, without exposing a personal browser profile.

## Preconditions

- `opencode.json` contains `mcp.chrome-devtools`.
- The configured package is the reviewed exact version
  `chrome-devtools-mcp@1.6.0`; do not replace it with `@latest`.
- `npx` is available on PATH.
- Google Chrome stable is installed as `google-chrome-stable`.
- The target web app is running before asking OpenCode to inspect it.

## Inputs

- DevTools browser URL: `http://127.0.0.1:9222`
- Dedicated Chrome profile directory: `/tmp/chrome-nexo-mcp`

## Steps

1. Start a dedicated Chrome instance:

   ```bash
   google-chrome-stable --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-nexo-mcp
   ```

2. Start OpenCode from the repository root.

3. Approve the Chrome tool call only after confirming this dedicated browser is
   open and contains no personal or sensitive session.

4. Use a prompt like:

   ```text
   Usa chrome-devtools para abrir http://127.0.0.1:5173, tomar screenshot, listar mensajes de consola y listar network requests.
   ```

## Verification

- `opencode debug config` resolves `mcp.chrome-devtools`.
- `opencode mcp list` reports `chrome-devtools` connected after OpenCode starts.
- OpenCode can navigate the dedicated Chrome instance at `127.0.0.1:9222`.
- Screenshots, console messages, and network requests are visible to OpenCode.
- Usage statistics, CrUX lookups, and update checks remain disabled; sensitive
  network headers are redacted from tool results.

## Upgrade Procedure

1. Check the official release and npm metadata for the proposed exact version.
2. Confirm its Node and Chrome requirements against the local environment.
3. Change the exact version in `opencode.json`; never use a mutable tag.
4. Run the focused MCP config test, complete harness tests, effective config,
   and MCP discovery before using the upgraded server.
5. Record the source, version, integrity, review, and rollback in a governed
   task.

## Rollback

- Remove the `mcp.chrome-devtools` block from `opencode.json`.
- Close the dedicated Chrome instance.
- Delete `/tmp/chrome-nexo-mcp` if a clean browser profile is desired.

## Escalation

- If `opencode mcp list` fails due to log permissions, fix
  `~/.local/share/opencode/log/` permissions outside the workspace sandbox.
- If `npx` cannot download `chrome-devtools-mcp`, retry with approved network
  access or install/cache the package through the standard developer workflow.
- If confirmation is not requested for a Chrome tool, stop and inspect the
  effective `nexo` permission before using browser control.

## Related Records

- Plan: `../plans/NEXO-0025-opencode-budget-guard-delegation.md`
- Implementation: `../implementations/NEXO-0025-chrome-devtools-mcp.md`
- Report: `../reports/2026-07-07/NEXO-0025-chrome-devtools-mcp-session-002.md`
- Hardening plan: `../plans/NEXO-0047-hardened-mcp-integrations.md`
- Current implementation:
  `../implementations/IMPL-NEXO-0047-hardened-mcp-integrations.md`
