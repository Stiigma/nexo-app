# NEXO-0037 - Preparación de Inventario para Venta

## Objective

Convertir cada prenda física de inventario en una ficha comercial confiable,
localizable y lista para vender; permitir que el equipo la edite, la publique,
la aparte y registre su venta sin perder costo, precio, responsable ni
trazabilidad.

## Done When

- Existe una definición aprobada de “prenda lista para venta”.
- Cada prenda tiene estado físico y estado comercial diferenciados.
- La edición de prendas presenta una lista de faltantes y bloquea la venta o
  publicación cuando falten datos críticos, salvo una excepción autorizada y
  auditada.
- El equipo sabe qué acciones puede realizar en cada etapa y el sistema aplica
  esas restricciones.
- Se puede demostrar el recorrido completo: edición → aprobación/publicación →
  apartado opcional → venta → consulta de utilidad.

## Scope

- Definir la ficha comercial mínima de una prenda y los datos opcionales.
- Resolver la regla abierta de ciclo de vida comercial (`OQ-007` del SRS).
- Definir responsabilidades operativas y su mapeo inicial a los roles actuales
  `ADMIN` y `OPERATOR`.
- Planear edición masiva de las prendas en `PRICE_PENDING`, empezando por las
  39 prendas actualmente importadas.
- Planear los controles de precio, apartados, ventas y correcciones.

## Out Of Scope

- Tienda en línea, checkout público, facturación fiscal, envíos o inventario
  multi-sucursal.
- Cambiar el costo histórico sin registro de corrección.
- Crear más roles técnicos que `ADMIN` y `OPERATOR` antes de validar el flujo
  con el equipo.
- Ejecutar migraciones, cambios de código, publicación externa o venta real.

## Proposed Commercial Policy

### Two independent lifecycles

El estado de inventario responde “¿dónde está la prenda en su vida física?” y
el estado comercial responde “¿qué tan preparada y visible está para venderse?”.
No deben mezclarse.

| Ciclo | Estados propuestos | Regla clave |
| --- | --- | --- |
| Inventario | `PRICE_PENDING` / `ACQUIRED_STOCK` → `AVAILABLE` → `RESERVED` → `SOLD` o `RETURNED` | Sólo `AVAILABLE` y `RESERVED` pueden entrar a una venta; la venta completa termina en `SOLD`. |
| Comercial | `DRAFT` → `READY_FOR_REVIEW` → `PUBLISHED`; también `PAUSED` | `PUBLISHED` sólo es posible si la prenda es `AVAILABLE` y su ficha comercial está completa. `PAUSED` la retira de los canales de venta sin cambiar su existencia física. |

Una prenda reservada puede permanecer publicada mostrando “apartada”, o
pausarse según el canal. Una prenda vendida se despublica automáticamente.

### Minimum commercial file

Para marcar una prenda como lista para revisión se requieren los datos
siguientes. El sistema debe mostrar una lista clara de los faltantes, no sólo
un mensaje de error al final.

| Grupo | Obligatorio para vender | Datos |
| --- | --- | --- |
| Identidad | Sí | Código interno, QR, foto principal, tipo de ropa y categoría. |
| Descripción | Sí | Marca (usar “Sin marca” si aplica), talla, condición, color, descripción breve y defectos visibles. |
| Confianza del cliente | Sí cuando aplique | Medidas relevantes, foto de etiqueta/talla y fotos de defectos; si no existen, una nota que lo aclare. |
| Operación | Sí | Ubicación física precisa, responsable de la última edición y fecha/hora de actualización. |
| Precio y rentabilidad | Sí | Precio público/lista en MXN, precio mínimo interno, costo total en MXN o excepción aprobada de costo pendiente. |
| Venta | Se genera al vender | Cliente, fecha, precio final por prenda, moneda, tipo de cambio si es USD y método de pago. |
| Trazabilidad | Sí, de sistema | Lote/compra de origen, cambios de estado y motivo/autor de toda corrección sensible. |

Notas de política:

- `targetPriceMxn` pasa a ser el **precio público/lista**. `minPriceMxn` es
  interno y no debe mostrarse a clientes ni a operadores sin autorización.
- Una prenda sin costo puede editarse, pero no debe publicarse ni venderse de
  forma normal. Un administrador puede autorizar una excepción con motivo; el
  reporte la marcará como “utilidad pendiente”.
- No se exige una cantidad fija de fotos. La foto principal es obligatoria y
  se agrega evidencia de etiqueta, medida o defecto cuando corresponda.
- Se recomienda mantener separado el texto interno de notas y la descripción
  comercial que se comparte con el cliente.

## Roles And Responsibilities

El modelo técnico actual se mantiene en dos roles; los siguientes son perfiles
de trabajo que pueden ser realizados por una o más personas.

| Perfil operativo | Rol inicial en Nexo | Puede hacer | No puede hacer sin Admin |
| --- | --- | --- | --- |
| Editor/a de inventario | `OPERATOR` | Subir/ordenar fotos, completar descripción, talla, condición, medidas, ubicación y proponer precio; enviar a revisión. | Publicar, cambiar costo histórico, ver o bajar el precio mínimo, corregir una venta. |
| Vendedor/a | `OPERATOR` | Buscar por código/QR, consultar ficha comercial, crear cliente, apartar/liberar, capturar venta y método de pago. | Vender una prenda incompleta, aplicar descuento bajo el mínimo, modificar costo o cancelar una venta cerrada. |
| Encargado/a de precios y catálogo | `ADMIN` | Aprobar precio, publicar/pausar, gestionar marcas/categorías/tallas/condiciones, atender excepciones de costo. | — |
| Dueño/a o administrador/a | `ADMIN` | Gestionar usuarios, consultar costos/utilidad/reportes y autorizar correcciones con motivo. | — |

Mientras el equipo sea pequeño, una misma persona `OPERATOR` puede editar y
vender. La aprobación de precio, publicación, cambios de costo y correcciones
de venta deben permanecer con `ADMIN` para evitar que una venta borre la
trazabilidad o se haga bajo el mínimo sin control.

## Steps

1. **Aprobar la política comercial.** Confirmar los estados propuestos, la
   excepción para costo pendiente y quién actúa como administrador de precios.
2. **Preparar catálogos.** Completar valores activos de tipos de ropa, marcas,
   categorías, tallas, condiciones, colores y métodos de pago. Incluir los
   valores operativos “Sin marca”, “No especificada” o equivalentes para no
   inventar información.
3. **Implementar el editor de prenda.** Mostrar una ficha por secciones,
   guardar fotos y datos, calcular el porcentaje de completitud y permitir
   ubicar físicamente cada pieza. La prioridad es la cola `PRICE_PENDING`.
4. **Aplicar el control de preparación.** Incorporar el estado comercial y
   validaciones de publicación/venta; registrar editor, revisor, fechas y
   motivos de excepciones. Resolver `OQ-007` en el SRS y crear requisitos y
   pruebas antes de programar.
5. **Establecer la rutina de precios.** El editor propone precio público y
   mínimo; el administrador aprueba o devuelve con comentario. No se publica
   una prenda sin esa decisión.
6. **Habilitar la operación de venta.** Desde una ficha publicada, buscar o
   escanear QR, apartar para un cliente o crear venta. La venta debe confirmar
   precio final, moneda, pago y cliente antes de pasar a `SOLD`.
7. **Trabajar la cola de salida.** Priorizar: (a) prendas con datos completos
   que sólo requieren precio; (b) prendas con fotos/datos faltantes; (c)
   prendas con costo pendiente que requieren decisión administrativa. Medir
   cuántas pasan a `PUBLISHED` cada día.
8. **Cierre diario.** Conciliar ventas capturadas contra pagos recibidos,
   revisar apartados vencidos o por contactar y verificar que cada prenda
   vendida cambió a `SOLD`.

## Acceptance Criteria

- Una prenda no se puede publicar ni vender si faltan foto principal, identidad,
  condición, ubicación o precio público/mínimo. La única excepción permitida
  es la falta de costo total, aprobada por `ADMIN` y marcada como utilidad
  pendiente.
- Un vendedor no puede vender una prenda que esté en `PRICE_PENDING`,
  `ACQUIRED_STOCK`, `DRAFT` o `PAUSED`.
- Una venta guarda una línea por prenda, precio final, cliente, fecha, moneda,
  método de pago y equivalente MXN cuando aplica.
- Cada modificación de precio mínimo, costo, publicación, estado o venta
  cerrada guarda responsable, fecha y motivo.
- Los costos y márgenes son visibles sólo para `ADMIN`; el vendedor ve sólo la
  información necesaria para vender y el precio público.
- El inventario muestra colas accionables: falta precio, falta información,
  listo para revisión, publicado, apartado y vendido.

## Dependencies

- `NEXO-0036`: aplicar la migración autorizada y completar la comprobación
  visual autenticada de fotos antes de depender de las imágenes para venta.
- `NEXO-0008`: catálogos operativos completos.
- `NEXO-0011`: ficha mínima y transición a disponibilidad.
- `NEXO-0013` y `NEXO-0014`: apartados y ventas en MXN/USD.

## Risks

- Publicar sin ubicación física o condición detallada provoca ventas que no se
  pueden surtir o devoluciones evitables.
- Permitir descuentos bajo el mínimo sin autorización erosiona el margen.
- Mezclar estado de inventario y publicación crea prendas aparentemente
  disponibles que no deberían venderse.
- Un costo pendiente impide calcular utilidad confiable; la excepción debe ser
  visible en reportes, no convertirse en dato cero.
- Cambiar ventas históricas sin auditoría rompe la confianza en los reportes.

## Verification

- Revisión de requisitos: `OQ-007` resuelto, requisitos identificados y
  trazables antes de implementación.
- Pruebas de dominio/API: transiciones de ambos ciclos, bloqueo de venta,
  permisos, excepción de costo y registro de auditoría.
- Prueba de interfaz: edición desde móvil, fotos, lista de faltantes, revisión,
  publicación, apartado, venta MXN y venta USD.
- Prueba operativa: una prenda de prueba recorre el flujo completo y el cierre
  diario concilia estado, pago y reporte de utilidad.

## Progress

- 2026-07-15: Plan inicial creado a partir de la necesidad de preparar el
  inventario existente para comenzar ventas.
- 2026-07-15: La persona usuaria aprobó iniciar por el editor y confirmó que
  `ADMIN` puede realizar las mismas acciones editoras que `OPERATOR`. El primer
  corte excluye cambios de costo, precio mínimo, código, compra y estado físico;
  esas correcciones administrativas conservan su flujo separado.
- 2026-07-15: Editor seguro implementado en API y en `/inventory` con lista de
  faltantes. El control de acceso redacciona costos, tipo de cambio y precio
  mínimo para `OPERATOR`; pruebas, builds y Prisma validaron. Falta QA visual
  autenticado antes de avanzar al estado comercial/publicación.

## Decision Log

- 2026-07-15: Se propone separar el ciclo físico del inventario del ciclo
  comercial de edición/publicación; la separación evita usar `AVAILABLE` como
  sinónimo de “visible para clientes”.
- 2026-07-15: Se conservan `ADMIN` y `OPERATOR` en v1; los perfiles de editor y
  vendedor son responsabilidades operativas mapeadas a `OPERATOR`, no roles
  técnicos nuevos todavía.
- 2026-07-15: Para el editor inicial, `ADMIN` hereda el acceso de `OPERATOR`.
  No se crea un tercer rol técnico ni un formulario financiero visible al
  operador.
