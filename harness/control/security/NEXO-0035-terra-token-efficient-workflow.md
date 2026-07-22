# NEXO-0035 Security Review - Terra Token-Efficient Agent Workflow

## Metadata

- Task ID: `NEXO-0035`
- Date: 2026-07-15
- Security agent: `nexo-security`
- Reviewed artifact: `IMPL-NEXO-0035-terra-token-efficient-workflow.md`
- Decision: approved

## Scope

Context selection and provider exposure boundaries, FIAD/Nexo separation,
local session markers, budget metadata, generated files, and configuration.

## Data And Trust Boundaries

- `focus.json` contains task metadata, paths, constraints, checks, and hashes;
  it contains no prompt history, credentials, or source contents.
- The generated packet contains only the approved compact context and exact
  fallback paths. It is local and ignored.
- FIAD canonical content is only sent when a session is marked by a `fiad:*` or
  `isyte:*` command. A `nexo:*` command clears that session's FIAD marker.

## Secrets And Environment

- No secret or credential file is read or written by the compiler, budget
  plugin, tests, focus record, or config.
- No auth file, API key, connection string, or provider credential was copied
  into evidence.

## Authentication And Sessions

- Local marker/binding files store opaque session IDs, task IDs, role/phase,
  timestamps, and cost/token totals only; they store no message text.

## Roles And Permissions

- Canonical agent routing and user-confirmation gates remain intact.
- Compact startup cannot bypass governance: invalid or insufficient context
  requires the full canonical resume path.

## Sensitive Data

- Source hashes reveal change identity, not file content.
- FIAD sensitive-file rules remain in its scoped context.

## Dependencies And Configuration

- No dependency was added. Existing Node/OpenCode plugin APIs are used.
- Experimental lifecycle hooks remain a compatibility risk, not a direct data
  exposure finding; plugin hook-load and lifecycle tests cover current types.

## Infrastructure Exposure

- No network, database, storage, CI/CD, deployment, or provider setting was
  modified. No paid request was made.

## Findings

- No high- or medium-risk security finding.
- Low: stale local session markers could preserve FIAD mode for the same opaque
  session ID. Session IDs are scoped locally, reload behavior is intentional,
  and any `nexo:*` command clears the marker.

## Required Mitigations

- Keep generated state ignored and retain the Nexo-clear lifecycle test.
- Revalidate experimental hooks after OpenCode upgrades.

## Residual Risk

- Accepted low operational risk from local marker persistence and future
  OpenCode hook/API changes.
