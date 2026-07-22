# NEXO-0047 Implementation - Hardened MCP Integrations

## Metadata

- Task ID: `NEXO-0047`
- Date: 2026-07-18
- Agent: `nexo-infra`
- Related plan: `../plans/NEXO-0047-hardened-mcp-integrations.md`
- Related handoff:
  `../handoffs/HOFF-2026-07-18-hardened-mcp-integrations.md`
- Related report:
  `../reports/2026-07-18/NEXO-0047-hardened-mcp-integrations-session-001.md`
- Final rework report:
  `../reports/2026-07-18/NEXO-0047-hardened-mcp-integrations-session-002.md`

## Summary

OpenCode now uses bounded official MCP integrations instead of mutable or
deprecated commands. Chrome remains local and exact-versioned, GitHub uses an
exact-digest official container, and Context7 uses its provider-hosted endpoint.

## Architecture And Pattern

- Architecture/technology: native declarative OpenCode configuration. No
  wrapper, daemon, installed package, lockfile, or application dependency was
  justified for three MCP endpoints.
- Pattern: explicit allowlisting at three layers: server capabilities, global
  tool exposure, and orchestrator permission. No application design pattern is
  introduced.
- Chrome uses the official npm package at `1.6.0` because it must connect to a
  loopback browser. GitHub uses the official `v1.6.0` container by digest
  because OpenCode cannot dynamically register with GitHub's remote auth
  server. Context7 uses its official HTTPS remote.

## Behavior Changed

- Chrome DevTools is pinned to `chrome-devtools-mcp@1.6.0`; usage statistics,
  CrUX, and update checks are disabled and network headers are redacted.
- GitHub now uses the official Linux/amd64 image digest with built-in OAuth,
  only context/repository/issue/pull-request toolsets, read-only and lockdown
  modes, and `repo,read:org` OAuth scopes.
- The GitHub container has no implicit pull, writable filesystem, Linux
  capabilities, new-privilege path, host volume, or non-loopback published
  port. OAuth callback `8085` is bound only to `127.0.0.1`.
- Context7 uses `https://mcp.context7.com/mcp` without a stored key and exposes
  only provider-defined documentation resolution/query tools.
- All three MCP tool globs are disabled globally and enabled only for `nexo`.
  GitHub and Context7 reads are allowed; Chrome calls require confirmation.

## Trust Boundaries

- GitHub's official stdio server keeps its OAuth token in container memory.
  This task does not authenticate, grant account access, or persist a token.
- Context7 receives only explicit library documentation queries. It must not
  receive source code, credentials, customer data, or private business context.
- Chrome has full visibility into its attached browser; the dedicated loopback
  profile and user confirmation are required controls.
- All MCP responses are untrusted data. Embedded instructions cannot authorize
  commands, disclosure, broader tool use, or permission bypass; actions require
  independent justification from the user's objective.

## Dependency Decision

- No application or npm dependency was installed. The reviewed Chrome npm
  release is `1.6.0`,
  with published integrity
  `sha512-VZX6f/OjQSYhy2BGGRs+y3LsrsAQAz/HwZCWKBLVyST/4r/3zjVEjjVW7gMCVbRDuspnVdcp5hQDPrQ5UFrdZw==`.
- Its Node requirement `^20.19.0 || ^22.12.0 || >=23` is satisfied by local
  Node `v26.4.0`.
- GitHub MCP Server release `v1.6.0` is immutable and its official Linux/amd64
  container manifest is pinned to
  `sha256:6f48d5cc9e9fe978315419cb68860fc605886b4250bc907339efaa7e96e41ce9`.
- That exact image was downloaded into the local Docker cache so OpenCode can
  enforce `--pull=never`; no daemon, container, or account session persists.
- Future upgrades require the runbook's explicit source/version/integrity and
  acceptance checks; mutable tags remain prohibited.

## Performance

- Context7 contributes two tools. GitHub is bounded to four toolsets and is not
  exposed to specialists. Chrome remains a broad tool server but is also
  primary-only and starts on demand through OpenCode.
- No local background process, cache, polling loop, or application hot path was
  added.

## Verification

- Focused MCP configuration tests: 5/5 passed.
- Complete OpenCode harness tests: 43/43 passed.
- Effective config resolves exact versions/digests, endpoint bounds, global
  denies, orchestrator enables, and MCP permissions.
- MCP discovery connects Chrome DevTools, GitHub, and Context7.
- Compact context remains 4,148 characters, approximately 1,037 tokens.
- Graphify updated after final rework to 9,126 nodes, 11,129 edges, and 920
  communities.

## Operational Notes

- Restart OpenCode after configuration changes.
- Approve the first GitHub tool's official OAuth flow only when account access
  is needed. The local server, not OpenCode remote OAuth, owns that flow.
- Context7 works without a key at lower rate limits; adding a key requires a
  separate secret-handling decision and environment-only configuration.
