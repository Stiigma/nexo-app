# HOFF-2026-07-01-purchase-capture-demo

## Metadata

- Task ID: `NEXO-0002`
- Date: 2026-07-01
- Authoring agent: `nexo-plan` with `nexo-design` input
- Receiving agent: `nexo-build`
- Status: stack confirmed, ready for disposable prototype implementation

## Objective

Create a narrow meeting demo for the inventory-first purchase flow without
turning the demo into hidden product architecture.

The demo should show an operator creating a purchase cart, adding garments with
photo placeholders and costs, confirming the cart as a purchase batch, assigning
internal codes, and reviewing the resulting garments as `Acquired Stock`.

## Context

Nexo product implementation has not started. The current canonical work is
`NEXO-0002`, which is finalizing domain context and unresolved requirements.
On 2026-07-01, the user confirmed the first disposable prototype stack:
React, SQLite, and Zustand.

The latest domain direction is inventory-first:

- A `Purchase Cart` exists before payment and is not inventory.
- A `Purchase Cart Item` has a capture ID and main photo, but no internal code.
- Confirming payment creates a `Purchase Batch`.
- Remaining cart items become garments in `Acquired Stock`.
- `Acquired Stock` cannot be reserved or sold until the minimum garment file is
  complete.

For a meeting demo, this slice is safer than reports, sales, reservations, QR,
auth, or production infrastructure because it exercises the current core model
without depending on unresolved downstream policies.

## Source Docs

- `NEXO_PROJECT.md`
- `CONTEXT.md`
- `docs/spec/SRS.md`
- `docs/spec/user-stories.md`
- `docs/spec/traceability.md`
- `harness/control/tasks.md`
- `harness/control/plans/NEXO-0002-domain-context.md`
- `harness/control/reports/2026-07-01/NEXO-0002-demo-orientation-session-005.md`
- `docs/adr/ADR-2026-07-01-disposable-prototype-stack.md`
- `docs/brand/README.md`
- `docs/brand/nexo-logo.png`
- `docs/design/README.md`
- `docs/design/purchase-capture-demo-brief.md`

Linked requirements and stories:

- `FR-PUR-001`, `FR-PUR-002`, `FR-PUR-003`, `FR-PUR-004`, `FR-PUR-005`,
  `FR-PUR-006`
- `FR-INV-001`, `FR-INV-002`, `FR-INV-004`, `FR-INV-005`, `FR-INV-008`,
  `FR-INV-009`
- `DR-001`, `DR-002`, `DR-003`, `DR-004`, `IR-001`, `IR-002`
- `US-001`, `US-002`, `US-003`, `US-009`, and the acquired-stock portion of
  `US-017`

## Files To Create Or Modify

Recommended demo-only path:

- Create `prototypes/purchase-capture-demo/` as a clearly labeled prototype
  surface separate from durable backend/database work.
- Use the Nexo design brief in `docs/design/purchase-capture-demo-brief.md`.
- Use the external design harness at
  `/home/otomi/Downloads/Backup/Harness/diseno-harness` as a process/checklist
  reference, especially its mobile UI checklist and implementation readiness
  rubric.
- Use Vite + React + TypeScript.
- Use Zustand for transient UI workflow state.
- Use SQLite in the browser through `@sqlite.org/sqlite-wasm` for local
  prototype persistence.
- Create a small data-access layer so SQLite calls stay out of React
  components.
- Use `docs/brand/nexo-logo.png` as the primary logo reference for the
  prototype shell/header.
- Do not create production auth, database schema, external exchange-rate
  integration, object storage integration, deployment config, or CI/CD for this
  slice.

Do not create `front/` for this prototype unless the user explicitly changes
direction from disposable demo to durable frontend foundation.

## Implementation Steps

1. Scaffold `prototypes/purchase-capture-demo/` with Vite, React, and
   TypeScript.
2. Add Zustand and SQLite WASM dependencies.
3. Read `docs/design/purchase-capture-demo-brief.md` before implementing the
   UI.
4. Keep the artifact visibly separated from product runtime code and label it
   as a prototype.
5. Add the supplied Nexo logo to the prototype asset set and use it in a compact
   mobile-friendly header.
6. Define prototype-only SQLite tables for:
   - stores,
   - purchase carts,
   - purchase cart items,
   - purchase batches,
   - garments,
   - difference reasons.
7. Define a Zustand store for:
   - active screen/step,
   - active cart ID,
   - selected cart item,
   - form drafts,
   - demo reset/seed commands.
8. Build the mobile-first flow:
   - Start purchase cart: store, date, currency, tax rate, exchange rate.
   - Add purchase cart item: capture ID, main photo placeholder, purchase cost,
     optional category selection, and category review flag.
   - Show expected cart total with tax and MXN equivalent.
   - Confirm payment: purchase evidence placeholder, paid total, difference
     reason when paid total differs from expected total.
   - Create purchase batch summary.
   - Assign deterministic sample internal codes.
   - Show resulting acquired-stock inventory list.
9. Keep calculations simple but explicit:
   - Store original currency and original amount.
   - Store the exchange rate used.
   - Show MXN equivalent.
   - Avoid implementing final rounding policy beyond display-level formatting
     until `OQ-001` is resolved.
10. Show blocked next actions:
   - Acquired-stock garments cannot be reserved or sold.
   - A garment with category review or missing minimum file fields is visibly
     not ready for availability.
11. Add a short README or visible note saying the demo is local, disposable, and
   does not represent production security, storage, exchange-rate, or audit
   behavior.

## Verification

- Manual demo run on a mobile viewport.
- `npm run build` for the prototype.
- If tests are added, run the prototype's narrow unit tests.
- Confirm the flow can demonstrate:
  - cart creation,
  - adding at least two cart items,
  - expected total calculation,
  - payment confirmation,
  - required difference reason when totals differ,
  - internal code assignment,
  - acquired-stock inventory review,
  - category review blocking availability.
- Confirm no real secrets, credentials, or external integrations are present.
- Confirm unresolved policies are not silently implemented as permanent
  business rules.
- Confirm the supplied logo is legible in the mobile header and not cropped.
- Review the implemented mobile UI against the design harness mobile checklist
  before treating the demo as ready for the meeting.

## Risks

- A disposable demo may be mistaken for production architecture.
- Starting a durable frontend before schema/ADR work can bake in premature API
  assumptions.
- Financial display can imply a rounding policy before `OQ-001` is resolved.
- Mock photo handling can hide future S3-compatible storage requirements.
- SQLite WASM browser storage behavior can vary by browser mode and storage
  availability.
- A polished demo can create pressure to skip unresolved correction, duplicate
  customer, QR, listing lifecycle, and exchange-rate fallback decisions.

## Acceptance Criteria

- A meeting attendee can understand the core purchase-to-inventory flow in less
  than five minutes.
- The demo uses canonical terms: `Purchase Cart`, `Purchase Cart Item`,
  `Purchase Batch`, `Acquired Stock`, `Category Review`, `Internal Code`, and
  `Minimum Garment File`.
- The demo does not include reports, sales, reservations, QR printing,
  production auth, real storage, real exchange-rate provider calls, deployment,
  or CI/CD.
- The demo visibly distinguishes `Purchase Cart Item` before payment from
  `Garment` after payment.
- The demo visibly blocks acquired stock from reservation or sale until the
  minimum garment file is complete.
- Prototype state is stored through SQLite, while Zustand is limited to UI
  workflow and transient state.

## Required Gates

- QA review: required before treating the demo as a product-ready slice.
- Security review: not required for a local disposable prototype; required
  before adding auth, real storage, external services, or deployable config.
- User confirmation: stack confirmed for disposable prototype. Explicit
  confirmation is still required before converting this into durable `front/`
  product foundation, committing, pushing, deploying, or adding external
  services.
