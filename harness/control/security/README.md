# Security Records

Security records capture reviews, threat models, findings, mitigations, and
accepted residual risk.

## Use When

- Work touches secrets, auth, permissions, sensitive data, storage, exports,
  uploads, QR payloads, infrastructure exposure, CI/CD, or deployment.
- `nexo-qa`, `nexo-infra`, or `nexo-build` identifies security risk.

## File Name

```text
NEXO-0000-short-title-security-review.md
```

## Required Content

- Scope.
- Data and trust boundaries.
- Findings.
- Risk rating.
- Required mitigations.
- Residual risk.
- Decision: approved, conditionally approved, or blocked.
