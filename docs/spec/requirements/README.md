# Nexo v1 — Requisitos del Sistema

Este directorio contiene los requisitos funcionales, no funcionales, de datos,
de integración, de negocio y restricciones para Nexo v1, organizados por
módulo de dominio.

Cada archivo sigue el formato definido en `../templates/requirement.md` e
incluye una sección `Artefactos de implementación` que mapea a archivos reales
del backend (NestJS) y frontend (React PWA).

## Índice de módulos

### Business Requirements (BR)

| ID | Título | Prioridad | Archivo |
|---|---|---|---|
| BR-001 | Conocer inventario por estado | P0 | [BR/BR-001.md](BR/BR-001.md) |
| BR-002 | Conocer costo real estimado por prenda | P0 | [BR/BR-002.md](BR/BR-002.md) |
| BR-003 | Conocer ventas y utilidad por prenda y periodo | P0 | [BR/BR-003.md](BR/BR-003.md) |
| BR-004 | Trazabilidad de compras por tienda | P0 | [BR/BR-004.md](BR/BR-004.md) |
| BR-005 | Captura mobile-first de compras y ventas | P1 | [BR/BR-005.md](BR/BR-005.md) |
| BR-006 | Administración de catálogos y datos operativos | P1 | [BR/BR-006.md](BR/BR-006.md) |

### Functional Requirements — Purchases (FR-PUR)

| ID | Título | Prioridad | Archivo |
|---|---|---|---|
| FR-PUR-001 | Crear carrito de compra | P0 | [FR/purchases/FR-PUR-001.md](FR/purchases/FR-PUR-001.md) |
| FR-PUR-002 | Agregar y remover items del carrito | P0 | [FR/purchases/FR-PUR-002.md](FR/purchases/FR-PUR-002.md) |
| FR-PUR-003 | Cargar tax predeterminado de la tienda | P0 | [FR/purchases/FR-PUR-003.md](FR/purchases/FR-PUR-003.md) |
| FR-PUR-004 | Tipo de cambio USD→MXN | P0 | [FR/purchases/FR-PUR-004.md](FR/purchases/FR-PUR-004.md) |
| FR-PUR-005 | Confirmar carrito como lote de compra | P0 | [FR/purchases/FR-PUR-005.md](FR/purchases/FR-PUR-005.md) |
| FR-PUR-006 | Diferencia entre total pagado vs esperado | P0 | [FR/purchases/FR-PUR-006.md](FR/purchases/FR-PUR-006.md) |

### Functional Requirements — Inventory (FR-INV)

| ID | Título | Prioridad | Archivo |
|---|---|---|---|
| FR-INV-001 | Crear registro de prenda trazable | P0 | [FR/inventory/FR-INV-001.md](FR/inventory/FR-INV-001.md) |
| FR-INV-002 | Foto principal obligatoria | P0 | [FR/inventory/FR-INV-002.md](FR/inventory/FR-INV-002.md) |
| FR-INV-003 | Archivo mínimo de prenda | P0 | [FR/inventory/FR-INV-003.md](FR/inventory/FR-INV-003.md) |
| FR-INV-004 | Estados de inventario | P0 | [FR/inventory/FR-INV-004.md](FR/inventory/FR-INV-004.md) |
| FR-INV-005 | Calcular costo total en MXN | P0 | [FR/inventory/FR-INV-005.md](FR/inventory/FR-INV-005.md) |
| FR-INV-006 | Buscar inventario | P1 | [FR/inventory/FR-INV-006.md](FR/inventory/FR-INV-006.md) |
| FR-INV-007 | Trazabilidad de compra y venta | P1 | [FR/inventory/FR-INV-007.md](FR/inventory/FR-INV-007.md) |
| FR-INV-008 | Bloquear adquiridas hasta completar archivo | P0 | [FR/inventory/FR-INV-008.md](FR/inventory/FR-INV-008.md) |
| FR-INV-009 | Revisión de categoría | P0 | [FR/inventory/FR-INV-009.md](FR/inventory/FR-INV-009.md) |
| FR-INV-010 | Editor seguro de prenda | P0 | [FR/inventory/FR-INV-010.md](FR/inventory/FR-INV-010.md) |
| FR-INV-011 | Checklist de preparación para venta | P0 | [FR/inventory/FR-INV-011.md](FR/inventory/FR-INV-011.md) |

### Functional Requirements — Listings (FR-LST)

| ID | Título | Prioridad | Archivo |
|---|---|---|---|
| FR-LST-001 | Estado comercial separado del físico | P0 | [FR/listings/FR-LST-001.md](FR/listings/FR-LST-001.md) |
| FR-LST-002 | Publicación solo tras archivo completo y disponible | P0 | [FR/listings/FR-LST-002.md](FR/listings/FR-LST-002.md) |

### Functional Requirements — Reservations (FR-RES)

| ID | Título | Prioridad | Archivo |
|---|---|---|---|
| FR-RES-001 | Reservar prenda disponible | P0 | [FR/reservations/FR-RES-001.md](FR/reservations/FR-RES-001.md) |
| FR-RES-002 | Guardar fecha y nota de reserva | P0 | [FR/reservations/FR-RES-002.md](FR/reservations/FR-RES-002.md) |
| FR-RES-003 | Liberar reserva | P1 | [FR/reservations/FR-RES-003.md](FR/reservations/FR-RES-003.md) |
| FR-RES-004 | Vender prenda reservada | P0 | [FR/reservations/FR-RES-004.md](FR/reservations/FR-RES-004.md) |

### Functional Requirements — Sales (FR-SAL)

| ID | Título | Prioridad | Archivo |
|---|---|---|---|
| FR-SAL-001 | Crear venta con líneas | P0 | [FR/sales/FR-SAL-001.md](FR/sales/FR-SAL-001.md) |
| FR-SAL-002 | Asociar venta a cliente | P0 | [FR/sales/FR-SAL-002.md](FR/sales/FR-SAL-002.md) |
| FR-SAL-003 | Capturar precio final, moneda, método y fecha | P0 | [FR/sales/FR-SAL-003.md](FR/sales/FR-SAL-003.md) |
| FR-SAL-004 | Soporte USD con equivalente MXN | P0 | [FR/sales/FR-SAL-004.md](FR/sales/FR-SAL-004.md) |
| FR-SAL-005 | Calcular utilidad por prenda vendida | P0 | [FR/sales/FR-SAL-005.md](FR/sales/FR-SAL-005.md) |
| FR-SAL-006 | Marcar prendas como vendidas | P0 | [FR/sales/FR-SAL-006.md](FR/sales/FR-SAL-006.md) |

### Functional Requirements — Expenses (FR-EXP)

| ID | Título | Prioridad | Archivo |
|---|---|---|---|
| FR-EXP-001 | Registrar gastos generales | P0 | [FR/expenses/FR-EXP-001.md](FR/expenses/FR-EXP-001.md) |
| FR-EXP-002 | Registrar gastos ligados a lote | P0 | [FR/expenses/FR-EXP-002.md](FR/expenses/FR-EXP-002.md) |
| FR-EXP-003 | Asignar gastos proporcionalmente | P0 | [FR/expenses/FR-EXP-003.md](FR/expenses/FR-EXP-003.md) |
| FR-EXP-004 | Categorizar gastos | P1 | [FR/expenses/FR-EXP-004.md](FR/expenses/FR-EXP-004.md) |

### Functional Requirements — Customers (FR-CUS)

| ID | Título | Prioridad | Archivo |
|---|---|---|---|
| FR-CUS-001 | Crear cliente con nombre requerido | P0 | [FR/customers/FR-CUS-001.md](FR/customers/FR-CUS-001.md) |
| FR-CUS-002 | Almacenar contacto opcional | P1 | [FR/customers/FR-CUS-002.md](FR/customers/FR-CUS-002.md) |
| FR-CUS-003 | Historial de compras y reservas | P1 | [FR/customers/FR-CUS-003.md](FR/customers/FR-CUS-003.md) |

### Functional Requirements — Catalogs (FR-CAT)

| ID | Título | Prioridad | Archivo |
|---|---|---|---|
| FR-CAT-001 | Gestionar tiendas | P1 | [FR/catalogs/FR-CAT-001.md](FR/catalogs/FR-CAT-001.md) |
| FR-CAT-002 | Gestionar categorías, tallas, condiciones, colores | P1 | [FR/catalogs/FR-CAT-002.md](FR/catalogs/FR-CAT-002.md) |
| FR-CAT-003 | Gestionar métodos de pago, tipos de gasto, razones de diferencia | P1 | [FR/catalogs/FR-CAT-003.md](FR/catalogs/FR-CAT-003.md) |
| FR-CAT-004 | Tax predeterminado editable por tienda | P1 | [FR/catalogs/FR-CAT-004.md](FR/catalogs/FR-CAT-004.md) |
| FR-CAT-005 | Catálogo de marcas con metadatos | P1 | [FR/catalogs/FR-CAT-005.md](FR/catalogs/FR-CAT-005.md) |
| FR-CAT-006 | Catálogo de tipos de ropa | P1 | [FR/catalogs/FR-CAT-006.md](FR/catalogs/FR-CAT-006.md) |
| FR-CAT-007 | API de catálogos con filtros y exportación | P2 | [FR/catalogs/FR-CAT-007.md](FR/catalogs/FR-CAT-007.md) |
| FR-CAT-008 | Filtros de inventario por catálogo | P2 | [FR/catalogs/FR-CAT-008.md](FR/catalogs/FR-CAT-008.md) |
| FR-CAT-009 | Reportes agrupados por dimensión de catálogo | P1 | [FR/catalogs/FR-CAT-009.md](FR/catalogs/FR-CAT-009.md) |

### Functional Requirements — Reports (FR-REP)

| ID | Título | Prioridad | Archivo |
|---|---|---|---|
| FR-REP-001 | Reporte de compras por periodo | P0 | [FR/reports/FR-REP-001.md](FR/reports/FR-REP-001.md) |
| FR-REP-002 | Reporte de ventas por periodo | P0 | [FR/reports/FR-REP-002.md](FR/reports/FR-REP-002.md) |
| FR-REP-003 | Reporte de gastos por periodo | P0 | [FR/reports/FR-REP-003.md](FR/reports/FR-REP-003.md) |
| FR-REP-004 | Reporte de inventario por estado | P0 | [FR/reports/FR-REP-004.md](FR/reports/FR-REP-004.md) |
| FR-REP-005 | Reporte de costo vendido, utilidad y margen | P0 | [FR/reports/FR-REP-005.md](FR/reports/FR-REP-005.md) |

### Functional Requirements — QR Labels (FR-QR)

| ID | Título | Prioridad | Archivo |
|---|---|---|---|
| FR-QR-001 | Generar etiquetas QR imprimibles | P1 | [FR/qr-labels/FR-QR-001.md](FR/qr-labels/FR-QR-001.md) |
| FR-QR-002 | QR resuelve a la prenda en el sistema | P1 | [FR/qr-labels/FR-QR-002.md](FR/qr-labels/FR-QR-002.md) |

### Functional Requirements — Auth (FR-AUTH)

| ID | Título | Prioridad | Archivo |
|---|---|---|---|
| FR-AUTH-001 | Roles Admin y Operator | P0 | [FR/auth/FR-AUTH-001.md](FR/auth/FR-AUTH-001.md) |
| FR-AUTH-002 | Permisos de Admin | P0 | [FR/auth/FR-AUTH-002.md](FR/auth/FR-AUTH-002.md) |
| FR-AUTH-003 | Permisos de Operator | P0 | [FR/auth/FR-AUTH-003.md](FR/auth/FR-AUTH-003.md) |
| FR-AUTH-004 | Editor seguro no expone datos financieros | P0 | [FR/auth/FR-AUTH-004.md](FR/auth/FR-AUTH-004.md) |

### Non-Functional Requirements (NFR)

| ID | Título | Prioridad | Archivo |
|---|---|---|---|
| NFR-UX-001 | Mobile-first para flujos core | P0 | [NFR/NFR-UX-001.md](NFR/NFR-UX-001.md) |
| NFR-UX-002 | Escritorio para administración | P1 | [NFR/NFR-UX-002.md](NFR/NFR-UX-002.md) |
| NFR-PERF-001 | Tiempo de respuesta en mobile | P1 | [NFR/NFR-PERF-001.md](NFR/NFR-PERF-001.md) |
| NFR-SEC-001 | HTTPS en producción | P0 | [NFR/NFR-SEC-001.md](NFR/NFR-SEC-001.md) |
| NFR-SEC-002 | Validación de roles server-side | P0 | [NFR/NFR-SEC-002.md](NFR/NFR-SEC-002.md) |
| NFR-REL-001 | Cálculos financieros determinísticos | P1 | [NFR/NFR-REL-001.md](NFR/NFR-REL-001.md) |
| NFR-MAINT-001 | Lógica de negocio testeable sin UI | P1 | [NFR/NFR-MAINT-001.md](NFR/NFR-MAINT-001.md) |

### Data Requirements (DR)

| ID | Título | Prioridad | Archivo |
|---|---|---|---|
| DR-001 | Trazabilidad monetaria | P0 | [DR/DR-001.md](DR/DR-001.md) |
| DR-002 | Tipos de cambio almacenados | P0 | [DR/DR-002.md](DR/DR-002.md) |
| DR-003 | Fotos fuera de PostgreSQL | P0 | [DR/DR-003.md](DR/DR-003.md) |
| DR-004 | Códigos internos únicos y estables | P0 | [DR/DR-004.md](DR/DR-004.md) |
| DR-005 | Auditoría de correcciones | P1 | [DR/DR-005.md](DR/DR-005.md) |

### Interface Requirements (IR)

| ID | Título | Prioridad | Archivo |
|---|---|---|---|
| IR-001 | Integración con S3 para fotos | P0 | [IR/IR-001.md](IR/IR-001.md) |
| IR-002 | Obtención de tipo de cambio USD→MXN | P0 | [IR/IR-002.md](IR/IR-002.md) |
| IR-003 | Proveedor de tipo de cambio recomendado | P1 | [IR/IR-003.md](IR/IR-003.md) |

### Constraints (CON)

| ID | Restricción | Prioridad | Archivo |
|---|---|---|---|
| CON-001 | PWA, no nativa | — | [CON/CON-001.md](CON/CON-001.md) |
| CON-002 | Backend NestJS | — | [CON/CON-002.md](CON/CON-002.md) |
| CON-003 | Frontend React | — | [CON/CON-003.md](CON/CON-003.md) |
| CON-004 | Base de datos PostgreSQL | — | [CON/CON-004.md](CON/CON-004.md) |
| CON-005 | Fotos en S3-compatible | — | [CON/CON-005.md](CON/CON-005.md) |
| CON-006 | Moneda de reporte MXN | — | [CON/CON-006.md](CON/CON-006.md) |
| CON-007 | Internet y HTTPS en producción | — | [CON/CON-007.md](CON/CON-007.md) |

## Convenciones

- **ID**: `{Tipo}-{Módulo}-{Número}` (ej. `FR-PUR-001`, `NFR-UX-001`)
- **Tipos**: `BR` (business), `FR` (functional), `NFR` (non-functional), `DR` (data), `IR` (interface/integration), `CON` (constraint)
- **Prioridad**: `P0` (Must), `P1` (Should), `P2` (Could), `P3` (Won't for v1)
- **Estado**: `Draft` → `Reviewed` → `Approved` → `Implemented` → `Deprecated`
- Cada archivo incluye `Artefactos de implementación` con rutas exactas a backend (`back/src/modules/`) y frontend (`front/src/features/`)

## Uso para agentes

- `nexo-build`: Leer el requisito + `Artefactos de implementación` para saber qué archivos crear/modificar.
- `nexo-design`: Leer los criterios de aceptación para diseñar la UI/UX del flujo.
- `nexo-qa`: Usar los criterios de aceptación y método de verificación para escribir pruebas.
- `nexo-spec`: Usar la plantilla `templates/requirement.md` para escribir nuevos requisitos.

## Referencias

- Documento fuente del producto: [`NEXO_PROJECT.md`](../../NEXO_PROJECT.md)
- SRS maestro (índice consolidado): [`../SRS.md`](../SRS.md)
- Backlog de historias: [`../user-stories.md`](../user-stories.md)
- Matriz de trazabilidad: [`../traceability.md`](../traceability.md)
- Plan maestro de features: [`../../harness/control/plans/NEXO-v1-feature-master-plan.md`](../../harness/control/plans/NEXO-v1-feature-master-plan.md)
