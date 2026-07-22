# ADR-2026-07-07-cicd-pipeline

## Status

Accepted.

## Context

Nexo v1 needs automated CI/CD for both the backend and the frontend before any
production deploy. The repositories already use **pnpm** with pinned dependencies
and a `vitest` test suite (NEXO-0024). There is currently no CI/CD configuration.

Requirements:

- Backend CI must run test → build → lint on every push/PR.
- Frontend must run test → build and deploy to Vercel on push to `main`.
- Credentials (Vercel token/org/project IDs) must never appear in the repo.
- The pipeline must be reversible and require explicit user confirmation before
  any real deploy (control-plane rule).

## Decision

Use **GitHub Actions** as the single CI/CD engine for both services:

| Pipeline | File | Triggers | Stages |
|---|---|---|---|
| Backend CI | `back/.github/workflows/nexo-api-ci.yml` | push/PR on `back/**`, `infra/**` | `pnpm install --frozen-lockfile` → `pnpm test` (vitest) → `pnpm run build` (tsc) → `pnpm run lint --if-present` |
| Frontend CI/CD | `front/.github/workflows/nexo-app-cicd.yml` | push to `main` on `front/**` | `pnpm install` → `pnpm test` → `pnpm build` → deploy via `amondnet/vercel-action@v25` (`--prod`) |
| DB backup | `.github/workflows/nexo-db-backup.yml` | daily cron `0 6 * * *` + manual | pg_dump → Azure Blob (see `ADR-2026-07-07-db-backup-strategy.md`) |

Key choices:

- **Node 22 + pnpm 9** (matches `lockfileVersion: '9.0'`; no `packageManager`
  field, so pnpm version is pinned explicitly in the workflow).
- **`pnpm install --frozen-lockfile`** for reproducible installs.
- **Lint is guarded with `--if-present`** so CI does not fail if a lint script is
  not yet defined in `package.json`.
- **Vercel deploy uses secrets only**: `VERCEL_TOKEN`, `VERCEL_ORG_ID`,
  `VERCEL_PROJECT_ID` (and `GITHUB_TOKEN` auto-provided). No literal tokens.
- **`amondnet/vercel-action@v25`** drives `vercel build` + `vercel deploy --prod`
  using `front/vercel.json` (framework `vite`, `outputDirectory: dist`, SPA
  rewrites).
- **No deploy runs without user-provided secrets**, and the workflow file itself
  performs no environment mutation — only the Vercel side effect occurs, which
  requires the operator to have configured the repo/orject secrets first.

## Consequences

- **Positive:** Every backend change is tested, built, and linted before merge.
- **Positive:** Frontend reaches production automatically on `main`, reducing
  manual deploy error.
- **Positive:** All credentials are GitHub Actions secrets; repo stays clean.
- **Risk:** Pinned `pnpm@9` may drift from the operator's local pnpm if they
  later move to pnpm 10 — mitigated by adding a `packageManager` field to
  `package.json` (recommended follow-up).
- **Risk:** `amondnet/vercel-action` performs the production deploy as a side
  effect of the workflow — mitigated by requiring real `VERCEL_*` secrets and
  explicit user confirmation before enabling the workflow on the repo.
- **Risk:** CI only covers unit tests (vitest); e2e/integration is future work.
