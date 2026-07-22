# NEXO-0047 - Hardened MCP Integrations

## Objective

Replace mutable or deprecated MCP configuration with bounded official
integrations while preserving browser inspection, GitHub research, and current
library documentation from the single Nexo chat.

## Done When

- Chrome DevTools uses an exact verified package version, disables telemetry,
  CrUX lookups, and update checks, and redacts sensitive network headers.
- GitHub uses the exact-digest official local container with built-in OAuth,
  read-only and lockdown modes, a bounded toolset, and a loopback callback.
- Context7 uses its official hosted endpoint and exposes only its two
  read-only documentation tools.
- MCP tools are unavailable by default and enabled only for `nexo`; Chrome
  actions require confirmation.
- No token, API key, credential, mutable package tag, or deprecated GitHub npm
  server is stored in project configuration.
- Focused config tests, the complete harness tests, effective-config
  resolution, MCP discovery, compact context, QA, and security pass.

## Scope

- `opencode.json` MCP and tool exposure configuration.
- The `nexo` OpenCode adapter permission for MCP tools.
- Focused MCP configuration tests.
- The Chrome DevTools MCP runbook and durable MCP implementation record.
- Governed task, review, report, closeout, and live-state records.

## Out Of Scope

- GitHub authentication, token creation, repository mutation, or OAuth consent.
- A live browser-control smoke test against an application.
- Command Code `.mcp.json`, Codex MCP configuration, package installation, or
  dependency lockfiles.
- Adding write-capable GitHub tools or automatic use of external documentation.

## Steps

1. Verify current OpenCode schema, package metadata, and provider guidance.
2. Register the governed task and pass the planned-to-active build decision.
3. Pin Chrome DevTools, replace the deprecated GitHub server, and add Context7.
4. Restrict MCP exposure to `nexo` and require confirmation for browser tools.
5. Add focused regression tests and update the operational documentation.
6. Run focused and full acceptance checks, then complete QA and security.
7. Close through the control engine and synchronize live state.

## Progress

- 2026-07-18: Confirmed `chrome-devtools-mcp` latest stable is `1.6.0`,
  `@modelcontextprotocol/server-github` is deprecated, and the official GitHub
  and Context7 remote endpoints are supported by OpenCode.
- 2026-07-18: User selected the next queued MCP-hardening task.
- 2026-07-18: The control engine authorized planned-to-active with the plan,
  handoff, architecture decision, and dependency approval present.
- 2026-07-18: Focused tests and effective config passed. Initial discovery
  exposed incompatible remote GitHub OAuth; the corrected exact-digest local
  server then connected alongside Chrome and Context7 without account auth.
- 2026-07-18: Final implementation verification passed with 5 focused and 43
  complete tests, compact context, effective config, three connected MCPs, and
  an updated code graph.
- 2026-07-18: The control engine authorized active-to-implemented with complete
  report, implementation, and recorded verification evidence.
- 2026-07-18: Security review 001 blocked close until MCP responses are
  explicitly treated as untrusted data and the rule has regression coverage.
- 2026-07-18: Governed rework added the untrusted-response rule and test; all 5
  focused and 43 complete tests, effective config, three MCP connections,
  compact context, and Graphify pass again.
- 2026-07-18: The control engine authorized the second active-to-implemented
  transition with final rework evidence.
- 2026-07-18: Final QA passed and security approved after validating the
  untrusted-response mitigation and all residual risks.
- 2026-07-18: The control engine authorized implemented-to-closed with complete
  report, implementation, QA, security, closeout, and verification evidence.

## Decision Log

- 2026-07-18: Use native OpenCode MCP configuration rather than a wrapper or
  new dependency. There is no application design pattern to introduce for
  three declarative integrations.
- 2026-07-18: Keep Chrome DevTools local because browser control targets a
  loopback-only dedicated Chrome instance. Pin `chrome-devtools-mcp@1.6.0`,
  whose npm integrity is published and whose Node requirement is satisfied by
  local Node `v26.4.0`.
- 2026-07-18: Initial discovery rejected GitHub's hosted endpoint because its
  auth server does not support OpenCode's dynamic client registration. Replaced
  that non-operable choice before acceptance rather than storing a PAT.
- 2026-07-18: Use GitHub MCP Server `v1.6.0` through its official Linux/amd64
  image digest. The official stdio build supplies OAuth without a repository
  secret. Run with no implicit pulls, a read-only filesystem, no capabilities,
  no new privileges, bounded toolsets/scopes, server read-only and lockdown,
  and callback port `127.0.0.1:8085`.
- 2026-07-18: Add `https://mcp.context7.com/mcp` without an API key. Context7's
  advertised MCP surface is limited to library resolution and documentation
  query; it cannot mutate the project or an external account.
- 2026-07-18: Disable all MCP tool globs globally and re-enable them only for
  the sole Nexo primary. Require `ask` for Chrome because it can inspect and
  modify a dedicated browser session; allow bounded GitHub and Context7 reads.
- 2026-07-18: Treat this plan as the architecture and dependency approval
  record. The user approved the queued task; no application package is
  installed and no external account is changed.

## Risks

- GitHub tools remain unauthenticated until the operator approves the first-use
  OAuth flow; no token is persisted by the container.
- GitHub and Context7 usage sends prompts or queries to third-party
  services; agents must send only the minimum non-sensitive query.
- Exact Chrome package pins require an explicit reviewed task to upgrade.
- Chrome DevTools can read and alter its attached browser; the dedicated
  profile and per-call confirmation remain mandatory.
- MCP server schemas can add context; GitHub toolsets and agent-only exposure
  bound that cost.

## Verification

- `node --test .opencode/tests/mcp-config.test.js`
- `node --test .opencode/tests/*.test.js`
- `opencode debug config`
- `opencode mcp list`
- `node .opencode/scripts/build-session-context.mjs`
- `graphify update .`
