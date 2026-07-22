# Password Setup Email Admin Trigger — Session 001

**Date:** 2026-07-18
**Agent:** nexo-build
**Status:** Complete (uncommitted)

## Objective

Add ability for admins to trigger password setup email for users without passwords.

## What Changed

### Backend

- `back/src/modules/identity/interface/http/dto/user-response.dto.ts` — Added `hasPassword: boolean` field to `UserResponseDto`. This safely exposes whether a user has a password set without leaking the hash.
- `back/src/modules/identity/interface/http/users.controller.ts` — Injected `VerificationCodeService`. Added `POST :id/send-password-setup` endpoint that validates the user exists, has no password hash, generates a verification code via `VerificationCodeService.generateCode()`, and returns a success message. Updated `toResponseDto()` to populate `hasPassword`.

### Frontend

- `front/src/features/admin/users/types/index.ts` — Added `hasPassword: boolean` to `UserDto`.
- `front/src/features/admin/users/hooks/use-users.ts` — Added `useSendPasswordSetup()` mutation hook that calls `POST /users/:id/send-password-setup` and invalidates the users query on success.
- `front/src/features/admin/users/hooks/index.ts` — Exported the new `useSendPasswordSetup` hook.
- `front/src/features/admin/users/views/UsersPage.tsx` — Added `Mail` and `AlertTriangle` icon imports, `useSendPasswordSetup` hook, and `sendPasswordSetup()` handler with toast feedback. Added yellow "Sin contraseña" badge (AlertTriangle icon) in the last-login column for users without passwords. Added "Enviar configuracion de contrasena" button (Mail icon) in the actions column, visible only when `!user.hasPassword`.

## Verification

- `cd back && pnpm run build` — **PASS** (tsc clean)
- `cd front && pnpm run build` — **PASS** (tsc + vite, 2560 modules, no errors)

## Design Decisions

1. Used `hasPassword` boolean derived from `passwordHash !== null` — safe, no hash exposure.
2. Button condition uses `!user.hasPassword` (not `lastLoginAt`) — more accurate since a user could have a password but never logged in.
3. Backend endpoint validates `passwordHash` is null before sending — prevents accidental re-sends.
4. Reused existing `VerificationCodeService.generateCode()` — same flow as first-login password setup.

## Files Modified

| File | Change |
|------|--------|
| `back/.../dto/user-response.dto.ts` | Added `hasPassword` field |
| `back/.../users.controller.ts` | Injected service, added endpoint, updated mapper |
| `front/.../types/index.ts` | Added `hasPassword` to `UserDto` |
| `front/.../hooks/use-users.ts` | Added `useSendPasswordSetup` mutation |
| `front/.../hooks/index.ts` | Exported new hook |
| `front/.../views/UsersPage.tsx` | Added badge, button, handler, imports |

## Not Committed

User explicitly requested no commit. Changes are local only.
