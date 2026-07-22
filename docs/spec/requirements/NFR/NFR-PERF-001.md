# NFR-PERF-001: Tiempo de respuesta en mobile

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | NFR-PERF-001 |
| **Título** | Tiempo de respuesta en mobile |
| **Tipo** | NFR (Non-Functional Requirement) |
| **Prioridad** | P1 |
| **MoSCoW** | Should |
| **Estado** | Draft |
| **Fuente** | Decisión de arquitectura |
| **Dueño** | Nexo project |

## Declaración

Las pantallas operativas principales deben responder en menos de 1 segundo
después de cargar los datos en redes móviles normales.

## Racional

La captura en tienda requiere velocidad. Esperas largas frustran al operador y
retrasan el trabajo.

## Criterio de Aceptación

- Dado que un operador realiza una acción típica (listar, buscar, crear),
  cuando la red es 4G normal,
  entonces la respuesta visual llega en ≤1s desde que los datos están listos.

## Método de Verificación

- [ ] Lighthouse audit: performance en mobile.

## Artefactos de implementación

### Backend
- Optimizaciones de consultas en `back/src/modules/*/infrastructure/repositories/`
- Paginación en endpoints

### Frontend
- Lazy loading de rutas y componentes
- Optimización de assets

## Notas

- P1: objetivo deseable; el MVP prioriza funcionalidad correcta sobre velocidad.
