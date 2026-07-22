# Propuesta de Rediseño UX/UI — Nexo

> **Tipo:** Especificación de diseño (`nexo-design`).
> **Destinatario:** `nexo-build` (codificación) y `nexo-qa` (verificación visual/accesibilidad).
> **Alcance:** rediseño visual y de información del *prototype* actual
> `prototypes/purchase-capture-demo/` y base del lenguaje de UI para el producto
> `front/`. No cambia el modelo de dominio (ver `CONTEXT.md`) ni la lógica de
> negocio existente.
> **Versión:** 0.1 — 2026-07-01.
> **Idioma:** español operativo; los términos canónicos del dominio
> (`Purchase Batch`, `Payment`, `Garment`, `Acquired Stock`, etc.) se conservan
> como sustantivos propios cuando conviene (ver §12 Copys).

---

## 1. Diagnóstico: por qué hoy "se ve AI"

El prototipo actual funciona, pero visualmente cae en patrones que le quitan
identidad y confunden al operador. Antes de proponer, dejemos fijado el
diagnóstico para que el rediseño ataca causas, no síntomas.

| # | Problema actual | Síntoma visible | Por qué pasa |
|---|---|---|---|
| D1 | **Glassmorphism sobre negro.** Todo es `#050608` con tarjetas `bg-white/[0.055]` y bordes `border-white/10`. | Se ve como un dashboard genérico de IA: superficies translúcidas, sin peso. | Es el "tema oscuro con tarjetas semitransparentes" por defecto de cualquier LLM. |
| D2 | **Todo aparece a la vez.** Cada pantalla es una sola columna `max-w-480px` con header + status pills + bloque de contexto + items + totales + barra de acción, todo en un solo scroll. | Carga cognitiva alta; el operador no sabe qué hacer primero. | No hay jerarquía ni *progressive disclosure*; no hay separación de entidades. |
| D3 | **Sin navegación real.** No hay sidebar ni tabs; se navega por botones "Volver". En escritorio se ve vacío y en móvil se siente una app de una sola pantalla. | El inventario, ventas, gastos, reportes no tienen hogar. | El shell se diseñó sólo para captura, no para el sistema operativo. |
| D4 | **Tarjetas anidadas y redundantes.** Tarjetas dentro de tarjetas (`Metric` dentro de un panel dentro de la sección) con eyebrows en mayúsculas `tracking-[0.18em]` tipo "PURCHASE CART". | Ruido visual; repite etiquetas en inglés que el operador no usa. | Patrón automático de "sección + eyebrow + título + grid de métricas". |
| D5 | **Azul por defecto.** `#138BFF` saturado en botones, bordes, fondos, focus, pills e iconos. | Todo compite; nada destaca. El acento de marca pierde fuerza. | Se usó un solo azul para todo sin un sistema de roles de color. |
| D6 | **Logo exprimido.** El logo horizontal está a `h-8` (32px) en un header pegajoso. | La marca casi no se nota; en móvil se ve como un icono más. | Falta un tratamiento de marca pensado (placa oscura + logo a tamaño real). |
| D7 | **Estados mezclados con datos.** Las pills de "SQLite local", "Sin conexión", "Prototype v4" conviven con el contenido de trabajo. | Ruido; el operador confunde meta-info del demo con el flujo. | No se separó *chrome* de sistema de *contenido* de trabajo. |
| D8 | **Bilingüe sin política.** UI en español pero con etiquetas en inglés: "Purchase Cart", "Garment", "Expected Cart Total", "Acquired Stock". | Confusión; el operador no mapea "Garment" con "prenda". | Se pegaron los términos del dominio sin una política de copys. |
| D9 | **Acciones secundarias siempre visibles.** "Cargar demo", "Reiniciar", "Descartar", "Eliminar" conviven con la acción primaria. | Se acciona por error; el flujo pierde claridad. | Falta jerarquía de acciones (primaria / secundaria en menú). |
| D10 | **Sin estados vacíos cargados de significado.** Los vacíos son decorativos (icono grande + texto genérico). | No orientan al siguiente paso. | Se hizo "plantilla de empty state" en vez de guiar. |

**Conclusión del diagnóstico:** el problema no es "falta de estilo", es falta de
**un sistema** (tokens, layout, jerarquía, roles de color) y de **objetividad de
pantalla** (una pantalla = un propósito, con separación de entidades y
revelación progresiva). El rediseño ataca eso.

---

## 2. Principios del rediseño

1. **Operativa premium, no landing.** Es una herramienta de trabajo; cada pixel
   justifica una decisión u acción. Cero decoración gratuita (sin gradientes
   hero, sin glassmorphism, sin tarjetas anidadas).
2. **Objetividad de pantalla.** Cada pantalla tiene **un** propósito explícito
   y **una** acción primaria. Lo secundario vive en menús, *sheets* o secciones
   colapsables.
3. **Separación de entidades.** El *chrome* (navegación), el *contexto*
   (tienda/fecha/FX) y el *trabajo* (items, totales) son regiones visuales
   distintas, no bloques apilados del mismo color.
4. **Revelación progresiva.** Totales en resumen pegajoso colapsable; detalles
   en *disclosure*; acciones destructivas en menú con confirmación.
5. **Sólido, no translúcido.** Superficies con color sólido y bordes definidos.
   El acento azul se reserva, no se riega.
6. **La marca aparece, no se susurra.** El logo tiene un lugar de honor en el
   sidebar/topbar sobre placa oscura, a tamaño legible.
7. **Componentes propios y editables.** Usar `shadcn/ui` (Tailwind + Radix) para
   tener componentes accesibles, sólidos y 100% editables en el repo.
8. **Móvil primero, escritorio completo.** Móvil = captura rápida; escritorio =
   navegación lateral + reportes. Mismo sistema, dos disposiciones.

---

## 3. Librería de componentes recomendada: `shadcn/ui`

### 3.1 Por qué `shadcn/ui`

- **Tailwind-nativo:** usa las mismas clases que ya tienes; no引入 otro sistema
  de estilos.
- **Editable:** los componentes se copian a tu repo (`src/components/ui/*`). No
  es una dependencia negra: puedes (y debes) editarlos para que se vean Nexo,
  no genéricos.
- **Accesible de fábrica:** construido sobre `Radix UI` (focus, ARIA, teclado).
- **Tematizable por tokens:** un archivo `globals.css` con variables CSS define
  el tema Nexo (colores, radios, sombras). Cambiar el tema = cambiar variables.
- **Tiene lo que falta hoy:** `sidebar`, `sheet` (nav móvil), `dialog`,
  `command` (búsqueda), `tabs`, `data-table`, `sonner` (toasts), `form`
  (react-hook-form), `select`, `radio-group`, `tooltip`, `dropdown-menu`,
  `alert-dialog`, `badge`, `card`, `separator`, `scroll-area`.

### 3.2 Stack de UI resultante

```text
React + Vite + TypeScript + Tailwind v4
  + shadcn/ui (componentes copiados en src/components/ui/*)
  + Radix UI (primitivas accesibles, transitive de shadcn)
  + lucide-react (iconos, ya en uso)
  + react-hook-form + zod (validación de formularios)
  + sonner (toasts de éxito/error)
  + class-variance-authority + clsx + tailwind-merge (variantes de componentes)
```

> **Nota:** `zustand` y `@sqlite.org/sqlite-wasm` se conservan para el
> *prototype* disposable. `shadcn/ui` no las reemplaza; reemplaza al `ui.tsx`
> hecho a mano y eleva la calidad visual/accesibilidad.

### 3.3 Setup (resumen para `nexo-build`)

1. `npx shadcn@latest init` en `prototypes/purchase-capture-demo/`.
   - Estilo: *new-york* (más denso y operativo que *default*).
   - Color base: el token `--primary` = azul Nexo (§4).
   - CSS variables: sí (necesario para theming).
2. Reemplazar `tailwind.config`/`globals.css` con el token system de §4.
3. Añadir componentes: `npx shadcn@latest add sidebar sheet dialog command tabs
   data-table sonner form select radio-group dropdown-menu alert-dialog badge
   card separator scroll-area input label button tooltip skeleton`.
4. Eliminar `src/components/ui.tsx` (su `Button`, `Field`, `TextInput`,
   `SelectInput`, `StatusPill`) y migrar usos a los componentes shadcn + un
   `StatusBadge` Nexo propio (§8).
5. Crear `src/components/nexo/*` para compuestos de dominio (§8).

### 3.4 Por qué no otras opciones

- **Headless UI / Radix puro:** accesibles pero no traen estilos; habría que
  escribir todo el视觉 a mano (justo lo que hoy se ve "AI").
- **Material UI / AntD:** imponen su identidad; se vería genérico y cuesta
  alinearlo a Tailwind.
- **Park UI / Ark UI:** válido, pero `shadcn/ui` tiene mejor ecosistema,
  documentación y el componente `sidebar` listo.

---

## 4. Sistema de tokens (colores, tipografía, radios, sombras)

### 4.1 Decisión de dirección: *chrome* oscuro + *canvas* claro

Hoy todo es oscuro translúcido (causa D1). El rediseño propone **dos
superficies con intención**:

- **Chrome (navegación):** oscuro sólido `ink` (sidebar, topbar). Ancla la marca
  (logo sobre placa negra) y separa navegación de trabajo.
- **Canvas (trabajo):** claro neutro `paper` (área de contenido). Las fotos de
  prendas resaltan, las tablas/reportes leen mejor, y deja de verse "AI
  dashboard oscuro".

Esto es lo que más cambia la percepción genérica. Es opcional un **modo oscuro**
completo (§4.5), pero el default recomendado es *canvas claro*.

### 4.2 Tokens de color (CSS variables para `shadcn/ui`)

Definir en `src/styles.css` bajo `:root` (modo claro) y `.dark` (modo oscuro).
Nombres HSL para encajar con el sistema de shadcn.

```css
:root {
  /* Superficies */
  --paper:        210 20% 98%;   /* #F7F8FA canvas de trabajo      */
  --surface:      0 0% 100%;     /* #FFFFFF tarjetas sobre paper   */
  --surface-2:    215 25% 95%;   /* #F0F3F7 bloques sutiles        */
  --chrome:       220 26% 7%;    /* #0A0B0D sidebar/topbar sólido  */
  --chrome-2:     222 22% 11%;   /* #111317 hover de nav           */

  /* Bordes y texto */
  --border:       220 14% 89%;   /* #E1E5EC divisores               */
  --border-strong:220 14% 80%;   /* #C4CBD4 bordes con énfasis      */
  --text:         222 30% 12%;   /* #14171F texto primario          */
  --text-muted:   220 9% 42%;    /* #5A6473 texto secundario        */
  --text-subtle:  220 8% 58%;    /* #8A93A2 texto terciario         */
  --text-inverse: 0 0% 100%;     /* texto sobre chrome              */

  /* Marca: azul eléctrico Nexo (del logo) */
  --brand:        210 100% 54%;  /* #138BFF acento principal        */
  --brand-strong: 210 96% 47%;   /* #0478E6 hover                   */
  --brand-soft:   210 100% 96%;  /* #E8F2FF fondo de acento suave   */
  --brand-ink:    210 100% 88%;  /* #9ED4FF texto sobre brand-soft  */

  /* Mapeo a shadcn (alias) */
  --background: var(--paper);
  --foreground: var(--text);
  --card:       var(--surface);
  --card-foreground: var(--text);
  --popover:    var(--surface);
  --popover-foreground: var(--text);
  --primary:        var(--brand);
  --primary-foreground: 0 0% 100%;
  --secondary:      var(--surface-2);
  --secondary-foreground: var(--text);
  --muted:          var(--surface-2);
  --muted-foreground: var(--text-muted);
  --accent:         var(--brand-soft);
  --accent-foreground: var(--brand-strong);
  --destructive:    0 84% 56%;   /* #E5484D */
  --destructive-foreground: 0 0% 100%;
  --input:          var(--surface);
  --ring:           var(--brand);
  --radius:         0.625rem;   /* 10px */

  /* Semánticos (estados) */
  --success:       162 84% 40%;  /* #12B886 */
  --success-soft:  152 60% 95%;  /* #E8F8F2 */
  --success-ink:   168 80% 22%;
  --warning:       38 92% 50%;   /* #F59E0B */
  --warning-soft:  40 100% 95%;  /* #FEF3E2 */
  --warning-ink:   32 80% 26%;
  --danger:        0 84% 56%;    /* #E5484D */
  --danger-soft:   0 86% 96%;    /* #FDECEC */
  --danger-ink:    0 70% 30%;
  --info:          var(--brand);
  --info-soft:     var(--brand-soft);
  --info-ink:      var(--brand-strong);
}
```

**Roles de color (regla de uso):**
- `--brand` **sólo** para: acción primaria, item de nav activo, focus ring,
  selección, controles determinados. **Nunca** para fondos grandes ni bordes de
  tarjetas comunes.
- `--surface`/`--surface-2`: bloques de contenido.
- `--chrome`: navegación.
- Estados: cada uno con par `ink`/`soft` (texto + fondo) para no depender sólo
  del color (accesibilidad).

### 4.3 Tipografía

- Familia: **Inter** (ya en uso). Considerar **Inter Display** para títulos de
  pantalla (peso 600–700) si se quiere más carácter.
- Escala (rem):

| Token | Tamaño | Uso |
|---|---|---|
| `text-2xl` 1.5rem / 600 | Título de pantalla (h1) |
| `text-xl`  1.25rem / 600 | Título de sección |
| `text-lg`  1.125rem / 600 | Título de tarjeta / entidad |
| `text-base` 1rem / 500 | Texto de trabajo, labels |
| `text-sm`  .875rem / 400 | Texto secundario |
| `text-xs`  .75rem / 500 | Meta, captions, pills |

- **Quitar los eyebrows en mayúsculas con tracking ancho**
  (`tracking-[0.18em] uppercase`). Es el tell #1 de "AI". Reemplazar por:
  - *Breadcrumb* en el topbar (ej. `Compras / Lotes / Detalle`), o
  - *Label* pequeño en `--text-subtle` en capitalización normal
    (ej. "Lote de compra").
- Dinero siempre en `tabular-nums` (alineación de columnas).

### 4.4 Radios, sombras, movimiento

- Radios: `--radius 10px` (tarjetas), `8px` (inputs/botones), `9999px` (pills).
  Un solo radio consistente, no mezclar.
- Sombras: mínimas y definidas. `--shadow-card: 0 1px 2px rgba(20,23,31,.04)`.
  El *chrome* no lleva sombra; se separa por color sólido. Las *sheets*/dialogs
  sí llevan sombra `0 12px 32px rgba(20,23,31,.16)`.
- Movimiento: `150ms ease` para hover/focus; `200ms` para disclosure. Respetar
  `prefers-reduced-motion: reduce` (desactivar transiciones).

### 4.5 Modo oscuro (opcional, fase 2)

Definir `.dark` invirtiendo `--paper`/`--surface` a tonos `ink` sólidos (no
translúcidos) y `--text` a claros. El modo oscuro **no** debe reproducir el
glassmorphism actual: superficies sólidas `#0F1115` / `#16181D` con bordes
`#23262D`. Priorizar el modo claro para v1.

---

## 5. Tratamiento de marca y logo

### 5.1 Reglas del logo

- **No recortar ni deformar.** El asset `nexo-logo.png` (1536×435, horizontal,
  fondo negro + wordmark italic blanco + barra azul) se usa completo.
- **Placa de marca.** El logo va sobre una placa `--chrome` (negro sólido), no
  sobre el canvas claro. Esto preserva el contraste del wordmark blanco y le da
  presencia.
- **Tamaños mínimos:**
  - Sidebar expandido: logo a `h-9` (36px) de alto, ancho proporcional.
  - Sidebar colapsado (rail): usar un *mark* derivado (la "N" + barra azul) en
    `size-8`. **Crear ese asset derivado** (`nexo-mark.svg`) en lugar de
    recortar el logo fuente (alineado a `docs/brand/README.md`).
  - Topbar móvil: logo a `h-7` sobre la placa oscura del topbar.
- **No poner el logo sobre fondos claros** sin una versión invertida; si se
  necesita sobre claro, generar `nexo-logo-light.svg` (wordmark oscuro). Para v1
  se mantiene siempre sobre placa oscura.

### 5.2 Acciones derivadas para `nexo-build`

- Crear `public/nexo-mark.svg` (mark compacto) derivado del logo.
- Colocar el logo en el header del sidebar (y topbar móvil) sobre `--chrome`.
- Eliminar el `StatusPill tone="blue">Prototype v4` del header (ruido). La
  versión se muestra en el footer del sidebar en `--text-subtle` o en un
  *dropdown* de ayuda.

---

## 6. Layout: sidebar + topbar + canvas

### 6.1 Estructura general

```text
┌──────────────────────────────────────────────┐
│  Sidebar (chrome, --chrome)  │  Topbar       │
│  ┌──────────────────────┐    │  (paper, --paper)
│  │ [logo Nexo]          │    │  breadcrumb · búsqueda · acciones
│  ├──────────────────────┤    ├───────────────┤
│  │ Navegación           │    │               │
│  │  Compras             │    │   Canvas      │
│  │   · Lotes            │    │   (trabajo)   │
│  │   · Carrito activo   │    │               │
│  │  Inventario          │    │               │
│  │   · Inventario        │    │               │
│  │   · Acquired Stock   │    │               │
│  │  Ventas              │    │               │
│  │   · Ventas           │    │               │
│  │   · Apartados        │    │               │
│  │   · Clientes         │    │               │
│  │  Operación           │    │               │
│  │   · Gastos           │    │               │
│  │   · Reportes         │    │               │
│  │  Admin (rol)         │    │               │
│  │   · Catálogos        │    │               │
│  │   · Usuarios         │    │               │
│  ├──────────────────────┤    │               │
│  │ [usuario] · [rol]    │    │               │
│  │ [offline] [versión]  │    │               │
│  └──────────────────────┘    │               │
└──────────────────────────────────────────────┘
```

### 6.2 Comportamiento responsive

| Breakpoint | Sidebar | Topbar | Canvas |
|---|---|---|---|
| **Móvil** `<768px` | Oculto; se abre con botón menú (hamburger) en topbar como `Sheet` deslizable desde izquierda. | Compacto: menú · logo pequeño · acción primaria contextual. | 1 columna, `px-4`, acción primaria en *sticky bottom bar*. |
| **Tablet** `768–1023px` | **Rail colapsado** (sólo iconos, `w-16`). Hover/icon activo muestra etiqueta en tooltip. Expandible a completo con botón. | Breadcrumb + búsqueda. | Ancho fluido. |
| **Escritorio** `≥1024px` | **Expandido** `w-64` por defecto, colapsable a rail. | Breadcrumb + `Command` (búsqueda global) + acciones. | `max-w-6xl` centrado para reportes; fluido para captura. |

> En el *prototype* disposable, muchas secciones del sidebar estarán
> deshabilitadas/marcadas "próximamente". Aun así, mostrarlas comunica el
> sistema completo y orienta al operador (resuelve D3).

### 6.3 Topbar

- Placa `--paper` con borde inferior `--border`.
- Izquierda: botón menú (móvil) + *breadcrumb* (`Compras / Lotes`).
- Centro/derecha: `Command` (búsqueda de prendas por código/QR), indicador
  offline (badge sutil, no pill gigante), avatar/rol.
- **Sin pills de "SQLite local" ni "Prototype v4"** en el área de trabajo. Esas
  viven en el footer del sidebar o en un dropdown de ayuda.

### 6.4 Sticky bottom action bar (móvil)

En flujos de captura (cart, pago), la acción primaria se fija al borde inferior
con un *safe-area inset* (`pb-[env(safe-area-inset-bottom)]`). Fondo `--surface`
sólido con borde superior `--border` (no translúcido). Una sola acción primaria;
la secundaria arriba, en el header de la pantalla.

---

## 7. Pantallas rediseñadas (objetividad por pantalla)

Se especifica cada pantalla con: propósito, acción primaria, disposición,
estados. Los nombres siguen `CONTEXT.md`.

### 7.1 S1 — Lotes de compra (home / `BatchList`)

- **Propósito:** ver y abrir lotes confirmados; iniciar una compra.
- **Acción primaria:** "Nuevo carrito" (topbar o header, no compite con items).
- **Cambios vs actual:**
  - Quitar el bloque "Control de demo" siempre visible. "Cargar demo" y
    "Reiniciar" van a un `DropdownMenu` "···" en el header (acciones de demo,
    no de trabajo).
  - Quitar eyebrow "DEMO LOCAL" y el `StatusPill` de conteo gigante.
  - Header: título "Lotes de compra" + contador pequeño en `--text-muted`
    (`12 lotes`) + botón "Nuevo carrito" + menú "···".
  - Lista de lotes: filas sólidas (`--surface`) con foto-mini de la tienda o
    icono, nombre, fecha, y a la derecha el total pagado en `tabular-nums` +
    `Badge` de estado ("Confirmado" verde / "Abierto" ámbar). Una fila = un
    lote, clara, sin tarjeta anidada.
  - Filtros rápidos (chips): Todos · Esta semana · Por tienda. (Fase 2: búsqueda.)
- **Estados:**
  - **Vacío:** ilustración + "Aún no hay lotes" + explicación del primer paso
    + botón "Crear primer carrito". (Guía, no decorativo.)
  - **Cargando:** `Skeleton` de 5 filas.
  - **Error:** `Alert` con causa y reintento.
  - **Sin permisos (operador):** N/A (puede ver lotes).

### 7.2 S2 — Nuevo carrito: selección de tienda (`NewCartFlow`)

- **Propósito:** elegir tienda para iniciar captura.
- **Acción primaria:** seleccionar tienda (al tocar se crea el carrito).
- **Cambios:** Quitar eyebrow "NUEVO CARRITO" y el `StatusPill tone="blue"` de
  país. Lista de tiendas como *cards* sólidas con icono de tienda, nombre,
  metadata (país · tax · moneda) y un chevron a la derecha. El bloque azul
  informativo ("Al seleccionar la tienda…") se mueve a un `Alert` *info* sutil
  o a un tooltip, no como bloque grande azul.
- **Estados:** vacío de tiendas (admin), cargando, error.

### 7.3 S3 — Captura de items del carrito (`CartCapture`)  ★ crítica

Esta es la pantalla más sobrecargada hoy (causa D2). Rediseño por **regiones**:

```text
┌ Header ─────────────────────────────────────┐
│ ← Carrito · {tienda}        [Descartar ···]  │   breadcrumb + menú (descartar va a menú)
├ Context strip (compacto, --surface-2) ───────┤
│ {fecha} · USD · Tax 8% · FX 18.5 · 3 items   │   una línea, metadata, no grid de 4 métricas
├ Items (canvas, región principal) ───────────┤
│ [+ Agregar item]                              │   botón secundario al inicio
│  item card · item card · item card            │   entidades separadas, sólidas
├ Totales (sticky summary, colapsable) ────────┤
│ Expected total  USD 120.00        [ver ▾]     │   colapsado por defecto
│   └ Subtotal · Tax · MXN equiv (al expandir)  │
├ Sticky action bar (móvil) ───────────────────┤
│            [ Confirmar pago ]                 │   una sola acción primaria
└──────────────────────────────────────────────┘
```

- **Context strip:** reemplaza el bloque grande con 4 `Metric`. Una sola fila
  compacta (`--surface-2`) con la metadata; toque abre un *popover* con detalle
  de FX/tax si hace falta.
- **Items:** tarjetas sólidas (`--surface`) con foto-mini, `Capture ID` o
  nombre, costo en grande (`tabular-nums`), categoría como `Badge`. Las
  acciones "Editar"/"Eliminar" van en un `DropdownMenu` "···" por item (no dos
  botones siempre visibles). "Eliminar" abre `AlertDialog` de confirmación (no
  `window.confirm` nativo).
- **Totales:** `Collapsible` pegajoso sobre la action bar. Resumen de una línea
  (Expected total) + expandir para desglose. Quita el `Alert` ámbar fijo de
  redondeo: se muestra sólo si hay un problema real de redondeo.
- **Action bar:** una sola acción primaria "Confirmar pago". "Volver" ya está en
  el breadcrumb/topbar.
- **Estados:** vacío de items (guía a "Agregar item"), cargando, guardando
  (botón en estado `loading` con `Spinner`), error de validación por item.

### 7.4 S4 — Agregar / editar item del carrito (`CartItemForm`)

- **Propósito:** capturar una prenda del carrito.
- **Acción primaria:** "Guardar item".
- **Cambios:** Un solo formulario en `Card` con `CardHeader` (título) y
  `CardContent` con secciones visuales (`Separator` entre grupos):
  1. Foto principal (selector de placeholders como `RadioGroup` visual o
     `ToggleGroup`).
  2. Costo de compra.
  3. Categoría (opcional).
- Quitar eyebrow "PURCHASE CART ITEM". El `Alert` azul "Capture ID se genera
  automáticamente" → mover a `help` del campo o a un tooltip en el ícono de
  info. Sticky bottom bar con "Guardar item" (estado loading al guardar).
- **Estados:** validación por campo (`Form` + `zod`), error inline, disabled al
  guardar.

### 7.5 S5 — Confirmar pago (`PaymentConfirmForm`)

- **Propósito:** confirmar el pago y convertir items en `Garment`s.
- **Acción primaria:** "Confirmar pago".
- **Cambios:** Estructurar en pasos visuales con `Separator`:
  1. **Resumen del carrito** (compacto, no repetir todo el contexto): items,
     expected total.
  2. **Dónde guardar** (`RadioGroup` "nuevo lote" / "lote existente" con
     `Select` condicional). Hoy es un bloque azul grande; será un `Card` normal
     con `RadioGroup`.
  3. **Comprobante** (`ToggleGroup` de iconos) + **Total pagado**.
  4. **Motivo de diferencia** — sólo aparece (`Collapsible`/condicional) si el
     total pagado difiere del esperado. Hoy ya es condicional, bien; mantenerlo
     pero con `Alert` *warning* sólido (no translúcido).
- Quitar el `Alert` azul final repetitivo; la consecuencia va en el botón
  ("Confirmar pago y crear prendas") y en el toast de éxito.
- **Estados:** validación, diferencia requerida, guardando, éxito → toast +
  navegación a detalle del lote.

### 7.6 S6 — Detalle de lote (`BatchDetail`)

- **Propósito:** revisar un lote, sus pagos y prendas.
- **Acción primaria:** "Nuevo pago en este lote".
- **Cambios:** Header con título + `Badge` estado. Context strip (fecha ·
  moneda · N pagos · M prendas). Después:
  - **Sección Pagos** con `Tabs` ("Pagos" | "Prendas") para **separar
    entidades** (hoy se mezclan pagos con sus prendas anidadas). En la tab
    "Pagos": tarjetas sólidas por pago con su desglose y `Badge` "Coincide /
    Diferencia". En la tab "Prendas": `Data-Table` de prendas (código, foto,
    costo, categoría, estado).
  - **Totales consolidados** como `Card` compacto, no bloque grande con icono.
  - Acceso a inventario: botón secundario "Ver en inventario" (no un bloque
    decorativo con icono).
- **Estados:** cargando, lote no encontrado, error.

### 7.7 S7 — Inventario adquirido (`AcquiredStockList`)

- **Propósito:** ver prendas adquiridas y su estado de bloqueo.
- **Cambios:** Hoy muestra "Lotes" arriba + lista de prendas. **Separar:** usar
  `Tabs` "Prendas | Por lote". La tab Prendas = `Data-Table` (código, foto,
  costo, categoría, estado). Filas bloqueadas (`Category Review`) con `Badge`
  ámbar **+ icono + texto** (no sólo color) y fila sutilmente destacada.
  Filtros: estado (disponible / bloqueado), categoría, tienda.
- **Estados:** vacío (guía a confirmar un carrito), cargando, error.

---

## 8. Inventario de componentes

### 8.1 Componentes `shadcn/ui` a usar (copiar al repo)

`sidebar`, `sheet`, `dialog`, `alert-dialog`, `dropdown-menu`, `command`,
`tabs`, `card`, `button`, `input`, `label`, `select`, `radio-group`,
`toggle-group`, `separator`, `badge`, `alert`, `collapsible`, `scroll-area`,
`data-table` (tanstack-table wrapper), `skeleton`, `sonner` (toaster),
`tooltip`, `form` (rhf), `breadcrumb`, `spinner`.

### 8.2 Componentes Nexo propios (`src/components/nexo/*`)

Compuestos de dominio, sólidos y consistentes:

| Componente | Reemplaza a | Notas |
|---|---|---|
| `NexoAppShell` | `<main>` de `App.tsx` | Composing Sidebar + Topbar + Canvas + Toaster + responsive. |
| `NexoSidebar` | (nuevo) | Nav por roles + footer usuario/rol/offline/versión. |
| `StatusBadge` | `StatusPill` | Variantes: success/warning/danger/info/neutral. Sólido (no translúcido). Siempre icono+texto. |
| `Money` | `formatMoney` inline | `<span class="tabular-nums">` con moneda + monto; variantes size/strong. |
| `ContextStrip` | bloque de 4 `Metric` | Fila compacta de metadata con popover de detalle. |
| `EntityCard` | tarjetas `bg-white/[.055]` | `Card` sólida con header/contenido/footer estandar. |
| `PhotoThumb` | bloque `Image` icon | Mini de foto placeholder con borde `--border`, size sm/md. |
| `StickyActionBar` | sticky bottom actual | Una acción primaria + opcionales; safe-area inset; sólido. |
| `EmptyState` | empty states decorativos | Ilustración + título + guía + CTA. |
| `StepHeader` | eyebrow + h1 | Breadcrumb + título + subtítulo, sin mayúsculas tracking. |
| `DifferenceAlert` | `Alert` ámbar | Warning sólido, aparece sólo si hay diferencia. |
| `NavItem` / `NavGroup` | (nuevo) | Item de sidebar con icono, label, badge de conteo, activo. |

### 8.3 Iconografía

- Mantener `lucide-react`. Reglas:
  - Un icono por concepto, consistente (no mezclar `Tag` y `Tags`).
  - Iconos sólo donde ayudan (nav, estado, acciones destructivas). No
    icono+texto en cada botón; el botón primario suele ir sin icono o con uno
    muy obvio.
  - Tamaños: 16/20px, `shrink-0`.

---

## 9. Estados (vacío, carga, error, disabled, permisos, éxito)

Por pantalla (resumen; detalle en §7):

| Pantalla | Vacío | Carga | Error | Disabled | Permiso | Éxito |
|---|---|---|---|---|---|---|
| S1 Lotes | Guía + CTA | Skeleton filas | Alert + reintento | — | Operador ve; admin ve todo | — |
| S3 Cart | Guía "Agregar item" | — | Validación inline | saving → botón loading | — | — |
| S5 Pago | — | — | Validación + diff reason | saving | — | Toast → S6 |
| S6 Detalle | — | Skeleton | "No encontrado" | — | — | — |
| S7 Stock | Guía "Confirmar carrito" | Skeleton | Alert | — | Operador ve operativo | — |
| Global | — | `Spinner`/`Skeleton` | `Alert` + reintento | `disabled` con `aria-disabled` | Sin permiso → pantalla `Forbidden` con explicación y contacto | `sonner` toast |

**Reglas de estado:**
- *Loading:* `Skeleton` para listas; `Spinner` en botón para acciones.
- *Error:* `Alert` destructivo con causa en lenguaje humano y acción de
  reintento. Nada de `window.alert`.
- *Disabled:* visual `opacity-60 cursor-not-allowed` + `aria-disabled="true"`.
- *Permisos:* si un rol no puede acceder, el `NavItem` se oculta y la ruta
  muestra `Forbidden` (no un redirect silencioso).
- *Éxito:* `sonner` toast (success) con acción de deshacer cuando aplique.

---

## 10. Accesibilidad

- **Teclado:** todo accionable llega por tab; orden lógico; `focus-visible`
  con `--ring` (2px offset 2px). Sidebar manejable con flechas (Radix).
- **Labels:** cada input con `<Label>` asociado (`htmlFor`); botones de icono
  con `aria-label`.
- **Contraste:** el tema claro supera AA para texto (`--text` sobre `--paper` ≥
  12:1; `--text-muted` ≥ 4.6:1). Estados usan par color+icono+texto.
- **ARIA:** `Tabs`, `Dialog`, `Sheet`, `DropdownMenu`, `Select`, `RadioGroup`
  ya accesibles vía Radix. `aria-current="page"` en nav activo.
- **Estados no sólo por color:** `StatusBadge` siempre icono + texto.
- **Movimiento:** `prefers-reduced-motion` desactiva transiciones.
- **Toque:** targets ≥ 44×44px en móvil; acción primaria en thumb-zone (abajo).
- **Screen reader:** regiones con `role="main"`/`aria-label`; listas con
  `aria-setsize`/`aria-posinset` cuando aplique.

---

## 11. Comportamiento responsive (resumen)

- **Móvil (<768):** sidebar → `Sheet`; canvas 1 col; action bar sticky inferior;
  topbar con menú + logo + acción primaria contextual; `Data-Table` → lista de
  tarjetas apiladas.
- **Tablet (768–1023):** sidebar rail colapsado (iconos); canvas fluido; tabs
  se mantienen.
- **Escritorio (≥1024):** sidebar expandido `w-64`; canvas `max-w-6xl` para
  reportes; `Data-Table` con columnas completas; multi-columna en formularios
  largos.
- **PWA:** `viewport` con `viewport-fit=cover` para safe-area; `theme-color`
  `--chrome`.

---

## 12. Copys y terminología

Política: **UI en español; términos del dominio como sustantivos propios
traducidos cuando exista equivalente claro**, con un mini-glosario visible en
ayuda. Mapeo propuesto:

| Término `CONTEXT.md` | Copys UI propuesto | Nota |
|---|---|---|
| Purchase Batch | **Lote de compra** | plural: "Lotes" |
| Payment | **Pago** | |
| Purchase Cart | **Carrito de compra** | aclarar "efímero" en help |
| Purchase Cart Item | **Item del carrito** | prenda antes de pago |
| Garment | **Prenda** | nunca "Garment" en UI |
| Inventory | **Inventario** | |
| Acquired Stock | **Inventario adquirido** | estado |
| Available/Reserved/Sold | Disponible / Apartada / Vendida | |
| Capture ID | **ID de captura** | (temporal) |
| Internal Code | **Código interno** | ej. GW-001 |
| Category Review | **Revisión de categoría** | badge "Pendiente" |
| Expected Cart Total | **Total esperado** | |
| Paid Total | **Total pagado** | |
| Difference Reason | **Motivo de diferencia** | |
| Minimum Garment File | **Ficha mínima de prenda** | |
| Store | **Tienda** | |
| Customer | **Cliente** | |
| Reservation | **Apartado** | |
| Sale / Sale Line | **Venta / Línea de venta** | |
| General/Batch Expense | **Gasto general / Gasto de lote** | |
| Total Cost / Profit / Margin | **Costo total / Utilidad / Margen** | |
| Admin / Operator | **Administrador / Operador** | roles |

- Eliminar mezcla inglés/español en la UI (causa D8).
- Botones en infinitivo/acción: "Confirmar pago", "Agregar item", "Guardar".
- Toasts en pasado: "Pago confirmado. Las prendas pasaron a inventario
  adquirido."
- Confirmaciones destructivas con `AlertDialog`, texto claro: "¿Eliminar
  {código}? Esta acción no se puede deshacer."

---

## 13. Plan de implementación para `nexo-build`

### 13.1 Fases (entregables incrementales)

**Fase 0 — Fundaciones (sin cambiar pantallas aún)**
1. `shadcn init` + token system (§4) en `src/styles.css`.
2. Añadir componentes shadcn base (§3.3).
3. Crear `src/lib/utils.ts` (`cn`), `src/components/nexo/*` (§8.2).
4. Derivar `public/nexo-mark.svg`; mover logo a assets.
5. `npm run build` + `test` siguen pasando.

**Fase 1 — App shell**
6. Implementar `NexoAppShell` con `NexoSidebar` (nav completa, secciones
   futuras deshabilitadas con `Badge` "próximamente"), `Topbar` (breadcrumb +
   command placeholder + offline badge), `Toaster`.
7. Responsive: Sheet en móvil, rail en tablet, expandido en escritorio.
8. Migrar `App.tsx` al shell; mantener rutas/pantallas existentes funcionando.

**Fase 2 — Migrar pantallas (una a una, mantener lógica)**
9. S1 Lotes → `EntityCard`/lista sólida + menú demo en `DropdownMenu`.
10. S2 Tiendas → cards sólidas + quitar eyebrow.
11. S3 Cart → regiones + context strip + totales `Collapsible` + acciones en
    menú + `AlertDialog`.
12. S4 Item form → `Form`+`zod` + secciones con `Separator`.
13. S5 Pago → `RadioGroup`/`ToggleGroup` + `DifferenceAlert` condicional.
14. S6 Detalle → `Tabs` (Pagos/Prendas) + `Data-Table`.
15. S7 Stock → `Tabs` + `Data-Table` + filtros.
16. Reemplazar `StatusPill` → `StatusBadge`; `formatMoney` → `<Money>`.
17. Eliminar `src/components/ui.tsx`.

**Fase 3 — Estados y accesibilidad**
18. `EmptyState` con guía en S1/S3/S7.
19. `Skeleton` loaders; `Spinner` en botones.
20. `Forbidden` para rutas sin permiso.
21. Auditoría accesibilidad (§10) con checklist.

### 13.2 Archivos a crear / modificar

```text
prototypes/purchase-capture-demo/
  src/styles.css                      (MOD: token system)
  src/lib/utils.ts                    (NEW: cn)
  components.json                     (NEW: shadcn config)
  public/nexo-mark.svg                (NEW: mark derivado)
  src/components/ui/*                 (NEW: shadcn components)
  src/components/nexo/*               (NEW: Nexo compuestos §8.2)
  src/components/ui.tsx               (DEL: al final de Fase 2)
  src/App.tsx                         (MOD: NexoAppShell)
  src/components/BatchList.tsx        (MOD: S1)
  src/components/NewCartFlow.tsx      (MOD: S2)
  src/components/CartCapture.tsx      (MOD: S3)
  src/components/CartItemForm.tsx     (MOD: S4)
  src/components/PaymentConfirmForm.tsx (MOD: S5)
  src/components/BatchDetail.tsx      (MOD: S6)
  src/components/AcquiredStockList.tsx (MOD: S7)
  src/components/format.ts            (MOD: mantener; envolver en <Money>)
  package.json                        (MOD: deps shadcn/rhf/zod/sonner/cva)
```

### 13.3 Riesgos y mitigaciones

- **Riesgo:** el *prototype* disposable se vuelve complejo. **Mitigación:** las
  secciones futuras del sidebar se marcan "próximamente" sin lógica; no
  implementar ventas/gastos/reportes ahora.
- **Riesgo:** migrar pantallas rompe tests. **Mitigación:** no cambiar lógica en
  `state/` ni `data/` ni `domain/`; sólo presentación. Tests siguen cubriendo
  repositorio/cálculo/validación.
- **Riesgo:** shadcn + Tailwind v4 config. **Mitigación:** `shadcn` soporta
  Tailwind v4; seguir la guía oficial; verificar `@theme` vs CSS vars.
- **Riesgo:** logo sobre claro se ve mal. **Mitigación:** logo siempre sobre
  placa `--chrome` (§5).

---

## 14. Criterios de aceptación de diseño

- [ ] La app **no** se ve generadora por IA: superficies sólidas, sin
  glassmorphism, sin eyebrows en mayúsculas, azul reservado.
- [ ] Existe `NexoAppShell` con sidebar (expandido/rail/sheet) y topbar
  funcionando en móvil/tablet/escritorio.
- [ ] El logo Nexo se muestra sobre placa oscura a tamaño legible; existe
  `nexo-mark.svg` para el rail.
- [ ] Cada pantalla tiene **un** propósito y **una** acción primaria visibles.
- [ ] S3 Cart separa regiones (contexto / items / totales colapsable / acción) y
  las acciones secundarias están en menús.
- [ ] S6 y S7 usan `Tabs`/`Data-Table` para separar entidades (pagos vs prendas).
- [ ] `StatusBadge` muestra estado con icono + texto (no sólo color).
- [ ] Todos los vacíos guían al siguiente paso (no decorativos).
- [ ] Confirmaciones destructivas usan `AlertDialog` (no `window.confirm`).
- [ ] Copys en español con glosario coherente (§12); sin mezcla inglés.
- [ ] Contraste AA; focus visible; navegación por teclado; `prefers-reduced-motion`.
- [ ] `npm run build` y `npm run test` pasan tras la migración.
- [ ] Revisión visual móvil (checklist del design harness) completada.

---

## 15. Referencias

- Producto: `NEXO_PROJECT.md`
- Lenguaje de dominio: `CONTEXT.md`
- Marca: `docs/brand/README.md`, `docs/brand/nexo-logo.png`
- Brief previo: `docs/design/purchase-capture-demo-brief.md`
- Proceso diseño: `docs/design/README.md`
- ADRs: `docs/adr/ADR-2026-07-01-disposable-prototype-stack.md`,
  `docs/adr/ADR-2026-07-01-purchase-batch-multi-payment.md`
- Handoff de implementación:
  `harness/control/handoffs/HOFF-2026-07-01-ui-redesign.md`
- Stack UI: `shadcn/ui` (https://ui.shadcn.com), Radix UI, lucide-react.
