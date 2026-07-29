# Handoff - NEXO-0053 Instagram Follow Verification

## Objective

Verify giveaway commenters and tagged accounts against the follower list of
`@nexo.ens`, then apply auditable eligibility decisions and ticket bonuses.

## Context

Chrome DevTools runs only through the dedicated loopback browser with explicit
user consent. A smoke run opened the followers dialog and extracted 162 unique
followers in memory, matching the Instagram UI count. The list was discarded;
do not persist full follower usernames.

## Source Documents

- `harness/control/plans/NEXO-0053-instagram-giveaway-follow-verification.md`
- `back/src/modules/giveaway/`
- `harness/content/giveaways.md`

## Files In Scope

- `back/src/modules/giveaway/application/follow-verifier.service.ts`
- `back/src/modules/giveaway/infrastructure/repositories/prisma-giveaway.repository.ts`
- `back/src/modules/giveaway/interface/http/giveaway.controller.ts`
- `front/src/features/giveaways/`

## Implementation Steps

1. Fetch follower usernames in memory from the live Instagram followers dialog,
   with rate-limited scrolling and no follower-list persistence.
2. Compare usernames case-insensitively and record only verification decisions
   and provenance.
3. Recalculate participant ticket totals for all affected records.
4. Provide an admin-only manual trigger and retain manual-review reversibility.

## Verification

- Chrome smoke test extracts at least one follower and reconciles the displayed count.
- Run focused backend and frontend type checks, tests, and production builds.
- Complete required QA and security reviews before close.

## Risks

- Instagram UI changes and rate limits can prevent complete extraction.
- Follow status is a time-sensitive eligibility fact and must retain snapshot provenance.
- Do not silently overwrite manual decisions or persist raw follower lists.

## Acceptance Criteria

- Non-following commenters are marked `NO_FOLLOW` only through an auditable,
  reversible verification run.
- Eligible tagged accounts receive exactly one `+3` bonus per valid comment.
- Ticket totals are consistent after each verification run.
- No credentials or full follower lists are persisted.

## Receiving Agent

`nexo`
