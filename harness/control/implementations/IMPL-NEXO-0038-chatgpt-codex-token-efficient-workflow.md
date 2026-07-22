# IMPL-NEXO-0038 - ChatGPT/Codex Token-Efficient Workflow

## Metadata

- Task ID: `NEXO-0038`
- Date: 2026-07-16
- Implementing agent: `nexo-build`
- Status: implemented and verified locally

## Objective

Extender a la app de ChatGPT/Codex el arranque compacto y la politica de
razonamiento proporcional al riesgo de NEXO-0035 sin duplicar el compilador ni
reducir gates de calidad.

## Architecture

`harness/control/scripts/build-session-context.mjs` contiene ahora la unica
implementacion del compilador. Los dos adaptadores solo fijan su archivo de
salida:

- ChatGPT/Codex: `.codex/state/session-context.json`.
- OpenCode: `.opencode/state/session-context.json`.

Ambos conservan el contrato fail-closed: validan frescura, fila de tarea,
estado, enlaces, presencia del ID, hashes SHA-256 y limite duro de 10,000
caracteres. Si cualquier validacion falla, eliminan el paquete anterior.

## Codex Configuration

La configuracion local del proyecto aplica:

- `model = "gpt-5.6-terra"`.
- `model_reasoning_effort = "high"` y el mismo esfuerzo para Plan mode.
- Verbosidad baja y resumen de razonamiento conciso.
- Compactacion automatica a 64,000 tokens totales.
- Maximo de 8,000 tokens almacenados por salida de herramienta.
- Maximo preventivo de 12,000 bytes para `AGENTS.md`; el archivo real mide
  3,917 caracteres.
- Prompt de compactacion que conserva tarea, intencion, decisiones,
  restricciones, archivos, resultados de verificacion, riesgos y siguiente
  accion, y prohibe afirmar validaciones no ejecutadas.

La politica operativa recomienda `medium` para resume/status/mecanica, `high`
para trabajo normal y `xhigh` solo para arquitectura, seguridad, datos entre
modulos, diagnosticos dificiles o revision final de alto riesgo. El proyecto
queda en `high` como default seguro porque la app no cambia automaticamente el
esfuerzo dentro de una misma tarea; el selector bajo el compositor permite el
ajuste puntual.

## Token Profile

- Paquete actual: 4,148 caracteres, aproximadamente 1,037 tokens.
- `AGENTS.md` + paquete: 8,065 caracteres, aproximadamente 2,017 tokens.
- Contra el baseline completo aproximado de 12,200 tokens de NEXO-0035, el
  arranque operativo de ChatGPT/Codex baja aproximadamente 83.5%.
- Si se compara solo el paquete compilado contra el baseline, la reduccion
  estimada es 91.5%.

Estas son estimaciones de cuatro caracteres por token; no se ejecuto una
solicitud pagada ni un benchmark real.

## Files

- `AGENTS.md`.
- `.codex/config.toml`.
- `.codex/.gitignore`.
- `.codex/README.md`.
- `.codex/scripts/build-session-context.mjs`.
- `.codex/tests/codex-token-efficiency.test.js`.
- `.opencode/scripts/build-session-context.mjs`.
- `harness/control/scripts/build-session-context.mjs`.
- `harness/control/README.md`.
- `harness/control/WORKFLOW.md`.
- `harness/control/agents/README.md`.
- `harness/control/skills/nexo-memory-resume.md`.
- `harness/control/state/CURRENT.md`.
- `harness/control/state/focus.json`.
- Control-plane plan, handoff, task, journal, QA, security, report and closeout
  records for NEXO-0038.

## Compatibility

- Los exports usados por las pruebas de OpenCode permanecen compatibles a
  traves del adaptador `.opencode/scripts/`.
- El cache local de modelos de Codex confirma `gpt-5.6-terra` y esfuerzos
  `medium`, `high` y `xhigh`.
- Codex CLI 0.144.5 carga la configuracion del proyecto en modo estricto.
- La documentacion oficial indica que la app de ChatGPT, Codex CLI y la
  extension de IDE comparten `config.toml`; una tarea nueva aplica los defaults.

## Verification

- 21/21 pruebas sinteticas pasan.
- Ambos adaptadores generan paquetes byte-for-byte identicos.
- Los dos paquetes miden 4,148 caracteres y cumplen el limite de 10,000.
- `codex --strict-config ... doctor --summary --no-color`: 17 OK, 0 fail.
- Los tres scripts pasan `node --check`.
- No se hizo llamada de modelo, cambio global, commit, push o deploy.

## Maintenance Rules

- Modificar la logica solo en `harness/control/scripts/`; los adaptadores deben
  seguir limitados a salida y compatibilidad de superficie.
- Actualizar `state/focus.json` cuando cambie la fila, plan, handoff o reporte
  del foco. Nunca relajar hashes o frescura para hacer pasar la compilacion.
- Si una nueva version de la app rechaza una clave, verificar primero la
  version incluida en la app y el manual oficial antes de cambiar el contrato.
- Mantener los archivos generados ignorados y libres de conversaciones,
  credenciales y URLs firmadas.
