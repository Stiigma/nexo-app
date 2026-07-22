# nexo-infra-guardrails

## Purpose

Apply infrastructure guardrails before changing Docker, Kubernetes, CI/CD,
deployment, scripts, runbooks, or environment configuration.

## Guardrails

- No real secrets. Use placeholders and documented variables.
- Do not copy reference-system `.env` files, dumps, credentials, PDFs, XLSX, or
  sensitive content.
- Durable infrastructure conventions require an ADR.
- Commit, push, deploy, or external environment changes require explicit user
  confirmation.
- Kubernetes, CI/CD, deploy, and network exposure changes require QA and
  security review before close.
- Write rollback notes for deployment-affecting changes.

## Output

Infrastructure handoff, ADR, runbook, implementation record, QA review, and
security review as required by the change.

## Verification

Validate syntax and local behavior where possible. Record commands, skipped
checks, placeholders, rollback path, and residual risk.
