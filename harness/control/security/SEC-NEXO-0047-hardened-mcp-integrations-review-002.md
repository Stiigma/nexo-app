# NEXO-0047 Security Review 002 - Hardened MCP Integrations

## Metadata

- Task ID: `NEXO-0047`
- Date: 2026-07-18
- Security agent: `nexo-security`
- Reviewed artifact: final MCP configuration, permissions, instructions, tests, and runbooks
- Decision: approved

## Scope

Re-review supply chain, secrets, OAuth, container isolation, browser control,
remote disclosure, tool exposure, prompt injection, and the review 001
mitigation.

## Supply Chain

- Chrome uses exact npm version `1.6.0`, compatible with local Node, with a
  documented published integrity and explicit upgrade procedure.
- GitHub uses official immutable release `v1.6.0` by the exact Linux/amd64 image
  manifest digest. Runtime uses `--pull=never`.
- The deprecated GitHub npm server and all mutable package tags are absent.
- Context7 uses the provider's official HTTPS endpoint and no local package.

## Secrets And Authentication

- No PAT, API key, Authorization header, client secret, token interpolation, or
  credential file exists in project configuration.
- GitHub uses the official stdio server's first-use OAuth and keeps its token in
  ephemeral container memory.
- This task did not initiate OAuth or grant account access.

## Container And Network Isolation

- GitHub has a read-only filesystem, all Linux capabilities dropped, no new
  privileges, no volume, no host network, and no implicit image pull.
- OAuth callback port `8085` is published only on `127.0.0.1`.
- GitHub server modes are read-only and lockdown; toolsets are limited to
  context, repositories, issues, and pull requests.

## Tool And Data Boundaries

- MCP tools are denied globally and enabled only for the sole Nexo primary.
- Chrome always requires confirmation and targets a dedicated loopback browser.
- Context7 accepts only minimum non-sensitive documentation queries.
- Final canonical and adapter rules classify every MCP response as untrusted
  data and prohibit following embedded instructions or deriving authority from
  returned content. Focused tests preserve this mitigation.

## Findings

- Review 001's prompt-injection finding is resolved.
- No blocking security finding remains.

## Residual Risk

- GitHub's `repo` OAuth scope is broad because GitHub offers no read-only OAuth
  scope for private repository content. The exact pinned server's read-only
  enforcement remains a material trust boundary.
- Exact npm versions are immutable in normal registry operation, but the
  OpenCode command cannot independently require the documented Chrome tarball
  integrity value.
- Explicit MCP queries and tool results can expose selected external or private
  data to the configured Generation Model; data minimization remains required.
- Provider compromise, malicious repository/browser content, and local Docker
  daemon compromise cannot be eliminated by project configuration.

## Required Mitigations

- Keep exact versions/digests, global denies, Chrome confirmation, GitHub
  read-only/lockdown, loopback-only exposure, and untrusted-content rules.
- Require a governed dependency/security review before any upgrade, new
  toolset, secret, scope expansion, endpoint replacement, or writable MCP use.
