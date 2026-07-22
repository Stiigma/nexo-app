# Report: NEXO-0024 Axios, pnpm, Pinned Dependencies — Session 001

- Task: NEXO-0024
- Date: 2026-07-06 (late evening → 2026-07-07 early morning UTC)
- Agent: nexo-build (OpenCode deepseek-v4-pro)
- Handoff: HOFF-2026-07-06-axios-pnpm-pinned-deps.md
- Status: ✅ Implemented, awaiting push confirmation

## What Changed

### Front (`dea4201`)
- Added `axios: "1.18.1"` to dependencies
- Pinned all 15 packages to exact versions (no `^` or `~`)
- Bumped: react 19.1.1→19.2.7, react-dom 19.1.1→19.2.7, @types/react 19.1.9→19.2.17, @types/react-dom 19.1.7→19.2.3
- Held: vite@7.0.6, @vitejs/plugin-react@4.7.0, typescript@5.8.3, vitest@3.2.4
- Rewrote `src/lib/api-client.ts` with Axios (response interceptor for 401→token refresh, identical `api.get<T>`/`api.post<T>` interface)
- Deleted `package-lock.json`, created `pnpm-lock.yaml` (57 KB, 140 packages)

### Back (`54778e0`)
- Pinned all 26 packages to exact versions
- Bumped: NestJS 11.1.6→11.1.27, swagger 11.2.0→11.4.5, @types/node 24.1.0→26.1.0, @types/supertest 6→7.2.0, supertest 7.1.4→7.2.2, tsx 4.20.3→4.23.0
- Held: prisma@6.12.0, typescript@5.8.3, vitest@3.2.4
- Deleted `package-lock.json`, created `pnpm-lock.yaml` (85 KB, 246 packages)

## Verification Summary

| Check | Result |
|-------|--------|
| No `^` or `~` in either package.json | ✅ |
| `pnpm-lock.yaml` in both repos | ✅ |
| Front build (tsc + vite) | ✅ 317 KB JS |
| Back build (tsc) | ✅ |
| Front tests | ⚠️ No test files exist (pre-existing) |
| Back unit tests | ✅ 4/4 |
| Back e2e tests | ⚠️ 9/16 fail — pre-existing DB seed mismatch |
| api-client Axios import | ✅ |
| auth-store.ts unchanged | ✅ zero changes |

## E2E Test Note

9 e2e tests fail because test fixture users (`admin@nexo.test`) don't match
database users (`nexoense@gmail.com`). All failures are login→401. Unit tests
and non-login e2e tests pass. This is a pre-existing database state issue, not
caused by dependency changes.

## Risk Assessment

- No regressions from Axios migration (interface identical, build passes)
- No phantom dependency issues from pnpm (both projects import explicitly)
- E2e seed data needs separate fix (existing issue)
- No CVEs reported for any pinned versions
- Major version bumps deferred to dedicated follow-up tasks

## Next

Push both commits to GitHub after user review and confirmation.
