# fiad-security Checklist

- Read affected Project Profile, security context, and touched file list.
- Formal security gate is required for secrets, auth, permissions, privacy,
  sensitive data, or exposure changes.
- Never open credential PDFs, spreadsheets, SQL dumps, service account JSON, or
  real env files unless explicitly authorized.
- Use placeholders in examples and templates.
- Close with findings, mitigations, residual risk, and report.
