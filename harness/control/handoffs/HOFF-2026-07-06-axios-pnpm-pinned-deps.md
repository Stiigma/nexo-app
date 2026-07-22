# HOFF-2026-07-06-axios-pnpm-pinned-deps

## Metadata

- Task ID: NEXO-0024
- Date: 2026-07-06
- Authoring agent: nexo-plan
- Receiving agent: nexo-build
- Status: ready

## Objective

1. Replace native `fetch` wrapper in `front/` with Axios (v1.18.1).
2. Pin all dependency versions (remove `^`/`~`) in both `front/` and `back/`.
3. Migrate both projects from npm to pnpm.

## Context

Currently:
- `front/src/lib/api-client.ts` uses native `fetch` with manual retry logic
  for token refresh. Axios interceptors are cleaner and more maintainable.
- All `package.json` files use `^` prefix, allowing uncontrolled minor/patch
  bumps. User wants exact versions.
- Both projects use npm. pnpm is faster, disk-efficient, and enforces strict
  dependency resolution.
- pnpm 11.10.0 is already installed globally on this machine.
- Node v26.4.0 is available.

## Source Docs

- `harness/control/plans/NEXO-0024-axios-pnpm-pinned-deps.md` (full plan with
  version table and target api-client design)
- `front/package.json` — 10 deps, 4 devDeps (all with `^`)
- `back/package.json` — 13 deps, 10 devDeps (all with `^`)
- `front/src/lib/api-client.ts` — current fetch-based client
- `front/src/stores/auth-store.ts` — consumer of `api.post()` and `api.get()`

## Files To Create Or Modify

### front/

- **MODIFY** `package.json` — add `axios: "1.18.1"`, remove all `^`, pin exact versions
- **MODIFY** `src/lib/api-client.ts` — rewrite with axios (see target design below)
- **DELETE** `package-lock.json`
- **DELETE** `node_modules/`
- **CREATE** `pnpm-lock.yaml` (via `pnpm install`)

### back/

- **MODIFY** `package.json` — remove all `^`, pin exact versions
- **DELETE** `package-lock.json`
- **DELETE** `node_modules/`
- **CREATE** `pnpm-lock.yaml` (via `pnpm install`)

## Implementation Steps

### Step 1 — Front: Axios + pinning

```bash
cd front
# Delete npm artifacts
rm -rf node_modules package-lock.json

# Edit package.json manually:
#   - Add "axios": "1.18.1" to dependencies
#   - Remove ^ and ~ from ALL version fields
#   - Set exact versions per the plan table
#     (hold vite@7.0.6, typescript@5.8.3, vitest@3.2.4)

# Install via pnpm
pnpm install
```

**Critical**: Do NOT bump vite to v8, typescript to v6, or vitest to v4.
These are major versions. Stay on current majors.

### Step 2 — Front: Rewrite api-client.ts

Replace `front/src/lib/api-client.ts` with the Axios version. The target
design is in the plan (`NEXO-0024-axios-pnpm-pinned-deps.md`). Key points:

- `axios.create({ baseURL, withCredentials })` for the instance
- Response interceptor catches 401, calls `refreshAccessToken()`, retries
- `ApiError` class preserved
- `api.get<T>()`, `api.post<T>()`, `api.put<T>()`, `api.delete<T>()` interface unchanged
- Consumers (`auth-store.ts`) require **zero changes** if interface is identical

### Step 3 — Front: Verify

```bash
cd front
pnpm run build   # tsc + vite build
pnpm test        # vitest
```

### Step 4 — Back: Pinning

```bash
cd back
rm -rf node_modules package-lock.json

# Edit package.json manually:
#   - Remove ^ and ~ from ALL version fields
#   - Set exact versions per the plan table
#     (hold @prisma/client@6.12.0, prisma@6.12.0, typescript@5.8.3, vitest@3.2.4)

pnpm install
```

### Step 5 — Back: Verify

```bash
cd back
pnpm run build   # tsc
pnpm test        # vitest
```

### Step 6 — Git

Commit and push both repos with descriptive messages. Example:

```
feat: migrate to pnpm, pin deps, add axios HTTP client

- Replace native fetch with axios 1.18.1 in front api-client
- Pin all dependency versions (no ^ or ~)
- Migrate from npm to pnpm (pnpm-lock.yaml)
- Hold major bumps: vite@7, ts@5, vitest@3, prisma@6
```

## Verification

- [ ] `pnpm run build` passes in `front/` and `back/`
- [ ] `pnpm test` passes in both (vitest)
- [ ] `pnpm-lock.yaml` exists in both repos
- [ ] No `^` or `~` in either `package.json`
- [ ] `front/src/lib/api-client.ts` uses `import ... from "axios"`
- [ ] `api.get<T>()`, `api.post<T>()`, etc. return typed data (same interface)
- [ ] `front/src/stores/auth-store.ts` still works (no changes needed)
- [ ] Both commits pushed to GitHub

## Risks

- Axios interceptor retry logic must handle edge cases (concurrent 401s,
  refresh failure). The plan's target design uses a `_retry` flag and a
  shared refresh promise — same pattern as the current fetch client.
- pnpm strictness might expose phantom dependencies. Both projects are
  modern and import explicitly; risk is low.
- Tests must be run to catch any regression. If vitest config uses npm
  paths, adjust to pnpm.

## Acceptance Criteria

1. `pnpm install` completes with zero errors in both projects.
2. `pnpm run build` produces the same output as before (dist/).
3. `pnpm test` passes all existing tests.
4. The `api` object interface is identical: `api.get<T>`, `api.post<T>`,
   `api.put<T>`, `api.delete<T>`, `ApiError`.
5. Token refresh works: 401 → refresh → retry → success.
6. Version fields are exact (no `^`, `~`).

## Required Gates

- QA review: No — this is tooling/deps, not feature code.
- Security review: No — pinned versions are latest stable, zero CVEs reported.
- User confirmation: Yes — after builds and tests pass, present the diff for
  review before pushing.
