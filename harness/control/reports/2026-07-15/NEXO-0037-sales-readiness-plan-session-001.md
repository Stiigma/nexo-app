# NEXO-0037 - Plan de Preparación para Venta: Sesión 001

- Fecha: 2026-07-15
- Agente: nexo-plan
- Estado: planificación completada; implementación no iniciada.

## Trabajo realizado

- Revisada la especificación, el modelo de inventario y el estado operativo
  actual de Nexo.
- Creado el plan de preparación de inventario para venta.
- Propuesta una ficha comercial mínima, con control explícito de faltantes,
  precio, ubicación, condición, trazabilidad y excepción de costo pendiente.
- Propuesta la separación entre ciclo físico de inventario y ciclo comercial de
  edición/publicación.
- Definidas responsabilidades de editor, vendedor y administrador, mapeadas a
  los roles técnicos actuales `OPERATOR` y `ADMIN`.

## Archivos modificados

- `harness/control/plans/NEXO-0037-sales-readiness.md`
- `harness/control/tasks.md`
- `harness/control/README.md`
- `harness/control/journal/2026-07-15.md`
- Este reporte.

## Verificación

- El plan contiene objetivo, alcance, exclusiones, criterios de aceptación,
  pasos, dependencias, riesgos y verificación.
- La propuesta respeta los roles actuales y los estados existentes de
  inventario; no modifica código, datos, configuración, credenciales ni
  servicios externos.
- Se identificó que 39 prendas importadas están en `PRICE_PENDING`, por lo que
  la edición y aprobación de precio es la primera cola operativa.

## Pendientes

- Confirmar la política propuesta de publicación, excepción de costo pendiente
  y responsable de aprobar precios.
- Con la confirmación, `nexo-spec` debe resolver `OQ-007`, asignar IDs a los
  requisitos resultantes y actualizar trazabilidad antes de implementación.
- Completar los prerrequisitos existentes: NEXO-0036, catálogos, ficha mínima,
  apartados y ventas.

## Siguiente paso recomendado

Validar la política comercial con el negocio y convertir las decisiones
aceptadas en requisitos implementables; en paralelo, comenzar a completar y
poner precio a las prendas de la cola `PRICE_PENDING`.
