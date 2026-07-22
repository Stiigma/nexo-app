# Nexo v1 Software Requirements Specification

## 1. Metadata

- Document status: draft
- Version: 0.3
- Date: 2026-07-18
- Source: `../../NEXO_PROJECT.md`
- Owner: Nexo project

## 2. Purpose

This document is the **master index** for all implementable and verifiable
requirements of Nexo v1. Each requirement now lives in its own file under
`requirements/`, organized by type and module, with full attributes,
acceptance criteria, verification methods, and implementation artifacts
(backend/frontend file references).

## 3. Scope

Nexo v1 is an internal operations system for a clothing resale business in
Ensenada, Baja California. The business buys clothing in the United States and
resells it in Mexico with margin over total cost.

The system must support:

- Purchase carts.
- Purchase batches.
- Individual garments.
- Inventory state tracking.
- Listing status tracking.
- Reservations.
- Sales in MXN and USD.
- Expenses.
- Customers.
- Catalogs.
- Reports.
- QR label generation.
- Admin and operator permissions.

Nexo v1 is not a formal accounting, tax, invoicing, or native mobile system.

## 4. Stakeholders And Users

| Role | Need |
| --- | --- |
| Business owner | Know costs, sales, inventory, and profit by period. |
| Admin | Manage catalogs, users, corrections, and reports. |
| Operator | Capture purchases, garments, reservations, and sales quickly. |
| Accountant/advisor | Review clear operational data later, outside the system. |

## 5. Definitions

| Term | Definition |
| --- | --- |
| Purchase cart | Temporary in-store collection of garments being considered before payment. |
| Purchase cart item | One garment captured before payment confirmation, identified by capture ID and main photo. |
| Purchase batch | Confirmed store payment that turns purchased cart items into acquired stock. |
| Garment | One sellable and traceable clothing item. |
| Acquired stock | Paid garment owned by Nexo but not yet available for reservation or sale. |
| Available garment | Garment that can be reserved or sold. |
| Reservation | Temporary hold of one garment for one customer. |
| Sale | Transaction containing one or more sale lines. |
| Sale line | One sold garment inside a sale with its own final sale price. |
| General expense | Expense that affects business reports but is not assigned to garments. |
| Batch expense | Expense linked to a purchase batch and distributed to garments. |
| Total cost | Garment purchase cost converted to MXN plus tax plus allocated expenses. |
| Profit | Sale line final sale price in MXN minus garment total cost in MXN. |
| Listing lifecycle | Commercial preparation independent of the physical inventory state: `Draft`, `Ready for Review`, `Published`, or `Paused`. |

## 6. Product Context

The target architecture is:

- Frontend: React PWA.
- Backend: NestJS.
- Database: PostgreSQL.
- Photo storage: S3-compatible object storage.
- Report currency: MXN.

Mobile views prioritize fast capture. Desktop views prioritize reports,
catalogs, administration, and operational review.

## 7. Constraints

| ID | Constraint | File |
| --- | --- | --- |
| CON-001 | The product must be a PWA, not a native iOS or Android app in v1. | [requirements/CON/CON-001.md](requirements/CON/CON-001.md) |
| CON-002 | The backend stack is NestJS. | [requirements/CON/CON-002.md](requirements/CON/CON-002.md) |
| CON-003 | The frontend stack is React. | [requirements/CON/CON-003.md](requirements/CON/CON-003.md) |
| CON-004 | The database is PostgreSQL. | [requirements/CON/CON-004.md](requirements/CON/CON-004.md) |
| CON-005 | Photos must be stored outside PostgreSQL in S3-compatible storage. | [requirements/CON/CON-005.md](requirements/CON/CON-005.md) |
| CON-006 | The report currency is MXN. | [requirements/CON/CON-006.md](requirements/CON/CON-006.md) |
| CON-007 | v1 requires internet access and HTTPS in production. | [requirements/CON/CON-007.md](requirements/CON/CON-007.md) |

## 8. Assumptions

| ID | Assumption |
| --- | --- |
| ASM-001 | The system starts clean with no historical import. |
| ASM-002 | The business accepts operational, not fiscal/accounting, reporting in v1. |
| ASM-003 | Exchange-rate data can be fetched daily from a reliable provider. |
| ASM-004 | Store tax defaults can be maintained by admins. |
| ASM-005 | Operators can capture at least one main photo per garment. |

## 9. Requirements Index

### 9.1 Business Requirements

| ID | Priority | Requirement | File |
| --- | --- | --- | --- |
| BR-001 | P0 | Conocer inventario por estado | [requirements/BR/BR-001.md](requirements/BR/BR-001.md) |
| BR-002 | P0 | Conocer costo real estimado por prenda | [requirements/BR/BR-002.md](requirements/BR/BR-002.md) |
| BR-003 | P0 | Conocer ventas y utilidad por prenda y periodo | [requirements/BR/BR-003.md](requirements/BR/BR-003.md) |
| BR-004 | P0 | Trazabilidad de compras por tienda | [requirements/BR/BR-004.md](requirements/BR/BR-004.md) |
| BR-005 | P1 | Captura mobile-first de compras y ventas | [requirements/BR/BR-005.md](requirements/BR/BR-005.md) |
| BR-006 | P1 | Administración de catálogos y datos operativos | [requirements/BR/BR-006.md](requirements/BR/BR-006.md) |

### 9.2 Purchases

| ID | Priority | Requirement | File |
| --- | --- | --- | --- |
| FR-PUR-001 | P0 | Crear carrito de compra | [requirements/FR/purchases/FR-PUR-001.md](requirements/FR/purchases/FR-PUR-001.md) |
| FR-PUR-002 | P0 | Agregar y remover items del carrito | [requirements/FR/purchases/FR-PUR-002.md](requirements/FR/purchases/FR-PUR-002.md) |
| FR-PUR-003 | P0 | Cargar tax predeterminado de la tienda | [requirements/FR/purchases/FR-PUR-003.md](requirements/FR/purchases/FR-PUR-003.md) |
| FR-PUR-004 | P0 | Tipo de cambio USD→MXN | [requirements/FR/purchases/FR-PUR-004.md](requirements/FR/purchases/FR-PUR-004.md) |
| FR-PUR-005 | P0 | Confirmar carrito como lote de compra | [requirements/FR/purchases/FR-PUR-005.md](requirements/FR/purchases/FR-PUR-005.md) |
| FR-PUR-006 | P0 | Diferencia entre total pagado vs esperado | [requirements/FR/purchases/FR-PUR-006.md](requirements/FR/purchases/FR-PUR-006.md) |

### 9.3 Inventory

| ID | Priority | Requirement | File |
| --- | --- | --- | --- |
| FR-INV-001 | P0 | Crear registro de prenda trazable | [requirements/FR/inventory/FR-INV-001.md](requirements/FR/inventory/FR-INV-001.md) |
| FR-INV-002 | P0 | Foto principal obligatoria | [requirements/FR/inventory/FR-INV-002.md](requirements/FR/inventory/FR-INV-002.md) |
| FR-INV-003 | P0 | Archivo mínimo de prenda | [requirements/FR/inventory/FR-INV-003.md](requirements/FR/inventory/FR-INV-003.md) |
| FR-INV-004 | P0 | Estados de inventario | [requirements/FR/inventory/FR-INV-004.md](requirements/FR/inventory/FR-INV-004.md) |
| FR-INV-005 | P0 | Calcular costo total en MXN | [requirements/FR/inventory/FR-INV-005.md](requirements/FR/inventory/FR-INV-005.md) |
| FR-INV-006 | P1 | Buscar inventario | [requirements/FR/inventory/FR-INV-006.md](requirements/FR/inventory/FR-INV-006.md) |
| FR-INV-007 | P1 | Trazabilidad de compra y venta | [requirements/FR/inventory/FR-INV-007.md](requirements/FR/inventory/FR-INV-007.md) |
| FR-INV-008 | P0 | Bloquear adquiridas hasta completar archivo | [requirements/FR/inventory/FR-INV-008.md](requirements/FR/inventory/FR-INV-008.md) |
| FR-INV-009 | P0 | Revisión de categoría | [requirements/FR/inventory/FR-INV-009.md](requirements/FR/inventory/FR-INV-009.md) |
| FR-INV-010 | P0 | Editor seguro de prenda | [requirements/FR/inventory/FR-INV-010.md](requirements/FR/inventory/FR-INV-010.md) |
| FR-INV-011 | P0 | Checklist de preparación para venta | [requirements/FR/inventory/FR-INV-011.md](requirements/FR/inventory/FR-INV-011.md) |

### 9.4 Listings

| ID | Priority | Requirement | File |
| --- | --- | --- | --- |
| FR-LST-001 | P0 | Estado comercial separado del físico | [requirements/FR/listings/FR-LST-001.md](requirements/FR/listings/FR-LST-001.md) |
| FR-LST-002 | P0 | Publicación solo tras archivo completo y disponible | [requirements/FR/listings/FR-LST-002.md](requirements/FR/listings/FR-LST-002.md) |

### 9.5 Reservations

| ID | Priority | Requirement | File |
| --- | --- | --- | --- |
| FR-RES-001 | P0 | Reservar prenda disponible | [requirements/FR/reservations/FR-RES-001.md](requirements/FR/reservations/FR-RES-001.md) |
| FR-RES-002 | P0 | Guardar fecha y nota de reserva | [requirements/FR/reservations/FR-RES-002.md](requirements/FR/reservations/FR-RES-002.md) |
| FR-RES-003 | P1 | Liberar reserva | [requirements/FR/reservations/FR-RES-003.md](requirements/FR/reservations/FR-RES-003.md) |
| FR-RES-004 | P0 | Vender prenda reservada | [requirements/FR/reservations/FR-RES-004.md](requirements/FR/reservations/FR-RES-004.md) |

### 9.6 Sales

| ID | Priority | Requirement | File |
| --- | --- | --- | --- |
| FR-SAL-001 | P0 | Crear venta con líneas | [requirements/FR/sales/FR-SAL-001.md](requirements/FR/sales/FR-SAL-001.md) |
| FR-SAL-002 | P0 | Asociar venta a cliente | [requirements/FR/sales/FR-SAL-002.md](requirements/FR/sales/FR-SAL-002.md) |
| FR-SAL-003 | P0 | Capturar precio final, moneda, método y fecha | [requirements/FR/sales/FR-SAL-003.md](requirements/FR/sales/FR-SAL-003.md) |
| FR-SAL-004 | P0 | Soporte USD con equivalente MXN | [requirements/FR/sales/FR-SAL-004.md](requirements/FR/sales/FR-SAL-004.md) |
| FR-SAL-005 | P0 | Calcular utilidad por prenda vendida | [requirements/FR/sales/FR-SAL-005.md](requirements/FR/sales/FR-SAL-005.md) |
| FR-SAL-006 | P0 | Marcar prendas como vendidas | [requirements/FR/sales/FR-SAL-006.md](requirements/FR/sales/FR-SAL-006.md) |

### 9.7 Expenses

| ID | Priority | Requirement | File |
| --- | --- | --- | --- |
| FR-EXP-001 | P0 | Registrar gastos generales | [requirements/FR/expenses/FR-EXP-001.md](requirements/FR/expenses/FR-EXP-001.md) |
| FR-EXP-002 | P0 | Registrar gastos ligados a lote | [requirements/FR/expenses/FR-EXP-002.md](requirements/FR/expenses/FR-EXP-002.md) |
| FR-EXP-003 | P0 | Asignar gastos proporcionalmente | [requirements/FR/expenses/FR-EXP-003.md](requirements/FR/expenses/FR-EXP-003.md) |
| FR-EXP-004 | P1 | Categorizar gastos | [requirements/FR/expenses/FR-EXP-004.md](requirements/FR/expenses/FR-EXP-004.md) |

### 9.8 Customers

| ID | Priority | Requirement | File |
| --- | --- | --- | --- |
| FR-CUS-001 | P0 | Crear cliente con nombre requerido | [requirements/FR/customers/FR-CUS-001.md](requirements/FR/customers/FR-CUS-001.md) |
| FR-CUS-002 | P1 | Almacenar contacto opcional | [requirements/FR/customers/FR-CUS-002.md](requirements/FR/customers/FR-CUS-002.md) |
| FR-CUS-003 | P1 | Historial de compras y reservas | [requirements/FR/customers/FR-CUS-003.md](requirements/FR/customers/FR-CUS-003.md) |

### 9.9 Catalogs

| ID | Priority | Requirement | File |
| --- | --- | --- | --- |
| FR-CAT-001 | P1 | Gestionar tiendas | [requirements/FR/catalogs/FR-CAT-001.md](requirements/FR/catalogs/FR-CAT-001.md) |
| FR-CAT-002 | P1 | Gestionar categorías, tallas, condiciones, colores | [requirements/FR/catalogs/FR-CAT-002.md](requirements/FR/catalogs/FR-CAT-002.md) |
| FR-CAT-003 | P1 | Gestionar métodos de pago, tipos de gasto, razones de diferencia | [requirements/FR/catalogs/FR-CAT-003.md](requirements/FR/catalogs/FR-CAT-003.md) |
| FR-CAT-004 | P1 | Tax predeterminado editable por tienda | [requirements/FR/catalogs/FR-CAT-004.md](requirements/FR/catalogs/FR-CAT-004.md) |
| FR-CAT-005 | P1 | Catálogo de marcas con metadatos | [requirements/FR/catalogs/FR-CAT-005.md](requirements/FR/catalogs/FR-CAT-005.md) |
| FR-CAT-006 | P1 | Catálogo de tipos de ropa | [requirements/FR/catalogs/FR-CAT-006.md](requirements/FR/catalogs/FR-CAT-006.md) |
| FR-CAT-007 | P2 | API de catálogos con filtros y exportación | [requirements/FR/catalogs/FR-CAT-007.md](requirements/FR/catalogs/FR-CAT-007.md) |
| FR-CAT-008 | P2 | Filtros de inventario por catálogo | [requirements/FR/catalogs/FR-CAT-008.md](requirements/FR/catalogs/FR-CAT-008.md) |
| FR-CAT-009 | P1 | Reportes agrupados por dimensión de catálogo | [requirements/FR/catalogs/FR-CAT-009.md](requirements/FR/catalogs/FR-CAT-009.md) |

### 9.10 Reports

| ID | Priority | Requirement | File |
| --- | --- | --- | --- |
| FR-REP-001 | P0 | Reporte de compras por periodo | [requirements/FR/reports/FR-REP-001.md](requirements/FR/reports/FR-REP-001.md) |
| FR-REP-002 | P0 | Reporte de ventas por periodo | [requirements/FR/reports/FR-REP-002.md](requirements/FR/reports/FR-REP-002.md) |
| FR-REP-003 | P0 | Reporte de gastos por periodo | [requirements/FR/reports/FR-REP-003.md](requirements/FR/reports/FR-REP-003.md) |
| FR-REP-004 | P0 | Reporte de inventario por estado | [requirements/FR/reports/FR-REP-004.md](requirements/FR/reports/FR-REP-004.md) |
| FR-REP-005 | P0 | Reporte de costo vendido, utilidad y margen | [requirements/FR/reports/FR-REP-005.md](requirements/FR/reports/FR-REP-005.md) |

### 9.11 QR Labels

| ID | Priority | Requirement | File |
| --- | --- | --- | --- |
| FR-QR-001 | P1 | Generar etiquetas QR imprimibles | [requirements/FR/qr-labels/FR-QR-001.md](requirements/FR/qr-labels/FR-QR-001.md) |
| FR-QR-002 | P1 | QR resuelve a la prenda en el sistema | [requirements/FR/qr-labels/FR-QR-002.md](requirements/FR/qr-labels/FR-QR-002.md) |

### 9.12 Auth and Permissions

| ID | Priority | Requirement | File |
| --- | --- | --- | --- |
| FR-AUTH-001 | P0 | Roles Admin y Operator | [requirements/FR/auth/FR-AUTH-001.md](requirements/FR/auth/FR-AUTH-001.md) |
| FR-AUTH-002 | P0 | Permisos de Admin | [requirements/FR/auth/FR-AUTH-002.md](requirements/FR/auth/FR-AUTH-002.md) |
| FR-AUTH-003 | P0 | Permisos de Operator | [requirements/FR/auth/FR-AUTH-003.md](requirements/FR/auth/FR-AUTH-003.md) |
| FR-AUTH-004 | P0 | Editor seguro no expone datos financieros | [requirements/FR/auth/FR-AUTH-004.md](requirements/FR/auth/FR-AUTH-004.md) |

### 9.13 Non-Functional Requirements

| ID | Priority | Requirement | File |
| --- | --- | --- | --- |
| NFR-UX-001 | P0 | Mobile-first para flujos core | [requirements/NFR/NFR-UX-001.md](requirements/NFR/NFR-UX-001.md) |
| NFR-UX-002 | P1 | Escritorio para administración | [requirements/NFR/NFR-UX-002.md](requirements/NFR/NFR-UX-002.md) |
| NFR-PERF-001 | P1 | Tiempo de respuesta en mobile | [requirements/NFR/NFR-PERF-001.md](requirements/NFR/NFR-PERF-001.md) |
| NFR-SEC-001 | P0 | HTTPS en producción | [requirements/NFR/NFR-SEC-001.md](requirements/NFR/NFR-SEC-001.md) |
| NFR-SEC-002 | P0 | Validación de roles server-side | [requirements/NFR/NFR-SEC-002.md](requirements/NFR/NFR-SEC-002.md) |
| NFR-REL-001 | P1 | Cálculos financieros determinísticos | [requirements/NFR/NFR-REL-001.md](requirements/NFR/NFR-REL-001.md) |
| NFR-MAINT-001 | P1 | Lógica de negocio testeable sin UI | [requirements/NFR/NFR-MAINT-001.md](requirements/NFR/NFR-MAINT-001.md) |

### 9.14 Data Requirements

| ID | Priority | Requirement | File |
| --- | --- | --- | --- |
| DR-001 | P0 | Trazabilidad monetaria | [requirements/DR/DR-001.md](requirements/DR/DR-001.md) |
| DR-002 | P0 | Tipos de cambio almacenados | [requirements/DR/DR-002.md](requirements/DR/DR-002.md) |
| DR-003 | P0 | Fotos fuera de PostgreSQL | [requirements/DR/DR-003.md](requirements/DR/DR-003.md) |
| DR-004 | P0 | Códigos internos únicos y estables | [requirements/DR/DR-004.md](requirements/DR/DR-004.md) |
| DR-005 | P1 | Auditoría de correcciones | [requirements/DR/DR-005.md](requirements/DR/DR-005.md) |

### 9.15 Interface And Integration Requirements

| ID | Priority | Requirement | File |
| --- | --- | --- | --- |
| IR-001 | P0 | Integración con S3 para fotos | [requirements/IR/IR-001.md](requirements/IR/IR-001.md) |
| IR-002 | P0 | Obtención de tipo de cambio USD→MXN | [requirements/IR/IR-002.md](requirements/IR/IR-002.md) |
| IR-003 | P1 | Proveedor de tipo de cambio recomendado (Banxico) | [requirements/IR/IR-003.md](requirements/IR/IR-003.md) |

## 10. MVP Acceptance Criteria

The MVP is acceptable when all of the following can be demonstrated:

| ID | Criterion | Linked requirements |
| --- | --- | --- |
| AC-MVP-001 | Create a USD purchase cart. | FR-PUR-001, FR-PUR-003, FR-PUR-004 |
| AC-MVP-002 | Add purchase cart items with required main photo and captured purchase cost. | FR-PUR-002, FR-INV-002 |
| AC-MVP-003 | Calculate tax and MXN equivalent for purchase data. | FR-PUR-003, FR-PUR-004, DR-001 |
| AC-MVP-004 | Confirm a cart as a purchase batch and move garments into acquired stock. | FR-PUR-005, FR-PUR-006, FR-INV-001, FR-INV-004 |
| AC-MVP-005 | Register general and batch-linked expenses. | FR-EXP-001, FR-EXP-002 |
| AC-MVP-006 | Calculate total cost per garment. | FR-INV-005, FR-EXP-003 |
| AC-MVP-007 | Reserve a garment for a customer. | FR-RES-001, FR-CUS-001 |
| AC-MVP-008 | Register a sale in MXN with sale lines. | FR-SAL-001, FR-SAL-003, FR-SAL-005 |
| AC-MVP-009 | Register a sale in USD with MXN equivalent. | FR-SAL-004, DR-001, DR-002 |
| AC-MVP-010 | Change sold garments to inventory state `Sold`. | FR-SAL-006, FR-INV-004 |
| AC-MVP-011 | Consult profit for sold garments. | FR-SAL-005, BR-003 |
| AC-MVP-012 | View purchase, sale, expense, and inventory reports. | FR-REP-001, FR-REP-002, FR-REP-003, FR-REP-004 |
| AC-MVP-013 | Generate a printable QR label sheet. | FR-QR-001, FR-QR-002 |
| AC-MVP-014 | Separate Admin and Operator permissions. | FR-AUTH-001, FR-AUTH-002, FR-AUTH-003 |

## 11. Out Of Scope For v1

- Fiscal invoicing.
- Formal Mexican tax calculation.
- Complete accounting.
- Offline mode.
- Reservation deposits.
- Accounts receivable.
- Direct label-printer integration.
- Historical data import.
- Advanced CRM.
- Native iOS or Android app.

## 12. Open Questions

| ID | Question | Impact |
| --- | --- | --- |
| OQ-001 | What rounding policy should be used for MXN, USD, tax, expense allocation, and profit? | Affects financial consistency and tests. |
| OQ-003 | What happens if the exchange-rate provider is unavailable? | Affects offline/fallback operational policy. |
| OQ-004 | Can an admin edit a confirmed purchase batch, acquired stock garment, sold garment, or completed sale? | Affects audit/correction model. |
| OQ-005 | How should duplicate customer records be handled? | Affects customer history reliability. |
| OQ-006 | What exact QR payload should be printed: URL, internal code, or signed token? | Affects security and routing. |
| OQ-007 | Resolved 2026-07-15: listing lifecycle is independent from physical inventory. | Implemented as `FR-LST-001` and `FR-LST-002`. |
| OQ-008 | Should catalog deactivation cascade to hide inactive values in filters or retain for historical accuracy? | Affects UX consistency and reporting. |
| OQ-009 | What metadata attributes should be seeded for brands and clothing types? | Affects analytics readiness. |
| OQ-010 | Should clothing type be a required field on the minimum garment file or optional for filtering only? | Affects garment-completion workflow. |

## 13. File Layout

```
docs/spec/
├── README.md               ← Spec conventions, ID scheme, templates
├── SRS.md                  ← THIS FILE: master index
├── user-stories.md         ← Story backlog
├── traceability.md         ← Traceability matrix
├── templates/              ← .md templates for requirements, stories, changes
└── requirements/
    ├── README.md           ← Index of all requirements by module
    ├── BR/                 ← Business requirements (6 files)
    ├── FR/
    │   ├── purchases/      ← Purchase carts and batches (6)
    │   ├── inventory/      ← Garments, states, editor (11)
    │   ├── listings/       ← Commercial listing lifecycle (2)
    │   ├── reservations/   ← Reservations (4)
    │   ├── sales/          ← MXN/USD sales, profit (6)
    │   ├── expenses/       ← General and batch expenses (4)
    │   ├── customers/      ← Customer records (3)
    │   ├── catalogs/       ← Stores, brands, types, etc. (9)
    │   ├── reports/        ← Operational reports (5)
    │   ├── qr-labels/      ← QR label generation (2)
    │   └── auth/           ← Roles and permissions (4)
    ├── NFR/                ← Non-functional (7)
    ├── DR/                 ← Data requirements (5)
    ├── IR/                 ← Interface/integration (3)
    └── CON/                ← Constraints (7)
```

Each requirement file includes: ID, title, metadata, declaration, rationale,
acceptance criteria (Given/When/Then), verification checklist, backend/frontend
implementation artifacts, linked stories, dependencies, and open questions.
