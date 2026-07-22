# NEXO-0049 Security Review 001 - OpenCode2 Productivity And Observability

## Metadata

- Task ID: `NEXO-0049`
- Date: 2026-07-18
- Security agent: `nexo-security`
- Reviewed artifact: session-001 implementation, exact dependency, privacy
  controls, local server/TUI, telemetry, and governed security gate

## Security Decision Evaluation

- Decision: approved
- Reviewed evidence: exact Plannotator package metadata/source behavior,
  effective plugin order/config/commands, local guards, ledger schema, status
  server, TUI source, focused privacy/telemetry/runtime tests, complete 81-test
  suite, secret-pattern scan, doctor, pseudo-TTY load, and runbook rollback.
- Findings: no blocking security finding remains. SEC-001 found that manual
  annotation could accept arbitrary folders or sensitive paths; it was fixed by
  allowing only project-relative `.md`, `.txt`, or `.html` files and denying
  URLs, folders, traversal, absolute paths, and `.env*`, with direct regressions.
- Residual risk: the exact third-party plugin executes inside OpenCode with the
  user's local privileges, regex sanitization cannot recognize every possible
  secret format, and OpenCode tool permissions are not an OS sandbox.

## Scope

Review dependency/install effects, sharing/network behavior, local server
exposure, secret paths, prompt/tool-content retention, HTML injection, command
scope, credentials, permissions, and rollback.

## Data And Trust Boundaries

- `harness/control/` remains canonical; plugins are adapters without lifecycle
  or memory authority.
- Plannotator is untrusted third-party code pinned to `0.23.1`, manually invoked,
  and removable independently.
- Ledger/status consumers read local metadata only; no telemetry network or
  second database exists.

## Secrets And Environment

- File, patch, grep, and shell access to `.env*` and the envsitter pepper path
  fails closed; documented templates remain allowed.
- User text redacts named secrets, bearer values, JWTs, bcrypt hashes, and large
  base64 blobs before model processing.
- Plannotator sharing is disabled in config/environment, remote mode is forced
  off before invocation, and URL/path guards prevent alternate retrieval.
- No credential signature was found in the changed OpenCode source/config scan.

## Authentication And Sessions

- No authentication, OAuth, account, cookie, or external session behavior was
  added or changed.
- Budget session IDs are local attribution metadata, not authentication tokens.

## Roles And Permissions

- Nexo remains the only selectable Nexo primary and specialists remain hidden,
  non-delegating, and governed by existing permissions.
- Manual Plannotator commands route through `nexo`; no autonomous tool or agent
  permission was granted.

## Sensitive Data

- Tool telemetry persists no argument, title, output, metadata, prompt, or
  environment value. Tests inject sentinel content and prove it is absent from
  the serialized ledger.
- TUI status reads only task IDs/status, aggregate costs/tokens/tool counts, and
  thresholds.
- The loopback page escapes all dynamic text and loads no scripts or remote
  resources.

## Dependencies And Configuration

- `@plannotator/opencode@0.23.1` is exact and is the only newly approved runtime
  dependency; no product manifest or lockfile changed.
- Package-cache resolution created no global command files. Three tighter
  project-local commands replace the package postinstall expectation.
- DCP, `snip`, memory, swarm, auto-review, sharing, and paid inference remain
  absent.

## Infrastructure Exposure

- Optional status binds only to `127.0.0.1:41749`, rejects port `5173`, denies
  non-GET/HEAD methods, sets no-store/nosniff/no-referrer and a script-blocking
  CSP, and is disabled until explicitly started.
- Inline CSS requires `style-src 'unsafe-inline'`; `default-src 'none'` blocks
  scripts/resources and `frame-ancestors 'none'` blocks embedding.
- No daemon, public listener, browser auto-open, deploy, or external environment
  mutation remains active.

## Findings

- SEC-001, medium before mitigation: arbitrary local annotation path could
  bypass the direct `.env*` tool guard. Resolved before approval with strict
  project-relative extension/path enforcement and tests.
- No unresolved high or medium finding remains.

## Required Mitigations

- No further mitigation is required for local single-user close.
- Preserve exact pinning, manual invocation, local path restrictions, content-
  free telemetry, and loopback binding on future changes.

## Residual Risk

- A compromised pinned dependency or local user account has the same local
  privileges as OpenCode; this task does not claim sandbox isolation.
- Sanitization is defense in depth. The primary control remains not reading or
  emitting real secrets.
