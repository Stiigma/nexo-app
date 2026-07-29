# NEXO-0052 Security Review

## Metadata

- Task ID: `NEXO-0052`
- Date: 2026-07-29
- Evaluator: Codex

## Security Decision Evaluation

- Decision: approved
- Reviewed evidence: OpenCode root/local configuration, MCP credential fields, doctor checks, repository secret-pattern scan, manifest path validation, atomic continuity writes, and regression tests
- Findings: the literal Vercel credential was removed and replaced with environment references; continuity rejects path traversal and ambiguous resume selection; controlled evidence and secret gates remain fail closed
- Residual risk: the previously exposed Vercel credential may remain valid in provider state, shell history, backups, or repository history until the owner revokes or rotates it externally

## Required Follow-Up

- Revoke or rotate the old Vercel credential in the provider.
- Store the replacement only in a non-versioned local environment or approved
  secret manager.

