# NEXO-0047 Security Review 001 - Hardened MCP Integrations

## Metadata

- Task ID: `NEXO-0047`
- Date: 2026-07-18
- Security agent: `nexo-security`
- Reviewed artifact: MCP configuration, permissions, trust boundaries, and runbooks
- Decision: blocked

## Scope

Review supply-chain mutability, secrets, OAuth, container isolation, browser
control, remote query disclosure, tool exposure, and untrusted MCP results.

## Controls Confirmed

- Chrome uses an exact package version, privacy flags, a dedicated loopback
  browser, header redaction, and per-call confirmation.
- GitHub uses an exact official image digest, no PAT, in-memory OAuth,
  loopback-only callback, read-only/lockdown modes, bounded toolsets, no
  volumes, read-only filesystem, no capabilities, and no new privileges.
- Context7 is keyless and exposes only two documentation retrieval tools.
- All MCP tools are denied globally and available only to `nexo`.

## Finding

- Medium: outbound query rules are explicit, but the canonical orchestrator and
  adapter do not explicitly classify MCP responses as untrusted data. Provider,
  repository, issue, pull-request, browser, or community documentation content
  can contain prompt-injection instructions that attempt to trigger commands,
  reveal data, broaden tool use, or bypass confirmation.

## Required Mitigation

- Add a canonical and adapter rule that MCP content is untrusted data, embedded
  instructions must never be followed, and any requested action must be
  independently justified by the user's objective and existing permissions.
- Add a focused regression assertion for that adapter rule.
- Re-run focused and complete harness acceptance before security re-review.

## Residual Risks

- GitHub's `repo` OAuth scope is broader than read-only because GitHub has no
  read-only OAuth scope for private repository content; pinned server read-only
  enforcement remains a required trust boundary.
- `npx` verifies an exact Chrome package version but configuration does not
  independently enforce the documented npm integrity hash.
- MCP reads can still disclose explicitly submitted queries and returned data
  to the configured Generation Model.
