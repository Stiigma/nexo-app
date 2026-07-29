# NEXO-0031 Security Review 002 - Vercel Root Directory Remediation

## Metadata

- Task ID: `NEXO-0031`
- Date: 2026-07-22
- Security agent: `nexo-security`
- Reviewed artifact: `harness/control/runbooks/RUNBOOK-NEXO-0031-operations.md`
- Prior review: `harness/control/security/SEC-NEXO-0031-vercel-root-directory-remediation-review-001.md`

## Scope

This re-review covers only the SEC-001 authorization rework and the resulting
security posture of the documented Vercel Root Directory/build remediation. It
does not approve or close the broader NEXO-0031 infrastructure task. Docker,
ngrok, CI/CD deployment behavior, DNS, domains, backups, credentials, and other
infrastructure exposure remain outside this decision.

Review 001 remains unchanged as historical evidence.

## Security Decision Evaluation

- Decision: approved
- Reviewed evidence: the current scoped runbook diff; security review 001; the
  local-readiness QA report; the NEXO-0031 plan, handoff, and accepted CI/CD
  ADR; unchanged `front/package.json`, `front/pnpm-lock.yaml`,
  `front/pnpm-workspace.yaml`, `front/vite.config.ts`, and `front/vercel.json`;
  the absent root `package.json` and empty root `package-lock.json`; and the
  previously reviewed official Vercel build/package-manager behavior.
- Findings: SEC-001 is resolved. The runbook now places explicit user
  authorization before every Vercel settings mutation and redeployment, limits
  pre-authorization activity to read-only inspection and recording of
  non-secret values, and orders project verification, bounded settings changes,
  and redeployment after authorization. No blocking scoped finding remains.
- Residual risk: Vercel may select pnpm 9 or 10 for lockfile version `9.0`
  because the frontend manifest does not pin an exact package-manager version.
  This is a pre-existing low reproducibility risk, not introduced by the
  remediation, and does not block the locked, cleanly built frontend. Hosted
  deployment behavior and rollback remain externally unverified.

### SEC-001 - External mutation boundary

- Severity: Resolved (previously Low)
- Evidence: the runbook now requires explicit authorization before changing any
  value or initiating a redeployment. Without authorization, it permits only
  read-only inspection and recording of current non-secret settings. After
  authorization, it requires confirmation of the correct team/project and no
  in-flight deployment before applying the six named build settings and
  starting the authorized deployment.
- Assessment: the ordered procedure now conforms to the control-plane external
  mutation rule and does not imply authority to change domains, credentials,
  Git integration, deployment triggers, production branches, access controls,
  or deployment protection.

### SEC-002 - Exact pnpm version

- Severity: Low (accepted residual risk)
- Evidence: `front/pnpm-lock.yaml` remains at lockfile version `9.0` with
  integrity-pinned resolutions, the clean frozen-lockfile install/build passed,
  and no dependency or lockfile changed. Vercel may select pnpm 9 or 10 because
  `front/package.json` has no `packageManager` field.
- Assessment: this version variance may affect reproducibility at the package
  manager edge, but there is no demonstrated dependency drift or exploit and it
  predates this runbook remediation. It does not require a dependency or
  configuration change for scoped approval. The actual Vercel-selected version
  should be captured in the authorized build evidence; any future exact pin is
  separate reviewed work.

### SEC-003 - Secrets, exposure, and rollback

- Severity: Informational
- Evidence: Root Directory `front` narrows the build context; disabled
  dashboard overrides restore the version-controlled `pnpm build`, `dist`, and
  Vite settings in unchanged `front/vercel.json`. The rework adds no secret,
  dependency, route, domain, permission, or external integration. It preserves
  recording of old non-secret settings, settings rollback, and promotion of a
  known stable prior deployment for application regression.
- Assessment: the guidance does not broaden repository exposure or bypass
  existing deployment authority. Vite `VITE_*` values remain public client
  configuration and must not contain secrets.

## Remaining External Checks

After explicit user authorization, an operator must:

1. Confirm the correct Vercel team/project, verify no deployment is in flight,
   and record only the current non-secret build settings.
2. Apply only Root Directory `front`, Framework Preset `Vite`, disabled
   build/output/install overrides, and Node `22.x`; verify unrelated settings
   remain unchanged.
3. Inspect the new build log for installation from `front/`, the selected pnpm
   version, locked dependency installation without lockfile regeneration,
   effective command `pnpm build`, Vite `7.0.6`, and publication of `dist` only.
4. Confirm build logs and generated client assets contain no credential and no
   secret is supplied through a public `VITE_*` variable.
5. Smoke-test the deployment and direct SPA routes while confirming domains,
   visibility, deployment protection, and access controls did not change.
6. Confirm a healthy prior deployment is available. If rollback becomes
   necessary, obtain/confirm authorization, restore the recorded settings or
   promote that deployment, and verify routing and availability.

These are execution/acceptance checks, not conditions requiring a new local
dependency or configuration change. Until they pass, Vercel deployment success
remains unverified and this approval must not be used as evidence to close all
NEXO-0031 infrastructure work.

## Review Record

- Repository artifact added by this re-review: this security record only.
- Security review 001 was not edited.
- No product code, dependency, lockfile, runbook, credential, browser, Vercel
  setting, deployment, or other external state was changed by this review.
- Recommended next step: return the scoped approval to `nexo`; perform the
  bounded external checks only after explicit user authorization, and keep the
  broader infrastructure security gate open.
