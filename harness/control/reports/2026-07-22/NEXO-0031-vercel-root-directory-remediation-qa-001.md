# NEXO-0031 Vercel Root Directory Remediation QA

## Metadata

- Task ID: `NEXO-0031`
- Date: 2026-07-22
- QA agent: `nexo-qa`
- Reviewed artifact: `harness/control/runbooks/RUNBOOK-NEXO-0031-operations.md`

## QA Decision Evaluation

- Decision: pass
- Reviewed evidence: the supplied Vercel failure and clean-checkout results; the scoped runbook diff; the NEXO-0031 plan and handoff; the accepted CI/CD ADR; the root and frontend manifests/lockfiles; `front/vercel.json`; current local build and configuration assertions; official Vercel build-configuration documentation.
- Findings: the diagnosis is consistent with the repository layout and observed command. The runbook gives the minimal corrective project settings, preserves `front/vercel.json` as canonical, defines expected redeploy signals, and includes configuration and deployment rollback. No scoped blocker was found. The absent frontend tests are a coverage gap, not a regression.
- Residual risk: this pass means local remediation readiness only. No Vercel setting was changed and no redeployment, hosted output, production URL, or custom domain was verified.

## Scope

Review only the Vercel `vite: command not found` remediation. This review does
not assess or close the remaining Docker, ngrok, CI/CD, backup, DNS, domain,
security, or other NEXO-0031 infrastructure work.

## Evidence Checked

- Supplied Vercel log at commit `5e352d9`: effective command `vite build`, then
  `vite: command not found` with exit 127.
- Supplied clean-checkout reproduction: repository-root execution produced the
  same exit 127, while `front/` completed
  `pnpm install --frozen-lockfile && pnpm build` and generated `dist`.
- Repository topology at `5e352d9`: the frontend has its autonomous
  `package.json`, `pnpm-lock.yaml`, Vite config, and `vercel.json` under
  `front/`; the repository root has no `package.json`.
- Current root `package-lock.json` has an empty `packages` map and therefore
  cannot provide Vite.
- `front/package.json` defines `build` as `tsc -b && vite build` and pins Vite
  `7.0.6`; `front/pnpm-lock.yaml` is present.
- `front/vercel.json` remains unchanged and declares framework `vite`, build
  command `pnpm build`, output directory `dist`, and the SPA rewrite.
- The runbook diff adds Root Directory `front`, Vite, disabled build/output/install
  overrides, Node `22.x`, expected next-deployment signals, troubleshooting,
  and rollback without adding a root manifest or duplicating dependencies.
- Official Vercel documentation confirms that Root Directory selects the app
  root and install path, project settings expose framework/build/install/output
  controls, and changed settings apply to the next deployment.
- Independent current-workspace verification:
  - `pnpm build` in `front/` passed with Vite `7.0.6`, 2,563 transformed modules,
    and generated `dist`.
  - Assertions for the build script, Vite version, Vercel build command, output
    directory, framework, absent root `package.json`, and present frontend
    lockfile passed.
  - `git diff --check -- harness/control/runbooks/RUNBOOK-NEXO-0031-operations.md`
    passed.
- No `front/src/**/*.test.ts` files exist. The supplied `pnpm test` exit 1 with
  `No test files found` is therefore recorded as missing automated coverage,
  not as a failing regression.

## Requirements And Acceptance

- **Diagnosis:** accepted. Running the inherited `vite build` from a root with
  no frontend manifest leaves no project-local Vite binary to execute. The
  successful clean `front/` install/build isolates project root selection and/or
  the inherited command override as the failure boundary.
- **Sufficiency:** accepted. Root Directory `front` makes Vercel install and
  build against the actual app. Removing overrides allows the unchanged
  `front/vercel.json` and lockfile to supply `pnpm build` and `dist`.
- **Minimality:** accepted. The remediation changes operational project settings
  and documentation only; it does not introduce redundant root dependencies or
  alter the known-good frontend deployment config.
- **Operational readiness:** accepted locally. The runbook states authorization
  boundaries, expected log/output evidence, settings rollback, and promotion of
  the prior stable deployment if an application regression appears.

## UX, Data, And Security Readiness

- Product UX and accessibility are not changed by this scoped documentation
  remediation. Operator usability is covered by explicit dashboard values,
  ordered steps, expected signals, and rollback.
- No schema, migration, persisted data, credentials, or secret values are
  touched. The instructions retain the requirement for user authorization
  before an external change.
- This scoped pass does not replace the broader NEXO-0031 security review
  required before task close.

## Findings

1. **No scoped blocker:** diagnosis, corrective settings, canonical config, and
   local build evidence align.
2. **Coverage gap:** the frontend has no matching unit tests, so Vitest cannot
   provide a regression gate. The production TypeScript/Vite build is the
   applicable local executable gate for this remediation.
3. **External evidence pending:** local success cannot prove Vercel applied the
   dashboard settings or produced a healthy deployment.

## Remaining External Verification

After explicit user authorization, an operator must:

1. Record current Vercel project settings, set Root Directory to `front`, select
   Vite and Node `22.x`, and remove inherited build/output/install overrides.
2. Trigger a new deployment and confirm its log installs from `front/`, runs
   effective command `pnpm build` (not `vite build`), reports Vite `7.0.6`, and
   publishes `dist` successfully.
3. Smoke-test the resulting deployment, including direct SPA-route fallback,
   and retain the deployment URL/log as external acceptance evidence.
4. Roll back the project settings if the command/path correction fails, or
   promote the prior stable deployment if the build succeeds but the app
   regresses.

Until those checks pass, Vercel deployment success remains unverified and
NEXO-0031 remains active.

## Files Changed In This QA Session

- Added this new scoped QA report only.

## Recommended Next Step

Return this local-readiness pass to `nexo`. Request user-authorized Vercel
settings and redeployment verification as a separate external step; do not use
this report to close the broader NEXO-0031 task.
