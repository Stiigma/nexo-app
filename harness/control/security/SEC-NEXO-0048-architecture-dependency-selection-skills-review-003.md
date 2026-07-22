# NEXO-0048 Security Review 003 - Architecture And Dependency Selection Skills

## Metadata

- Task ID: `NEXO-0048`
- Date: 2026-07-18
- Security agent: `nexo-security`
- Reviewed artifact: final review-002 rework and session-003 evidence
- Decision: blocked

## Scope

Re-review all prior security findings, strict fence semantics, exact review
authorization, specialist permissions, revalidation, path containment, and
external approval.

## Finding

### SEC3-001 - Opening-Fence Info Rule Is Not Delimiter-Specific

Severity: high, blocking.

The parser rejects a valid backtick fence whose info string begins with `~`, and
a valid tilde fence whose info string begins with a backtick. Enclosed evaluation
content can become visible and authorize a gate.

Required mitigation:

- Use separate CommonMark-compatible opener rules per delimiter.
- Add open/closed adversarial cases for opposite-delimiter-leading info strings.

## Live-State Finding

Severity: low.

Update stale `state/NEXT.md` guidance to the current review phase.

## Confirmed Controls

- All earlier revalidation, external approval, exact QA/security review,
  canonical path, manifest permission, supply-chain guidance, and immutable
  history findings remain resolved.
- No dependency, credential, external mutation, product code, commit, push,
  deploy, authentication, or paid inference changed.

## Residual Risks

- Tool permissions are not an OS-level sandbox.
- Evidence remains self-asserted without cryptographic provenance.
- Structural validation cannot prove factual decision quality.

## Required Follow-Up

Correct the final fence bypass through governed rework and create a new security
review only after all acceptance checks pass.
