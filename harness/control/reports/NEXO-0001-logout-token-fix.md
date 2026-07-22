# Report: NEXO-0001 — Logout Token Clearing Fix

**Date:** 2026-07-18
**Agent:** nexo-build
**Status:** Fixed, build passes

## Root Cause

In `front/src/common/components/layout/Sidebar.tsx`, the `handleLogout` function
only cleared the frontend Zustand auth store and navigated to `/login`:

```typescript
function handleLogout() {
  setUser(null);     // frontend only
  navigate("/login");
}
```

It **never called `POST /auth/logout`**, so the httpOnly cookies
(`nexo_access_token`, `nexo_refresh_token`) were never cleared server-side.
On next page load the browser still sent the cookies, the session was still
valid, and the user appeared to still be logged in.

## What Already Existed

A correct `useLogout` hook already existed at
`front/src/features/auth/hooks/use-logout.ts` that:

1. Calls `POST /auth/logout` via `auth-service.ts` → clears httpOnly cookies
2. Catches API errors (logout should succeed even if the server call fails)
3. Clears the user from the auth store via `setUser(null)`
4. Navigates to `/login`

## Fix

**File changed:** `front/src/common/components/layout/Sidebar.tsx`

- Imported `useLogout` from `@/features/auth/hooks`
- Replaced the inline `handleLogout` closure with `useLogout()` hook
- Updated the logout button's `onClick` to call `logoutMutation.mutate()`
- Removed the now-unused `setUser` subscription from the component

## Files Touched

| File | Change |
|------|--------|
| `front/src/common/components/layout/Sidebar.tsx` | Replace inline logout with `useLogout` hook |

## Verification

- `tsc -b` passes (TypeScript compilation)
- `vite build` passes (production build)
- No other logout entry points found in the codebase that bypass the API

## Remaining / Follow-up

- None. The `useLogout` hook already handled all edge cases correctly.
- The backend `clearAuthCookies` function correctly sets `maxAge: 0` on both
  `nexo_access_token` and `nexo_refresh_token` cookies.
