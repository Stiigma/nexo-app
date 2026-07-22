# Nexo Domain Context

This context defines the canonical domain language for Nexo v1. Use these terms
in requirements, code, tests, reports, UI copy decisions, and future handoffs
unless a later domain decision updates this file.

## Language

### Business Core

**Nexo**:
The clothing resale business that buys garments in the United States and
resells them in Mexico.
_Avoid_: store, platform, shop

**Purchase Batch**:
A store-day aggregate that groups one or more payments at the same store on the
same date. It anchors purchase-level traceability and provides consolidated
totals for the store-day. An operator works primarily with batches; carts are
temporary capture tools.
_Avoid_: lot, trip, order, ticket

**Payment**:
One confirmed cart payment inside a purchase batch. Each payment carries its own
purchase evidence, tax rate, exchange rate, expected total, paid total, and
difference reason. A batch can have multiple payments from separate visits to
the same store on the same day.
_Avoid_: ticket, confirmation, remittance, sub-batch

**Buying Trip**:
An operational buying period or outing, such as a USA trip, that can contain
multiple purchase batches.
_Avoid_: purchase batch, lot

**Purchase Cart**:
A temporary in-store collection of garments being captured before payment. Items
in this cart are not yet Nexo inventory. The cart is ephemeral: it disappears
from active views once its payment is confirmed into a purchase batch.
_Avoid_: open batch, draft batch, wishlist

**Purchase Cart Item**:
One garment captured inside a purchase cart before payment confirmation. It has
a capture ID and main photo, but no definitive internal code yet.
_Avoid_: inventory item, product, SKU

**Garment**:
One individual sellable and traceable clothing item. It is the main inventory
unit and keeps the same internal code through purchase, reservation, and sale.
_Avoid_: product, item, article, SKU

**Inventory**:
The collection of garments Nexo physically owns after purchase confirmation,
grouped by inventory state.
_Avoid_: catalog

**Store**:
The place where Nexo buys garments. A store has operational defaults such as tax
rate.
_Avoid_: supplier, vendor, branch

**Customer**:
The person who buys or reserves garments from Nexo.
_Avoid_: client, buyer, account

### Inventory States

**Inventory State**:
The physical and operational state of a garment owned by Nexo, independent from
its listing status.
_Avoid_: listing status, catalog status

**Acquired Stock**:
A paid garment that belongs to Nexo but is still blocked from reservation or
sale until its minimum garment file is complete.
_Avoid_: closed batch item, unavailable garment

**Available Garment**:
A garment that belongs to Nexo and can be reserved or sold.
_Avoid_: active item, in stock

**Reserved Garment**:
A garment temporarily held for one customer through a reservation.
_Avoid_: held item, apartada item

**Sold Garment**:
A garment that has been included in a completed sale line.
_Avoid_: completed item, closed item

### Listing Statuses

**Listing Status**:
The commercial readiness state of a garment, independent from its inventory
state.
_Avoid_: inventory state, garment state

**Not Listed**:
A garment with no prepared commercial listing information.
_Avoid_: unpublished, hidden

**Draft Listing**:
A garment listing with the minimum garment file and suggested price needed for
internal reservation or sale.
_Avoid_: incomplete listing, draft garment

**Ready Listing**:
A garment listing that is complete enough for review or publication.
_Avoid_: approved item, finished item

**Published Listing**:
A garment listing that has been made visible on a sales channel.
_Avoid_: live item, active item

**Minimum Garment File**:
The minimum business facts needed before a paid garment can move out of
acquired stock: main photo, category, brand, size, condition, color, physical
location, and suggested price.
_Avoid_: required fields, complete profile

### Money And Costing

**Original Money**:
The currency and amount as captured from the source operation before conversion
to MXN.
_Avoid_: raw amount, source amount

**MXN Equivalent**:
The MXN value stored for reporting and profit calculations after applying the
recorded exchange rate.
_Avoid_: converted amount, report amount

**Exchange Rate**:
The USD-to-MXN rate applied to a purchase batch, sale, or expense when original
money is not MXN. The applied rate is part of the historical record.
_Avoid_: FX, conversion rate

**Tax Rate**:
The percentage used to calculate store tax for purchase data, normally loaded
from the selected store and manually correctable.
_Avoid_: sales tax setting, IVA

**Expected Cart Total**:
The total Nexo expects from a purchase cart before payment, based on captured
cart items and purchase assumptions.
_Avoid_: estimated ticket, subtotal

**Paid Total**:
The real amount paid at the store for a confirmed purchase batch.
_Avoid_: final ticket, actual total

**Purchase Evidence**:
The purchase-level record that ties a confirmed purchase batch to the real
store payment, ticket, and applied money inputs.
_Avoid_: receipt only, proof, attachment

**Difference Reason**:
The required explanation category when the paid total does not match the
expected cart total.
_Avoid_: note, comment, discrepancy text

**General Expense**:
An operational expense that affects business reports but is not assigned into
garment total cost.
_Avoid_: overhead, operating cost

**Batch Expense**:
An expense linked to a purchase batch and allocated into the total cost of the
batch garments.
_Avoid_: purchase expense, linked expense

**Allocated Expense**:
The portion of a batch expense assigned to a garment, proportional to that
garment's base purchase cost.
_Avoid_: expense share, distributed cost

**Total Cost**:
The estimated real cost of one garment in MXN, including converted purchase
cost, tax, and allocated batch expenses.
_Avoid_: landed cost, final cost

**Suggested Price**:
The internal price recommendation captured for a garment before sale.
_Avoid_: list price, target price

**Final Sale Price**:
The real price captured on a sale line when one garment is sold.
_Avoid_: sold price, transaction price

**Profit**:
The sale line's final sale price in MXN minus the sold garment's total cost in
MXN.
_Avoid_: gain, revenue, margin

**Margin**:
A report metric derived from sale and cost values for a period or sold garment
set.
_Avoid_: profit

### Customer Operations

**Reservation**:
A temporary hold of one available garment for one customer. Reservations in v1
do not represent deposits, accounts receivable, or payment promises.
_Avoid_: hold, layaway, apartado

**Reservation Release**:
The act of removing a reservation so the garment becomes available again.
_Avoid_: cancellation, deletion

**Sale**:
A transaction that sells one or more available or reserved garments to a
customer and contains one sale line per garment.
_Avoid_: order, checkout, ticket

**Sale Line**:
The part of a sale that assigns one final sale price to one sold garment. A
sale has one sale line per garment so garment-level profit is deterministic.
_Avoid_: sale item, order line, detail row

**Payment Method**:
The catalog value describing how a purchase or sale was paid.
_Avoid_: payment type, tender

### Roles

**Admin**:
A user who can manage catalogs, users, corrections, reports, and all inventory.
_Avoid_: owner, manager

**Operator**:
A user who captures purchase batches, garments, reservations, sales, and
operational inventory lookups.
_Avoid_: staff, seller

### Catalogs

**Operational Catalog**:
An admin-managed list of formal values used to keep capture consistent, such as
categories, brands, sizes, conditions, colors, payment methods, expense types,
difference reasons, and stores.
_Avoid_: lookup table, options

**Catalog Value**:
One selectable entry inside an operational catalog. Catalog values are formal
business vocabulary, not ad hoc capture text.
_Avoid_: option, free text, lookup row

**Category**:
The formal garment classification used for search, reporting, and capture
consistency. It may be selected during purchase cart capture and is required for
the minimum garment file.
_Avoid_: type, department, quick category

**Category Review**:
The need to assign or confirm a formal category for a garment captured quickly
without reliable category information.
_Avoid_: provisional category, free-text category, temporary category

**Brand**:
The garment brand captured for inventory search and operational review.
_Avoid_: maker, label

**Size**:
The garment size captured for inventory search and operational review.
_Avoid_: talla

**Condition**:
The garment's resale condition captured for commercial review and customer
confidence.
_Avoid_: quality, status

**Color**:
The garment color captured for search, listing review, and customer-facing
description.
_Avoid_: tone, shade

**Expense Type**:
The operational catalog value used to classify expenses.
_Avoid_: expense category

### Traceability And Labels

**Capture ID**:
A temporary identifier for a purchase cart item before payment confirmation.
_Avoid_: internal code, SKU

**Internal Code**:
The unique stable identifier assigned to a garment after payment confirmation
and kept through inventory, reservation, and sale.
_Avoid_: SKU, barcode, serial

**QR Label**:
A printable label containing the internal code and QR that helps locate the
garment in the system.
_Avoid_: tag, sticker

**Main Photo**:
The required primary photo used to identify a garment during purchase capture
and later commercial review.
_Avoid_: cover image, thumbnail

**Physical Location**:
The free-text place where a garment is stored, such as a box, rack, bag, or
hanger area.
_Avoid_: warehouse bin, address

**Garment Traceability**:
The ability to follow one garment from purchase batch through reservation and
sale.
_Avoid_: audit trail, history

### Reports

**Report Currency**:
MXN, the currency used for consolidated business reports.
_Avoid_: base currency

**Purchase Report**:
A period report showing purchase activity and totals.
_Avoid_: buying report

**Sales Report**:
A period report showing sale activity and totals in MXN.
_Avoid_: revenue report

**Expense Report**:
A period report separating general expenses from batch expenses.
_Avoid_: cost report

**Inventory Report**:
A report that separates acquired stock, available, reserved, and sold garments.
_Avoid_: stock report

**Profit Report**:
A report showing cost sold, profit, and margin for a period.
_Avoid_: earnings report

### Scope Boundaries

**Operational Reporting**:
Business reporting intended to support Nexo operations and later review with an
accountant. It is not formal accounting or fiscal reporting.
_Avoid_: accounting, fiscal reporting

**v1 Exclusion**:
A concept deliberately outside the first version, such as fiscal invoicing,
offline mode, reservation deposits, accounts receivable, advanced CRM,
historical import, direct label-printer integration, or native mobile apps.
_Avoid_: backlog item, future feature
