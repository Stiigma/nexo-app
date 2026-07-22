# NEXO-0048 Security Review 001 - Architecture And Dependency Selection Skills

## Metadata

- Task ID: `NEXO-0048`
- Date: 2026-07-18
- Security agent: `nexo-security`
- Reviewed artifact: initial decision skills, adapters, engine, tests, and evidence
- Decision: blocked

## Scope

Review authorization bypass, fail-open outcomes, task binding, artifact
containment, requirement ownership, supply-chain guidance, external-action
boundaries, parser edge cases, and historical compatibility.

## Findings

### SEC-001 - Later Transitions Do Not Revalidate Pre-Build Decisions

Severity: high, blocking.

Architecture or dependency evidence can change after build authorization and is
not checked again before implemented, QA, security, or close decisions.

Required mitigation:

- Revalidate every declared pre-build requirement during active-to-implemented,
  review gates, and close.
- Add regression tests that mutate approval after build and confirm later
  transitions fail closed.

### SEC-002 - Requirement Ownership And External Approval Are Under-Specified

Severity: high, blocking.

An implementation specialist can currently edit the governed manifest, and
external approval has no exact decision contract. This permits a requirement
downgrade or weak external evidence to bypass intended authorization.

Required mitigation:

- Deny `nexo-build` edits to structured task manifests; the orchestrator owns
  evidence/status synchronization after specialist return.
- Require exact approved external-approval evidence when that requirement is
  true.
- Document that manifest requirement classification is planner/orchestrator
  policy and cannot be downgraded during build.

### SEC-003 - Decision And Task Parsing Is Ambiguous

Severity: high, blocking.

Task binding uses a substring and heading/decision checks are global. Another
task mention, fenced examples, duplicate headings, or out-of-section decisions
can forge structurally valid evidence.

Required mitigation:

- Require one exact task-ID metadata field.
- Ignore fenced examples.
- Require exactly one expected heading and scope the exact decision to it.
- Require non-placeholder decision fields and add adversarial regression cases.

### SEC-004 - Canonical Evidence Directory Can Be Bypassed Inside The Repository

Severity: medium, blocking.

Lexical prefix checks do not reject dot segments, and realpath containment only
checks the repository root. In-repository traversal or a symlink can point an
artifact type at a disallowed internal file.

Required mitigation:

- Reject non-normal relative paths and backslash ambiguity.
- Verify the final realpath remains under a canonical directory for that
  artifact type.
- Add in-repository traversal and symlink tests.

### SEC-005 - Historical Reopen Guidance Is Inaccurate

Severity: low.

Closed tasks have no reopen transition. Historical incompatible evidence should
stay immutable, and future rework should use a new governed task.

Required mitigation:

- Correct the implementation note and document the historical boundary.

## Controls Confirmed

- No package, lockfile, credential, account, OAuth, external mutation, product
  code, commit, push, deploy, or paid inference changed.
- The engine remains local, read-only, and free of child-process or network I/O.
- The dependency skill covers exact identity, official sources, transitives,
  install behavior, secrets/scopes, network/data access, and rollback.

## Residual Risks

- Markdown evidence remains self-asserted and has no cryptographic human
  provenance.
- Structural checks cannot prove the factual quality of architecture or
  supply-chain analysis.
- Agents must continue treating package metadata, advisories, repositories, and
  external documentation as untrusted data.

## Required Follow-Up

Process all blocking findings through governed rework and create a second
security review after focused and complete verification pass again.
