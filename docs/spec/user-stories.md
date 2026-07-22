# Nexo v1 User Stories

## Scoring

Priority uses `P0`, `P1`, `P2`, and `P3`. MoSCoW maps to `Must`, `Should`,
`Could`, and `Won't for v1`.

Story points use Fibonacci values: `1`, `2`, `3`, `5`, `8`, `13`. A `13`
should normally be split before implementation.

## Backlog Summary

| ID | Epic | Priority | MoSCoW | Points | Linked requirements | Status |
| --- | --- | --- | --- | --- | --- | --- |
| US-001 | Purchases | P0 | Must | 5 | FR-PUR-001, FR-PUR-003, FR-PUR-004 | Draft |
| US-002 | Purchases | P0 | Must | 5 | FR-PUR-002, FR-INV-002, IR-001 | Draft |
| US-003 | Purchases | P0 | Must | 5 | FR-PUR-005, FR-PUR-006, FR-INV-001, FR-INV-004, FR-INV-005 | Draft |
| US-004 | Reservations | P0 | Must | 3 | FR-RES-001, FR-CUS-001 | Draft |
| US-005 | Sales | P0 | Must | 5 | FR-SAL-001, FR-SAL-003, FR-SAL-005, FR-SAL-006 | Draft |
| US-006 | Sales | P0 | Must | 3 | FR-SAL-004, DR-001, DR-002 | Draft |
| US-007 | Expenses | P0 | Must | 3 | FR-EXP-001, FR-EXP-002 | Draft |
| US-008 | Expenses | P0 | Must | 5 | FR-EXP-003, FR-INV-005 | Draft |
| US-009 | Inventory | P0 | Must | 3 | FR-INV-004, FR-REP-004 | Draft |
| US-010 | Reports | P0 | Must | 8 | FR-REP-001, FR-REP-002, FR-REP-003, FR-REP-004, FR-REP-005 | Draft |
| US-011 | Auth | P0 | Must | 5 | FR-AUTH-001, FR-AUTH-002, FR-AUTH-003 | Draft |
| US-012 | QR | P1 | Should | 3 | FR-QR-001, FR-QR-002 | Draft |
| US-013 | Catalogs | P1 | Should | 3 | FR-CAT-001, FR-CAT-004 | Draft |
| US-014 | Customers | P1 | Should | 3 | FR-CUS-002, FR-CUS-003 | Draft |
| US-015 | Inventory | P1 | Should | 3 | FR-INV-006, FR-INV-007, FR-CAT-008 | Draft |
| US-016 | Reservations | P1 | Should | 2 | FR-RES-003, FR-RES-004 | Draft |
| US-017 | Inventory | P0 | Must | 5 | FR-INV-003, FR-INV-008, FR-INV-009, FR-CAT-002, FR-CAT-006 | Draft |
| US-018 | Catalogs | P1 | Should | 3 | FR-CAT-005 | Draft |
| US-019 | Catalogs | P1 | Should | 2 | FR-CAT-006 | Draft |
| US-020 | Catalogs | P1 | Should | 3 | FR-CAT-002, FR-CAT-003 | Draft |
| US-021 | Inventory | P1 | Should | 3 | FR-CAT-008, FR-INV-006 | Draft |
| US-022 | Reports | P2 | Could | 2 | FR-CAT-007, FR-CAT-009 | Draft |
| US-023 | Inventory | P0 | Must | 5 | FR-INV-010, FR-INV-011, FR-AUTH-004 | Implemented; authenticated QA pending |
| US-024 | Listings | P0 | Must | 5 | FR-LST-001, FR-LST-002 | Draft |

## Stories

### US-001 - Start Purchase Cart

- Persona: Operator.
- Story: As an operator, I want to start a purchase cart from my phone so I can
  capture garments while I am in the store before payment.
- Priority: P0.
- Points: 5.
- Linked requirements: FR-PUR-001, FR-PUR-003, FR-PUR-004.

Acceptance criteria:

- Given I am an operator, when I create a cart, then I can select store, date,
  and currency.
- Given I select a store, when the cart form loads, then the store tax rate is
  prefilled and editable.
- Given the cart uses USD, when the cart is created, then the exchange rate
  used for MXN calculations is stored.

### US-002 - Add Purchase Cart Item

- Persona: Operator.
- Story: As an operator, I want to add a purchase cart item with photo and cost
  so I can capture merchandise quickly before payment.
- Priority: P0.
- Points: 5.
- Linked requirements: FR-PUR-002, FR-INV-002, IR-001.

Acceptance criteria:

- Given an active purchase cart, when I add an item, then the system requires a
  main photo and captured purchase cost.
- Given I save the cart item, when payment has not been confirmed, then it has a
  capture ID but no internal code.
- Given I remove a cart item before confirmation, when payment is confirmed,
  then that removed item does not enter Nexo inventory.
- Given I do not know the category during quick capture, when I save the cart
  item, then it can be flagged for category review.

### US-003 - Confirm Purchase Batch

- Persona: Operator.
- Story: As an operator, I want to confirm a purchase cart after payment so the
  purchased garments enter Nexo inventory as acquired stock.
- Priority: P0.
- Points: 5.
- Linked requirements: FR-PUR-005, FR-PUR-006, FR-INV-001, FR-INV-004,
  FR-INV-005.

Acceptance criteria:

- Given a purchase cart has items, when I confirm payment, then I must provide
  purchase evidence.
- Given payment is confirmed, when the purchase batch is created, then every
  remaining cart item receives a unique internal code.
- Given the paid total differs from expected cart total, when I confirm
  payment, then I must select a difference reason.
- Given the batch confirms successfully, when I view included garments, then
  their inventory state is `Acquired Stock`.
- Given batch costs are calculated, when I view a garment, then it shows total
  cost in MXN.

### US-004 - Reserve Garment

- Persona: Operator.
- Story: As an operator, I want to reserve a garment for a customer so I can
  hold it before sale.
- Priority: P0.
- Points: 3.
- Linked requirements: FR-RES-001, FR-CUS-001.

Acceptance criteria:

- Given a garment is `Available`, when I reserve it for a customer, then its
  inventory state becomes `Reserved`.
- Given the customer does not exist, when I reserve the garment, then I can
  create a customer with at least a name.
- Given a reservation is saved, when I view it, then I can see customer,
  garment, date, and optional note.

### US-005 - Register MXN Sale

- Persona: Operator.
- Story: As an operator, I want to register a sale in MXN so sold garments and
  profit are recorded.
- Priority: P0.
- Points: 5.
- Linked requirements: FR-SAL-001, FR-SAL-003, FR-SAL-005, FR-SAL-006.

Acceptance criteria:

- Given one or more available or reserved garments, when I create a sale, then I
  can select customer, date, and payment method.
- Given the sale is in MXN, when I complete it, then each sale line stores its
  own final MXN amount.
- Given the sale completes, when I view included garments, then they are
  `Sold` and show profit.

### US-006 - Register USD Sale

- Persona: Operator.
- Story: As an operator, I want to register a sale in USD so the system keeps
  both original currency and MXN reporting values.
- Priority: P0.
- Points: 3.
- Linked requirements: FR-SAL-004, DR-001, DR-002.

Acceptance criteria:

- Given a sale is in USD, when I capture final amount, then the system stores
  original USD amount.
- Given the exchange rate is applied, when the sale is saved, then the MXN
  equivalent and applied rate are stored.
- Given I view the sale later, when the external rate has changed, then the sale
  still shows the originally applied rate.

### US-007 - Record Expenses

- Persona: Operator.
- Story: As an operator, I want to record general and batch-linked expenses so
  costs and reports are complete.
- Priority: P0.
- Points: 3.
- Linked requirements: FR-EXP-001, FR-EXP-002.

Acceptance criteria:

- Given I record a general expense, when I save it, then it appears in expense
  reports and does not alter garment cost.
- Given I record a batch-linked expense, when I save it, then it appears on the
  batch and is available for allocation.

### US-008 - Allocate Batch Expenses

- Persona: Admin.
- Story: As an admin, I want batch-linked expenses allocated into garment total
  cost so profit is based on real estimated cost.
- Priority: P0.
- Points: 5.
- Linked requirements: FR-EXP-003, FR-INV-005.

Acceptance criteria:

- Given a batch has linked expenses, when total costs are calculated, then each
  garment receives a proportional expense allocation.
- Given allocation completes, when I sum allocated amounts, then the total
  matches the source expense amount subject to rounding policy.

### US-009 - View Inventory By State

- Persona: Admin or operator.
- Story: As a user, I want to see acquired, available, reserved, and sold
  inventory so I know what can be sold and what still needs review.
- Priority: P0.
- Points: 3.
- Linked requirements: FR-INV-004, FR-REP-004.

Acceptance criteria:

- Given garments exist in different states, when I open inventory, then I can
  filter by `Acquired Stock`, `Available`, `Reserved`, and `Sold`.
- Given I open a garment, when it has purchase or sale history, then the detail
  shows that traceability.

### US-010 - View Core Reports

- Persona: Admin.
- Story: As an admin, I want purchase, sale, expense, inventory, and profit
  reports so I can review business performance.
- Priority: P0.
- Points: 8.
- Linked requirements: FR-REP-001, FR-REP-002, FR-REP-003, FR-REP-004,
  FR-REP-005.

Acceptance criteria:

- Given data exists, when I filter reports by period, then I can see purchases,
  sales, and expenses for that period.
- Given garments have been sold, when I view profit reports, then I can see cost
  sold, profit, and margin.
- Given inventory exists, when I view inventory reports, then I can separate
  acquired stock, available, reserved, and sold items.

### US-011 - Enforce Roles

- Persona: Admin.
- Story: As an admin, I want Admin and Operator permissions separated so
  sensitive actions are controlled.
- Priority: P0.
- Points: 5.
- Linked requirements: FR-AUTH-001, FR-AUTH-002, FR-AUTH-003.

Acceptance criteria:

- Given I am an admin, when I access catalogs, users, reports, and corrections,
  then access is allowed.
- Given I am an operator, when I try admin-only actions, then access is denied.
- Given API requests bypass the UI, when the role lacks permission, then the API
  rejects the operation.

### US-012 - Print QR Labels

- Persona: Operator.
- Story: As an operator, I want printable QR labels so physical garments can be
  matched to system records.
- Priority: P1.
- Points: 3.
- Linked requirements: FR-QR-001, FR-QR-002.

Acceptance criteria:

- Given I select garments, when I generate labels, then the printable page shows
  internal code and QR for each garment.
- Given I scan a QR, when the system resolves it, then it opens or locates the
  matching garment.

### US-013 - Manage Stores

- Persona: Admin.
- Story: As an admin, I want to manage store records with address, city, state,
  and tax rate so purchase batches and reports have accurate store data.
- Priority: P1.
- Points: 3.
- Linked requirements: FR-CAT-001, FR-CAT-004.

Acceptance criteria:

- Given I am an admin, when I create a store, then I can enter name, address,
  city, state, and default tax rate.
- Given a store exists, when I edit it, then I can update any field including
  the default tax rate.
- Given a store is deactivated, when an operator starts a purchase cart, then
  the deactivated store does not appear in the store selector.
- Given a store is deactivated, when I view historical purchase batches or
  garments linked to that store, then the historical data remains intact.

### US-014 - View Customer History

- Persona: Operator.
- Story: As an operator, I want to view customer contact data and history so I
  can support repeat buyers.
- Priority: P1.
- Points: 3.
- Linked requirements: FR-CUS-002, FR-CUS-003.

Acceptance criteria:

- Given a customer has optional contact fields, when I open customer detail,
  then I can see phone, Instagram, WhatsApp, and notes.
- Given a customer has sales or reservations, when I open customer detail, then
  I can see that history.

### US-015 - Search Inventory

- Persona: Operator.
- Story: As an operator, I want to search inventory by code and attributes so I
  can find garments quickly.
- Priority: P1.
- Points: 3.
- Linked requirements: FR-INV-006, FR-INV-007, FR-CAT-008.

Acceptance criteria:

- Given inventory exists, when I search by code, category, brand, size, or
  customer, then matching garments are shown.
- Given I open a search result, when purchase or sale links exist, then the
  garment detail shows them.

### US-016 - Release Or Sell Reservation

- Persona: Operator.
- Story: As an operator, I want to release a reservation or convert it to sale
  so reserved inventory stays accurate.
- Priority: P1.
- Points: 2.
- Linked requirements: FR-RES-003, FR-RES-004.

Acceptance criteria:

- Given a garment is reserved, when I release the reservation, then the garment
  returns to `Available`.
- Given a garment is reserved, when I sell it, then the garment becomes
  `Sold`.

### US-017 - Complete Minimum Garment File

- Persona: Operator.
- Story: As an operator, I want to complete the minimum garment file for
  acquired stock so garments can become available for reservation or sale.
- Priority: P0.
- Points: 5.
- Linked requirements: FR-INV-003, FR-INV-008, FR-INV-009, FR-CAT-002, FR-CAT-006.

Acceptance criteria:

- Given a garment is acquired stock, when category, brand, clothing type, size,
  condition, color, physical location, or suggested price is missing, then it
  cannot become available.
- Given a garment has category review, when I assign a formal category catalog
  value, then category review is cleared.
- Given the minimum garment file is complete, when I mark the garment ready for
  internal sale, then its inventory state can become `Available`.

### US-023 - Edit Garment File

- Persona: Operator and Admin.
- Story: As a worker, I want to edit the commercial information of an existing
  garment so I can complete its file and prepare it for sale.
- Priority: P0.
- Points: 5.
- Linked requirements: FR-INV-010, FR-INV-011, FR-AUTH-004.

Acceptance criteria:

- Given I am an operator or admin, when I open an inventory garment, then I
  can open the same editor and save its name, classifications, location, public
  price, and notes.
- Given a garment is incomplete, when I open the editor, then I see its
  missing-file checklist before saving.
- Given I am an operator, when I submit the editor form, then I cannot change
  internal code, purchase linkage, inventory status, cost, or minimum price.
- Given I am an admin, when I use the editor, then I can perform every editor
  action available to an operator; separate administrative corrections remain
  outside this form.

### US-024 - Manage Listing Readiness

- Persona: Admin.
- Story: As an admin, I want to review and publish a complete garment without
  changing its physical inventory state so I can control what is offered for
  sale.
- Priority: P0.
- Points: 5.
- Linked requirements: FR-LST-001, FR-LST-002.

Acceptance criteria:

- Given a garment is physically available and its commercial file is complete,
  when an admin approves it, then it can change from `READY_FOR_REVIEW` to
  `PUBLISHED`.
- Given a garment is sold, when the sale completes, then its listing is no
  longer published while the physical state becomes `SOLD`.

### US-018 - Manage Brands

- Persona: Admin.
- Story: As an admin, I want to manage a rich Brands (Marcas) catalog with
  metadata so I can enable brand-based filtering, reporting, and future
  analytics.
- Priority: P1.
- Points: 3.
- Linked requirements: FR-CAT-005.

Acceptance criteria:

- Given I am an admin, when I create a brand, then I can enter name, logo URL
  (optional), origin country (optional), and metadata key-value pairs.
- Given a brand exists, when I edit it, then I can update any field including
  metadata.
- Given a brand is deactivated, when an operator completes a garment file, then
  the deactivated brand still appears on historical garments but is hidden from
  the active brand selector.
- Given brands exist in the system, when I view the brands list, then it
  supports pagination and sorting by name.

### US-019 - Manage Clothing Types

- Persona: Admin.
- Story: As an admin, I want to manage a Clothing Types (Tipos de ropa) catalog
  so I can structurally classify garments for filtering, display grouping, and
  reporting.
- Priority: P1.
- Points: 2.
- Linked requirements: FR-CAT-006.

Acceptance criteria:

- Given I am an admin, when I create a clothing type, then I can enter name
  (e.g., "Camisa", "Pantalon", "Vestido"), active flag, display order, and
  metadata key-value pairs.
- Given clothing types exist with display order values, when the frontend shows
  the type selector, then types are sorted by display order ascending.
- Given a clothing type is deactivated, when an operator completes a garment
  file, then the deactivated type is hidden from the selector but preserved on
  historical garments.
- Given I view the clothing types list, when I change display order values,
  then the new order is reflected immediately in the frontend.

### US-020 - Manage Operational Catalogs

- Persona: Admin.
- Story: As an admin, I want to manage categories, sizes, conditions, colors,
  payment methods, expense types, and difference reasons so operators capture
  consistent data across all workflows.
- Priority: P1.
- Points: 3.
- Linked requirements: FR-CAT-002, FR-CAT-003.

Acceptance criteria:

- Given I manage garment catalogs, when I create, edit, or deactivate a
  category, size, condition, or color, then operators can use the active values
  when completing garment files.
- Given I manage payment methods, when I update the catalog, then operators can
  select active payment methods in sales.
- Given I manage expense types, when I update the catalog, then operators can
  select active expense types when recording expenses.
- Given I manage difference reasons, when I update the catalog, then operators
  must select a reason when a purchase batch total differs from the expected
  cart total.
- Given any catalog value is deactivated, when historical records reference it,
  then the historical data remains intact and the deactivated value is visible
  in detail views but hidden from active selectors.

### US-021 - Filter Inventory By Catalog

- Persona: Operator.
- Story: As an operator, I want to filter inventory by brand, clothing type,
  store, category, size, condition, and color so I can find garments quickly.
- Priority: P1.
- Points: 3.
- Linked requirements: FR-CAT-008, FR-INV-006.

Acceptance criteria:

- Given I open the inventory view, when filter controls are displayed, then
  they are populated with active catalog values for brand, clothing type, store,
  category, size, condition, and color.
- Given I select one or more catalog filters, when I apply them, then the
  garment list narrows to matching garments only.
- Given I combine catalog filters with text search, when I apply both, then
  results match all active filters and the search term.
- Given I clear all filters, when the list refreshes, then all garments are
  shown.

### US-022 - Catalog Analytics Export

- Persona: Admin.
- Story: As an admin, I want to export catalog data and catalog-filtered sales
  and inventory reports so I can analyze business performance in external
  tools.
- Priority: P2.
- Points: 2.
- Linked requirements: FR-CAT-007, FR-CAT-009.

Acceptance criteria:

- Given I access the catalog export endpoint, when I request JSON or CSV
  format, then the response contains all active catalog entries with their
  fields.
- Given I generate a sales report grouped by brand, when I export it, then the
  export shows aggregated totals per brand for the selected period.
- Given I generate an inventory report grouped by clothing type, when I export
  it, then the export shows garment counts per clothing type.
- Given I access any catalog endpoint, when I pass `?filter=`, `?sort=`,
  `?page=`, and `?limit=` parameters, then the response matches the query.
