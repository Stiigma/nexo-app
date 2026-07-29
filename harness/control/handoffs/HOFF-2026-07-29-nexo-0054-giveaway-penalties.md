# Handoff - NEXO-0054 Giveaway Participant Penalties

## Objective

Build a reversible administrative workflow to fully disqualify a giveaway
participant and explain the penalty in the giveaway dashboard.

## Context

Existing `isActive` has no audit reason and comment `invalidReason` applies only
to individual comments. The new model must preserve both histories and use a
separate active penalty to determine effective tickets.

## Source Documents

- `harness/control/plans/NEXO-0054-giveaway-participant-penalties.md`
- `back/prisma/schema.prisma`
- `back/src/modules/giveaway/`
- `front/src/features/giveaways/`

## Files To Modify

- `back/prisma/schema.prisma` and a generated Prisma migration
- Giveaway repository, service, controller, and DTOs
- Giveaway frontend types, hooks, detail view, and components

## Implementation Steps

1. Persist penalty/revocation audit data with a non-destructive migration.
2. Implement a transactional active-penalty create/revoke workflow.
3. Expose penalty data and effective totals.
4. Build the penalized-participants review UI.

## Verification

- Run the task's declared type checks and production builds.
- Confirm a penalized participant has zero effective tickets without losing
  comments; confirm revocation restores effective tickets.

## Risks

- Do not silently delete comments, bonuses, or audit history.
- Do not expose the endpoints outside `AdminWorkspace`.

## Acceptance Criteria

- Every active penalty has reason, source, actor, and timestamp.
- Every revocation has actor and timestamp.
- Eligible totals exclude active penalties.
- The dashboard presents human-readable reasons and reversible controls.

## Receiving Agent

`nexo`
