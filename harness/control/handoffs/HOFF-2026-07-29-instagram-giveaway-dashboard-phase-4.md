# Handoff - Instagram Giveaway Dashboard And Phase 4 Verification

## Status

- Date: 2026-07-29
- Session binding: `UNBOUND_SESSION`
- Reason for handoff: Nexo budget guard reached the session/task soft limit.
- Product implementation stopped immediately after this record was requested.
- This work is **not** part of the repository's default active task
  `NEXO-0036`; do not update that task or replace the default focus silently.
- Recommended receiving agent: `nexo`, to register a new controlled task and
  prepare the required plan/manifest before any Phase 4 implementation.

## Objective

Continue an admin-only Instagram giveaway dashboard that imports giveaway
comments, applies base-ticket rules, presents participant evidence, and lets an
administrator review bonuses. The next requested phase is automated follow
verification for commenters and tagged accounts.

## Business Rules Agreed In The Session

1. A valid comment gives one base ticket.
2. A comment must contain exactly one Instagram tag.
3. A participant must tag a different account in each comment. Reusing the same
   tagged account in the same giveaway invalidates the later comment.
4. A comment with zero tags, multiple tags, or `@nexo.ens` as the tag is invalid.
5. A commenter who does not follow `@nexo.ens` is ineligible; their comments
   must ultimately be invalidated as `NO_FOLLOW`.
6. For each otherwise valid comment, add three tickets when that comment's
   tagged account follows `@nexo.ens`.
7. Participation and ticket totals are independent between the men's and
   women's giveaways.
8. The current UI assumes a one-time `+2` story-share bonus per participant,
   but the proof and review policy was not finalized.
9. Like verification and Ensenada residency remain unresolved/manual checks.

## Giveaway Sources

- Men's Instagram media ID: `17960893353144193`.
- Women's Instagram media ID: `18428526250131084`.
- Giveaway copy and observed counts: `harness/content/giveaways.md`.
- Raw fetched comment snapshot: `back/scripts/giveaway-comments.json`.

The raw snapshot contains Instagram usernames and comment text. Treat it as
personal data. Decide retention, access, and Git tracking before continuing.

## What Changed

### Backend and data

- Added Prisma giveaway models and invalid-reason enum in
  `back/prisma/schema.prisma`.
- Created and applied migration
  `back/prisma/migrations/20260729200419_add_giveaway/migration.sql`.
- Added `back/prisma/seed-giveaways.ts` and seeded the two giveaways locally.
- Added the Nest module under `back/src/modules/giveaway/`, including domain
  types, repository, services, DTOs, controller, bonus endpoints, and user
  activity lookup.
- Registered `GiveawayModule` in `back/src/app.module.ts`.
- Added `@mcpware/instagram-mcp@1.0.4` to the backend dependency set.
- Added scripts:
  - `back/scripts/fetch-instagram-comments.mjs`
  - `back/scripts/sync-giveaway-db.mjs`
  - `back/scripts/list-mcp-tools.mjs`
- Imported a comment snapshot into the local database.

### Frontend

- Added admin routes:
  - `/admin/giveaways`
  - `/admin/giveaways/:id`
- Added the `front/src/features/giveaways/` feature with giveaway cards,
  participant table, per-comment expansion, bonus toggles, React Query hooks,
  and a username evidence panel.
- Added the admin navigation entry and gift icon to desktop/mobile navigation.
- The evidence panel calls
  `GET /api/v1/giveaways/users/:username/activity` and groups the derived
  comment records by giveaway.

### Configuration and documentation

- Added Instagram MCP/tool configuration using environment-variable references
  in project OpenCode configuration. No access token was found persisted in
  searched repository files.
- A user supplied real short-lived Instagram tokens in chat. They must be
  treated as exposed and rotated; never copy them into this handoff, source,
  logs, or task state.
- `front/package-lock.json` was created while installing/checking frontend
  dependencies even though the repository otherwise uses pnpm. Review and
  remove or intentionally adopt it before committing.

## Local Import Result

The snapshot/import scripts reported:

| Giveaway | Fetched comments | Valid base comments | Invalid details | Participants |
| --- | ---: | ---: | --- | ---: |
| Men's | 240 | 238 | 2 duplicate tags | 31 |
| Women's | 350 | 344 | 1 no-tag, 1 multi-tag, 4 duplicate tags | 43 |

Earlier Instagram metadata observations were 246 and 313 comments. The later
snapshot differs materially, especially for the women's post. Reconcile
timestamp, top-level/reply semantics, deletions/hidden comments, and pagination
before using these totals for the final draw.

## Verification Performed

- Prisma migration `20260729200419_add_giveaway` was generated and applied to
  the local PostgreSQL database; Prisma Client generation completed.
- Both giveaway seed records were created locally.
- Comment fetch completed with cursor pagination through the installed
  Instagram client and produced 240/350 records.
- Local database import completed with the rule summary above.
- A direct Prisma query showed participant/comment totals and ranked sample
  participants.
- Frontend TypeScript check completed without giveaway errors.
- Backend giveaway TypeScript errors were corrected; a full backend `tsc`
  invocation still surfaced unrelated/pre-existing test-global configuration
  errors, so no full clean backend type gate is recorded.
- Nest startup mapped all giveaway routes, including the username activity
  endpoint.
- Unauthenticated requests correctly returned `401`.
- An authenticated dashboard request initially returned `500` because a stale
  server instance had an undefined `GiveawayService`. The DI setup was changed
  to concrete class providers and the server was restarted. No final
  authenticated end-to-end acceptance was captured after the user took process
  ownership of port 3000.
- At the user's request, the assistant-owned process on port 3000 was stopped;
  the user then started their own backend process.

## Open Risks And Known Defects

1. **Controlled-work gap:** Phase 4 touches real credentials, Instagram data,
   browser automation, eligibility decisions, and local database records. It
   needs a new registered controlled task, plan, manifest, rollback, QA, and
   security review before implementation.
2. **Token exposure:** Real access tokens were pasted in chat. Rotate/revoke
   them and use environment variables only. Repository search found no token
   value with the known prefix, but this does not cover shell history, chat, or
   external logs.
3. **Browser consent:** Chrome DevTools control has not been authorized for
   Phase 4. Obtain explicit confirmation and use only the dedicated loopback
   browser/profile.
4. **Destructive sync:** `back/scripts/sync-giveaway-db.mjs` deletes existing
   comments and participants before reimporting. Rerunning it can erase manual
   review/bonus decisions. Do not run it again without backup, explicit user
   approval, and an idempotent/upsert replacement.
5. **Incomplete EC5:** The imported base-ticket set has not yet invalidated
   commenters who fail the account-follow requirement.
6. **Totals not recalculated:** Bonus endpoints update follow/story fields but
   currently do not reliably recompute participant `totalTickets` after every
   toggle. Fix and test before manual review.
7. **Giveaway list totals:** Repository list mapping currently initializes
   `totalTickets` to zero instead of aggregating participant totals.
8. **Evidence fidelity:** The database stores derived tagged usernames but not
   the original comment text, timestamp, permalink, or immutable snapshot
   metadata. The username evidence panel therefore shows derived records, not
   complete auditable evidence. Adding those fields requires an approved schema
   migration and privacy/retention decision.
9. **Sync endpoint incomplete:** `POST /giveaways/:id/sync` currently invokes
   the sync service with an empty comment array; the real import is performed by
   standalone scripts.
10. **Idempotency:** The application sync service and standalone importer need
    conflict-safe upserts and stable duplicate ordering before production use.
11. **Route/process acceptance:** Final authenticated dashboard acceptance,
    evidence search, and bonus toggles have not been verified end to end.
12. **Dirty worktree:** The root and backend worktrees contain substantial
    unrelated existing changes. Stage or commit nothing until giveaway-scoped
    changes are isolated and reviewed.
13. **Dependency/tooling review:** The new MCP dependency and accidental npm
    lockfile need the project's dependency-selection gate before retention.

## Recommended Next Step

1. Register a new controlled task (next available `NEXO-*` ID) specifically for
   giveaway administration and Instagram eligibility verification. Do not bind
   it to or modify `NEXO-0036`.
2. Rotate the exposed Instagram token and define approved secret injection.
3. Confirm the unresolved story/like/location evidence policies and data
   retention requirements.
4. Before Phase 4, fix and test total recalculation, list aggregation,
   idempotent non-destructive sync, and evidence fidelity.
5. Reconcile the Instagram count discrepancy and freeze an auditable snapshot.
6. After task gates and explicit browser consent, implement Phase 4 as a
   resumable verifier that caches follow checks, records evidence timestamps and
   provenance, supports `verified`/`not_following`/`unverifiable`, rate-limits
   requests, and never silently invalidates reviewed records.

## Files To Review Or Modify Next

- `back/prisma/schema.prisma`
- `back/src/modules/giveaway/application/giveaway.service.ts`
- `back/src/modules/giveaway/application/sync-giveaway.service.ts`
- `back/src/modules/giveaway/infrastructure/repositories/prisma-giveaway.repository.ts`
- `back/src/modules/giveaway/interface/http/giveaway.controller.ts`
- `back/scripts/fetch-instagram-comments.mjs`
- `back/scripts/sync-giveaway-db.mjs`
- `front/src/features/giveaways/components/ParticipantTable.tsx`
- `front/src/features/giveaways/components/UserEvidencePanel.tsx`
- `front/src/features/giveaways/hooks/use-giveaways.ts`
- `harness/content/giveaways.md`

## Acceptance Criteria For The Next Controlled Slice

- A registered task and valid control manifest authorize the work.
- No real token is stored in source, config, reports, shell commands committed
  to Git, or browser evidence.
- Base-comment import is idempotent and preserves existing manual review.
- Every ticket total is derived consistently and covered by tests.
- Each eligibility decision records status, timestamp, method, and evidence
  provenance, with manual override auditability.
- The dashboard can review one participant at a time, display complete retained
  evidence, and apply/revert bonuses without stale totals.
- Count discrepancies are resolved or explicitly documented before winner
  selection.
- Backend/frontend targeted tests and production builds pass, followed by
  authenticated admin acceptance.

## Source Documents

- `AGENTS.md`
- `harness/control/README.md`
- `harness/control/WORKFLOW.md`
- `harness/control/tasks.md`
- `harness/control/agents/nexo.md`
- `harness/content/giveaways.md`
