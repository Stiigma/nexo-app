# NEXO-0046 Security Review - Structured Control Engine

## Metadata

- Task ID: `NEXO-0046`
- Date: 2026-07-18
- Security agent: `nexo-security`
- Reviewed artifact: structured manifest and evidence evaluator
- Decision: approved

## Scope

Review filesystem containment, evidence trust, sensitive-file access, symlinks,
review parsing, mutation authority, and external effects.

## Data And Trust Boundaries

- Manifests are untrusted control input and are schema-validated.
- `tasks.md` remains canonical; status and plan conflicts block operations.
- Evidence paths are explicit and restricted by artifact type.

## Secrets And Environment

- Artifact allowlists prevent `.env` and arbitrary repository files from being
  used as evidence.
- Realpath checks reject symlinks that resolve outside the repository before
  content is read.
- No secret or credential was accessed.

## Authentication And Sessions

- Product authentication and OpenCode sessions are unchanged.

## Roles And Permissions

- The engine has no write operation or external-action path.
- The orchestrator applies an allowed decision manually and remains constrained
  by existing user-confirmation rules.

## Sensitive Data

- Evidence content is inspected only for task identity, required headings,
  declared verification commands, and review decisions; content is not emitted.

## Dependencies And Configuration

- No dependency or runtime version changed.
- Only Node.js standard-library filesystem, path, and URL modules are used.

## Infrastructure Exposure

- No process daemon, listener, port, service, cloud resource, or deployment was
  introduced.

## Findings

- Security review found and corrected canonical-directory, escaping-symlink,
  and duplicate-decision risks through governed rework.
- No blocking finding remains.

## Required Mitigations

- Keep the engine read-only until operational evidence justifies safe mutation.
- Treat manifest changes as code review/control-plane changes.

## Residual Risk

- The engine validates recorded evidence, not whether a command truly executed
  or a human approval is authentic.
- A malicious in-repository canonical evidence file can still lie; review and
  version-control provenance remain required.
- Existing tasks without manifests remain under prompt-enforced legacy rules.
