# NEXO-0053 — Instagram Giveaway Follow Verification

## Objective

Automate the verification of Instagram follows for giveaway eligibility (Level 2
of the giveaway verification pyramid). Verify which commenters and tagged
accounts follow `@nexo.ens` and apply the corresponding ticket rules without
manual admin intervention.

## Done When

- A resumable script/service builds a list of `@nexo.ens` followers.
- Every giveaway commenter who does NOT follow `@nexo.ens` has all their
  comments in that giveaway invalidated with reason `NO_FOLLOW`.
- Every valid comment whose tagged user follows `@nexo.ens` receives the
  `+3` follow bonus on that comment.
- Participant `totalTickets` is recalculated to be the single source of truth
  after every verification change.
- Pay-for-play eligibility updates (`verifiedFollow` + `invalidReason`) are
  auditable, reversible, and never silently applied.
- Chrome DevTools control stays inside its dedicated loopback profile with
  explicit user consent per run.
- No real token or credential is persisted in source, logs, or control-plane
  evidence.

## Scope

- Implement a `FollowVerifier` service that:
  1. Fetches the complete follower list of `@nexo.ens` via Chrome DevTools
     (scrolling the Instagram web follower modal with pagination pauses).
  2. Builds an in-memory Set of follower usernames.
  3. Iterates giveaway participants and comments, matching usernames
     (case-insensitive) against the follower set.
  4. Persists verification results (`verifiedFollow`, `followBonus`,
     `invalidReason`) to the database with provenance metadata.
  5. Recalculates `totalTickets` for every affected participant.
- Expose verification as a backend API endpoint (`POST /giveaways/:id/verify-follows`)
  plus a manual trigger button in the admin dashboard.
- Ensure the follower fetch is resumable (checkpoint progress) and
  rate-limited.
- Document the verification provenance (timestamp, follower-list snapshot date,
  method, verifier version).

## Out Of Scope

- Like verification, story-share proof, Ensenada residency checks, and winner
  selection.
- Changing the core giveaway Prisma schema (except adding provenance fields if
  required by security review).
- Running follow verification automatically on comment import (it stays a
  separate manual/admin step).
- Cross-giveaway deduplication or unified participant profiles.
- Deploying, committing, or pushing any changes.

## Architecture Decision

The follower list is built by Chrome DevTools automation navigating the
Instagram web UI. This approach was selected because:

1. Instagram's Graph API does not expose a public follower list endpoint for
   accounts the user does not own — only aggregate `followers_count` is
   available.
2. The Instagram web UI's follower modal supports infinite scroll and can be
   queried via `evaluate_script` for DOM extraction.
3. Chrome DevTools is already configured as a trusted MCP in this project
   (`opencode.json`), with an explicit dedicated loopback browser profile rule.
4. The resulting follower set is ephemeral in-memory, never persisted as a full
   list, and only derived verification decisions are stored.

### Decision Evaluation

| Factor | Evaluation |
|---|---|
| Correctness | Manual fallback override available for any verifier error |
| Resumability | Last-checkpoint username stored; resume from that point |
| Data minimization | Only eligibility flags stored, not the follower list |
| Consent | User must authorize browser control before each run |

**Decision: Approved** — Use Chrome DevTools scroll-extract for
`@nexo.ens` follower verification.

## Steps

1. Fix prerequisite dashboard bugs: total recalculation after bonus toggle,
   idempotent non-destructive sync, list `totalTickets` aggregation.
2. Create `FollowVerifier` service in `back/src/modules/giveaway/application/`.
3. Implement follower-list extraction via Chrome DevTools (`evaluate_script`
   against the follower modal DOM after scroll-based pagination).
4. Implement case-insensitive username matching loop (~500 participants
   and tagged accounts, ~2s between profiles for rate-limiting).
5. Implement `POST /giveaways/:id/verify-follows` endpoint.
6. Add "Verify Follows" button to the admin detail page.
7. Add provenance fields (`verifiedAt`, `verifiedBy`, `verificationMethod`)
   to `GiveawayComment` and `GiveawayParticipant`.
8. Run control-engine build gate before implementation.
9. After implementation: run backend/frontend tests and builds, then QA and
   security review before close.

## Risks

- Instagram rate-limiting or account flagging from excessive scrolling.
  Mitigation: inter-request delays (≥1s) and max batch size per run.
- Chrome DevTools disconnection mid-verification. Mitigation: checkpoint
  progress by username; resume from last saved state.
- Follower list staleness between fetch and verification application.
  Mitigation: record snapshot timestamp; allow manual re-verification.
- Privacy: the verifier inspects public Instagram profiles but the process
  must not store non-nexo profile data. Mitigation: only eligibility flags
  and provenance metadata are persisted.

## Verification

- TypeScript type check (back + front) with zero giveaway errors.
- Backend unit tests for the follow-verification service (mocked follower set).
- Backend/frontend production builds.
- Chrome smoke test: verify the follower modal extracts ≥1 username.
- Manual acceptance: run a verified test giveaway with known followers,
  confirm correct flags + recalculated totals.
- QA and security review evidence submitted before close.

## Source Documents

- `harness/control/handoffs/HOFF-2026-07-29-instagram-giveaway-dashboard-phase-4.md`
- `back/src/modules/giveaway/`
- `back/scripts/fetch-instagram-comments.mjs`
- `harness/control/runbooks/NEXO-0025-chrome-devtools-mcp.md`
