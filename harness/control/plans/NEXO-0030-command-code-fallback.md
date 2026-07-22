# NEXO-0030 - Command Code Fallback For OpenCode

## Objective

Configurar Command Code (`cmd`) como fallback operativo de OpenCode para Nexo,
usando el mismo control plane canonico: `AGENTS.md`, `harness/control/`,
agentes `nexo-*`, journal, reports, handoffs y restricciones de workflow.

## Done When

- [x] `NEXO-0030` esta registrado en `tasks.md`.
- [x] `.commandcode/taste/taste.md` refuerza las reglas especificas de Nexo.
- [x] Command Code tiene MCPs de proyecto equivalentes para Chrome DevTools y
  GitHub.
- [x] Existe un runbook con prompts y comandos reproducibles para resume, plan,
  build, MCPs, modelos y smoke test.
- [x] Se documenta que GitHub MCP puede requerir token por entorno, sin guardar
  secretos reales.
- [x] Hay implementation record y reporte de sesion.

## Scope

- Configuracion local de Command Code por proyecto.
- Documentacion operativa bajo `harness/control/runbooks/`.
- Live state bajo `harness/control/README.md`, `tasks.md`, `state/CURRENT.md` y
  `state/NEXT.md`.

## Out Of Scope

- Portar el plugin `.opencode/plugins/nexo-budget-guard.js`.
- Reemplazar `opencode.json` o comandos internos de OpenCode.
- Ejecutar prompts de build con mutacion de codigo.
- Guardar tokens reales de GitHub u otros proveedores.

## Steps

1. Registrar `NEXO-0030` en `tasks.md`.
2. Reforzar `.commandcode/taste/taste.md` con reglas de arranque, routing,
   cierre de sesion y restricciones.
3. Configurar MCPs de Command Code en scope de proyecto:
   `chrome-devtools` y `github`.
4. Crear runbook `NEXO-0030-command-code-fallback.md`.
5. Verificar CLI, autenticacion, modelos y MCP list.
6. Ejecutar smoke test no mutante con `cmd -p --max-turns 2`.
7. Registrar implementation, reporte y journal.

## Progress

- 2026-07-08: Plan ejecutado. Command Code queda configurado como fallback
  documentado de OpenCode.

## Decision Log

- 2026-07-08: La equivalencia practica se resuelve con `taste.md`, MCPs de
  proyecto y runbook de prompts reproducibles; no se intenta paridad exacta con
  plugins/eventos internos de OpenCode.
- 2026-07-08: `deepseek/deepseek-v4-pro` queda como modelo sugerido para
  sesiones fallback por similitud con el uso reciente de OpenCode; `claude-sonnet-5`
  queda como alternativa manual para tareas dificiles.
- 2026-07-08: `NEXO-0030` se registra aunque ya exista plan `NEXO-0031`; no se
  renumeran IDs porque el control plane requiere IDs estables.

## Risks

- Command Code no expone un sistema equivalente confirmado para el budget guard
  de OpenCode; usar `/usage` y reportes como mitigacion operativa.
- Los MCPs usan `npx -y`; la primera ejecucion real puede requerir red y cachear
  paquetes.
- GitHub MCP puede requerir token por variable de entorno segun el servidor; no
  debe escribirse un token real en archivos del repo.

## Verification

- [x] `cmd --version`
- [x] `cmd status`
- [x] `cmd --list-models`
- [x] `cmd mcp list`
- [x] Smoke test no mutante con `cmd -p --max-turns 2` completado.
