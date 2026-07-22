# Password Setup Countdown Timer — Implementation Report

**Date:** 2026-07-16  
**Agent:** nexo-build  
**Task:** Add visual 15-minute countdown timer to password setup flow  
**Status:** Implemented, build verified, not committed

## What Changed

### 1. `front/src/features/auth/types/set-password.ts`
- Added `expiresAt?: string` (ISO date string) to `VerifyCodeResponse` interface

### 2. `front/src/features/auth/views/SetPasswordPage.tsx`
- Added `useEffect` import and `toast` from sonner
- Added `expiresAt: Date | null` and `timeLeft: number` state
- Added countdown `useEffect` that:
  - Runs every second while `expiresAt` is set
  - Updates `timeLeft` with remaining seconds
  - On expiry (≤0): clears interval, resets to email step, clears token/email, fires toast error
- Updated `onVerified` callback to extract `expiresAt` from verify response (with 15-min fallback)
- Passes `timeLeft` and `expiresAt` props to `PasswordSetupForm`

### 3. `front/src/features/auth/views/components/CodeVerificationForm.tsx`
- Updated `onVerified` prop signature to accept optional `expiresAt?: string`
- Forwards `result.expiresAt` from verify mutation response to parent

### 4. `front/src/features/auth/views/components/PasswordSetupForm.tsx`
- Added `Clock` icon import from lucide-react
- Added `timeLeft: number` and `expiresAt: Date` to props interface
- Renders countdown timer card above password fields:
  - Clock icon (turns red at < 3 min)
  - MM:SS display with color coding: green (>10 min), yellow (3-10 min), red (<3 min)
  - Progress bar that shrinks proportionally (100% → 0%)
  - Warning message when < 3 minutes remain

## Design Decisions

- **Fallback timer:** If backend does not return `expiresAt`, defaults to 15 minutes from now
- **Color thresholds:** >600s = normal, 180-600s = yellow/warning, <180s = red/danger
- **Progress bar width:** `(timeLeft / 900) * 100%` — full at start, 0 at expiry
- **Auto-redirect:** Resets entire flow to email step with toast notification

## Verification

```
cd front && pnpm run build
# tsc -b && vite build
# ✓ 2560 modules transformed
# ✓ built in 6.49s
```

TypeScript compilation: **PASS**  
Vite production build: **PASS**

## Remaining

- Not committed per instruction
- Backend may need to return `expiresAt` in `/auth/verify-code` response for the timer to reflect actual server-side expiry
