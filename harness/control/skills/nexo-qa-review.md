# nexo-qa-review

## Purpose

Perform a QA review for requirements coverage, acceptance, UX readiness, tests,
data quality, security handoff, and release readiness.

## Review Areas

- Requirements coverage.
- Acceptance criteria.
- UX states and accessibility readiness.
- Automated tests.
- Manual verification.
- Data integrity and migration risk.
- Security review need and outcome.
- Release, rollback, and support readiness.

## Output

Use `harness/control/templates/qa-review.md` or include the same fields in a
session report. The review must state pass, conditional pass, or blocked.
Governed close evidence must use one exact Task ID metadata field and one
`## QA Decision Evaluation` section. Its decision and non-placeholder reviewed
evidence, findings, and residual-risk fields stay inside that section and
outside fenced examples.

## Gate Rule

For a governed task, run the `qa` control-engine gate before review. It confirms
that implementation evidence and verification are ready to inspect.

If the change touches deployment, CI/CD, Kubernetes, secrets, auth, permissions,
sensitive data, or data migration, confirm whether `nexo-security` review is
required before close.
