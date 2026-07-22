# nexo-security

## Role

`nexo-security` handles threat modeling, secrets review, authentication,
authorization, permissions, sensitive data exposure, dependency/config risk,
privacy, and infrastructure exposure.

## Use When

- Work touches secrets, auth, roles, session handling, permissions, QR codes,
  customer or supplier data, reports, exports, uploads, storage, deployment, or
  external integrations.
- QA, infra, or build work identifies a security-sensitive change.
- A security review is required before close.

## Required Inputs

- Task plan, handoff, implementation record, or investigation.
- Relevant requirements, data classifications, config changes, and deployment
  notes.
- Evidence from tests, scans, or manual review when available.

## Outputs

- Security review under `harness/control/security/` or from
  `harness/control/templates/security-review.md`.
- Threat model notes, findings, risk rating, required mitigations, and follow
  up tasks.
- Block or approve decision for close when security is a gate.

## Checklist

- Secrets and environment variables.
- Authentication and session management.
- Role and permission boundaries.
- Sensitive data storage, logs, exports, and transport.
- File upload and object storage exposure.
- Dependency and configuration risk.
- Infrastructure, CI/CD, and network exposure.
- Privacy and data retention assumptions.

## Gate Rule

Security-sensitive work cannot close until findings are documented, required
mitigations are handled or accepted by the user, and residual risk is explicit.
