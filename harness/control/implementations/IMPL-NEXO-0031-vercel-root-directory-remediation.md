# NEXO-0031 Implementation - Vercel Root Directory Remediation

## Metadata

- Task ID: `NEXO-0031`
- Date: 2026-07-22
- Agent: `nexo` with `nexo-infra`
- Related plan: `harness/control/plans/NEXO-0031-cicd-deploy-domain.md`
- Related handoff: `harness/control/handoffs/HOFF-2026-07-07-cicd-deploy-domain.md`
- Related report: `harness/control/reports/2026-07-22/NEXO-0031-vercel-root-directory-remediation-session-002.md`

## Summary

The Vercel failure was isolated to project settings that build from the
repository root with `vite build`. The actual Vite application is autonomous
under `front/`; a clean frozen-lockfile install and production build pass there.
The remediation keeps `front/vercel.json` canonical and documents the bounded
external settings correction instead of duplicating frontend dependencies at
the repository root.

## Files Changed

- `harness/control/runbooks/RUNBOOK-NEXO-0031-operations.md`
  - Added the required Vercel Root Directory, framework, command, output,
    install, and Node settings.
  - Added authorization ordering, expected deployment evidence,
    troubleshooting, and rollback.
- NEXO-0031 live-state, plan, review, journal, and report records were updated or
  added for continuity; no frontend source, manifest, lockfile, or Vercel config
  changed.

## Behavior Changed

- Operators now have one deterministic procedure for the observed exit 127:
  set Root Directory to `front`, retain Vite and Node 22.x, remove inherited
  build/install/output overrides, and let `front/vercel.json` run `pnpm build`
  and publish `dist`.
- The procedure requires explicit user confirmation before any project-setting
  mutation or redeploy and limits pre-authorization work to read-only inspection
  of non-secret values.

## Verification

- Clean root checkout: the effective `vite build` reproduces
  `vite: command not found` with exit 127.
- Clean `front/`: `pnpm install --frozen-lockfile && pnpm build` passes with
  Vite 7.0.6, 2,563 transformed modules, and generated `dist`.
- Current `front/`: `pnpm build` passes.
- Assertions confirm the frontend build script, Vite version, Vercel build
  command, output directory, and framework.
- `git diff --check` passes.
- Scoped QA decision: pass for local remediation readiness.
- Scoped security re-review decision: approved.

## Operational Notes

- No Vercel setting, environment variable, credential, domain, deployment, Git
  integration, or external environment changed in this implementation session.
- The next authorized build must capture the selected pnpm version, locked
  install, effective `pnpm build`, Vite 7.0.6, and `dist` publication.
- `pnpm test` currently exits 1 because no matching frontend test files exist;
  this is a coverage gap, not a failing regression introduced here.

## Follow-Up

- Obtain explicit user confirmation for the six bounded Vercel build settings
  and redeployment.
- Verify the hosted URL and direct SPA routes after deployment while preserving
  domains, visibility, access controls, and deployment protection.
- Keep NEXO-0031 active for its remaining Docker/ngrok, credentials, DNS,
  backup, and broader close gates.
