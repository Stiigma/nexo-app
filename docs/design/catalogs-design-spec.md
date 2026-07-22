# Nexo Catalogs — Design Specification (F2)

## Metadata

- Document: diseño completo de la feature de catálogos operativos
- Fecha: 2026-07-07
- Agente: nexo-design
- Basado en: `NEXO_PROJECT.md`, `plans/NEXO-0008-operational-catalogs.md`,
  `nexo-v1-frontend-complete-design.md`, tracer bullet existente
  (`ClothingTypesPage`), ADR-2026-07-07 frontend feature module structure
- Receiving agent: `nexo-build`
- Decisiones de diseño: sustituye la nota "No usar Tailwind" del doc de diseño
  v1; shadcn/ui + Tailwind es ahora el sistema de diseño adoptado

---

## 1. Decisión clave: patrón "Catalog Entity Config"

### Problema

F2 tiene **9 entidades de catálogo** casi idénticas:

| Entidad | Campos propios | Campos comunes |
|---------|----------------|----------------|
| Stores | name, address, city, state, defaultTaxRate | id, active, createdAt, updatedAt |
| Brands | name, metadata (JSON) | id, active, ... |
| Clothing Types | sectionId, nameEn, nameEs, displayOrder, metadata | id, active, ... |
| Categories | name | id, active, ... |
| Sizes | name, displayOrder | id, active, ... |
| Conditions | name, displayOrder | id, active, ... |
| Colors | name, hex | id, active, ... |
| Payment Methods | name | id, active, ... |
| Expense Types | name | id, active, ... |
| Difference Reasons | name | id, active, ... |

Todas necesitan: **tabla paginada + búsqueda + crear/editar modal + toggle activo + eliminar**.

Construir 9 páginas separadas = **9× duplicación**, 9× mantenimiento, 9× riesgo
de inconsistencia.

### Solución

Una **infraestructura genérica** que se configura por entidad. Cada entidad es
un archivo de configuración. El 90% del código vive una sola vez.

```
┌──────────────────────────────────────────────────────────┐
│  CatalogsPage (contenedor con Tabs)                      │
│  └── CatalogEntityView config={activeConfig}             │
│       ├── CatalogToolbar   (search + "Nuevo" button)     │
│       ├── CatalogDataTable (tabla genérica)              │
│       │    └── useCatalogList(config, filters)           │
│       ├── CatalogFormDialog (crear/editar genérico)      │
│       │    └── useCatalogCreate(config)                  │
│       │       / useCatalogUpdate(config)                 │
│       └── CatalogDeleteDialog (confirmación)             │
│            └── useCatalogDelete(config)                  │
└──────────────────────────────────────────────────────────┘
```

**Cada entidad se agrega en ~40 líneas de configuración**, no en una página
completa.

---

## 2. Arquitectura de código

### 2.1 Estructura de archivos

```
front/src/features/catalogs/
├── types/
│   ├── index.ts
│   ├── catalog-entity.ts          ← CatEntity base, CatField, CatColumn, CatConfig
│   └── entities/
│       ├── store.ts               ← StoreEntity type + zod schema + config
│       ├── brand.ts
│       ├── clothing-type.ts       ← (migra el tracer bullet existente)
│       ├── category.ts
│       ├── size.ts
│       ├── condition.ts
│       ├── color.ts
│       ├── payment-method.ts
│       ├── expense-type.ts
│       └── difference-reason.ts
├── services/
│   ├── catalog-service.ts         ← Factory: createCatalogService(config)
│   └── index.ts
├── hooks/
│   ├── use-catalog-list.ts        ← useQuery genérico paginado
│   ├── use-catalog-create.ts      ← useMutation genérico
│   ├── use-catalog-update.ts      ← useMutation genérico
│   ├── use-catalog-toggle.ts      ← useMutation genérico (active/inactive)
│   ├── use-catalog-delete.ts      ← useMutation genérico
│   ├── use-debounced-search.ts    ← Hook utilitario (debounce 300ms)
│   └── index.ts
├── helpers/
│   ├── build-query-params.ts      ← Convierte filtros → query params
│   ├── format-cell.ts             ← Formateadores por tipo de campo
│   └── index.ts
├── store/
│   ├── catalog-ui-store.ts        ← Zustand: tab activo, modal state
│   └── index.ts
├── components/
│   ├── CatalogTabs.tsx            ← Tabs para cambiar entre entidades
│   ├── CatalogEntityView.tsx      ← Contenedor principal (recibe config)
│   ├── CatalogToolbar.tsx         ← Search + "Nuevo" + filtros
│   ├── CatalogDataTable.tsx       ← Tabla genérica (shadcn Table)
│   ├── CatalogFormDialog.tsx      ← Dialog crear/editar (shadcn Dialog + Form)
│   ├── CatalogDeleteDialog.tsx    ← AlertDialog confirmación
│   ├── CatalogEmptyState.tsx      ← Estado vacío con CTA
│   ├── CatalogErrorState.tsx      ← Estado de error con retry
│   ├── CatalogLoadingState.tsx    ← Skeleton rows
│   └── index.ts
├── config/
│   └── registry.ts                ← Array de las 9 configs, orden de tabs
└── views/
    ├── CatalogsPage.tsx           ← Página: <CatalogTabs registry={...} />
    └── index.ts
```

### 2.2 El "Catalog Entity Config" — interfaz central

```typescript
// features/catalogs/types/catalog-entity.ts
import type { ZodSchema } from "zod";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Toda entidad de catálogo tiene estos campos base */
export interface CatEntity {
  id: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Tipos de campo soportados en el form automático */
export type CatFieldType =
  | "text"
  | "number"
  | "boolean"     // → Switch
  | "select"      // → Select con options
  | "textarea";

/** Definición de un campo del formulario */
export interface CatField {
  name: string;
  label: string;
  type: CatFieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];  // solo para select
  fullWidth?: boolean;        // ocupa 2 columnas en el grid del form
  hint?: string;              // texto de ayuda bajo el campo
}

/** Definición de una columna de la tabla */
export interface CatColumn<T extends CatEntity> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  hideOnMobile?: boolean;     // se oculta en pantallas pequeñas
}

/** Configuración completa de una entidad de catálogo */
export interface CatConfig<T extends CatEntity = CatEntity> {
  // Identidad
  key: string;                // "stores" — usado en queryKey, URL, store
  label: string;              // "Tiendas" — tab label, headers
  singular: string;           // "Tienda" — "Nueva Tienda", "Eliminar Tienda"
  description: string;        // "Tiendas donde se compran prendas"
  icon: LucideIcon;

  // API
  basePath: string;           // "/catalogs/stores"

  // Validación
  schema: ZodSchema<T>;       // zod schema para el formulario

  // Tabla
  columns: CatColumn<T>[];

  // Formulario
  fields: CatField[];

  // Defaults para el form de creación
  defaultValues: Partial<T>;

  // Permiso (todas son Admin-only para mutaciones, pero la lectura es Access)
  // No se configura aquí — lo maneja AuthGuard a nivel de ruta.
}
```

### 2.3 Ejemplo: configuración de "Stores"

```typescript
// features/catalogs/types/entities/store.ts
import { z } from "zod";
import { Store } from "lucide-react";
import type { CatConfig } from "../catalog-entity";
import type { CatEntity } from "../catalog-entity";

export interface StoreEntity extends CatEntity {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  defaultTaxRate: number;
}

export const storeSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  defaultTaxRate: z.coerce.number().min(0).max(1).default(0.0875),
  active: z.boolean().default(true),
});

export const storeConfig: CatConfig<StoreEntity> = {
  key: "stores",
  label: "Tiendas",
  singular: "Tienda",
  description: "Tiendas donde se compran prendas en Estados Unidos.",
  icon: Store,
  basePath: "/catalogs/stores",
  schema: storeSchema,
  columns: [
    { key: "name", header: "Nombre", render: (r) => r.name, sortable: true },
    { key: "city", header: "Ciudad", render: (r) => r.city ?? "—", hideOnMobile: true },
    { key: "state", header: "Estado", render: (r) => r.state ?? "—", hideOnMobile: true },
    {
      key: "defaultTaxRate",
      header: "Tax",
      render: (r) => `${(r.defaultTaxRate * 100).toFixed(2)}%`,
      width: "80px",
    },
    // active y actions columns las añade CatalogDataTable automáticamente
  ],
  fields: [
    { name: "name", label: "Nombre", type: "text", required: true, placeholder: "Walmart" },
    { name: "address", label: "Dirección", type: "text", fullWidth: true },
    { name: "city", label: "Ciudad", type: "text" },
    { name: "state", label: "Estado", type: "text", placeholder: "CA" },
    { name: "defaultTaxRate", label: "Tax rate", type: "number", hint: "0.0875 = 8.75%" },
  ],
  defaultValues: { defaultTaxRate: 0.0875, active: true },
};
```

**Una entidad = ~50 líneas.** Las 9 entidades son ~450 líneas de config vs
~2,000+ líneas si hiciéramos 9 páginas separadas.

### 2.4 Service factory genérico

```typescript
// features/catalogs/services/catalog-service.ts
import { api } from "@/common/services/api-client";
import type { PaginatedResponse, ApiFilters } from "@/common/types";
import type { CatConfig, CatEntity } from "../types/catalog-entity";

export function createCatalogService<T extends CatEntity>(config: CatConfig<T>) {
  return {
    list: (filters: ApiFilters) =>
      api.get<PaginatedResponse<T>>(config.basePath, { params: filters }),

    create: <D extends Record<string, unknown>>(data: D) =>
      api.post<T>(config.basePath, data),

    update: (id: string, data: Partial<T>) =>
      api.put<T>(`${config.basePath}/${id}`, data),

    toggleActive: (id: string, active: boolean) =>
      api.patch<T>(`${config.basePath}/${id}/active`, { active }),

    remove: (id: string) =>
      api.delete<void>(`${config.basePath}/${id}`),
  };
}

export type CatalogService<T extends CatEntity> =
  ReturnType<typeof createCatalogService<T>>;
```

### 2.5 Hooks genéricos

```typescript
// features/catalogs/hooks/use-catalog-list.ts
import { useQuery } from "@tanstack/react-query";
import { createCatalogService } from "../services/catalog-service";
import { buildQueryParams } from "../helpers/build-query-params";
import type { CatConfig, CatEntity } from "../types/catalog-entity";
import type { ApiFilters } from "@/common/types";

export function useCatalogList<T extends CatEntity>(
  config: CatConfig<T>,
  filters: ApiFilters
) {
  const service = createCatalogService(config);
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: [config.key, "list", params] as const,
    queryFn: () => service.list(params),
    placeholderData: (prev) => prev,   // keepPreviousData — sin flash al paginar
  });
}
```

```typescript
// features/catalogs/hooks/use-catalog-create.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCatalogService } from "../services/catalog-service";
import type { CatConfig, CatEntity } from "../types/catalog-entity";

export function useCatalogCreate<T extends CatEntity>(config: CatConfig<T>) {
  const qc = useQueryClient();
  const service = createCatalogService(config);

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => service.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [config.key, "list"] });
    },
  });
}
```

(Patrón idéntico para `useCatalogUpdate`, `useCatalogToggle`, `useCatalogDelete`.)

### 2.6 Store de UI (Zustand)

```typescript
// features/catalogs/store/catalog-ui-store.ts
import { create } from "zustand";
import type { CatEntity } from "../types/catalog-entity";

interface CatalogUIState {
  // Tab activo
  activeKey: string;
  setActiveKey: (key: string) => void;

  // Búsqueda (por entidad, persiste al cambiar de tab)
  searchByEntity: Record<string, string>;
  setSearch: (key: string, query: string) => void;

  // Página actual (por entidad)
  pageByEntity: Record<string, number>;
  setPage: (key: string, page: number) => void;

  // Modal de crear/editar
  formOpen: boolean;
  formMode: "create" | "edit";
  editingEntity: CatEntity | null;
  openCreate: () => void;
  openEdit: (entity: CatEntity) => void;
  closeForm: () => void;

  // Confirmación de eliminar
  deleteTarget: CatEntity | null;
  openDeleteConfirm: (entity: CatEntity) => void;
  closeDeleteConfirm: () => void;
}

export const useCatalogUIStore = create<CatalogUIState>((set) => ({
  activeKey: "stores",
  setActiveKey: (activeKey) => set({ activeKey }),

  searchByEntity: {},
  setSearch: (key, query) =>
    set((s) => ({ searchByEntity: { ...s.searchByEntity, [key]: query } })),

  pageByEntity: {},
  setPage: (key, page) =>
    set((s) => ({ pageByEntity: { ...s.pageByEntity, [key]: page } })),

  formOpen: false,
  formMode: "create",
  editingEntity: null,
  openCreate: () => set({ formOpen: true, formMode: "create", editingEntity: null }),
  openEdit: (entity) =>
    set({ formOpen: true, formMode: "edit", editingEntity: entity }),
  closeForm: () => set({ formOpen: false, editingEntity: null }),

  deleteTarget: null,
  openDeleteConfirm: (entity) => set({ deleteTarget: entity }),
  closeDeleteConfirm: () => set({ deleteTarget: null }),
}));
```

### 2.7 Registry de entidades

```typescript
// features/catalogs/config/registry.ts
import { storeConfig } from "../types/entities/store";
import { brandConfig } from "../types/entities/brand";
import { clothingTypeConfig } from "../types/entities/clothing-type";
import { categoryConfig } from "../types/entities/category";
import { sizeConfig } from "../types/entities/size";
import { conditionConfig } from "../types/entities/condition";
import { colorConfig } from "../types/entities/color";
import { paymentMethodConfig } from "../types/entities/payment-method";
import { expenseTypeConfig } from "../types/entities/expense-type";
import { differenceReasonConfig } from "../types/entities/difference-reason";
import type { CatConfig } from "../types/catalog-entity";

export const CATALOG_REGISTRY: CatConfig[] = [
  storeConfig,
  brandConfig,
  clothingTypeConfig,
  categoryConfig,
  sizeConfig,
  conditionConfig,
  colorConfig,
  paymentMethodConfig,
  expenseTypeConfig,
  differenceReasonConfig,
];
```

---

## 3. Diseño visual — shadcn/ui

### 3.1 Sistema de diseño adoptado

Se adopta **shadcn/ui + Tailwind CSS** como sistema de diseño. Esto sustituye
la nota "No usar Tailwind/CSS-in-JS" del doc `nexo-v1-frontend-complete-design.md`
línea 475. Justificación: shadcn da componentes accesibles, profesionales y
consistentes sin requerir diseño manual; los componentes son copy-paste (no
npm dependency) y se personalizan vía CSS variables.

### 3.2 Componentes shadcn a usar en catálogos

| Componente shadcn | Uso en catálogos |
|-------------------|------------------|
| `Tabs` | Navegación entre las 9 entidades |
| `Table` + `TableHeader/Body/Row/Cell` | `CatalogDataTable` |
| `Dialog` + `DialogContent/Header/Footer` | `CatalogFormDialog` (crear/editar) |
| `AlertDialog` | `CatalogDeleteDialog` (confirmar eliminar) |
| `Form` + `FormField/Item/Control/Label/Message` | Formulario automático |
| `Input` | Campos de texto |
| `Select` | Campos tipo `select` |
| `Switch` | Campo `boolean` (activo/inactivo) |
| `Button` | Acciones: "Nuevo", "Guardar", "Cancelar", "Eliminar" |
| `Badge` | Estado activo/inactivo en tabla |
| `Pagination` (componente propio sobre shadcn) | Paginación de la tabla |
| `Skeleton` | `CatalogLoadingState` |
| `Sonner` (toast) | Feedback de éxito/error en mutaciones |
| `Tooltip` | Etiquetas en botones de acción (edit/eliminar) |
| `DropdownMenu` | Menú de acciones por fila (editar, toggle, eliminar) |

### 3.3 Layout de la pantalla

```
Desktop (>760px):
┌─────────────────────────────────────────────────────────────┐
│ Sidebar │ Header: "Catálogos"  [Admin]                       │
│         │                                                      │
│         │ ┌──────────────────────────────────────────────────┐│
│         │ │ [Tiendas] [Marcas] [Tipos] [Categorías] [Tallas] ││  ← Tabs (scroll horizontal si overflow)
│         │ │ [Condiciones] [Colores] [Pagos] [Gastos] [Dif.]  ││
│         │ ├──────────────────────────────────────────────────┤│
│         │ │ 🔍 Buscar tienda...          [+ Nueva Tienda]    ││  ← Toolbar
│         │ ├──────────────────────────────────────────────────┤│
│         │ │ Nombre      Ciudad    Estado  Tax    Activo  ⋯  ││  ← Table header
│         │ │ Walmart     Ensenada  BC      8.75%  ● Sí   ⋯   ││
│         │ │ Target      San Diego CA      7.75%  ● Sí   ⋯   ││
│         │ │ Gap         —         —       0%     ○ No   ⋯   ││
│         │ ├──────────────────────────────────────────────────┤│
│         │ │ Mostrando 1-10 de 25              ← 1 2 3 ... → ││  ← Pagination
│         │ └──────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘

Mobile (<760px):
┌──────────────────────────────┐
│ Header: "Catálogos" [Admin]   │
│                              │
│ [Tiendas] [Marcas] [Tipos] → │  ← Tabs scroll horizontal
│ ┌──────────────────────────┐ │
│ │ 🔍 Buscar...   [+ Nuevo] │ │  ← Toolbar apilado
│ ├──────────────────────────┤ │
│ │ Nombre           Tax  ⋯  │ │  ← Table (columnas hideOnMobile ocultas)
│ │ Walmart           8.75% ⋯ │ │
│ │ Target            7.75% ⋯ │ │
│ ├──────────────────────────┤ │
│ │ 1-10 de 25      ← 1 2 →  │ │
│ └──────────────────────────┘ │
│                              │
│ [Captura] [Inventario] [Rep] │  ← MobileNav (bottom)
└──────────────────────────────┘
```

### 3.4 Modal de crear/editar (Dialog)

```
┌──────────────────────────────┐
│  ✕                           │
│  Nueva Tienda                 │  ← DialogTitle
│  Crea una tienda para compras │  ← DialogDescription
│                              │
│  ┌────────────┐  ┌─────────┐ │
│  │ Nombre *   │  │ Tax rate│ │
│  │ [Walmart ] │  │ [0.0875]│ │  ← grid 2 columnas
│  │            │  │ 0.0875= │ │
│  │            │  │ 8.75%   │ │  ← hint
│  └────────────┘  └─────────┘ │
│  ┌──────────────────────────┐│
│  │ Dirección                ││  ← fullWidth
│  │ [________________]       ││
│  └──────────────────────────┘│
│  ┌────────────┐  ┌─────────┐ │
│  │ Ciudad     │  │ Estado  │ │
│  │ [Ensenada] │  │ [BC   ] │ │
│  └────────────┘  └─────────┘ │
│                              │
│  [Cancelar]      [Guardar]   │  ← DialogFooter
└──────────────────────────────┘

Validación inline:
┌──────────────────────────────┐
│  Nombre *                    │
│  [                  ]         │
│  ⚠ El nombre es obligatorio  │  ← FormMessage (red)
└──────────────────────────────┘
```

### 3.5 Confirmación de eliminar (AlertDialog)

```
┌──────────────────────────────┐
│  ⚠  Eliminar tienda          │
│                              │
│  ¿Seguro que quieres eliminar │
│  "Walmart"? Esta acción no   │
│  se puede deshacer.          │
│                              │
│  Los registros históricos    │
│  no se afectan.              │  ← hint de dominio
│                              │
│  [Cancelar]    [Eliminar]    │  ← Button variant="destructive"
└──────────────────────────────┘
```

---

## 4. Estados visuales

Cada estado debe ser explícito y accionable.

### 4.1 Loading (carga inicial)

- `CatalogDataTable` muestra 5-8 filas de `Skeleton` con la misma estructura
  de columnas que la tabla real.
- El botón "Nuevo" stays enabled (no bloquea la creación mientras carga).

### 4.2 Empty (sin datos, primera vez)

```
┌──────────────────────────────────┐
│           🏪                     │  ← icono de la entidad
│                                  │
│    Aún no hay tiendas            │
│    Crea tu primera tienda para   │
│    registrar compras.            │
│                                  │
│      [+ Nueva Tienda]            │  ← CTA button
└──────────────────────────────────┘
```

### 4.3 Search sin resultados

```
┌──────────────────────────────────┐
│           🔍                     │
│                                  │
│  No se encontraron tiendas con   │
│  "xyz".                          │
│                                  │
│      [Limpiar búsqueda]          │  ← limpia el input
└──────────────────────────────────┘
```

### 4.4 Error de carga

```
┌──────────────────────────────────┐
│           ⚠️                     │
│                                  │
│  No se pudieron cargar las       │
│  tiendas.                        │
│                                  │
│  Error: <mensaje del backend>    │  ← texto del ApiError
│                                  │
│      [Reintentar]                │  ← refetch de TanStack Query
└──────────────────────────────────┘
```

### 4.5 Mutation loading

- Botón "Guardar" muestra `Loader2` spinner + texto "Guardando...".
- Botón deshabilitado.
- Inputs del form se vuelven `readOnly` (no `disabled` para no perder el foco
  visual).

### 4.6 Mutation success

- Toast (Sonner): "✓ Tienda creada" / "✓ Tienda actualizada" / "✓ Tienda
  eliminada".
- Dialog se cierra.
- Tabla se refresca automáticamente (invalidación de queryKey).

### 4.7 Mutation error

- Toast (Sonner) variant destructive: "✗ No se pudo crear la tienda: <mensaje>".
- Dialog permanece abierto con los datos intactos.
- Si es error de validación del backend (400), los errores se mapean a los
  campos del form vía `setError`.

### 4.8 Toggle activo/inactivo

- Click directo en el `Badge` de la columna "Activo" → toggle inmediato
  (optimistic update: el badge cambia al instante, si falla revierte).
- Toast: "✓ Tienda desactivada" / "✓ Tienda activada".

### 4.9 Permission denied

- Si un Operator llega a `/admin/catalogs`, `AuthGuard` bloquea a nivel de
  ruta (ya implementado). No se necesita estado adicional en la pantalla.

---

## 5. Flujos de usuario

### 5.1 Flujo: crear entidad

1. Admin navega a `/admin/catalogs`.
2. Ve tabs con las 9 entidades. Tab "Tiendas" activo por defecto.
3. Ve la tabla de tiendas existentes (o empty state si no hay).
4. Click "Nueva Tienda".
5. Se abre `CatalogFormDialog` con campos vacíos + defaults.
6. Llena el form. Validación en blur (zod).
7. Click "Guardar". Botón muestra spinner.
8. `useCatalogCreate` mutation ejecuta.
9. On success: toast "Tienda creada", dialog cierra, tabla refresca.
10. On error: toast rojo, dialog permanece.

### 5.2 Flujo: editar entidad

1. En la tabla, click botón "Editar" (lápiz) en la fila, O click en el
   `DropdownMenu` (⋯) → "Editar".
2. Se abre `CatalogFormDialog` en modo edit, con los datos cargados.
3. Modifica campos.
4. Click "Guardar".
5. `useCatalogUpdate` mutation ejecuta.
6. On success: toast "Tienda actualizada", dialog cierra, tabla refresca.

### 5.3 Flujo: desactivar/activar

1. En la tabla, click en el `Badge` "Sí"/"No" de la columna Activo.
2. `useCatalogToggle` mutation ejecuta (optimistic).
3. Badge cambia al instante.
4. On success: toast "Tienda desactivada".
5. On error: badge revierte, toast rojo.

### 5.4 Flujo: eliminar

1. Click `DropdownMenu` (⋯) → "Eliminar".
2. Se abre `AlertDialog` de confirmación.
3. Click "Eliminar" (botón rojo).
4. `useCatalogDelete` mutation ejecuta.
5. On success: toast "Tienda eliminada", tabla refresca.

### 5.5 Flujo: buscar

1. Escribir en el input "Buscar tienda...".
2. `useDebouncedSearch` espera 300ms sin cambios.
3. Se actualiza el queryKey de `useCatalogList` con el nuevo search.
4. TanStack Query refetch. Tabla muestra nueva data.
5. Mientras carga, `placeholderData` mantiene la data anterior (sin flash).
6. Si no hay resultados, se muestra estado "Search sin resultados".

### 5.6 Flujo: paginar

1. Click en número de página o flecha en `Pagination`.
2. Store actualiza `pageByEntity[key]`.
3. `useCatalogList` refetch con la nueva página.
4. `placeholderData` mantiene data anterior mientras carga.
5. Scroll al top de la tabla.

### 5.7 Flujo: cambiar de entidad (tab)

1. Click en otro tab (ej. "Marcas").
2. Store actualiza `activeKey`.
3. `CatalogEntityView` renderiza con el config de "Marcas".
4. Búsqueda y página se preservan por entidad (vía `searchByEntity`/`pageByEntity`).
5. `useCatalogList` de marcas ejecuta si no está cacheado.

---

## 6. Responsive behavior

| Breakpoint | Tabs | Toolbar | Tabla | Pagination |
|------------|------|---------|-------|------------|
| **< 640px** | Scroll horizontal, tab compacto | Stack vertical: search arriba, button abajo | Columnas `hideOnMobile` ocultas; scroll horizontal si overflow | Compacta: solo ← → + página actual |
| **640-1024px** | Scroll horizontal | Inline (search + button en una fila) | Columnas `hideOnMobile` ocultas | Completa |
| **> 1024px** | Todos visibles si caben, sino scroll | Inline | Todas las columnas | Completa con números |

### Mobile table strategy

En móvil, la tabla NO se convierte en cards (mantiene formato tabla) pero:
- Oculta columnas marcadas `hideOnMobile: true`.
- Permite scroll horizontal si aún no cabe.
- El menú de acciones por fila es `DropdownMenu` (no botones sueltos).

---

## 7. Accesibilidad

### 7.1 Tabs

- `role="tablist"` en el contenedor.
- Cada tab: `role="tab"`, `aria-selected`, `aria-controls`, `id`.
- Panel: `role="tabpanel"`, `aria-labelledby`.
- Navegación con teclado: flechas izq/der entre tabs, Enter/Space activa.

### 7.2 Tabla

- `<thead>` con `scope="col"` en cada `<th>`.
- Columna de acciones: `<th scope="col">Acciones</th>`.
- Botones de acción: `aria-label="Editar Walmart"`, `aria-label="Eliminar Walmart"`.

### 7.3 Dialog (crear/editar)

- `role="dialog"`, `aria-modal="true"`.
- `aria-labelledby` apunta al `DialogTitle`.
- Focus trap: al abrir, foco va al primer campo. Tab cicula dentro del dialog.
- Escape cierra el dialog (shadcn lo maneja).
- Al cerrar, foco vuelve al botón que lo abrió.

### 7.4 AlertDialog (eliminar)

- `role="alertdialog"`.
- Focus va al botón "Cancelar" por defecto (acción segura primero).
- Escape cierra.

### 7.5 Formularios

- Cada `Input` tiene `<Label>` asociado vía `htmlFor`/`id`.
- Errores de validación: `aria-invalid="true"` en el input,
  `aria-describedby` apunta al mensaje de error.
- `Switch` (boolean): `role="switch"`, `aria-checked`, label asociado.

### 7.6 Toasts

- `role="status"` para success, `role="alert"` para error.
- `aria-live="polite"` (no interrumpen al usuario).

### 7.7 Contraste

- shadcn/ui cumple WCAG AA por defecto en sus variantes.
- El tema de Nexo (verde oscuro `#1a5f4a` sobre crema `#f6f4ef`) se valida
  con contraste >= 4.5:1 para texto y >= 3:1 para UI components.

---

## 8. Copy y terminología

| Contexto | Copy |
|----------|------|
| Tab label | "Tiendas", "Marcas", "Tipos de ropa", "Categorías", "Tallas", "Condiciones", "Colores", "Métodos de pago", "Tipos de gasto", "Motivos de diferencia" |
| Botón crear | "Nueva Tienda", "Nueva Marca", etc. |
| Dialog title (create) | "Nueva Tienda" |
| Dialog title (edit) | "Editar Tienda" |
| Dialog description (create) | "Crea una tienda para registrar compras." |
| Botón guardar | "Guardar" |
| Botón cancelar | "Cancelar" |
| Toast create success | "✓ Tienda creada" |
| Toast update success | "✓ Tienda actualizada" |
| Toast delete success | "✓ Tienda eliminada" |
| Toast toggle on | "✓ Tienda activada" |
| Toast toggle off | "✓ Tienda desactivada" |
| Empty state title | "Aún no hay tiendas" |
| Empty state desc | "Crea tu primera tienda para registrar compras." |
| Search placeholder | "Buscar tienda..." |
| Search no results | "No se encontraron tiendas con \"{query}\"." |
| Error load | "No se pudieron cargar las tiendas." |
| Delete confirm title | "Eliminar tienda" |
| Delete confirm desc | "¿Seguro que quieres eliminar \"{name}\"? Esta acción no se puede deshacer." |
| Delete confirm note | "Los registros históricos no se afectan." |
| Badge active | "Sí" (con dot verde) |
| Badge inactive | "No" (con dot gris) |
| Column "actions" header | "Acciones" |
| Pagination summary | "Mostrando {start}-{end} de {total} resultados" |

---

## 9. Dependencias a instalar

```json
{
  "dependencies": {
    "tailwindcss": "^4",
    "@tailwindcss/vite": "^4",
    "class-variance-authority": "^0.7",
    "clsx": "^2",
    "tailwind-merge": "^2",
    "@radix-ui/react-dialog": "^1",
    "@radix-ui/react-alert-dialog": "^1",
    "@radix-ui/react-tabs": "^1",
    "@radix-ui/react-select": "^2",
    "@radix-ui/react-switch": "^1",
    "@radix-ui/react-tooltip": "^1",
    "@radix-ui/react-dropdown-menu": "^2",
    "@radix-ui/react-label": "^2",
    "@radix-ui/react-slot": "^1",
    "sonner": "^1"
  }
}
```

shadcn CLI (`npx shadcn@latest init` + `add`) copia los componentes a
`src/common/components/ui/` y gestiona estas dependencias automáticamente.

---

## 10. Migración del tracer bullet existente

El `ClothingTypesPage.tsx` actual (tracer bullet) se migra al nuevo patrón:

1. Crear `types/entities/clothing-type.ts` con `ClothingTypeEntity`, schema
   zod, y `clothingTypeConfig`.
2. Eliminar `features/catalogs/views/ClothingTypesPage.tsx` (su lógica queda
   en `CatalogEntityView` + config).
3. Eliminar `common/components/ui/CatalogTable.tsx` y `Pagination.tsx`
   manuales (reemplazados por `CatalogDataTable` + shadcn Pagination).
4. Mover tipos de `common/types/api.ts` (`ClothingTypeDto`, etc.) a
   `features/catalogs/types/entities/clothing-type.ts`.

---

## 11. Backend — endpoints necesarios

Para que el frontend funcione, cada entidad necesita en el backend:

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/catalogs/{entity}` | Access | Lista paginada con `?page&limit&search&sortBy&sortOrder&active` |
| `POST` | `/catalogs/{entity}` | Admin | Crear |
| `PUT` | `/catalogs/{entity}/:id` | Admin | Actualizar |
| `PATCH` | `/catalogs/{entity}/:id/active` | Admin | Toggle active `{ active: boolean }` |
| `DELETE` | `/catalogs/{entity}/:id` | Admin | Eliminar (soft) |

**Nota sobre DELETE**: El plan F2 menciona "deactivation must not break
historical records". Se recomienda que DELETE sea soft (marca `active=false` +
`deletedAt`) en lugar de hard delete. Si se implementa soft delete, el toggle
active y el delete pueden ser el mismo endpoint (`PATCH /:id/active`).
Confirmar con `nexo-spec` si DELETE es hard o soft.

** clothing-types ya tiene `GET` implementado.** Faltan POST, PUT, PATCH,
DELETE para clothing-types y todo el CRUD para las otras 8 entidades.

---

## 12. Orden de implementación recomendado

1. **Instalar Tailwind + shadcn/ui** + migrar theme visual.
2. **Construir la infraestructura genérica**: types, service factory, hooks,
   store, components (`CatalogEntityView`, `CatalogDataTable`,
   `CatalogFormDialog`, etc.).
3. **Migrar clothing-types** al nuevo patrón (validar que todo funciona con
   la entidad que ya tiene backend).
4. **Backend: CRUD para clothing-types** (POST, PUT, PATCH, DELETE) — ya tiene
   GET.
5. **Frontend: validar CRUD completo de clothing-types** end-to-end.
6. **Backend: las 8 entidades restantes** (schema + migration + DDD stack +
   seed).
7. **Frontend: las 8 configs** (~50 líneas cada una, en el registry).
8. **QA review + closeout F2.**

---

## 13. Verificación de diseño (nexo-design-spec checklist)

- [x] Users, roles, permissions: Admin muta, Operator lee (vía AuthGuard).
- [x] Screens and navigation: `/admin/catalogs` con tabs.
- [x] Primary workflows: crear, editar, toggle, eliminar, buscar, paginar.
- [x] Form fields, validation, errors: zod schema por entidad, validación
      inline.
- [x] Empty, loading, error, disabled, permission states: todos definidos.
- [x] Responsive behavior: tabla con `hideOnMobile`, tabs scroll, toolbar
      stack.
- [x] Accessibility: tabs, table, dialog, alertdialog, form, toasts con ARIA.
- [x] Copy and terminology: tabla de copy completa.
