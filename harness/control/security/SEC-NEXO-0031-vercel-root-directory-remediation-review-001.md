# NEXO-0031 Security Review - Vercel Root Directory Remediation

## Metadata

- Task ID: `NEXO-0031`
- Date: 2026-07-22
- Security agent: `nexo-security`
- Reviewed artifact: `harness/control/runbooks/RUNBOOK-NEXO-0031-operations.md`

## Scope

This review covers only the documented remediation for Vercel running
`vite build` from the repository root: setting the Vercel Root Directory to
`front`, retaining the Vite and Node 22 settings, removing inherited
build/output/install overrides, and using the unchanged frontend lockfile and
`front/vercel.json`.

This is not a security approval of all NEXO-0031 infrastructure and does not
approve task closure. Docker, ngrok, GitHub Actions deployment behavior, DNS,
domains, database backups, hosted runtime behavior, and the remaining
credential and exposure boundaries require their own broader verification.

## Security Decision Evaluation

- Decision: conditional
- Reviewed evidence: the scoped runbook diff; the Vercel failure and clean
  frontend install/build evidence recorded by QA; the NEXO-0031 plan and
  handoff; `docs/adr/ADR-2026-07-07-cicd-pipeline.md`;
  `front/package.json`, `front/pnpm-lock.yaml`, `front/pnpm-workspace.yaml`,
  `front/vite.config.ts`, and unchanged `front/vercel.json`; the empty root
  `package-lock.json` and absent root `package.json`; the frontend CI workflow;
  official Vercel build and package-manager documentation; and
  `harness/control/reports/2026-07-22/NEXO-0031-vercel-root-directory-remediation-qa-001.md`.
- Findings: no critical, high, or medium scoped vulnerability was found. One
  low-severity external-authorization ambiguity and one low-severity package
  manager reproducibility risk remain; the build-context and configuration
  changes otherwise narrow exposure and preserve existing controls.
- Residual risk: no Vercel setting, hosted build, deployment, production URL,
  environment-variable scope, deployment protection, or rollback was inspected
  externally. A lockfile-version-9 project may be built by Vercel with pnpm 9
  or 10 because `front/package.json` does not pin `packageManager`.

### SEC-001 - Dashboard mutation authorization ordering

- Severity: Low
- Evidence: the runbook records current settings and requires explicit user
  authorization before retrying or creating a deployment, but its ordered steps
  save the Root Directory, framework, overrides, and Node version before that
  authorization statement. Vercel documents these as project-wide settings
  applied to the next deployment.
- Impact: an operator could interpret the runbook as permitting project-setting
  mutation before approval, contrary to the control-plane rule that every
  external environment change requires explicit user confirmation. The setting
  changes do not deploy by themselves, which limits immediate impact.
- Required condition: before any dashboard edit, obtain explicit user
  authorization that covers both the named project-setting changes and the
  later redeployment. Record only non-secret old values and do not broaden the
  authorization to domains, environment variables, Git integration,
  production branches, access, or deployment-protection settings.

### SEC-002 - Package-manager version is lockfile-selected, not exactly pinned

- Severity: Low
- Evidence: `front/pnpm-lock.yaml` uses lockfile version `9.0`, contains
  integrity hashes, and resolved a clean frozen-lockfile build; the workspace
  permits the required `esbuild` build step. The package manifest has no
  `packageManager` field. Vercel documents that lockfile version `9.0` can select
  pnpm 9 or 10. The accepted CI/CD ADR already records exact pnpm pinning as a
  follow-up risk.
- Impact: the dependency graph remains locked, but package-manager and
  install-script behavior can vary slightly between Vercel projects or project
  ages. No dependency addition, lockfile change, unexpected package resolution,
  or demonstrated exploit is part of this remediation.
- Mitigation: keep the Install Command override disabled rather than using an
  unversioned manual command; capture the actual pnpm version and locked-install
  behavior in the next authorized Vercel build log. Any exact package-manager
  pin should be a separately reviewed repository/configuration change.

### SEC-003 - Build and exposure boundary is not broadened

- Severity: Informational
- Evidence: Vercel states that a configured Root Directory prevents the app
  from accessing files outside that directory. Selecting `front` therefore
  narrows the build context to the autonomous frontend. Disabling dashboard
  overrides restores version-controlled `pnpm build`, `dist`, and Vite settings
  from unchanged `front/vercel.json`; it does not add a dependency, remote
  script, serverless function, route, domain, credential, or permission. The
  existing SPA rewrite is unchanged.
- Assessment: the guidance does not bypass CI checks or grant deployment
  authority. It only affects future Vercel builds. It must not be used to alter
  Git/deployment triggers or to skip the existing test/build gates. Only `dist`
  should be published; repository and control-plane files remain outside the
  output and build boundary.

### SEC-004 - Secret and credential handling is unchanged

- Severity: Informational
- Evidence: the runbook names credential classes but includes no values and
  does not instruct the operator to copy, reveal, rotate, or re-scope a secret.
  No credential-bearing file or Vercel environment variable is changed by the
  remediation.
- Assessment: no new secret exposure was found. Because Vite embeds client-side
  `VITE_*` values into public assets, the authorized operator must still confirm
  that only public configuration, such as the API base URL, is present in that
  namespace and that build logs contain no credentials.

### SEC-005 - Rollback is adequate for this narrow change

- Severity: Informational
- Evidence: the runbook requires recording old dashboard values, restoring
  those values if the configuration correction fails, and promoting a known
  stable prior deployment if the new build succeeds but the application
  regresses.
- Assessment: configuration rollback and deployment rollback are correctly
  separated. Restoring the former values may restore the known failed build
  configuration, so service recovery depends on a genuinely healthy prior
  deployment being available for promotion.

## Conditions For Scoped Approval

1. Obtain explicit authorization before changing any Vercel project setting,
   and obtain/confirm authorization before redeployment.
2. Limit the dashboard mutation to the six documented build settings; do not
   change credentials, domains, Git integration, deployment triggers,
   production branches, access controls, or deployment protection.
3. Preserve `front/pnpm-lock.yaml`, `front/pnpm-workspace.yaml`, and
   `front/vercel.json`; do not add a root manifest, duplicate dependencies, or
   introduce an install override as part of this remediation.

## Remaining External Checks

After explicit authorization, an operator must:

1. Confirm the correct Vercel team/project and record the prior non-secret
   values before editing; also confirm that no deployment is already in flight.
2. Apply only Root Directory `front`, Vite, disabled build/output/install
   overrides, and Node `22.x`; verify unrelated project settings are unchanged.
3. Inspect the next build log for the `front/` install path, the selected pnpm
   version, locked dependency installation without lockfile regeneration,
   effective command `pnpm build`, Vite `7.0.6`, and publication of `dist` only.
4. Confirm logs and generated client assets disclose no credential and that no
   secret is supplied through a public `VITE_*` variable.
5. Smoke-test the deployment and direct SPA routes while confirming existing
   domains, visibility, deployment protection, and access controls did not
   change.
6. Confirm a healthy prior deployment is available. If needed and separately
   authorized, restore the recorded settings or promote that prior deployment,
   then verify routing and availability.

Until these conditions and checks are satisfied, this record is only a
conditional approval of the scoped runbook remediation. It is not evidence for
closing the broader infrastructure task.

## Review Record

- Repository artifact added by this review: this security record only.
- No product code, dependency, lockfile, runbook, credential, browser, Vercel
  setting, deployment, or other external service was changed.
- Recommended next step: return the conditional scoped decision to `nexo`; an
  authorized operator may perform the bounded Vercel checks, while the broader
  infrastructure security gate remains open.
