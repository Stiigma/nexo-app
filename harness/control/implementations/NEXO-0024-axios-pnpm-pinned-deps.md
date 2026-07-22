# NEXO-0024 — Axios, pnpm, and Pinned Dependencies Implementation

## Metadata

- Task ID: NEXO-0024
- Date: 2026-07-06
- Agent: nexo-build
- Handoff: HOFF-2026-07-06-axios-pnpm-pinned-deps.md
- Plan: plans/NEXO-0024-axios-pnpm-pinned-deps.md

## Summary

Implemented Axios HTTP client for the frontend, pinned all dependency versions
in both `front/` and `back/`, and migrated both projects from npm to pnpm.
All version fields are now exact (no `^` or `~`). Major version bumps were held
(vite@7, typescript@5, vitest@3, prisma@6) per the plan.

## Changes

### Front (`dea4201`)

| File | Action | Details |
|------|--------|---------|
| `package.json` | MODIFIED | Added `axios: "1.18.1"`, pinned all 15 deps, bumped react 19.1.1→19.2.7, react-dom 19.1.1→19.2.7, @types/react 19.1.9→19.2.17, @types/react-dom 19.1.7→19.2.3 |
| `package-lock.json` | DELETED | Replaced by pnpm-lock.yaml |
| `pnpm-lock.yaml` | CREATED | 57 KB, 140 packages resolved |
| `src/lib/api-client.ts` | REWRITTEN | Axios-based with response interceptor for 401→token refresh retry, same `api.get<T>()` / `api.post<T>()` interface |

### Back (`54778e0`)

| File | Action | Details |
|------|--------|---------|
| `package.json` | MODIFIED | Pinned all 26 deps, bumped NestJS 11.1.6→11.1.27, swagger 11.2.0→11.4.5, @types/node 24.1.0→26.1.0, @types/supertest 6→7, supertest 7.1.4→7.2.2, tsx 4.20.3→4.23.0. Also pinned `dotenv: "17.4.2"` (not in plan table, existed in package.json). |
| `package-lock.json` | DELETED | Replaced by pnpm-lock.yaml |
| `pnpm-lock.yaml` | CREATED | 85 KB, 246 packages resolved |

## Pinned Versions

### Front

| Package | Version | Bump |
|---------|---------|------|
| react | 19.2.7 | ↑ minor |
| react-dom | 19.2.7 | ↑ minor |
| react-router-dom | 7.18.1 | — |
| @tanstack/react-query | 5.101.2 | — |
| react-hook-form | 7.81.0 | — |
| zustand | 5.0.14 | — |
| zod | 4.4.3 | — |
| lucide-react | 1.23.0 | — |
| @hookform/resolvers | 5.4.0 | — |
| axios | 1.18.1 | NEW |
| vite | 7.0.6 | HOLD |
| @vitejs/plugin-react | 4.7.0 | HOLD |
| @types/react | 19.2.17 | ↑ minor |
| @types/react-dom | 19.2.3 | ↑ minor |
| typescript | 5.8.3 | HOLD |
| vitest | 3.2.4 | HOLD |

### Back

| Package | Version | Bump |
|---------|---------|------|
| @nestjs/common | 11.1.27 | ↑ patch |
| @nestjs/core | 11.1.27 | ↑ patch |
| @nestjs/jwt | 11.0.2 | — |
| @nestjs/passport | 11.0.5 | — |
| @nestjs/platform-express | 11.1.27 | ↑ patch |
| @nestjs/swagger | 11.4.5 | ↑ minor |
| @prisma/client | 6.12.0 | HOLD |
| @scalar/nestjs-api-reference | 1.2.8 | — |
| bcrypt | 6.0.0 | — |
| cookie-parser | 1.4.7 | — |
| dotenv | 17.4.2 | — |
| passport | 0.7.0 | — |
| passport-jwt | 4.0.1 | — |
| reflect-metadata | 0.2.2 | — |
| rxjs | 7.8.2 | — |
| @nestjs/testing | 11.1.27 | ↑ patch |
| @types/bcrypt | 6.0.0 | — |
| @types/cookie-parser | 1.4.10 | — |
| @types/express | 5.0.6 | ↑ patch |
| @types/node | 26.1.0 | ↑ minor |
| @types/passport-jwt | 4.0.1 | — |
| @types/supertest | 7.2.0 | ↑ major |
| prisma | 6.12.0 | HOLD |
| supertest | 7.2.2 | ↑ patch |
| tsx | 4.23.0 | ↑ minor |
| typescript | 5.8.3 | HOLD |
| vitest | 3.2.4 | HOLD |

## Verification

| Check | Front | Back |
|-------|-------|------|
| `pnpm install` | ✅ 140 packages | ✅ 246 packages |
| No `^`/`~` in package.json | ✅ | ✅ |
| `pnpm-lock.yaml` exists | ✅ 57 KB | ✅ 85 KB |
| `package-lock.json` deleted | ✅ | ✅ |
| `pnpm run build` | ✅ 317 KB JS (103 KB gzip) | ✅ tsc clean |
| `pnpm test` (unit) | ⚠️ No test files | ✅ 4/4 passed |
| `pnpm test` (e2e) | N/A | ⚠️ 9/16 fail (see below) |
| `api-client` uses axios | ✅ | N/A |
| `api` interface unchanged | ✅ auth-store.ts zero changes | N/A |
| Major bumps held | ✅ vite@7, ts@5, vitest@3 | ✅ prisma@6, ts@5, vitest@3 |

### E2E Test Failures (Back)

9 of 16 back tests fail, all in `auth.e2e-spec.ts`. All failures are
login-dependent tests that return 401 because the test fixture credentials
(`admin@nexo.test` / `operator@nexo.test`) don't match the database user emails
(`nexoense@gmail.com` / `eduardo.castro220302@gmail.com`). This is a
**pre-existing database state issue** — the unit tests (4/4) and non-login e2e
tests (3/3) all pass. Not caused by dependency pinning or the npm→pnpm
migration.

## Git Commits

| Repo | Hash | Message |
|------|------|---------|
| front | `dea4201` | feat: migrate to pnpm, pin deps, add axios HTTP client |
| back | `54778e0` | feat: migrate to pnpm, pin all dependency versions |

Both commits are local only. Awaiting user confirmation to push.

## Remaining

- Push both repos to GitHub (pending user confirmation)
- Fix e2e test seed data to use matching test credentials (separate task)
- Follow-up tasks for major version bumps: vite 8, typescript 6, vitest 4, prisma 7
- Consider `.gitignore` entries for pnpm (optional — no npm artifacts remain)

## Recommended Next Step

Push both commits after review, then resume NEXO-0008 (F2 operational catalogs).
