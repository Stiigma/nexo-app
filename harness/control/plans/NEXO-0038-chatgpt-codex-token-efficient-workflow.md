# NEXO-0038 - ChatGPT/Codex Token-Efficient Workflow

## Objective

Aplicar en la app de ChatGPT con Codex la misma estrategia de eficiencia de
tokens de NEXO-0035: Terra para trabajo cotidiano, razonamiento proporcional al
riesgo, contexto inicial determinista y compacto, salidas de herramientas
acotadas y compactacion temprana sin reducir las validaciones de calidad.

## Done When

- La configuracion local de Codex usa `gpt-5.6-terra`, verbosidad baja y
  razonamiento `high` por defecto; `xhigh` queda reservado para trabajo critico.
- ChatGPT/Codex genera y consume un paquete de contexto propio bajo `.codex/`
  con el mismo contrato validado y limite de 10,000 caracteres de OpenCode.
- El compilador de contexto vive en el control plane y los adaptadores de
  Codex y OpenCode reutilizan una sola implementacion.
- Codex compacta el historial antes de que crezca sin control y limita la
  cantidad de salida de cada herramienta que queda en el contexto.
- La configuracion carga en modo estricto y todas las pruebas existentes mas
  las nuevas pruebas de Codex pasan.
- QA y seguridad confirman que no se eliminaron gates ni se agregaron secretos,
  llamadas pagadas o cambios externos.

## Scope

- `.codex/config.toml`, adaptador y estado local ignorado de Codex.
- Compilador de contexto compartido bajo `harness/control/scripts/`.
- Adaptador compatible de `.opencode/scripts/`.
- Instrucciones de arranque y politica de razonamiento por riesgo.
- Pruebas sinteticas y registros del control plane.

## Out Of Scope

- Cambiar configuracion global en `~/.codex/`.
- Ejecutar una solicitud pagada o un benchmark A/B real.
- Cambiar producto, backend, frontend, base de datos, Azure o infraestructura.
- Reducir pruebas, typecheck, schema, QA o security para ahorrar tokens.
- Commit, push o deploy.

## Steps

1. Promover el compilador de contexto a una ubicacion compartida del control
   plane y mantener adaptadores pequenos para Codex y OpenCode.
2. Configurar Terra, razonamiento por riesgo, compactacion, limite de salida y
   limite preventivo para `AGENTS.md` en `.codex/config.toml`.
3. Actualizar el arranque para que cada superficie lea su paquete local y use
   el fallback canonico solo cuando sea necesario.
4. Agregar pruebas de compatibilidad de los dos adaptadores y de las claves de
   configuracion relevantes.
5. Ejecutar validacion estricta de Codex, pruebas sinteticas y revision de
   seguridad; registrar resultados.

## Progress

- 2026-07-16: Tarea registrada y handoff preparado para `nexo-build`.
- 2026-07-16: Implementacion terminada. Los adaptadores generan paquetes
  identicos de 4,148 caracteres, 21 pruebas pasan y Codex Doctor estricto
  reporta 17 OK y 0 fallas. QA y seguridad aprobaron el cierre.

## Decision Log

- 2026-07-16: Se reutiliza el mismo paquete determinista; no se usa un agente
  resumidor porque agregaria otro turno y otra posible perdida de restricciones.
- 2026-07-16: `high` es el default de implementacion. `medium` se recomienda
  para reanudaciones y trabajo mecanico; `xhigh` solo para seguridad,
  arquitectura, cambios de datos entre modulos o diagnosticos dificiles.
- 2026-07-16: Se fija compactacion a 64,000 tokens totales y salida por
  herramienta a 8,000 tokens para controlar el crecimiento sin truncar las
  verificaciones normales del repo.
- 2026-07-16: El arranque real medido como `AGENTS.md` mas paquete es de
  aproximadamente 2,017 tokens, una reduccion estimada de 83.5% contra el
  baseline completo de 12,200 tokens.

## Risks

- La app y el CLI pueden incluir versiones distintas de Codex; las claves se
  validan con el CLI local y deben volver a revisarse si la app reporta una
  incompatibilidad.
- Una compactacion demasiado agresiva puede perder decisiones; el prompt de
  compactacion preservara tarea, restricciones, archivos, verificacion y
  siguiente accion.
- Un paquete corto pero obsoleto sigue siendo peligroso; conserva validacion de
  frescura, hashes, conflictos y fallback completo.

## Verification

- `node --test .opencode/tests/*.test.js .codex/tests/*.test.js`.
- Generar los paquetes `.codex/state/session-context.json` y
  `.opencode/state/session-context.json`; ambos deben ser iguales y medir
  `<= 10,000` caracteres.
- `codex --strict-config -C /home/otomi/nexo/develoment doctor --summary --no-color`.
- Parsear `.codex/config.toml` y comprobar modelo, esfuerzo, compactacion,
  limite de salida e instrucciones de compactacion.
- Confirmar que los archivos de estado de Codex quedan ignorados y no contienen
  secretos ni historial de conversacion.
