# Implementation - NEXO-0054 Comment-Scoped Pre-Existing Followers

## Delivered

- Extended giveaway evidence labels with an optional comment scope.
- Added `PRE_EXISTING_FOLLOWER` as an auditable, reversible reason.
- A scoped label preserves comment validity and its base ticket while setting
  only the follow bonus to zero.
- Added duplicate-active-label protection and pending-review behavior on
  revocation.
- Added the admin `Bonos inactivos` section with participant/tag evidence.
- Applied the eight confirmed men's-giveaway pairs transactionally without
  persisting a follower snapshot.

## Migration And Data Integrity

- Applied migration `20260729223000_add_comment_scoped_giveaway_penalties` to
  the local PostgreSQL database.
- Verification found eight active scoped labels; all eight comments remained
  valid, all eight follow bonuses were zero, and all eight decisions retained
  provenance.
- Rollback is revocation of the active labels, which returns each affected
  comment to pending follow verification and recalculates participant totals.

## Verification

- Backend production build passed.
- Frontend TypeScript and production build passed.
- `git diff --check` passed.
- Full backend `tsc --noEmit` remains blocked by pre-existing missing Vitest
  globals in test files; the production build excludes that unrelated issue.

## Remaining

- Complete QA and security review before task close.
