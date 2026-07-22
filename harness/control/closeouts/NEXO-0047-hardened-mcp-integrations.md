# NEXO-0047 Closeout - Hardened MCP Integrations

## Metadata

- Task ID: `NEXO-0047`
- Completion date: 2026-07-18
- Status: governed close evidence

## Objective

Replace mutable or deprecated MCP commands with bounded official integrations
for browser inspection, GitHub research, and current library documentation.

## Outcome

Chrome DevTools is exact-versioned with privacy controls, GitHub runs from an
official exact image digest in a hardened read-only container with ephemeral
OAuth, and Context7 provides a two-tool keyless documentation surface. MCPs are
denied globally, available only to `nexo`, and governed by confirmation, data
minimization, and untrusted-response rules.

## Files Changed

- OpenCode MCP, tool exposure, and `nexo` adapter configuration.
- Focused MCP regression tests.
- Canonical orchestrator MCP trust rules.
- Chrome and combined MCP operational runbooks.
- NEXO-0047 plan, handoff, implementation, reports, security reviews, QA,
  manifest, journal, live state, and derived graph records.

## Verification

- 5/5 focused MCP configuration tests pass.
- 43/43 complete OpenCode harness tests pass.
- Effective config resolves exact identities, bounds, and permissions.
- Chrome DevTools, GitHub, and Context7 discovery all connect.
- Compact context remains 4,148 characters, approximately 1,037 tokens.
- Graphify final rework update: 9,126 nodes, 11,129 edges, 920 communities.
- QA decision: pass.
- Security decision: approved after governed rework.

## Remaining Follow-Up

- Restart OpenCode to load the new configuration.
- Authorize GitHub only when account access is needed and after reviewing the
  official OAuth scope prompt.
- Start and confirm the dedicated Chrome profile only when browser inspection
  is needed.
- Add architecture/dependency selection skills and decision evaluations as the
  next agent-workflow task.

## Links

- Plan: `../plans/NEXO-0047-hardened-mcp-integrations.md`
- Handoff: `../handoffs/HOFF-2026-07-18-hardened-mcp-integrations.md`
- Final report:
  `../reports/2026-07-18/NEXO-0047-hardened-mcp-integrations-session-002.md`
- QA:
  `../reports/2026-07-18/NEXO-0047-hardened-mcp-integrations-qa.md`
- Final security:
  `../security/SEC-NEXO-0047-hardened-mcp-integrations-review-002.md`
- Initial security finding:
  `../security/SEC-NEXO-0047-hardened-mcp-integrations-review-001.md`
- Implementation:
  `../implementations/IMPL-NEXO-0047-hardened-mcp-integrations.md`
- Runbook: `../runbooks/NEXO-0047-hardened-mcp-integrations.md`
