# NEXO-0047 Report - Hardened MCP Integrations Session 002

## Metadata

- Date: 2026-07-18
- Agent: `nexo-infra`
- Task: `NEXO-0047`
- Status: final implementation after governed security rework

## What Was Done

- Processed security review 001 through implemented-to-active rework.
- Added canonical and OpenCode adapter rules that classify all MCP responses as
  untrusted data, reject embedded instructions, and require independent
  justification for any action.
- Added regression coverage proving the effective adapter retains the rule.
- Re-ran the complete config, discovery, context, test, and graph acceptance
  suite without changing versions, endpoints, scopes, or container bounds.

## Files Changed

- `.opencode/agents/nexo.md`
- `.opencode/tests/mcp-config.test.js`
- `harness/control/agents/nexo.md`
- `harness/control/runbooks/NEXO-0047-hardened-mcp-integrations.md`
- `harness/control/implementations/IMPL-NEXO-0047-hardened-mcp-integrations.md`
- NEXO-0047 security, lifecycle, plan, report, and live-state records
- Derived `graphify-out/` artifacts

## Verification Performed

- `node --test .opencode/tests/mcp-config.test.js`: 5 passed, 0 failed,
  including the untrusted-response adapter assertion.
- `node --test .opencode/tests/*.test.js`: 43 passed, 0 failed.
- `opencode debug config`: exact MCP bounds and the untrusted-response rule
  resolve in the sole Nexo primary.
- `opencode mcp list`: Chrome DevTools, exact-digest GitHub, and Context7 all
  connected; no account OAuth was initiated.
- `node .opencode/scripts/build-session-context.mjs`: 4,148 characters,
  approximately 1,037 tokens.
- `graphify update .`: 9,126 nodes, 11,129 edges, 920 communities.

## Security Rework Result

- Embedded instructions in browser, provider, repository, issue, pull-request,
  and documentation content cannot authorize commands, disclosure, broader
  tool use, or permission bypass.
- Existing residual risks remain documented: broad GitHub `repo` OAuth scope
  for private reads, exact-version npm integrity not independently enforced by
  config, and explicit query/result disclosure to the Generation Model.

## External And Security Effects

- MCP discovery contacted the configured services and started only ephemeral
  local MCP processes.
- No account authentication, OAuth consent, MCP data tool invocation, browser
  control, credential access, image change, repository mutation, commit, push,
  deploy, persistent container, or paid inference occurred.

## Open Items

- Repeat QA and security review against this final evidence.
- Create closeout and request implemented-to-closed after both pass.

## Recommended Next Step

Transition back to implemented, approve final QA/security evidence, and close
NEXO-0047 through the control engine.
