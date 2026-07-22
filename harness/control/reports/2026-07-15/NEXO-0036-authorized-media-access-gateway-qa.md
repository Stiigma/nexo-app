# NEXO-0036 QA Review — Authorized Media Access Gateway

## Metadata

- Task ID: NEXO-0036
- Date: 2026-07-15
- QA agent: nexo-qa
- Reviewed artifact: NEXO-0036 implementation and pending data migration
- Decision: conditional pass

## Scope

Review durable storage-key persistence, protected photo renewal, migration
safety, regression coverage, and readiness to replace the expired URLs that
blocked NEXO-0033 visual acceptance.

## Requirements Coverage

- Pass: photo identity is modeled as a stable key and the generated read URL
  is no longer persisted or returned from inventory.
- Pass: a same-origin content endpoint authenticates the session and requires
  `OperatorWorkspace` before redirecting to a fresh URL.
- Pass: frontend obtains its source from photo ID, without storage-provider or
  SAS branching.
- Pass: the importers persist stable keys on create/update paths.

## Acceptance Criteria

- Pass: 56/56 current legacy references are recognized by the migration
  normalization simulation and become `items/{id}/main.webp`.
- Pass: no simulated value retains an HTTP URL, query string, or local public
  prefix.
- Pass: resolver, redirect, inventory selection, upload, and broader backend
  suites pass.
- Pending: apply the migration and observe all 56 actual records through the
  authenticated gateway/UI.

## UX And Accessibility

- The existing card, detail modal, and full-photo lightbox retain their `img`
  semantics and alt text. Only the source-resolution strategy changes.
- Manual rendering remains pending because the migration deliberately was not
  applied.

## Automated Tests

- 14 backend files / 61 tests passed.
- Backend and frontend production builds passed.
- Current 39-item importer dry-run passed with no writes.

## Manual Verification

- Read-only database metrics confirm 56 signed Azure references, each with a
  query string; no photo paths were printed or exposed.
- SQL simulation confirms all 56 normalize cleanly.
- No authenticated visual check was performed because doing so requires the
  explicitly gated migration first.

## Data Integrity

- The migration is fail-closed for residual URL-shaped entries.
- It changes reference representation only: no item, photo ID, blob object,
  order, or pricing data is removed or recreated.

## Security Handoff

- See `security/NEXO-0036-authorized-media-access-gateway.md`.

## Release Readiness

Not ready to close until the migration is authorized/applied, authenticated
visual QA passes, and container privacy is confirmed.

## Findings

- QA-1 (open): final behavior cannot be observed against the local database
  until the `path` → `storageKey` migration is applied.

## Required Follow-Up

- Apply the migration only after explicit user confirmation.
- Check database counts, protected redirect behavior, inventory cards, detail,
  lightbox, and the 39-item `PRICE_PENDING` filter/order.

