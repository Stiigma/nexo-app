# NEXO-0054 - Giveaway Participant Penalties

## Objective

Provide auditable, reversible evidence tags for Instagram giveaway usernames,
including a dedicated admin review section that explains each tag.

## Done When

- Participant-level tags never alter tickets, eligibility, comments, or bonuses.
- A comment-scoped `PRE_EXISTING_FOLLOWER` tag suppresses only that comment's
  `+3` follow bonus while preserving its base ticket and participation.
- Administrators can create and revoke multiple tags with a reason and note.
- Giveaway detail exposes tagged participants in a dedicated evidence section.
- The dashboard lists the applicable reason, source, timestamp, and reviewer.

## Scope

- Add a `GiveawayParticipantPenalty` persistence model and migrations, with an
  optional comment scope for pair-specific evidence.
- Add admin-only create/revoke penalty endpoints.
- Add active-penalty data to participant detail responses.
- Add a penalized-participants tab with filterable reason and evidence.
- Preserve displayed giveaway totals for informational participant tags; only
  comment-scoped bonus exclusions alter totals.

## Out Of Scope

- Automatic follow-verification application from NEXO-0053.
- Deleting existing comments or follower snapshots.
- Changing comment-level validity or base-ticket rules.

## Migration Plan

The first migration adds an append-only penalty table. The follow-up migration
adds `PRE_EXISTING_FOLLOWER`, an optional `commentId`, its foreign key, and a
partial unique index preventing duplicate active labels for one comment/reason.
Neither migration deletes existing giveaway records. Rollback after use is to
revoke active comment-scoped labels, restore comments to pending follow review,
recalculate totals, then remove the comment relation and enum value only if the
audit history is intentionally discarded.

## Steps

1. Add Prisma penalty enum/model and create a local migration.
2. Add repository, service, DTO, and admin endpoint support.
3. Include active-tag information in giveaway detail without changing tickets.
4. Build the admin evidence-tag tab and tag/revocation interactions.
5. Run type checks, targeted tests, builds, QA, and security review.
6. Apply the eight confirmed men's-giveaway pairs transactionally and verify
   that base tickets remain while their follow bonuses equal zero.

## Decision Log

- 2026-07-29: Represent evidence tags in a separate entity instead of
  overloading comment invalidations, preserving reason, source, timestamps,
  and revocation history.
- 2026-07-29: Tags are informational only. The previous effective-ticket-zero
  behavior was removed before any penalty records were created.
- 2026-07-29: `PRE_EXISTING_FOLLOWER` is a narrow exception: it is scoped to a
  comment/tag pair and suppresses only the follow bonus, never participation.

## Risks

- A bad manual tag could misrepresent participant evidence.
  Mitigation: mandatory reason/note, explicit reversible revocation, and audit
  fields.

## Verification

- `pnpm --dir back tsc --noEmit`
- `pnpm --dir front tsc --noEmit`
- `pnpm --dir back build`
- `pnpm --dir front build`
- `git diff --check`
