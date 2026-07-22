# NEXO-0047 Report - Hardened MCP Integrations Session 001

## Metadata

- Date: 2026-07-18
- Agent: `nexo-infra`
- Task: `NEXO-0047`
- Status: implementation complete

## What Was Done

- Pinned Chrome DevTools to `1.6.0`, disabled usage statistics, CrUX, and update
  checks, and enabled network-header redaction.
- Replaced the deprecated GitHub npm server. Initial use of GitHub's hosted
  endpoint failed because its auth server does not support OpenCode dynamic
  client registration; no PAT fallback was accepted.
- Moved GitHub to the official immutable `v1.6.0` Linux/amd64 container digest
  with built-in in-memory OAuth, loopback callback, bounded toolsets/scopes,
  read-only and lockdown modes, and hardened Docker flags.
- Added the official keyless Context7 remote, whose advertised MCP surface is
  library resolution and documentation query.
- Denied all three MCP tool globs globally, enabled them only for `nexo`, and
  required confirmation for Chrome tools.
- Added focused regression tests, provider-use instructions, upgrade rules, a
  combined runbook, and a durable implementation record.
- Downloaded only the approved GitHub image digest into the local Docker cache
  so runtime can enforce `--pull=never`. No persistent container was created.

## Files Changed

- `opencode.json`
- `.opencode/agents/nexo.md`
- `.opencode/tests/mcp-config.test.js`
- `harness/control/agents/nexo.md`
- `harness/control/runbooks/NEXO-0025-chrome-devtools-mcp.md`
- `harness/control/runbooks/NEXO-0047-hardened-mcp-integrations.md`
- `harness/control/implementations/IMPL-NEXO-0047-hardened-mcp-integrations.md`
- NEXO-0047 plan, handoff, manifest, journal, task, and live-state records
- Derived `graphify-out/` artifacts

## Verification Performed

- `node --test .opencode/tests/mcp-config.test.js`: 5 passed, 0 failed.
- `node --test .opencode/tests/*.test.js`: 43 passed, 0 failed.
- `opencode debug config`: exact MCP commands/endpoints, global denies,
  `nexo` enables, Chrome `ask`, and GitHub/Context7 `allow` resolve correctly.
- `opencode mcp list`: Chrome DevTools, exact-digest GitHub, and Context7 all
  connected after correcting the remote GitHub OAuth incompatibility.
- `node .opencode/scripts/build-session-context.mjs`: 4,148 characters,
  approximately 1,037 tokens.
- `graphify update .`: 9,109 nodes, 11,114 edges, 928 communities.
- `node harness/control/scripts/control-engine.mjs gate --task NEXO-0047 --name build`:
  allowed with synchronized state and required pre-build evidence.
- `docker pull ghcr.io/github/github-mcp-server@sha256:6f48d5cc9e9fe978315419cb68860fc605886b4250bc907339efaa7e96e41ce9`:
  exact expected digest downloaded to local cache.

## External And Security Effects

- Public provider documentation, npm metadata, GitHub release metadata, and
  image manifests were read.
- The exact GitHub image was added to the local Docker cache.
- No GitHub or Context7 account authentication, OAuth consent, MCP tool call,
  browser control, credential access, repository mutation, commit, push,
  deploy, service exposure, or paid inference occurred.

## Open Items

- Run governed QA and security review.
- GitHub account authorization and a live Chrome tool invocation remain
  operator-triggered actions outside this close; configuration discovery is
  complete without them.

## Recommended Next Step

Transition to implemented, pass QA and security, then close NEXO-0047 and
restart OpenCode to load the new MCP configuration.
