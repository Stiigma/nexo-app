# ADR-2026-07-26 — Garment Lifecycle And Business Rules

## Status

Accepted

## Context

The existing `Item.status` conflates physical inventory position, data completeness, commercial visibility, and transaction outcome. Field edits leave badges stale; the generic update path can set any state reachable in a flat transition map; and the current accept-any-reachable-state-at-create behavior allows a new garment to be created as `RETURNED`, which is nonsensical.

Product-owner Gerardo confirmed the following decisions through a structured interview on 2026-07-26. These decisions define the garment lifecycle policy and supersede the previous single-status model.

## Decision

### Model: Two independent persisted dimensions

Separate the garment lifecycle into two dimensions:

| Dimension | Field | Answers |
|---|---|---|
| **Inventory Status** | `Item.status` | "What is the physical/transactional position of this unique garment?" |
| **Listing Status** | `Item.listingStatus` | "What is the preparation and publication position of its commercial record?" |

**Readiness** is a computed fact (not a third status) that returns stable blocker codes and eligible actions.

### 1. Inventory States (6)

| State | Label | Meaning |
|---|---|---|
| `PRICE_PENDING` | Falta precio | Registered but financial packet incomplete. Not sellable. |
| `ACQUIRED_STOCK` | Adquirido | Owned, financial packet complete, but price not yet approved. |
| `AVAILABLE` | Disponible | Price approved, file complete, physically ready for one reservation or sale. |
| `RESERVED` | Reservado | Active reservation holds the garment for one customer. |
| `SOLD` | Vendido | Completed sale owns the garment's commercial disposition. |
| `RETURNED` | Devuelto | Quarantine after customer return, supplier return, or controlled reversal. |

### 1.1 PRICE_PENDING rules

- **Entry:** Automatic on create/import when the financial packet is incomplete; also on re-entry when an authorized correction makes the financial packet incomplete again.
- **Exit to ACQUIRED_STOCK:** Automatic when the financial packet becomes complete (cost, currency, MXN equivalent, minimum price, target price all present; exchange rate required only when original currency is not MXN).
- **Exit to RETURNED:** Admin command with recorded reason.
- **Cost exception:** Allowed with admin approval, written reason, audit trail, and a "utility pending" report marker.

### 1.2 ACQUIRED_STOCK → AVAILABLE gate

- **Minimum file for approval:** Commercial data (brand, category, condition, size, color), main valid photo, target and minimum price, and cost basis or approved cost exception. Physical location is **never required** for any gate.
- **Financial data access:** Both operators and admins can view and edit all financial fields (cost, currency, MXN equivalent, exchange rate, minimum price, target price).
- **Cost exception timing:** The admin must approve a cost exception **before** the garment enters `READY_FOR_REVIEW`. The exception requires written reason, audit record, and marks utility as pending.
- **Submit trigger:** The system continuously validates file completeness. When all required data is present, the system shows _"Ficha completa — Lista para enviar a revisión."_ An operator or admin must then **explicitly press "Enviar a revisión"** to move `DRAFT → READY_FOR_REVIEW`. The system validates but the human decides.
- **Approval model — Collective sign-off (single round):** All operators and admins review the file in `READY_FOR_REVIEW` and give their "check" / digital signature that both price and content are correct. This is **one single round** covering price, content, and publication readiness. A simple majority (>50%) is sufficient. The preparer also signs as part of the collective.
- **Editing during review:** Any edit to a protected field (price, cost, catalog, photo) while in `READY_FOR_REVIEW` **invalidates all existing signatures** and drops the listing back to `DRAFT`. The preparer must re-submit after corrections.
- **Time-out for absent reviewers:** After 48 hours of an incomplete signature set, the admin may proceed without the absent person's signature (recorded reason).
- **Single admin scenario:** A lone admin may self-approve with a written reason.
- **Transition consequence:** On majority approval, inventory moves `ACQUIRED_STOCK → AVAILABLE` and listing moves `READY_FOR_REVIEW → APPROVED`. Both transitions commit atomically in one transaction.

### 1.3 AVAILABLE invariants

- `AVAILABLE` is internal clearance for sale. Customer visibility additionally requires `PUBLISHED` listing status.
- **Edits:** Everything is editable. The system recalculates readiness/state on save. If a protected financial or commercial field changes, the system automatically invalidates the current approval and demotes accordingly (to `ACQUIRED_STOCK`, or to `PRICE_PENDING` if the financial packet becomes incomplete).
- **Operations:** Reservation and sale require `PUBLISHED` listing status.

### 1.4 RESERVED rules

- **Duration:** 48 hours by default, adjustable by the operator per agreement with the customer.
- **Exclusivity:** One active reservation per garment. A waiting list (ordered by request date) is maintained for fallback.
- **Cancellation/expiry:** Return to `AVAILABLE`; if `PUBLISHED`, the listing remains visible as available.
- **Forced release:** Admin may release with recorded reason. A new reservation is a separate operation.

### 1.5 SOLD rules

- **Post-sale edits:** Only internal notes. Corrections use a formal audited command.
- **Visibility:** Sold garments appear only in sales reports and history, not in default inventory views.
- **Returns:** `SOLD → RETURNED` is allowed via admin command linked to the original sale, without deleting or modifying the sale record.
- **Partial sales:** Not permitted. Each garment is indivisible.

### 1.6 RETURNED quarantine rules

- **Inspection responsibility:** The operator documents condition and decides the disposition. Admin intervenes only for exceptions.
- **Disposition options:**
  - Restock to `PRICE_PENDING` if financial packet is incomplete.
  - Restock to `ACQUIRED_STOCK` if financial packet is complete.
  - Remain `RETURNED` as write-off/disposal.
- **Return types (required):** Customer return, supplier return, or admin correction.
- **Required evidence:** Condition notes, disposition decision. Photo is required only when damage is present.
- **Restock:** New review and approval are required before the garment becomes `AVAILABLE` again.

### 2. Listing States (6)

| State | Label | Meaning |
|---|---|---|
| `NOT_LISTED` | Sin ficha | No commercial preparation started. Default for new/imported garments. |
| `DRAFT` | Borrador | Preparation started, facts may be incomplete or stale. |
| `READY_FOR_REVIEW` | Listo para revisión | File complete, submitted, and actively collecting collective signatures. |
| `APPROVED` | Aprobado | Majority reached. Awaiting admin publication. |
| `PUBLISHED` | Publicado | Admin-published and visible. Inventory status determines available vs reserved presentation. |
| `PAUSED` | Pausado | Previously published listing intentionally hidden. |

### 2.1 Listing transition rules

- **Initial state:** Always `NOT_LISTED`, even if all data is already complete.
- **NOT_LISTED → DRAFT:** Triggered by the first successful commercial edit (identity, catalog, photo, or price data), provided inventory is not `SOLD` or `RETURNED`.
- **DRAFT → READY_FOR_REVIEW:** System validates all data is complete. Operator or admin presses "Enviar a revisión." Requires: identity (code + name), active catalog values (brand, category, size, color, condition), main photo with valid storage, targetPriceMxn > 0, minPriceMxn > 0, and cost basis or approved cost exception. Physical location is not required.
- **READY_FOR_REVIEW → DRAFT:** A material edit invalidates all signatures. Submitter withdraws, admin rejects with reason, or system invalidates after a protected edit.
- **READY_FOR_REVIEW → APPROVED:** Automatic on reaching majority (>50%) of active operator/admin signatures. Also transitions inventory `ACQUIRED_STOCK → AVAILABLE` atomically.
- **APPROVED → PUBLISHED:** Admin explicit publish command. Re-checks current revisions, readiness, `AVAILABLE` inventory, and file completeness. Approval and publication are separate audited actions.
- **APPROVED → DRAFT:** Admin reopens for material edit; any protected edit; or system fail-safe invalidation. Invalidates approval and clears signatures.
- **PUBLISHED → PAUSED:** Admin or system for a named operational condition. Reason required. Preserves approval if no material data changed.
- **PAUSED → PUBLISHED:** Admin resume. Revalidates inventory status (`AVAILABLE`, not `RESERVED`) and file completeness.
- **PUBLISHED → DRAFT:** Admin reopens for material edit, or system fail-safe after protected data invalidation.
- **PAUSED → DRAFT:** Operator or admin rework command.
- **DRAFT/PAUSED/APPROVED → NOT_LISTED:** Abandon/retire by submitter or admin with reason.
- **PUBLISHED/PAUSED/APPROVED/READY_FOR_REVIEW/DRAFT → NOT_LISTED:** System consequence of sale or return (`SOLD` or `RETURNED` inventory forces `NOT_LISTED`).
- **Cascada instantánea:** If a garment is created/imported with all required data already present, the system performs `NOT_LISTED → DRAFT → READY_FOR_REVIEW` instantly without user interaction. The human must still press "Enviar a revisión" to proceed.

### 3. Collective sign-off protocol

| Aspect | Rule |
|---|---|
| Who signs | All active operators and admins |
| Preparer signs? | Yes, as part of the collective |
| Required majority | Simple majority (> 50%) |
| Absence handling | 48-hour timeout; admin may proceed without the absent signature |
| Record | Each signature is timestamped, audit-trailed, and bound to the current revision |

### 4. Audit trail

Every state transition (inventory and listing) creates an append-only `ItemStateTransition` record containing: item ID, dimension (`INVENTORY` or `LISTING`), from/to state, actor user ID and role, initiating user ID for system consequences, reason code or free text where required, source (`CREATE`, `EDITOR`, `PRICE_REVIEW`, `PUBLICATION`, `RESERVATION`, `SALE`, `RETURN`, `RESTOCK`, `MIGRATION`, `SYSTEM_RECONCILIATION`), related record IDs, lifecycle version, commercial/financial revision, and server-generated timestamp.

Price-review records are also append-only, with submitter, reviewer, decision, revision snapshot, and invalidation timestamp.

Routine transitions use controlled reason codes. Free-text reason is mandatory for rejection, retirement, return, restock disposition, emergency correction, cost exception, customer mismatch, and below-minimum sale approval.

## Consequences

- The physical and commercial badges may legitimately differ (`AVAILABLE + DRAFT`, `AVAILABLE + APPROVED`, `RESERVED + PUBLISHED`, etc.).
- Generic status mutation is replaced by explicit lifecycle commands with narrow permission, reason, transaction, and test contracts.
- A single-round "collective sign-off" replaces the strict different-user approval from the original plan. The system validates completeness; a human confirms submission.
- Existing rows migrate to `NOT_LISTED` without losing their current inventory status. Anomalies appear in a review report.
- Cost exception and return quarantine prevent unreliable financial data or damaged goods from entering the sellable pool.
- Physical location is never a gate — it is informational only for all states.
- Both operators and admins can edit financial data; the collective sign-off provides the control layer.
- No new dependency or external workflow engine is introduced. Policy lives in pure domain functions within the existing inventory bounded context.

## Alternatives Considered

1. **Keep single `Item.status`:** Smallest schema change, but cannot represent `AVAILABLE + DRAFT`, conflates publication with physical stock, and contradicts listing requirements.
2. **Two persisted state dimensions inside Inventory (selected):** Smallest option that represents both lifecycles, preserves transaction integrity, and follows the modular-monolith architecture.
3. **Separate Listing aggregate/service:** Stronger future channel independence, but adds cross-aggregate consistency and operational complexity before a storefront exists.

## Decision Log

- 2026-07-25: Created NEXO-0050 as a new P0 task. Selected two persisted lifecycle dimensions plus computed readiness.
- 2026-07-26 — Interview session 1: Product-owner confirmed collective sign-off model (majority vote), operator return inspection, financial-data access for both roles, 48h timeout, physical location never required, waiting list for reservations, and unrestricted editing on AVAILABLE with system recalculation.
- 2026-07-26 — Traceability session 2: Product-owner resolved all conflicts and gaps:
  - **New `APPROVED` listing state** (6 total) between `READY_FOR_REVIEW` and `PUBLISHED`.
  - **Single round of collective signatures** covering price, content, and publication readiness together.
  - **System validates, human confirms:** the system checks completeness, but an operator/admin must explicitly press "Enviar a revisión."
  - **Cost exception:** approved by admin before entering `READY_FOR_REVIEW` to unblock the review gate.
  - **Editing during review:** invalidates all signatures, returns to `DRAFT`.
  - **Cascada instantánea:** garments created with all data skip through `DRAFT` to `READY_FOR_REVIEW` transparently.
  - **APPROVED is always explicit:** even if instantaneous after majority, the state is recorded in the transition history.
