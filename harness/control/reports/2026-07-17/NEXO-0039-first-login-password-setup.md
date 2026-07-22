# NEXO-0039 First-Login Password Setup — Implementation Report

**Date:** 2026-07-17
**Agent:** nexo-build
**Task:** First-Login Password Setup Flow for Nexo v1

---

## Summary

Implemented a complete first-login password setup flow that allows admin-created users (who have no password) to set their password via email verification. The flow is: check email → send code → verify code → set password.

## Files Modified

| File | Change |
|------|--------|
| `back/prisma/schema.prisma` | Made `passwordHash` nullable, added `VerificationCode` and `PasswordHistory` models |
| `back/src/modules/identity/domain/user.ts` | `passwordHash: string` → `passwordHash: string \| null` |
| `back/src/modules/identity/application/ports/user-repository.ts` | `passwordHash: string` → `passwordHash?: string \| null` in `CreateUserData` |
| `back/src/modules/identity/interface/http/dto/create-user.dto.ts` | Made `password` optional, added regex validation for password policy |
| `back/src/modules/identity/interface/http/users.controller.ts` | Handle optional password (null passwordHash when no password provided) |
| `back/src/modules/identity/infrastructure/repositories/prisma-user.repository.ts` | Handle nullable `passwordHash` in PrismaUserRecord, create, and toDomain |
| `back/src/modules/identity/infrastructure/repositories/in-memory-user.repository.ts` | Handle nullable `passwordHash` with `?? null` fallback |
| `back/src/modules/identity/application/local-identity.provider.ts` | Reject login for users without `passwordHash` |
| `back/src/modules/identity/identity.module.ts` | Registered `VerificationCodeService`, `PasswordHistoryService`, `RateLimitService` |
| `back/src/modules/identity/interface/http/auth.controller.ts` | Added 4 new endpoints + rate limiting + IP extraction |

## Files Created

| File | Purpose |
|------|---------|
| `back/src/modules/identity/application/password-validation.service.ts` | Password policy validation (8+ chars, upper, lower, digit, special) |
| `back/src/modules/identity/application/verification-code.service.ts` | 6-digit code generation, SHA-256 hashing, TTL, attempt limiting |
| `back/src/modules/identity/application/password-history.service.ts` | Last 3 passwords reuse prevention |
| `back/src/modules/identity/application/rate-limit.service.ts` | In-memory sliding window rate limiting |
| `back/src/modules/identity/interface/http/dto/check-email.dto.ts` | DTO for GET /auth/check-email |
| `back/src/modules/identity/interface/http/dto/set-password.dto.ts` | DTO for POST /auth/set-password |
| `back/src/modules/identity/interface/http/dto/verify-code.dto.ts` | DTO for POST /auth/verify-code |

## New API Endpoints

| Method | Path | Rate Limit | Description |
|--------|------|------------|-------------|
| `GET` | `/auth/check-email?email=...` | 10/hour | Check if email needs password setup |
| `POST` | `/auth/send-code` | 3/hour | Send verification code to email |
| `POST` | `/auth/verify-code` | 5/hour | Verify 6-digit code |
| `POST` | `/auth/set-password` | 7/hour | Set new password (requires valid code) |

## Database Migration

- **Name:** `20260718054604_first_login_password_setup`
- **Status:** Applied successfully
- **Changes:**
  - `User.passwordHash` changed from `String` to `String?`
  - New table: `verification_codes` (id, email, codeHash, attempts, used, expiresAt, createdAt)
  - New table: `password_history` (id, userId, hash, createdAt) with FK to User

## Security Controls

- **Code storage:** SHA-256 hashed (never plain text in DB)
- **Code expiry:** 10 minutes
- **Max attempts:** 5 per code
- **Rate limits:** check-email 10/h, send-code 3/h, verify-code 5/h, set-password 7/h
- **User enumeration prevention:** Generic messages on all endpoints (same response for existing/non-existing users)
- **Password policy:** 8+ chars, uppercase, lowercase, digit, special character
- **Password history:** Last 3 passwords tracked, reuse rejected
- **Login guard:** Users without `passwordHash` cannot authenticate

## Verification

- Prisma migration applied: ✅
- TypeScript compilation (non-test files): ✅ zero errors
- Pre-existing test type errors: 86 (unrelated to this work)
- No commits, pushes, or deploys made

## Remaining Work

- **Email delivery:** Currently logs verification codes to console; needs integration with email service (SendGrid, AWS SES, etc.)
- **Frontend:** No UI built for the password setup flow
- **Tests:** No unit/e2e tests for new services/endpoints yet
- **Redis-backed rate limiting:** Current implementation is in-memory (single instance only)
- **Cron cleanup:** `VerificationCodeService.cleanupExpired()` exists but is not wired to a scheduler
