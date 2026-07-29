# NEXO-0050 - Garment Lifecycle And Business Rules

## Metadata

- Task ID: `NEXO-0050`
- Status: `planned`
- Priority: P0
- Created: 2026-07-25
- Planning agent: `nexo-plan`
- Receiving agent after approval: `nexo-build`
- Required gates: architecture decision, migration plan, product-owner approval,
  QA review, and security review.
- Related task: `NEXO-0037` remains the source of the implemented safe editor;
  this task defines and owns the unimplemented lifecycle policy rather than
  rewriting that work.

## Objective

Make garment state changes deterministic, guarded, testable, and auditable.
Separate the physical inventory lifecycle from the commercial listing
lifecycle, derive safe state consequences from garment data, require a
maker-checker approval before publication, and prevent reservation or sale when
the garment or its transaction is incomplete.

## Done When

- The six existing inventory states and five commercial states have one clear
  meaning, label, owner, and exhaustive transition table.
- Editing data recalculates readiness and applies only the safe automatic state
  consequences defined here; approval, publication, reservation, sale, and
  return remain explicit commands.
- Every transition is authorized from server-side policy, records its actor,
  time, source, reason, and before/after state, and is atomic with its business
  record.
- An operator can prepare and submit a garment, but a different `ADMIN` account
  must approve the price revision before an admin can publish it.
- A garment cannot be reserved or sold without the required garment, listing,
  customer, reservation, price, and sale data.
- The current create-path defect cannot create a garment as `RETURNED`, and no
  generic update endpoint can bypass lifecycle commands.
- Domain and application tests cover every allowed and rejected transition
  without a UI, satisfying `NFR-MAINT-001`.

## Problem Analysis

### Why garments do not change state today

1. `PUT /items/:id/editor` deliberately excludes `status`; edits persist data
   but cannot trigger a lifecycle transition.
2. The generic update path changes state only when a caller explicitly sends
   `status`. It does not derive a state from completeness.
3. `isValidTransition()` validates only an edge in a map. Except for a positive
   `targetPriceMxn` before `AVAILABLE`, it does not validate garment data,
   actor, related reservation/sale, or a reason.
4. Creation treats “reachable from `ACQUIRED_STOCK`” as “valid initial state.”
   Because `RETURNED` is in that transition list, a new garment can incorrectly
   be created as returned.
5. The database has only `Item.status`; the commercial lifecycle already
   required by `FR-LST-001/002` has no persisted field.
6. Readiness exists as an informational checklist only. No server-side command
   consumes it to submit, approve, publish, reserve, or sell.
7. There is no persisted approval revision or transition history, so the
   system cannot prove who approved which price or invalidate an approval after
   an edit.

### Consequence

The current system conflates a garment's physical position, data completeness,
commercial visibility, and transaction outcome. A field edit may make a badge
stale, while a direct status update may make a garment appear sellable without
the facts that justify it.

## Scope

- Inventory and listing state definitions, invariants, and transition guards.
- A pure readiness evaluator and explicit lifecycle command policy.
- Automatic intake-state derivation and fail-safe automatic demotion.
- Price review, maker-checker approval, publication, and audit records.
- Reservation, sale, and return integration contracts, including required
  related records.
- Prisma migration and conservative backfill strategy.
- API commands, response blockers, eligible actions, and operator/admin queues.
- Unit, integration, migration, authorization, concurrency, and UI acceptance
  verification.

## Out Of Scope

- Public storefront, checkout, shipping, fiscal invoicing, accounting, or CRM.
- A new technical role beyond current `OPERATOR` and `ADMIN`.
- A third-party workflow engine, microservice, message broker change, or new
  product dependency.
- Automatic publication, automatic sale, or an unaudited administrator bypass.
- Reinterpreting historical `RETURNED` rows without human review.
- Implementing reservation and sales modules ahead of their owning tasks;
  NEXO-0050 defines their lifecycle contract and integrates when those records
  exist.
- Code, schema, or product-spec changes during this planning session.

## Domain Vocabulary And Data Rules

### Two independent persisted dimensions

- **Inventory status** answers: “What is the physical/transactional position of
  this unique garment?” It remains `Item.status`.
- **Listing status** answers: “What is the preparation and publication position
  of its commercial record?” It becomes `Item.listingStatus`.
- **Readiness** answers: “Which facts are present or missing right now?” It is a
  computed result, not a third editable status.
- **Price approval** answers: “Which exact commercial and financial revision
  did a second user approve?” It is an append-only review record, not a boolean.

### Required data groups

| Group | Required facts | Used by |
| --- | --- | --- |
| Identity | Non-blank unique `internalCode` and non-blank `productName` | Listing preparation and traceability |
| Catalog | Active `brandId`, `categoryId`, `conditionId`, `sizeId`, and `colorId` | Submit, approve, publish |
| Physical file | Non-blank `physicalLocation` and exactly one main photo whose storage reference is valid | Submit, publish, reserve, sell |
| Public price | Finite `targetPriceMxn > 0` | Submit, approve, publish, sell |
| Internal price | Finite `minPriceMxn > 0` and `targetPriceMxn >= minPriceMxn` | Price approval and sale |
| Cost basis | Supported `costCurrency`, finite `costAmount > 0`, finite `costMxnEq > 0`, and finite `exchangeRate > 0` when conversion is required | Intake derivation, approval, profit |
| Cost exception | Active `ADMIN` approval with reason, approver, timestamp, and revision; may replace missing cost basis only | Price approval and “utility pending” reporting |
| Reservation | Persisted active reservation with item, customer, reservation date, actor, and no other active reservation | `AVAILABLE -> RESERVED` |
| Sale | Persisted sale line with item, customer, date, final price, currency, payment method, and MXN equivalent when needed | `AVAILABLE/RESERVED -> SOLD` |
| Return | Persisted return/correction linked to the source sale or supplier action, with reason and responsible admin | Any transition to `RETURNED` |

`notes` remains optional and cannot be used as an unstructured substitute for
customer, price, reservation, sale, approval, or return records. Catalog IDs
must reference active values; existence alone is insufficient.

### Cross-lifecycle invariants

1. `PUBLISHED` can be entered only while inventory is `AVAILABLE`. A subsequent
   reservation may retain `PUBLISHED`, but the presentation must say
   “Reservado” and prevent a second reservation.
2. `PRICE_PENDING`, `ACQUIRED_STOCK`, `SOLD`, and `RETURNED` cannot be actively
   published. `SOLD` and `RETURNED` force listing `NOT_LISTED`.
3. `AVAILABLE` means internally cleared for sale; it does not itself mean
   visible to customers. Normal reservation or sale additionally requires
   `PUBLISHED`.
4. A valid price approval is bound to item ID, commercial revision, financial
   revision, and immutable price/cost snapshot. A material edit invalidates it.
5. The submitter and price approver must be different user IDs. If an `ADMIN`
   prepares/submits a garment, another `ADMIN` must approve it. The publisher
   may be the approving admin, but publication is a separate explicit action.
6. State changes occur in the same database transaction as their approval,
   reservation, sale, return, and audit records. Partial success is forbidden.
7. Clients supply `expectedLifecycleVersion`; stale commands fail with a
   conflict and cannot overwrite a newer review or state.

## Inventory State Machine

### States

| State | Spanish label | Meaning | Entry rule |
| --- | --- | --- | --- |
| `PRICE_PENDING` | Falta precio | Nexo owns/registered the garment, but its required financial packet is incomplete. It is not sellable. | Derived on create/import or after an authorized financial correction. |
| `ACQUIRED_STOCK` | Adquirido | The garment is owned and its financial packet is complete (or has an active cost exception), but it has not passed sale-readiness approval. | Derived after financial completion, restock, or readiness withdrawal. |
| `AVAILABLE` | Disponible | The garment passed current file and price approval and is physically available for one reservation or sale. | Only as a consequence of valid admin price approval/restock review. |
| `RESERVED` | Reservado | One active reservation holds the garment for one customer. | Only through reservation creation. |
| `SOLD` | Vendido | A completed sale line owns the garment's commercial disposition. | Only through sale completion. |
| `RETURNED` | Devuelto | The garment is in return/quarantine after a customer return, supplier return, or controlled reversal. It is not automatically sellable. | Only through a return/correction command with a persisted reason record. |

`RETURNED` is deliberately a quarantine state rather than proof that an item is
fit for resale. An admin inspection is required before restocking.

### Exhaustive valid inventory transitions

| From -> To | Initiator/role | Required guards and atomic effects |
| --- | --- | --- |
| `NEW -> PRICE_PENDING` | `SYSTEM`, caused by `OPERATOR` or `ADMIN` create/import | Initial status is derived, never accepted from the request. Required identity/FKs exist, and the financial packet is incomplete. Create an initial audit event. |
| `NEW -> ACQUIRED_STOCK` | `SYSTEM`, caused by `OPERATOR` or `ADMIN` create/import | Initial status is derived, never accepted from the request. Financial packet is complete. A new item can never start `AVAILABLE`, `RESERVED`, `SOLD`, or `RETURNED`. |
| `PRICE_PENDING -> ACQUIRED_STOCK` | `SYSTEM` after an authorized edit, or `ADMIN` cost-exception approval | Financial packet becomes complete or a valid cost exception exists. Record initiating actor and changed financial revision. Do not skip to `AVAILABLE`. |
| `PRICE_PENDING -> RETURNED` | `ADMIN` | Persist return/withdrawal reason and source; no active reservation/sale; listing becomes `NOT_LISTED`. |
| `ACQUIRED_STOCK -> PRICE_PENDING` | `SYSTEM` after an `ADMIN` financial correction | Financial packet becomes incomplete, no active reservation/sale, and any review/approval is invalidated. Listing is no more than `DRAFT`. |
| `ACQUIRED_STOCK -> AVAILABLE` | `SYSTEM`, caused by a different-user `ADMIN` price approval | Listing is `READY_FOR_REVIEW`; identity, catalog, physical file, and price guards pass; reviewed revision is current; price/cost snapshot or cost exception is valid. Approval and transition commit together. |
| `ACQUIRED_STOCK -> RETURNED` | `ADMIN` | Persist reason/source; no active reservation/sale; listing becomes `NOT_LISTED`. |
| `AVAILABLE -> PRICE_PENDING` | `SYSTEM` after authorized financial invalidation | No active reservation; an `ADMIN` changed financial facts so the packet is incomplete. Invalidate approval and move listing to `DRAFT` with an audit pair. |
| `AVAILABLE -> ACQUIRED_STOCK` | `SYSTEM` after file/readiness invalidation, or `ADMIN` withdrawal | No active reservation. Required physical/commercial facts no longer pass or admin withdraws readiness with reason. Invalidate approval; listing becomes `DRAFT` or `NOT_LISTED` according to withdrawal intent. |
| `AVAILABLE -> RESERVED` | `OPERATOR` or `ADMIN` through reservation command | Listing is `PUBLISHED`; readiness and price approval remain valid; exactly one customer and reservation date are stored; no active reservation or sale exists. Create reservation, status, and audit atomically. |
| `AVAILABLE -> SOLD` | `OPERATOR` or `ADMIN` through sale command | Listing is `PUBLISHED`; sale line is complete; final amount and MXN equivalent are positive; final amount is not below approved minimum unless a separate admin discount approval exists. Persist sale, set `SOLD`, set listing `NOT_LISTED`, and audit atomically. |
| `AVAILABLE -> RETURNED` | `ADMIN` | Persist a supplier-return/withdrawal record and reason; no active reservation/sale; listing becomes `NOT_LISTED`. |
| `RESERVED -> AVAILABLE` | `OPERATOR`, `ADMIN`, or expiry process | The active reservation is released, cancelled, or expires according to policy; close it with actor/source/time before changing status. Listing may remain `PUBLISHED` and again show available. |
| `RESERVED -> SOLD` | `OPERATOR` or `ADMIN` through sale command | Sale guards pass and customer matches the active reservation. A mismatch requires an `ADMIN` override by a user other than the seller, with reason. Close reservation, persist sale, set listing `NOT_LISTED`, and audit atomically. |
| `RESERVED -> RETURNED` | `ADMIN` | Close the active reservation, persist return/withdrawal reason, set listing `NOT_LISTED`, and audit atomically. |
| `SOLD -> RETURNED` | `ADMIN` through return command | Link the original sale line; capture reason, date, disposition, and refund/correction reference. Do not delete or rewrite the sale. Listing becomes `NOT_LISTED`. |
| `RETURNED -> PRICE_PENDING` | `ADMIN` through restock inspection | Return/refund is settled, garment is physically present, no active transaction exists, inspection says restock, and financial packet is incomplete. Listing starts `DRAFT` or remains `NOT_LISTED`; prior approval stays invalid. |
| `RETURNED -> ACQUIRED_STOCK` | `ADMIN` through restock inspection | Same restock guards, but financial packet is complete. Listing starts `DRAFT` or remains `NOT_LISTED`; a new review and approval are still required. |

All other inventory transitions are invalid. In particular, direct
`PRICE_PENDING -> AVAILABLE`, `RETURNED -> AVAILABLE`, and arbitrary
`PATCH status=SOLD` are removed even if the current map allows a subset of
them.

## Commercial/Listing State Machine

### States

| State | Spanish label | Meaning |
| --- | --- | --- |
| `NOT_LISTED` | Sin ficha comercial | No active commercial preparation or the listing was retired after sale/return. This is the migration and creation default. |
| `DRAFT` | Borrador | Preparation has started, but facts may be incomplete or have changed since review. |
| `READY_FOR_REVIEW` | Listo para revisión | A user explicitly submitted a complete public file and proposed public price at a known revision. It is awaiting/currently in admin review. |
| `PUBLISHED` | Publicado | Admin explicitly published the currently approved revision. It is commercially visible; inventory status determines available vs reserved presentation. |
| `PAUSED` | Pausado | A previously published listing is intentionally hidden without changing physical ownership. Resume requires all current guards again. |

### Exhaustive valid listing transitions

| From -> To | Initiator/role | Required guards and effects |
| --- | --- | --- |
| `NOT_LISTED -> DRAFT` | `SYSTEM` after first commercial edit by `OPERATOR`/`ADMIN`, or explicit start command | Inventory is not `SOLD`/`RETURNED`; record editor and commercial revision. Completeness is not required. |
| `DRAFT -> READY_FOR_REVIEW` | `OPERATOR` or `ADMIN` explicit submit | Identity, active catalogs, physical file, main photo, and proposed public price pass; no active reservation/sale; store submitter and submitted revision. No approval is implied. |
| `READY_FOR_REVIEW -> DRAFT` | Submitter withdraws; `ADMIN` rejects with reason; or `SYSTEM` invalidates after a material authorized edit | Record reason/source, clear current approval eligibility, and increment revision when data changed. |
| `READY_FOR_REVIEW -> PUBLISHED` | `ADMIN` explicit publish | A different-user admin approval exists for the current commercial/financial revisions; inventory is `AVAILABLE`; all readiness guards still pass. Publishing is a second command after price approval. |
| `PUBLISHED -> PAUSED` | `ADMIN`, or `SYSTEM` for a named operational safety condition | Reason code is required; preserve approval only if no material data changed. Physical state does not change. |
| `PAUSED -> PUBLISHED` | `ADMIN` explicit resume | Inventory is `AVAILABLE` (not reserved for initial resume), current approval and readiness remain valid, and expected version matches. |
| `PUBLISHED -> DRAFT` | `ADMIN` reopens for material edit, or `SYSTEM` fail-safe invalidation | Unpublish immediately, invalidate approval if protected data changed, record reason and actor/source. Operators require admin reopen before editing a published protected field. |
| `PAUSED -> DRAFT` | `OPERATOR` or `ADMIN` rework command | Reopen preparation; any protected edit invalidates approval. |
| `DRAFT -> NOT_LISTED` | Submitter or `ADMIN` abandon/retire command | No active reservation/sale; reason required when admin retires another user's draft. |
| `PAUSED -> NOT_LISTED` | `ADMIN` retire command | Reason required; no active reservation; physical state remains unless a separate inventory command changes it. |
| `PUBLISHED/PAUSED/READY_FOR_REVIEW/DRAFT -> NOT_LISTED` | `SYSTEM` consequence of sale or return | The sale/return command is valid and atomic; preserve history in audit rather than leaving a stale public listing. |

No other listing transitions are valid. Data completeness can make a draft
eligible for submission, but it cannot silently submit, approve, or publish it.

## Automatic Derivation Rules

### What is automatic

1. **Create/import intake:** ignore any client-supplied initial status. Derive
   `PRICE_PENDING` when the financial packet is incomplete; otherwise derive
   `ACQUIRED_STOCK`. Default listing to `NOT_LISTED`.
2. **Financial completion:** after an authorized save, automatically move
   `PRICE_PENDING -> ACQUIRED_STOCK` when all financial guards pass. This is the
   direct answer to “prices were set but the garment did not change state.”
3. **Preparation start:** the first successful commercial edit moves
   `NOT_LISTED -> DRAFT` when inventory permits preparation.
4. **Readiness projection:** every read and edit returns deterministic
   `missingFields`, `blockers`, `recommendedInventoryStatus`,
   `submissionEligible`, `approvalEligible`, `publicationEligible`, and
   `eligibleActions` from server-side policy.
5. **Fail-safe demotion:** an authorized material correction, catalog
   deactivation, missing main photo, or invalid financial fact invalidates the
   affected approval and demotes the garment/listing as specified above. The
   initiating actor remains in the audit event even when the transition actor
   is `SYSTEM`.
6. **Transaction consequences:** reservation release restores `AVAILABLE`;
   sale and return set listing `NOT_LISTED`; restock returns to intake review.

### What is never automatic

- `DRAFT -> READY_FOR_REVIEW`: submission captures human intent and revision.
- Price or cost-exception approval: requires a different `ADMIN` user.
- `READY_FOR_REVIEW -> PUBLISHED`: requires explicit admin publication.
- Reservation, sale, return, discount override, or restock decision.

This boundary prevents data entry from accidentally making an item public or
sold while still eliminating stale “Falta precio” and readiness states.

### Material fields and approval invalidation

Changing any of the following increments the relevant revision and invalidates
submission/approval: product name, brand, category, condition, size, color,
physical location, main photo selection/storage reference, target price,
minimum price, cost currency/amount/MXN equivalent, exchange rate, or cost
exception. Routine internal notes that do not alter customer facts may remain
non-material, but the domain policy—not the controller—owns this list.

Edits to a `RESERVED` garment's material or financial fields are blocked until
the reservation is released, except an admin emergency correction with reason
that also resolves the reservation. `SOLD` garments are immutable except
through explicit return/correction commands.

## Multi-User Approval Workflow

1. **Prepare — `OPERATOR` or `ADMIN`:** edit allowed descriptive/catalog/photo
   fields. An operator may propose the public `targetPriceMxn` but cannot view
   or set cost basis or `minPriceMxn`.
2. **Submit — preparer:** explicitly submit the complete public file. The
   system records `submittedBy`, timestamp, and revision and changes listing to
   `READY_FOR_REVIEW`.
3. **Review price — different `ADMIN`:** inspect protected financial facts,
   set or confirm final public/minimum price, optionally approve a documented
   missing-cost exception, and approve or reject. Approval records the exact
   snapshot and moves eligible intake inventory to `AVAILABLE`; rejection
   returns listing to `DRAFT` with a reason.
4. **Publish — `ADMIN`:** in a separate action, re-check current revisions,
   readiness, `AVAILABLE`, and approval, then move listing to `PUBLISHED`.
5. **Operate — `OPERATOR` or `ADMIN`:** reserve/release or sell only through
   transaction commands. A final sale below approved minimum requires a
   separate admin approval; approver and seller must differ.
6. **Correct — `ADMIN`:** pause, reopen, return, restock, or correct protected
   financial/state data with reason. The system invalidates stale approvals and
   never rewrites history.

There is no same-user approval exception in this task. If only one eligible
account exists, the item remains blocked and the business owner must provision
another admin or approve a separately planned policy change.

## Audit Trail

Create append-only `ItemStateTransition` records with:

- `id`, `itemId`, dimension (`INVENTORY` or `LISTING`), `fromState`, `toState`;
- `actorUserId` (nullable only for migration/scheduled system work), captured
  `actorRole`, and `initiatingUserId` for system consequences;
- controlled `reasonCode`, optional required `reasonText` where policy says so;
- source (`CREATE`, `EDITOR`, `PRICE_REVIEW`, `PUBLICATION`, `RESERVATION`,
  `SALE`, `RETURN`, `RESTOCK`, `MIGRATION`, or `SYSTEM_RECONCILIATION`);
- related record ID (review, reservation, sale line, return, or exception),
  correlation ID, lifecycle version, commercial/financial revisions;
- `occurredAt` generated by the server and bounded metadata with no secrets or
  full sensitive payload dump.

Create append-only price-review records containing submitter, reviewer,
decision (`APPROVED`/`REJECTED`), submitted and decided timestamps, revision,
price/cost snapshot, reason/comment, and invalidation timestamp/source. Audit
rows and approvals cannot be edited or deleted through product APIs.

Routine transitions use controlled reason codes. Free-text reason is mandatory
for rejection, retirement, return, restock disposition, emergency correction,
cost exception, customer mismatch, and below-minimum sale approval.

## Technical Implementation

### Domain and application seams

Keep the policy inside the existing inventory bounded context for this slice;
do not create a listing microservice or external workflow engine.

- `GarmentReadinessEvaluator`: pure function that validates current data and
  emits stable blocker codes and eligible actions.
- `GarmentLifecyclePolicy`: pure state machine for both dimensions, role,
  related-record, maker-checker, and invariant guards.
- `PriceApprovalPolicy`: pure revision/snapshot and separation-of-duties rules.
- Explicit application commands/use cases for submit, approve/reject price,
  publish/pause/resume/reopen, reserve/release, complete sale, return, and
  restock.
- One transactional repository boundary to persist item, business record,
  approval, and audit together with optimistic lifecycle-version checking.
- Controllers perform authentication/DTO validation only; they cannot contain
  or duplicate lifecycle policy.

The existing `item-status.enum.ts` may expose values/labels, but a transition
map alone is no longer the business policy. The editor remains a field
allow-list and invokes reconciliation after an authorized save; it still does
not accept arbitrary status values.

### API surface

- Keep `PUT /items/:id/editor` for allowed data only; return readiness,
  resulting automatic transitions, and eligible actions.
- `GET /items/:id/readiness` — server-derived blockers/actions with role-safe
  financial redaction.
- `GET /items/:id/lifecycle-history` — authorized audit timeline.
- `POST /items/:id/listing/submit`
- `POST /items/:id/price-reviews/approve`
- `POST /items/:id/price-reviews/reject`
- `POST /items/:id/listing/publish`
- `POST /items/:id/listing/pause`
- `POST /items/:id/listing/resume`
- `POST /items/:id/listing/reopen`
- Reservation, sale, return, and restock commands live under their owning
  application modules but call the same lifecycle policy transactionally.

Every command carries `expectedLifecycleVersion`; reason-bearing commands use
controlled reason code plus validated comment. Return `403` for role failures,
`409` for stale/conflicting state, and `422` with stable blocker codes for unmet
business facts. Remove/deprecate status mutation from generic create/update
DTOs after clients migrate.

## Migration Plan

1. Add Prisma `ListingStatus` with `NOT_LISTED`, `DRAFT`,
   `READY_FOR_REVIEW`, `PUBLISHED`, and `PAUSED`.
2. Add non-null `Item.listingStatus @default(NOT_LISTED)`,
   `lifecycleVersion`, `commercialRevision`, and `financialRevision`.
3. Add append-only transition, price-review, and cost-exception persistence
   with user/item relations, indexes by item/time and review status, and unique
   protection against more than one current approval per revision.
4. Add required reservation/sale/return references only in coordination with
   `NEXO-0013/0014`; do not invent placeholder transactional truth.
5. Backfill every existing item to `listingStatus=NOT_LISTED` and create a
   `MIGRATION` initialization audit event. Preserve every current inventory
   status; do not infer publication or silently repair rows.
6. Produce a dry-run data-quality report for invalid money, missing main photo,
   inactive/missing catalog values, `AVAILABLE/RESERVED/SOLD` rows without
   related facts, and any suspicious `RETURNED` rows caused by the create bug.
7. Quarantine blockers for manual review. Do not convert missing money to zero,
   fabricate approvals, customers, reservations, or sales.
8. Validate rollback on a database copy, then apply through the existing Prisma
   deployment process only after explicit environment authorization.

No dependency addition is selected or expected. If implementation proposes a
workflow/state-machine package, it must run `nexo-select-dependency` and prove
why direct domain policy is insufficient before changing this plan.

## Architecture Options

1. **Keep one overloaded `Item.status`:** smallest schema change, but cannot
   represent `AVAILABLE + DRAFT`, conflates publication with physical stock,
   and contradicts `FR-LST-001`.
2. **Add listing status and append-only review/audit records inside Inventory:**
   smallest option that represents both dimensions, preserves transaction
   integrity, and follows the modular-monolith architecture.
3. **Create a separate Listing aggregate/module/service now:** stronger future
   channel independence, but adds cross-aggregate consistency and operational
   complexity before Nexo has a storefront or multiple channels.

## Architecture Decision Evaluation

- Decision: approved
- Selected option: Option 2 — two persisted state dimensions on the garment,
  with append-only approval/audit records and one transactional application
  boundary in the existing inventory module.
- Rationale: It satisfies the approved separate-lifecycle requirements and
  audit/maker-checker needs without a service boundary, distributed workflow,
  or duplicated policy. Option 1 cannot model the business; Option 3 is
  premature for the current internal PWA.
- Pattern decision: Use explicit State Machine/Policy functions plus Command
  use cases. Do not use State objects or a workflow framework; finite enums,
  tables, and pure guards are clearer and directly testable.
- Required evidence or approval: Record the durable two-lifecycle/audit
  convention in an ADR and obtain product-owner approval of the business-policy
  choices before the build gate. QA and security remain required before close.
- Reversibility: The listing field and append-only tables can be dark-launched
  with all existing rows `NOT_LISTED`; API/UI activation can be rolled back
  while preserving audit data. Removing the schema later requires an explicit
  data migration.

## Consequences

- “Data complete” becomes a computed fact; “submitted,” “approved,” and
  “published” remain accountable decisions.
- The physical and commercial badges may legitimately differ, for example
  `AVAILABLE + DRAFT` or `RESERVED + PUBLISHED`.
- Generic status mutation is replaced by more endpoints, but each endpoint has
  a narrow permission, reason, transaction, and test contract.
- Existing rows are safely unpublished after migration until users review them.

## Phased Implementation

### Phase 0 — Policy approval and ownership alignment

1. Product owner confirms the state meanings, strict different-user approval,
   cost exception, reserved-listing behavior, return quarantine, and no normal
   sale outside `PUBLISHED`.
2. Create the ADR required by the approved architecture evaluation.
3. Align `FR-INV-004/008`, `FR-LST-001/002`, user stories, and traceability.
4. Update `NEXO-0037` so its implemented editor remains a prerequisite and its
   unimplemented listing/approval scope is not built twice.

### Phase 1 — Pure policy and current bug repair

1. Write exhaustive table-driven tests for readiness, both state machines,
   roles, maker-checker, revisions, and blocker codes.
2. Implement domain policies and explicit initial-state derivation.
3. Reject initial `RETURNED`/transactional statuses and remove status from
   generic mutation contracts.
4. Reconcile editor saves synchronously and return readiness/results.

### Phase 2 — Persistence, migration, and audit

1. Implement and dry-run the Prisma migration on a restored database copy.
2. Backfill `NOT_LISTED`, initial versions, and migration audit rows.
3. Produce/review the data-quality quarantine report.
4. Add transactional repository support and concurrency tests.

### Phase 3 — Review and publication workflow

1. Implement submit, approve/reject, publish, pause, resume, and reopen
   commands/endpoints.
2. Add role-safe responses, queues, stable blockers, and audit history.
3. Add operator/admin UI actions with missing-data and approval feedback.

### Phase 4 — Reservation, sale, return, and restock integration

1. Integrate reservation commands with `NEXO-0013` records.
2. Integrate sale, minimum-price approval, and currency guards with
   `NEXO-0014`.
3. Add return/restock records and atomic lifecycle consequences.

### Phase 5 — Acceptance, security, and rollout

1. Run migration/data verification and full automated gates once.
2. Run authenticated two-user desktop/mobile acceptance on representative
   complete, incomplete, reserved, sold, and returned garments.
3. Complete QA and security review, document implementation, and roll out with
   existing items unpublished until reviewed.

Phases 1-3 form the first executable P0 slice. Phase 4 is contractually blocked
where reservation/sale persistence does not yet exist; no fake related records
may be used to claim completion.

## Acceptance Criteria

1. New garments with missing financial facts enter `PRICE_PENDING`; completing
   all required price/cost facts moves them to `ACQUIRED_STOCK` automatically.
2. New garments cannot be created as `AVAILABLE`, `RESERVED`, `SOLD`, or
   `RETURNED`, including the currently reproducible `RETURNED` loophole.
3. Completing descriptive data updates readiness and starts/updates `DRAFT`,
   but does not auto-submit, approve, publish, reserve, or sell.
4. Every valid transition in both tables passes with its complete guard set;
   every unlisted edge and each missing guard is rejected with a stable blocker.
5. An operator can submit, but the same user cannot approve that revision even
   if that user is now/admin already; another `ADMIN` is required.
6. Price approval and publication are separate audited commands. Publication
   fails on stale revision, missing/inactive catalog data, no main photo,
   invalid location, invalid public/minimum price, invalid cost basis without
   exception, or inventory other than `AVAILABLE`.
7. A protected edit invalidates the exact approval and safely unpublishes or
   demotes the item according to policy.
8. Reservation fails without customer/date, with a non-published/non-available
   item, or when another active reservation exists.
9. Sale fails without its complete sale line, from an invalid state/listing,
   below minimum without separate approval, or for the wrong reserved customer
   without admin override.
10. Sale and return atomically update both lifecycle dimensions and preserve
    the original transaction history.
11. Every successful/automatic transition has one append-only audit row with
    actor/source/time/reason/correlation/version; failed commands create no
    partial state or approval.
12. Concurrent approval/publication requests against the same expected version
    allow at most one current result and reject stale writers.
13. Operator responses and history do not expose cost, minimum price, margin,
    or restricted approval metadata.
14. Existing rows migrate to `NOT_LISTED` without losing or silently changing
    their inventory status; anomalies appear in a review report.
15. Domain/application tests prove all rules without controllers or UI.

## Verification

- Domain table tests for every inventory/listing edge, guard, role, automatic
  consequence, revision invalidation, and maker-checker rule.
- `pnpm --dir back test:unit`
- `pnpm --dir back test:e2e`
- `pnpm --dir back test`
- `pnpm --dir back db:validate`
- `pnpm --dir back build`
- `pnpm --dir front test`
- `pnpm --dir front build`
- Migration dry run on a database copy plus row counts, enum distribution,
  audit initialization, FK/orphan, and rollback checks.
- Authenticated manual matrix with at least two distinct users: operator submit,
  admin approve, admin publish, reserve/release, normal sale, rejected
  below-minimum sale, return, and restock.
- Security review of authorization, IDOR resistance, financial redaction,
  append-only audit behavior, reason sanitization, and stale-write handling.
- Before build/QA/implemented/closed transitions, run the NEXO-0050 control
  engine gate required by its structured manifest.

## Risks And Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Scope overlaps unimplemented NEXO-0037 work | Duplicate or conflicting implementations | Align ownership in Phase 0; preserve its editor, move lifecycle execution to this task. |
| Existing statuses lack related reservation/sale truth | Migration could legitimize invalid rows | Preserve status, report/quarantine anomalies, require manual review rather than fabrication. |
| Strict two-user approval blocks a very small team | Garments remain unpublishable | Require a second named admin; any override is a separate owner-approved policy task. |
| Automatic rules surprise operators | Accidental unpublish/demotion | Return explicit resulting transitions, show confirmation for protected edits, and audit initiating user. |
| Listing and inventory updates diverge | Stale public inventory | Single transaction, cross-lifecycle invariants, optimistic version, and integration tests. |
| Price changes after approval | Sale under unreviewed terms | Revision-bound snapshots and automatic invalidation. |
| `RETURNED` mixes customer and supplier cases | Incorrect restock/accounting | Require return type/source record and quarantine before restock; consider future state split from evidence. |
| Catalog deactivation invalidates listings | Published garment becomes incomplete | Fail-safe pause/demotion plus actionable admin queue and audit. |
| Audit metadata leaks protected financial data | Unauthorized disclosure | Bounded structured metadata, API redaction, role tests, and security review. |
| Phase 4 dependencies are incomplete | Cannot prove end-to-end lifecycle | Keep transaction contracts explicit and block those acceptance items until NEXO-0013/0014 records exist. |

## Dependencies

- `NEXO-0037`: implemented operator-safe editor and readiness UI; remaining
  listing/approval work must not be duplicated.
- `NEXO-0036`: reliable authorized main-photo access for publication guards.
- `NEXO-0008`: active catalog values and admin catalog management.
- `NEXO-0011`: minimum-file and availability requirements consolidated here.
- `NEXO-0013`: persisted customers/reservations for reservation transitions.
- `NEXO-0014`: persisted sale lines, currency/payment, and utility integration.
- Current identity module: stable user IDs and `ADMIN`/`OPERATOR`
  authorization for maker-checker evidence.

## Residual Risks

- The current product requirements describe four listing states; adding
  `NOT_LISTED` must be reflected in SRS/traceability before implementation.
- The single `RETURNED` state remains semantically broad even with typed return
  records. Operational evidence may justify separate future states.
- A later public/multi-channel sales capability may justify extracting a
  Listing aggregate, but it is not justified for this internal PWA slice.

## Decision Log

- 2026-07-25: Created NEXO-0050 as a new P0 task rather than rewriting
  NEXO-0037. NEXO-0037's safe editor is retained as prior work.
- 2026-07-25: Selected two persisted lifecycle dimensions plus computed
  readiness; data may auto-derive intake and safe demotion but never human
  approval/publication/transaction decisions.
- 2026-07-25: Selected strict different-user price approval and append-only,
  revision-bound audit records. Product-owner confirmation and ADR remain
  pre-build requirements.

## Next Step

`nexo` should obtain product-owner approval for the Phase 0 policy choices,
record the required ADR/external-approval evidence, align NEXO-0037 ownership,
then create a plan-to-build handoff to `nexo-build`. Do not begin schema or code
changes while those gates are open.
