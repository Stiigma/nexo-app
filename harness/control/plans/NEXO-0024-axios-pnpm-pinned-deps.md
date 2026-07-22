# NEXO-0024 - Axios, pnpm, and Pinned Dependencies

## Objective

1. Replace native `fetch` wrapper in `front/` with **Axios** for cleaner HTTP
   interceptors, automatic JSON, timeout support, and better error handling.
2. **Pin all dependency versions** (remove `^`/`~`) in both `front/` and `back/`
   `package.json` to the latest stable releases — no automatic minor/patch bumps.
3. **Migrate both projects from npm to pnpm** for faster, disk-efficient
   installs and strict dependency resolution.

## Done When

- `front/src/lib/api-client.ts` rewritten with Axios, preserving all existing
  behavior (token refresh, error handling, typed responses).
- All `package.json` version fields use exact versions (no `^` or `~`).
- `package-lock.json` replaced by `pnpm-lock.yaml` in both projects.
- `node_modules/` cleaned and reinstalled via pnpm.
- `npm run build` (back) and `npm run build` (front) pass without errors.
- `npm test` passes in both projects.
- `npm run dev` starts both servers successfully.
- `.gitignore` updated to remove npm-specific entries if needed.
- Git commits and pushes for both repos.

## Scope

| Item | Front | Back |
|------|-------|------|
| Install axios | ✅ | ❌ (not applicable) |
| Rewrite api-client.ts → axios | ✅ | ❌ |
| Pin all dep versions | ✅ | ✅ |
| Delete node_modules/ + package-lock.json | ✅ | ✅ |
| `pnpm install` → pnpm-lock.yaml | ✅ | ✅ |
| Verify build | ✅ | ✅ |
| Verify tests | ✅ | ✅ |
| Verify dev server | ✅ | ✅ |
| Update .gitignore if needed | ✅ | ✅ |

## Out Of Scope

- Changing any application logic beyond the HTTP client.
- Adding new features to `api-client.ts`.
- Upgrading NestJS to a different major version (v11 stays).
- Adding pnpm workspaces or monorepo configuration.
- CI/CD pipeline changes.
- Dockerfile or docker-compose changes.

## Pinned Versions

### Front (`front/package.json`)

| Package | Current (`^`) | Pinned To | Bump |
|---------|--------------|-----------|------|
| react | ^19.1.1 | **19.2.7** | minor |
| react-dom | ^19.1.1 | **19.2.7** | minor |
| react-router-dom | ^7.18.1 | **7.18.1** | — |
| @tanstack/react-query | ^5.101.2 | **5.101.2** | — |
| react-hook-form | ^7.81.0 | **7.81.0** | — |
| zustand | ^5.0.14 | **5.0.14** | — |
| zod | ^4.4.3 | **4.4.3** | — |
| lucide-react | ^1.23.0 | **1.23.0** | — |
| @hookform/resolvers | ^5.4.0 | **5.4.0** | — |
| vite | ^7.0.6 | **7.0.6** | ⚠️ hold (v8 is major) |
| @vitejs/plugin-react | ^4.7.0 | **4.7.0** | ⚠️ hold (v6 is major) |
| **axios** | — | **1.18.1** | new |
| @types/react | ^19.1.9 | **19.2.17** | minor |
| @types/react-dom | ^19.1.7 | **19.2.3** | minor |
| typescript | ^5.8.3 | **5.8.3** | ⚠️ hold (v6 is major) |
| vitest | ^3.2.4 | **3.2.4** | ⚠️ hold (v4 is major) |

### Back (`back/package.json`)

| Package | Current (`^`) | Pinned To | Bump |
|---------|--------------|-----------|------|
| @nestjs/common | ^11.1.6 | **11.1.27** | patch |
| @nestjs/core | ^11.1.6 | **11.1.27** | patch |
| @nestjs/jwt | ^11.0.2 | **11.0.2** | — |
| @nestjs/passport | ^11.0.5 | **11.0.5** | — |
| @nestjs/platform-express | ^11.1.6 | **11.1.27** | patch |
| @nestjs/swagger | ^11.2.0 | **11.4.5** | minor |
| @prisma/client | ^6.12.0 | **6.12.0** | ⚠️ hold (v7 is major) |
| @scalar/nestjs-api-reference | ^1.2.8 | **1.2.8** | — |
| bcrypt | ^6.0.0 | **6.0.0** | — |
| cookie-parser | ^1.4.7 | **1.4.7** | — |
| passport | ^0.7.0 | **0.7.0** | — |
| passport-jwt | ^4.0.1 | **4.0.1** | — |
| reflect-metadata | ^0.2.2 | **0.2.2** | — |
| rxjs | ^7.8.2 | **7.8.2** | — |
| @nestjs/testing | ^11.1.6 | **11.1.27** | patch |
| @types/bcrypt | ^6.0.0 | **6.0.0** | — |
| @types/cookie-parser | ^1.4.10 | **1.4.10** | — |
| @types/express | ^5.0.3 | **5.0.6** | patch |
| @types/node | ^24.1.0 | **26.1.0** | minor (matches Node 26) |
| @types/passport-jwt | ^4.0.1 | **4.0.1** | — |
| @types/supertest | ^6.0.3 | **7.2.0** | major (compat w/ supertest 7) |
| prisma | ^6.12.0 | **6.12.0** | ⚠️ hold (v7 is major) |
| supertest | ^7.1.4 | **7.2.2** | patch |
| tsx | ^4.20.3 | **4.23.0** | minor |
| typescript | ^5.8.3 | **5.8.3** | ⚠️ hold (v6 is major) |
| vitest | ^3.2.4 | **3.2.4** | ⚠️ hold (v4 is major) |

### Why holding major bumps?

Vite 8, TypeScript 6, vitest 4, Prisma 7 are all **major version jumps**.
They likely introduce breaking changes that should be handled in separate,
dedicated tasks with their own testing cycles. Pinning to the current installed
major keeps this task focused and safe.

## Steps

### Phase 1 — Front (Axios + Pinning + pnpm)

1. **Install axios**: `pnpm add axios@1.18.1` in `front/`
2. **Pin all versions**: Remove all `^`/`~` from `front/package.json`,
   set exact versions per table above.
3. **Rewrite `api-client.ts`**:
   - Create Axios instance with `baseURL`, `withCredentials`, headers.
   - Implement response interceptor for 401 → token refresh retry.
   - Implement request interceptor for Content-Type.
   - Preserve `ApiError` class.
   - Preserve typed `api.get<T>()`, `api.post<T>()`, `api.put<T>()`,
     `api.delete<T>()` interface.
4. **Verify existing consumers**: `auth-store.ts` uses `api.post()` and
   `api.get()` — ensure the interface is unchanged.
5. **Build**: `pnpm run build` (tsc + vite)
6. **Test**: `pnpm test`

### Phase 2 — Back (Pinning + pnpm)

7. **Pin all versions**: Remove all `^`/`~` from `back/package.json`,
   set exact versions per table above.
8. **pnpm install**: Delete `node_modules/` and `package-lock.json`,
   run `pnpm install`.
9. **Build**: `pnpm run build`
10. **Test**: `pnpm test`

### Phase 3 — Finalize

11. **Git commits**: One commit per repo with descriptive messages.
12. **Push**: Push both repos to GitHub.
13. **Verification**: Clean checkout test (optional, if CI exists).

## Axios API Client Design

```typescript
// front/src/lib/api-client.ts (target design)

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Refresh token interceptor
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = axios
    .post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true })
    .then(() => true)
    .catch(() => false)
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
  return refreshPromise;
}

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !config._retry) {
      config._retry = true;
      const refreshed = await refreshAccessToken();
      if (refreshed) return client(config);
    }
    return Promise.reject(error);
  }
);

function handleError(error: unknown): never {
  if (error instanceof AxiosError) {
    throw new ApiError(
      error.response?.status ?? 0,
      (error.response?.data as { message?: string })?.message ?? "Error de red"
    );
  }
  throw error;
}

export const api = {
  get: async <T>(path: string): Promise<T> => {
    const res = await client.get<T>(path);
    return res.data;
  },
  post: async <T>(path: string, body?: unknown): Promise<T> => {
    const res = await client.post<T>(path, body);
    return res.data;
  },
  put: async <T>(path: string, body: unknown): Promise<T> => {
    const res = await client.put<T>(path, body);
    return res.data;
  },
  delete: async <T>(path: string): Promise<T> => {
    const res = await client.delete<T>(path);
    return res.data;
  },
};

export { ApiError };
```

### Key differences vs current fetch-based client

| Feature | Current (fetch) | New (axios) |
|---------|----------------|-------------|
| Token refresh | Manual retry in `apiFetch` | Response interceptor with `_retry` flag |
| JSON parsing | Manual `res.json()` | Automatic via `responseType: "json"` |
| Error typing | Manual casting | `AxiosError` with typed `response.data` |
| Timeout | Not set | Can add `timeout: 15000` |
| Base URL | Concatenated string | `axios.create({ baseURL })` |
| 204 handling | Manual check | `res.data` is `undefined` / empty |

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Axios interceptor bugs break token refresh | High | Preserve exact same retry logic; test 401 path |
| pnpm strictness surfaces phantom deps | Medium | Both projects are modern and explicit with imports |
| Major version bumps (Vite 8, TS 6) break build | High | **Hold** — pin current majors, not latest |
| pnpm not available in CI/production | Low | pnpm install is simple; document in tooling |
| `pnpm-lock.yaml` conflicts with team npm users | Low | Single-developer project currently |

## Decision Log

- 2026-07-06: Use NEXO-0024 for this task.
- 2026-07-06: Hold major version bumps (Vite 8, TS 6, vitest 4, Prisma 7).
  Create follow-up tasks for each upgrade.
- 2026-07-06: Install pnpm globally via npm (v11.10.0). Corepack unavailable
  on this system.
- 2026-07-06: Axios 1.18.1 selected — latest stable with zero reported CVEs.

## Verification

- [ ] `pnpm run build` passes in `front/` and `back/`
- [ ] `pnpm test` passes in both (vitest)
- [ ] `pnpm run dev` starts both servers
- [ ] Login flow works end-to-end (requires running backend)
- [ ] Token refresh triggers correctly on 401 responses
- [ ] `pnpm-lock.yaml` exists in both repos
- [ ] No `^` or `~` in either `package.json`
- [ ] `git diff` shows only intended changes
