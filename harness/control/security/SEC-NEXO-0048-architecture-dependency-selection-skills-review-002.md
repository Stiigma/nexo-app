# NEXO-0048 Security Review 002 - Architecture And Dependency Selection Skills

## Metadata

- Task ID: `NEXO-0048`
- Date: 2026-07-18
- Security agent: `nexo-security`
- Reviewed artifact: governed rework and session-002 evidence
- Decision: blocked

## Scope

Re-review SEC-001 through SEC-005 and search for remaining authorization,
parsing, path, supply-chain, or permission bypasses.

## Findings

### SEC2-001 - QA And Security Decisions Lack Exact Review Contracts

Severity: high, blocking.

Close still validates QA/security with a task-ID substring and document-wide
decision field. Another task's review can mention NEXO-0048 and satisfy close.

Required mitigation:

- Require one exact Task ID metadata field and one section-scoped QA or security
  decision with non-placeholder review fields.
- Add cross-task, out-of-section, and unrelated-review tests.

### SEC2-002 - Fenced-Content Exclusion Can Be Bypassed

Severity: high, blocking.

Fence parsing loses opening length and accepts invalid closers. Evaluations that
remain fenced according to Markdown can become authorizing evidence.

Required mitigation:

- Track exact fence semantics, reject unterminated fences, and add length,
  trailing-text, backtick, and tilde adversarial cases.

### SEC2-003 - Historical Guidance Remains Contradictory

Severity: low.

The implementation record uses new governed tasks for future corrections, while
the active plan still refers to reopening historical tasks.

Required mitigation:

- Align the plan to immutable closed history.

## Confirmed Resolution

- SEC-001 later-gate revalidation is resolved.
- SEC-002 is resolved within the trusted local orchestrator model for build and
  exact external approval, subject to expanding specialist edit denies.
- SEC-004 canonical path containment is resolved.
- No dependency, credential, account, external mutation, product code, commit,
  push, deploy, or paid inference changed.

## Residual Risks

- Edit-tool permissions are not an OS sandbox; instruction-following agents and
  untrusted-content rules remain part of the local trust model.
- Evidence remains self-asserted without cryptographic human provenance.

## Required Follow-Up

Process the blocking findings through another governed rework and create a third
security review only after focused and complete checks pass.
