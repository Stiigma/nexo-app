# NEXO-0030 Implementation - Command Code Fallback For OpenCode

## Metadata

- Task ID: `NEXO-0030`
- Date: 2026-07-08
- Agent: `nexo-infra`
- Related plan: `../plans/NEXO-0030-command-code-fallback.md`
- Related handoff: user-provided implementation plan in session
- Related report: `../reports/2026-07-08/NEXO-0030-command-code-fallback-session-001.md`

## Summary

Command Code (`cmd`) is configured as a practical fallback for OpenCode in Nexo.
It now has project-local MCP configuration for Chrome DevTools and GitHub,
project taste rules that point it at the Nexo control plane, and a runbook with
ready-to-run prompts for resume, plan, build and non-mutating smoke tests.

## Files Changed

- `.commandcode/taste/taste.md`
- `.mcp.json`
- `harness/control/plans/NEXO-0030-command-code-fallback.md`
- `harness/control/runbooks/NEXO-0030-command-code-fallback.md`
- `harness/control/implementations/NEXO-0030-command-code-fallback.md`
- `harness/control/reports/2026-07-08/NEXO-0030-command-code-fallback-session-001.md`
- `harness/control/journal/2026-07-08.md`
- `harness/control/tasks.md`
- `harness/control/README.md`
- `harness/control/state/CURRENT.md`
- `harness/control/state/NEXT.md`

## Behavior Changed

- `cmd mcp list` resolves two project-scoped MCP servers:
  - `chrome-devtools` via `npx -y chrome-devtools-mcp@latest`
  - `github` via `npx -y @modelcontextprotocol/server-github`
- Command Code project taste now explicitly says to read the Nexo control plane
  before acting and to use the canonical `nexo-*` agent routing.
- The runbook documents `/usage` as a partial substitute for OpenCode's local
  budget guard.

## Verification

- `cmd --version` returned `0.41.2`.
- `cmd status` reported authenticated as `Stiigma` through Command Code.
- `cmd --list-models` listed `deepseek/deepseek-v4-pro`,
  `claude-sonnet-5`, and other available models.
- `cmd mcp list` showed `chrome-devtools` and `github` enabled with project
  scope.
- Non-mutating smoke test passed with escalated execution because Command Code
  writes session files under `~/.commandcode`. The output identified active
  tasks `NEXO-0008` and `NEXO-0023`, next steps, and workflow restrictions for
  commit, push, deploy, external changes, secrets, historical records and
  session close reports.

## Operational Notes

- GitHub MCP may require a GitHub token in the operator's environment. Do not
  persist real tokens in repository files.
- Chrome DevTools MCP expects a dedicated Chrome instance at
  `http://127.0.0.1:9222`.
- First real MCP use may download packages through `npx -y`.
- Running `cmd -p` inside the workspace sandbox can fail with read-only errors
  when Command Code writes to `~/.commandcode`; allow normal CLI access when a
  real Command Code session is expected.

## Follow-Up

- Use the non-mutating smoke prompt after any Command Code upgrade or MCP
  change.
- Do not run mutating build prompts until a Nexo task, handoff, and verification
  target are clear.
