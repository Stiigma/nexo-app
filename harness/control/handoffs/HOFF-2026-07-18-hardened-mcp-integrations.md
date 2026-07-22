# HOFF-2026-07-18-hardened-mcp-integrations

## Metadata

- Task ID: `NEXO-0047`
- Date: 2026-07-18
- Authoring agent: `nexo`
- Receiving agent: `nexo-infra`
- Status: ready

## Objective

Implement the approved bounded MCP configuration without installing packages,
handling credentials, authenticating an account, or mutating an external
system.

## Context

OpenCode currently launches Chrome through a mutable npm tag and GitHub through
a deprecated npm server. The queued follow-up also permits Context7 only when
its role is bounded and read-only. Official provider and OpenCode documentation
support the selected configuration in the task plan.

## Source Docs

- `AGENTS.md`
- `opencode.json`
- `harness/control/plans/NEXO-0047-hardened-mcp-integrations.md`
- `harness/control/runbooks/NEXO-0025-chrome-devtools-mcp.md`
- `harness/control/runbooks/NEXO-0047-hardened-mcp-integrations.md`
- `https://opencode.ai/docs/mcp-servers/`
- `https://github.com/github/github-mcp-server`
- `https://github.com/ChromeDevTools/chrome-devtools-mcp`
- `https://github.com/upstash/context7`

## Files To Create Or Modify

- `opencode.json`
- `.opencode/agents/nexo.md`
- `.opencode/tests/mcp-config.test.js`
- `harness/control/runbooks/NEXO-0025-chrome-devtools-mcp.md`
- `harness/control/implementations/IMPL-NEXO-0047-hardened-mcp-integrations.md`
- NEXO-0047 governed evidence and live-state files

## Implementation Steps

1. Replace mutable/deprecated MCP entries with the exact plan configuration.
2. Disable MCP tool globs globally and enable them only for `nexo`.
3. Require confirmation for Chrome tools and allow bounded read-only MCP tools.
   Use the pinned official GitHub container because remote OAuth discovery is
   incompatible with OpenCode and no PAT may be stored.
4. Add structural regression tests for versions, endpoints, headers, exposure,
   timeouts, secret hygiene, and adapter permissions.
5. Update the Chrome runbook and create a durable implementation record.
6. Run all declared verification and record exact results.

## Verification

- `node --test .opencode/tests/mcp-config.test.js`
- `node --test .opencode/tests/*.test.js`
- `opencode debug config`
- `opencode mcp list`
- `node .opencode/scripts/build-session-context.mjs`
- `graphify update .`

## Risks

- Do not start OAuth, create a token, or write an API key.
- Do not connect Chrome DevTools to a personal browser profile.
- Do not broaden GitHub beyond read-only bounded toolsets.
- Do not silently replace an unavailable remote service with another package.

## Acceptance Criteria

- No `@latest` or deprecated GitHub npm server remains in `opencode.json`.
- Chrome is exact-versioned and privacy/update controls are explicit.
- GitHub is official, digest-pinned, bounded, read-only, lockdown-enabled,
  hardened as a container, and credential-free in the repository.
- Context7 is official, remote, keyless, and limited to documentation lookup.
- Only `nexo` receives MCP tools and Chrome calls require confirmation.
- All declared verification succeeds or a blocker is recorded.

## Required Gates

- QA review: required
- Security review: required
- User confirmation: required only for OAuth, credential creation, live browser
  control, external mutation, commit, push, or deploy
