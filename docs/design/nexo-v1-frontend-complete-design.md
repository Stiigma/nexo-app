# Nexo v1 — Frontend Design Complete

## Metadata

- Document: diseño completo de frontend PWA
- Versión: v1.0
- Fecha: 2026-07-06
- Agente: nexo-design
- Basado en: `NEXO_PROJECT.md`, `docs/spec/SRS.md`, `docs/spec/user-stories.md`,
  feature master plan F0-F11, backend `identity` module actual

---

## 1. API Endpoints — Mapa Completo

### 1.1 Endpoints Existentes (Backend Implementado)

| Método | Ruta | Auth | Descripción | Feature |
|--------|------|------|-------------|---------|
| `POST` | `/api/v1/auth/login` | — | Login (devuelve cookies httpOnly) | F1 |
| `POST` | `/api/v1/auth/refresh` | Refresh | Renovar access token | F1 |
| `POST` | `/api/v1/auth/logout` | — | Cerrar sesión (limpia cookies) | F1 |
| `GET` | `/api/v1/auth/me` | Access | Usuario actual | F1 |
| `GET` | `/api/v1/auth/operator-workspace` | Access + Operator | Probe operador | F1 |
| `GET` | `/api/v1/auth/admin-workspace` | Access + Admin | Probe admin | F1 |

### 1.2 Endpoints Planeados por Feature

#### F2 — Operational Catalogs (NEXO-0008)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/v1/catalogs/categories` | Access | Listar categorías |
| `POST` | `/api/v1/catalogs/categories` | Admin | Crear categoría |
| `PUT` | `/api/v1/catalogs/categories/:id` | Admin | Editar categoría |
| `DELETE` | `/api/v1/catalogs/categories/:id` | Admin | Eliminar categoría (soft) |
| `GET` | `/api/v1/catalogs/brands` | Access | Listar marcas |
| `POST` | `/api/v1/catalogs/brands` | Admin | Crear marca |
| `PUT` | `/api/v1/catalogs/brands/:id` | Admin | Editar marca |
| `GET` | `/api/v1/catalogs/sizes` | Access | Listar tallas |
| `POST` | `/api/v1/catalogs/sizes` | Admin | Crear talla |
| `GET` | `/api/v1/catalogs/conditions` | Access | Listar condiciones |
| `POST` | `/api/v1/catalogs/conditions` | Admin | Crear condición |
| `GET` | `/api/v1/catalogs/colors` | Access | Listar colores |
| `GET` | `/api/v1/catalogs/expense-types` | Admin | Listar tipos de gasto |

#### F3 — Quick Pre-Payment Purchase (NEXO-0009)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/v1/purchases/carts` | Operator | Crear carrito de compra |
| `GET` | `/api/v1/purchases/carts/:id` | Operator | Ver carrito activo |
| `POST` | `/api/v1/purchases/carts/:id/items` | Operator | Agregar prenda al carrito |
| `PUT` | `/api/v1/purchases/carts/:id/items/:itemId` | Operator | Editar item del carrito |
| `DELETE` | `/api/v1/purchases/carts/:id/items/:itemId` | Operator | Quitar item del carrito |
| `POST` | `/api/v1/purchases/carts/:id/confirm` | Operator | Confirmar carrito → lote |

#### F4 — Payment Confirmation & Acquired Inventory (NEXO-0010)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `PUT` | `/api/v1/purchases/batches/:id/payment` | Admin | Registrar pago del lote |
| `GET` | `/api/v1/purchases/batches/:id` | Access | Ver detalle de lote |
| `GET` | `/api/v1/purchases/batches` | Access | Listar lotes (filtro por estado) |

#### F5 — Minimum Garment File & Availability (NEXO-0011)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/v1/garments/:id` | Access | Ver ficha mínima de prenda |
| `PUT` | `/api/v1/garments/:id` | Operator | Completar ficha mínima (fotos, datos) |
| `POST` | `/api/v1/garments/:id/photos` | Operator | Subir foto de prenda |
| `DELETE` | `/api/v1/garments/:id/photos/:photoId` | Operator | Eliminar foto |
| `PUT` | `/api/v1/garments/:id/availability` | Operator | Marcar como disponible |

#### F6 — Inventory Detail & Search (NEXO-0012)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/v1/inventory` | Access | Buscar/filtrar inventario |
| `GET` | `/api/v1/inventory/:garmentId` | Access | Ficha completa de prenda |
| `GET` | `/api/v1/inventory/stats` | Access | Conteos por estado |
| `PUT` | `/api/v1/inventory/:garmentId/status` | Operator | Cambiar estado de listado |
| `PUT` | `/api/v1/inventory/:garmentId/location` | Operator | Actualizar ubicación física |

#### F7 — Customers & Reservations (NEXO-0013)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/v1/customers` | Access | Buscar clientes |
| `POST` | `/api/v1/customers` | Operator | Crear cliente |
| `GET` | `/api/v1/customers/:id` | Access | Ver cliente + historial |
| `PUT` | `/api/v1/customers/:id` | Operator | Editar cliente |
| `POST` | `/api/v1/reservations` | Operator | Crear apartado |
| `GET` | `/api/v1/reservations` | Access | Listar apartados activos |
| `PUT` | `/api/v1/reservations/:id/release` | Operator | Liberar apartado |
| `PUT` | `/api/v1/reservations/:id/convert-to-sale` | Operator | Convertir a venta |

#### F8 — MXN/USD Sales (NEXO-0014)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/v1/sales` | Operator | Registrar venta |
| `GET` | `/api/v1/sales` | Access | Listar ventas |
| `GET` | `/api/v1/sales/:id` | Access | Ver detalle de venta |
| `GET` | `/api/v1/exchange-rates/latest` | Access | Tipo de cambio del día (Banxico) |

#### F9 — Expenses & Real Cost (NEXO-0015)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/v1/expenses` | Admin | Registrar gasto |
| `GET` | `/api/v1/expenses` | Admin | Listar gastos |
| `PUT` | `/api/v1/expenses/:id` | Admin | Editar gasto |
| `POST` | `/api/v1/expenses/allocate` | Admin | Asignar gasto a lote/prendas |

#### F10 — Operational Reports (NEXO-0016)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/v1/reports/purchases` | Admin | Reporte de compras |
| `GET` | `/api/v1/reports/sales` | Admin | Reporte de ventas |
| `GET` | `/api/v1/reports/inventory` | Admin | Reporte de inventario |
| `GET` | `/api/v1/reports/profit` | Admin | Reporte de ganancias |
| `GET` | `/api/v1/reports/export/:type` | Admin | Exportar reporte CSV/PDF |

#### F11 — QR Labels (NEXO-0017)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/v1/garments/:id/qr` | Operator | Generar/obtener QR de prenda |
| `POST` | `/api/v1/garments/qr/batch` | Operator | Generar QRs para múltiples prendas |
| `GET` | `/api/v1/garments/:id/qr/print` | Operator | Versión imprimible del QR |

#### Seguridad futura (NEXO-0023)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/v1/admin/security-events` | Admin | Consultar bitácora de seguridad |
| `POST` | `/api/v1/admin/security-events/export` | Admin | Exportar eventos del día |

---

## 2. Pantallas — Matriz Completa por Feature y Rol

### 2.1 Vista General: Árbol de Pantallas

```
/login                          [Público]
/operator                       [Operator, Admin]
  /operator/purchase            [Operator]    Crear compra rápida (F3)
  /operator/purchase/:cartId    [Operator]    Carrito activo (F3)
  /operator/garment/:id         [Operator]    Ficha mínima prenda (F5)
  /operator/inventory           [Operator]    Inventario operativo (F6)
  /operator/inventory/:id       [Operator]    Ficha completa prenda (F6)
  /operator/reservations        [Operator]    Apartados activos (F7)
  /operator/reservations/new    [Operator]    Nuevo apartado (F7)
  /operator/customers           [Operator]    Clientes (F7)
  /operator/customers/:id       [Operator]    Ficha cliente (F7)
  /operator/sales               [Operator]    Registrar venta (F8)
  /operator/sales/:id           [Operator]    Detalle venta (F8)
/admin                          [Admin]
  /admin/dashboard              [Admin]       Dashboard admin (F10)
  /admin/catalogs               [Admin]       Lista de catálogos (F2)
  /admin/catalogs/:type         [Admin]       Editar catálogo (F2)
  /admin/purchases              [Admin]       Lotes de compra (F4)
  /admin/purchases/:id          [Admin]       Detalle lote + pago (F4)
  /admin/inventory              [Admin]       Inventario completo (F6)
  /admin/expenses               [Admin]       Gastos (F9)
  /admin/expenses/new           [Admin]       Nuevo gasto (F9)
  /admin/reports                [Admin]       Reportes (F10)
  /admin/reports/:type          [Admin]       Reporte específico (F10)
  /admin/users                  [Admin]       Usuarios (F1)
  /admin/security-log           [Admin]       Bitácora (NEXO-0023)
  /admin/corrections            [Admin]       Correcciones admin
```

### 2.2 Matriz Completa por Feature

| Feature | Pantalla | Rol | Tipo | Prioridad |
|---------|----------|-----|------|-----------|
| **F1** | Login | — | Form | P0 |
| **F1** | User menu (header) | Ambos | UI | P0 |
| **F2** | Lista de catálogos | Admin | List | P1 |
| **F2** | Editor de categorías | Admin | Form CRUD | P1 |
| **F2** | Editor de marcas | Admin | Form CRUD | P1 |
| **F2** | Editor de tallas | Admin | Form CRUD | P1 |
| **F2** | Editor de condiciones | Admin | Form CRUD | P1 |
| **F2** | Editor de colores | Admin | Form CRUD | P1 |
| **F3** | Nueva compra rápida | Operator | Form wizard | P0 |
| **F3** | Carrito de compra activo | Operator | List + actions | P0 |
| **F3** | Agregar prenda al carrito | Operator | Form modal | P0 |
| **F3** | Confirmar carrito → lote | Operator | Summary + confirm | P0 |
| **F4** | Lista de lotes | Admin | Table | P0 |
| **F4** | Detalle de lote | Admin | Detail + payment | P0 |
| **F4** | Registrar pago de lote | Admin | Form | P0 |
| **F5** | Ficha mínima de prenda | Operator | Form + photo | P0 |
| **F5** | Subir fotos | Operator | Upload | P0 |
| **F5** | Marcar como disponible | Operator | Toggle | P0 |
| **F6** | Búsqueda de inventario | Ambos | Search + grid | P1 |
| **F6** | Ficha completa de prenda | Ambos | Detail | P1 |
| **F6** | Cambiar estado de listado | Operator | Dropdown | P1 |
| **F6** | Stats de inventario | Admin | Dashboard | P1 |
| **F7** | Lista de clientes | Ambos | Search + list | P1 |
| **F7** | Nuevo/editar cliente | Operator | Form | P1 |
| **F7** | Ficha cliente + historial | Ambos | Detail | P1 |
| **F7** | Nuevo apartado | Operator | Form | P0 |
| **F7** | Apartados activos | Operator | List + actions | P0 |
| **F8** | Nueva venta MXN | Operator | Form | P0 |
| **F8** | Nueva venta USD | Operator | Form | P0 |
| **F8** | Lista de ventas | Ambos | Table | P0 |
| **F8** | Detalle de venta | Ambos | Detail | P0 |
| **F9** | Lista de gastos | Admin | Table | P0 |
| **F9** | Nuevo/editar gasto | Admin | Form | P0 |
| **F9** | Asignar gasto a lote | Admin | Form modal | P0 |
| **F10** | Dashboard de reportes | Admin | Grid cards | P0 |
| **F10** | Reporte de compras | Admin | Table + chart | P0 |
| **F10** | Reporte de ventas | Admin | Table + chart | P0 |
| **F10** | Reporte de inventario | Admin | Table + stats | P0 |
| **F10** | Reporte de ganancias | Admin | Summary cards | P0 |
| **F10** | Exportar reporte | Admin | Button | P0 |
| **F11** | Generar QR de prenda | Operator | Button | P1 |
| **F11** | Vista imprimible QR | Operator | Print layout | P1 |

**Total: 49 pantallas** (17 Operator, 32 Admin/ambas)

---

## 3. Árbol de Componentes Reutilizables

```
src/
├── components/
│   ├── ui/                         # Atomos de diseño
│   │   ├── Button.tsx              # <Button variant="primary|danger|ghost">
│   │   ├── Input.tsx               # <Input label error>
│   │   ├── Select.tsx              # <Select options>
│   │   ├── Textarea.tsx
│   │   ├── Badge.tsx               # <Badge variant="success|warning|danger">
│   │   ├── Modal.tsx               # <Modal open onClose>
│   │   ├── Card.tsx                # <Card>
│   │   ├── Table.tsx               # <Table columns data>
│   │   ├── Tabs.tsx                # <Tabs items>
│   │   ├── Toast.tsx               # Notificaciones
│   │   ├── Spinner.tsx             # Loading
│   │   ├── EmptyState.tsx          # "No hay datos"
│   │   └── ConfirmDialog.tsx       # "¿Estás seguro?"
│   │
│   ├── layout/                     # Estructura
│   │   ├── AppShell.tsx            # Sidebar + Header + Content
│   │   ├── Sidebar.tsx             # Navegación + rol
│   │   ├── Header.tsx              # Título + breadcrumb + user menu
│   │   ├── MobileNav.tsx           # Bottom nav para mobile
│   │   ├── PageHeader.tsx          # Título + acciones de la página
│   │   └── Container.tsx           # Max-width wrapper
│   │
│   ├── forms/                      # Campos compuestos
│   │   ├── FormField.tsx           # Label + Input + Error
│   │   ├── CurrencyInput.tsx       # USD/MXN con formato
│   │   ├── DatePicker.tsx          # Selector de fecha
│   │   ├── PhotoUpload.tsx         # Cámara/galería + preview
│   │   ├── SearchInput.tsx         # Búsqueda con debounce
│   │   └── CategoryPicker.tsx      # Select anidado (categoría > sub)
│   │
│   ├── business/                   # Componentes de dominio
│   │   ├── GarmentCard.tsx         # Card de prenda (foto, precio, estado)
│   │   ├── GarmentGrid.tsx         # Grid de GarmentCard
│   │   ├── GarmentForm.tsx         # Form completo de prenda
│   │   ├── CartItemRow.tsx         # Fila de item en carrito
│   │   ├── BatchSummary.tsx        # Resumen de lote (items, total)
│   │   ├── PaymentForm.tsx         # Form de pago (monto, método, evidencia)
│   │   ├── ReservationCard.tsx     # Card de apartado
│   │   ├── SaleLineItem.tsx        # Línea de venta
│   │   ├── CustomerCard.tsx        # Card de cliente
│   │   ├── ExchangeRateBadge.tsx   # USD → MXN conversion
│   │   ├── StatusBadge.tsx         # Estado de prenda/lote/reserva
│   │   ├── QRCode.tsx              # QR generado (SVG)
│   │   └── QRPrintLayout.tsx       # Layout para impresión de QRs
│   │
│   └── charts/                     # Reportes
│       ├── SimpleBarChart.tsx      # Barras (ventas por mes)
│       ├── SimplePieChart.tsx      # Pastel (inventario por estado)
│       └── SummaryCard.tsx         # Card con número grande
│
├── features/                       # Módulos por feature
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── useAuth.ts             # Hook: login, logout, refresh, session
│   │   └── AuthGuard.tsx          # Ruta protegida (reemplaza ProtectedRoute)
│   │
│   ├── catalogs/                   # F2
│   │   ├── CatalogListPage.tsx
│   │   ├── CatalogEditorPage.tsx
│   │   └── useCatalogs.ts
│   │
│   ├── purchases/                  # F3 + F4
│   │   ├── NewPurchasePage.tsx
│   │   ├── PurchaseCartPage.tsx
│   │   ├── AddGarmentModal.tsx
│   │   ├── ConfirmCartPage.tsx
│   │   ├── BatchListPage.tsx
│   │   ├── BatchDetailPage.tsx
│   │   ├── PaymentPage.tsx
│   │   └── usePurchases.ts
│   │
│   ├── inventory/                  # F5 + F6
│   │   ├── InventorySearchPage.tsx
│   │   ├── GarmentDetailPage.tsx
│   │   ├── GarmentEditPage.tsx
│   │   ├── InventoryStatsPage.tsx
│   │   └── useInventory.ts
│   │
│   ├── customers/                  # F7
│   │   ├── CustomerListPage.tsx
│   │   ├── CustomerDetailPage.tsx
│   │   ├── CustomerFormPage.tsx
│   │   └── useCustomers.ts
│   │
│   ├── reservations/               # F7
│   │   ├── ReservationListPage.tsx
│   │   ├── NewReservationPage.tsx
│   │   └── useReservations.ts
│   │
│   ├── sales/                      # F8
│   │   ├── NewSalePage.tsx
│   │   ├── SaleListPage.tsx
│   │   ├── SaleDetailPage.tsx
│   │   └── useSales.ts
│   │
│   ├── expenses/                   # F9
│   │   ├── ExpenseListPage.tsx
│   │   ├── ExpenseFormPage.tsx
│   │   ├── AllocateExpenseModal.tsx
│   │   └── useExpenses.ts
│   │
│   ├── reports/                    # F10
│   │   ├── ReportsDashboard.tsx
│   │   ├── PurchaseReport.tsx
│   │   ├── SalesReport.tsx
│   │   ├── InventoryReport.tsx
│   │   ├── ProfitReport.tsx
│   │   └── useReports.ts
│   │
│   ├── qr/                         # F11
│   │   ├── QRGenerateButton.tsx
│   │   ├── QRPrintPage.tsx
│   │   └── useQR.ts
│   │
│   ├── admin/                      # Admin-only
│   │   ├── AdminDashboard.tsx
│   │   ├── UserManagementPage.tsx
│   │   ├── CorrectionsPage.tsx
│   │   └── SecurityLogPage.tsx     # NEXO-0023
│   │
│   └── corrections/                # Correcciones admin
│       ├── CorrectionForm.tsx
│       └── useCorrections.ts
│
├── hooks/                          # Hooks globales
│   ├── useApi.ts                   # Fetch wrapper con JWT cookie
│   ├── useDebounce.ts
│   ├── useMediaQuery.ts            # Mobile detection
│   └── useOnlineStatus.ts          # PWA online/offline
│
├── lib/                            # Utilidades
│   ├── api-client.ts               # fetch wrapper: GET, POST, PUT, DELETE
│   ├── currency.ts                 # Formateo MXN/USD
│   ├── dates.ts                    # Formateo de fechas
│   └── validators.ts               # Zod schemas
│
├── stores/                         # Estado global (Zustand)
│   ├── auth-store.ts              # Session, role, tokens
│   └── ui-store.ts                # Sidebar state, modals, toasts
│
├── routes.tsx                      # Configuración de React Router
├── App.tsx                         # Punto de entrada (refactorizado)
├── main.tsx                        # Bootstrap
└── styles.css                      # CSS global + variables
```

---

## 4. Rutas — React Router Config

```typescript
// src/routes.tsx
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  // ── Público ──
  { path: "/login", element: <LoginPage /> },

  // ── Operator (y Admin) ──
  {
    path: "/",
    element: <AppShell />,        // Sidebar + Header
    loader: authLoader,          // Verifica sesión, redirige a /login
    children: [
      // Operator workspace
      {
        element: <RoleGuard roles={["Operator", "Admin"]} />,
        children: [
          { index: true, element: <Navigate to="/purchases/new" /> },
          { path: "purchases/new", element: <NewPurchasePage /> },
          { path: "purchases/cart/:cartId", element: <PurchaseCartPage /> },
          { path: "garments/:id", element: <GarmentDetailPage /> },
          { path: "garments/:id/edit", element: <GarmentEditPage /> },
          { path: "inventory", element: <InventorySearchPage /> },
          { path: "customers", element: <CustomerListPage /> },
          { path: "customers/new", element: <CustomerFormPage /> },
          { path: "customers/:id", element: <CustomerDetailPage /> },
          { path: "reservations", element: <ReservationListPage /> },
          { path: "reservations/new", element: <NewReservationPage /> },
          { path: "sales/new", element: <NewSalePage /> },
          { path: "sales", element: <SaleListPage /> },
          { path: "sales/:id", element: <SaleDetailPage /> },
        ]
      },

      // ── Admin only ──
      {
        element: <RoleGuard roles={["Admin"]} />,
        children: [
          { path: "admin", element: <AdminDashboard /> },
          { path: "admin/catalogs", element: <CatalogListPage /> },
          { path: "admin/catalogs/:type", element: <CatalogEditorPage /> },
          { path: "admin/purchases", element: <BatchListPage /> },
          { path: "admin/purchases/:id", element: <BatchDetailPage /> },
          { path: "admin/purchases/:id/payment", element: <PaymentPage /> },
          { path: "admin/inventory/stats", element: <InventoryStatsPage /> },
          { path: "admin/expenses", element: <ExpenseListPage /> },
          { path: "admin/expenses/new", element: <ExpenseFormPage /> },
          { path: "admin/reports", element: <ReportsDashboard /> },
          { path: "admin/reports/:type", element: <ReportPage /> },
          { path: "admin/users", element: <UserManagementPage /> },
          { path: "admin/security-log", element: <SecurityLogPage /> },
          { path: "admin/corrections", element: <CorrectionsPage /> },
        ]
      }
    ]
  }
]);
```

---

## 5. Dependencias Frontend Requeridas

```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7",        // Navegación
    "zustand": "^5",                 // Estado global (auth, UI)
    "zod": "^3",                     // Validación de formularios
    "react-hook-form": "^7",         // Manejo de formularios
    "@tanstack/react-query": "^5",   // Data fetching + caching
    "lucide-react": "^0",            // Iconos
    "qrcode": "^1"                   // Generación QR (F11)
  },
  "devDependencies": {
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/qrcode": "^1",
    "typescript": "^5.8",
    "vite": "^7",
    "@vitejs/plugin-react": "^4",
    "vitest": "^3",
    "@testing-library/react": "^16"
  }
}
```

**No usar Tailwind/CSS-in-JS** — mantener CSS vanilla con variables CSS para
mantener el bundle pequeño y el PWA rápido.

---

## 6. Flujos Clave

### 6.1 Compra Rápida (F3 — Operator, mobile-first)

```
Pantalla 1: Nueva Compra
┌─────────────────────────────┐
│ ← Volver          Nueva Compra │
│                                 │
│ 📍 Tienda: [Select]          │
│ 💰 Tipo Precio: ○Ticket ○Est. │
│ 📷 Evidencia: [Tomar foto]   │
│                                 │
│ ┌─────────────────────────┐   │
│ │ PRENDAS EN CARRITO (0)  │   │
│ │ [+ Agregar prenda]      │   │
│ └─────────────────────────┘   │
│                                 │
│ Total USD: $0.00              │
│ Total MXN: $0.00              │
│                                 │
│ [  CONFIRMAR COMPRA  ]  ← disabled si 0 items
└─────────────────────────────┘

Pantalla 2: Agregar Prenda (modal desde Pantalla 1)
┌─────────────────────────────┐
│         Agregar Prenda       │
│                                 │
│ Categoría: [Select]          │
│ Marca:     [Select]          │
│ Talla:     [Select]          │
│ Condición: [Select]          │
│ Color:     [Select]          │
│                                 │
│ Precio USD: [$ 0.00]        │
│ ¿Es oferta?: ○Sí ○No        │
│                                 │
│ 📷 Foto rápida (opcional):  │
│ [📸 Tomar foto]              │
│                                 │
│ [  AGREGAR AL CARRITO  ]     │
│ [  Cancelar ]                │
└─────────────────────────────┘

Pantalla 3: Confirmación
┌─────────────────────────────┐
│        Confirmar Compra      │
│                                 │
│ Tienda: Target               │
│ Fecha: 06/07/2026            │
│                                 │
│ Items (5):                    │
│ ┌─────────────────────────┐   │
│ │ 👕 Nike M - $15.99      │   │
│ │ 👖 Levis 32 - $24.99    │   │
│ │ ...                      │   │
│ └─────────────────────────┘   │
│                                 │
│ Total: $87.45 USD             │
│ TC: $17.50 (estimado Banxico)│
│ ≈ $1,530.38 MXN              │
│                                 │
│ [  CONFIRMAR Y CREAR LOTE  ] │
│ [  Seguir agregando ]       │
└─────────────────────────────┘
```

### 6.2 Venta Rápida (F8 — Operator, mobile-first)

```
Pantalla: Nueva Venta
┌─────────────────────────────┐
│ ← Volver          Nueva Venta│
│                                 │
│ 👤 Cliente: [Buscar/Crear]  │
│                                 │
│ Moneda: ○MXN  ○USD          │
│                                 │
│ PRENDAS A VENDER:            │
│ [🔍 Buscar por código/QR]   │
│ ┌─────────────────────────┐   │
│ │ 👕 Nike M - $350 MXN   │ ✕ │
│ │ 👖 Levis 32 - $450 MXN │ ✕ │
│ └─────────────────────────┘   │
│ [+ Agregar prenda]           │
│                                 │
│ Subtotal: $800.00 MXN        │
│                                 │
│ 💳 Método de pago:           │
│ ○ Efectivo  ○ Tarjeta       │
│ ○ Transferencia              │
│                                 │
│ [  REGISTRAR VENTA  ]        │
└─────────────────────────────┘
```

### 6.3 Apartado (F7 — Operator)

```
Pantalla: Nuevo Apartado
┌─────────────────────────────┐
│ ← Volver       Nuevo Apartado│
│                                 │
│ 👤 Cliente: [Buscar/Crear]  │
│                                 │
│ Prenda: [🔍 Buscar]         │
│ ┌─────────────────────────┐   │
│ │ 👕 Nike M - $350 MXN   │   │
│ │ Estado: Disponible      │   │
│ └─────────────────────────┘   │
│                                 │
│ 💵 Abono (opcional):         │
│ [$ 0.00]                     │
│                                 │
│ 📅 Vence en: [7] días       │
│                                 │
│ [  CREAR APARTADO  ]         │
└─────────────────────────────┘
```

---

## 7. Data Flow — Estado y API Client

```
┌──────────────────────────────────────────────────────────┐
│                     Frontend PWA                          │
│                                                           │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐   │
│  │ Zustand   │    │ TanStack │    │  React Router     │   │
│  │ AuthStore │    │ Query    │    │  (loaders)        │   │
│  │          │    │ Cache    │    │                   │   │
│  │ session  │    │ garments│    │  authLoader()     │   │
│  │ role     │    │ batches │    │  ── verifica      │   │
│  │ login()  │    │ sales   │    │     sesión antes  │   │
│  │ logout() │    │ catalogs│    │     de cada ruta  │   │
│  │ refresh()│    │ ...     │    │                   │   │
│  └────┬─────┘    └────┬─────┘    └────────┬──────────┘   │
│       │               │                   │               │
│       └───────────────┼───────────────────┘               │
│                       │                                   │
│              ┌────────▼────────┐                          │
│              │   api-client.ts  │                          │
│              │                  │                          │
│              │ fetch() wrapper  │                          │
│              │ - credentials:   │                          │
│              │   "include"      │  ← envía cookies JWT    │
│              │ - base URL       │                          │
│              │ - refresh on 401 │  ← si access expira     │
│              │ - error handling │                          │
│              └────────┬────────┘                          │
└───────────────────────┼──────────────────────────────────┘
                        │
               ┌────────▼────────┐
               │  NestJS Backend  │
               │  /api/v1/*       │
               └─────────────────┘
```

### api-client.ts (core)

```typescript
// src/lib/api-client.ts

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

async function refreshAccessToken(): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  return res.ok;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 401 && !path.includes("/auth/")) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new ApiError(res.status, error.message ?? "Error");
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
```

---

## 8. Mobile-First Responsive Strategy

| Breakpoint | Layout | Comportamiento |
|------------|--------|----------------|
| **< 640px** (móvil) | Single column, bottom nav | Sidebar → bottom tab bar; forms full-width; fotos con cámara nativa (`capture` attribute) |
| **640-1024px** (tablet) | Sidebar collapsible | Sidebar como drawer; grids de 2 columnas |
| **> 1024px** (desktop) | Sidebar fijo 280px | Vista completa para admin/reportes |

```css
/* Variables CSS globales */
:root {
  --color-bg: #f6f4ef;
  --color-surface: #fffdf8;
  --color-text: #101820;
  --color-text-secondary: #5a5348;
  --color-primary: #1a5f4a;
  --color-danger: #c44;
  --color-warning: #e6a817;
  --color-success: #2d8a4e;
  --sidebar-width: 280px;
  --header-height: 56px;
  --bottom-nav-height: 60px;
}
```

---

## 9. Fases de Implementación del Frontend

| Fase | Features | Pantallas nuevas | Dependencias | Tiempo est. |
|------|----------|-----------------|--------------|-------------|
| **Setup** | Router, API client, Zustand, layout | AppShell, Sidebar, Header, MobileNav, LoginPage | react-router-dom, zustand, @tanstack/react-query, lucide-react | 2-3h |
| **F2** | Catálogos operativos | CatalogList, CatalogEditor | — | 3-4h |
| **F3** | Compra rápida | NewPurchase, PurchaseCart, AddGarment, ConfirmCart | — | 5-7h |
| **F4** | Pagos y lotes | BatchList, BatchDetail, PaymentPage | — | 3-4h |
| **F5** | Ficha mínima | GarmentEdit, PhotoUpload | — | 4-5h |
| **F6** | Inventario | InventorySearch, InventoryStats, GarmentDetail | @tanstack/react-query (infinite scroll) | 4-5h |
| **F7** | Clientes + Apartados | Customer*, Reservation* | — | 4-5h |
| **F8** | Ventas MXN/USD | NewSale, SaleList, SaleDetail | — | 4-5h |
| **F9** | Gastos | ExpenseList, ExpenseForm, AllocateExpense | — | 3-4h |
| **F10** | Reportes | ReportsDashboard, 4 reportes, export | SimpleBarChart, SimplePieChart | 4-5h |
| **F11** | QR | QRGenerate, QRPrint | qrcode | 2-3h |
| **NEXO-0023** | Security log | SecurityLogPage | — | 1-2h |

**Total estimado: 40-52 horas de frontend** (paralelizable con backend).

---

## 10. Estructura Final de Archivos

```
front/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   ├── manifest.webmanifest
│   └── icons/                    # PWA icons 192, 512
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes.tsx
│   ├── styles.css
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── ui/                   # 14 átomos
│   │   ├── layout/               # 6 layout
│   │   ├── forms/                # 6 form fields
│   │   ├── business/             # 12 dominio
│   │   └── charts/               # 3 charts
│   ├── features/
│   │   ├── auth/                 # 3 files
│   │   ├── catalogs/             # 3 files
│   │   ├── purchases/            # 8 files
│   │   ├── inventory/            # 5 files
│   │   ├── customers/            # 4 files
│   │   ├── reservations/         # 3 files
│   │   ├── sales/                # 4 files
│   │   ├── expenses/             # 4 files
│   │   ├── reports/              # 6 files
│   │   ├── qr/                   # 3 files
│   │   ├── admin/                # 4 files
│   │   └── corrections/          # 2 files
│   ├── hooks/                    # 4 hooks
│   ├── lib/                      # 4 utils
│   └── stores/                   # 2 stores
```

**Total: ~90 archivos frontend** (49 pantallas + ~41 componentes/utils).

---

## 11. Próximo Paso Recomendado

1. **Setup phase**: instalar dependencias, crear router + api-client + layout + login real
2. **F2**: catálogos (es la siguiente feature del backend también — NEXO-0008)
3. Avanzar en paralelo con backend feature por feature
