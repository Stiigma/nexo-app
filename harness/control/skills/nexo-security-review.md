# nexo-security-review

## Purpose

Review security-sensitive work and record risks, mitigations, and residual
risk.

## Review Areas

- Secrets and environment variables.
- Authentication and session handling.
- Roles, permissions, and authorization checks.
- Sensitive data at rest, in transit, in logs, and in exports.
- File upload, object storage, and QR payload exposure.
- Dependency and configuration risk.
- Infrastructure, CI/CD, and network exposure.
- Privacy, retention, and deletion assumptions.

## Output

Use `harness/control/templates/security-review.md` or write a security record
under `harness/control/security/`. The review must state approved, conditionally
approved, or blocked.
Governed close evidence must use one exact Task ID metadata field and one
`## Security Decision Evaluation` section. Its decision and non-placeholder
reviewed evidence, findings, and residual-risk fields stay inside that section
and outside fenced examples.

## Rule

For a governed task, run the `security` control-engine gate before review. It
confirms that implementation evidence and verification are ready to inspect.

Do not accept unresolved high-risk findings silently. Either fix them, record
explicit user acceptance, or block close.
