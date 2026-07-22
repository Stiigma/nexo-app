# Runbook - Command Code Fallback For OpenCode

## Purpose

Usar Command Code (`cmd`) como fallback maximo cuando OpenCode falle o no este
disponible, manteniendo el mismo sistema operativo de Nexo:
`AGENTS.md`, `harness/control/`, agentes `nexo-*`, handoffs, reports, closeouts,
journal y restricciones de commit/push/deploy.

El objetivo es maxima equivalencia practica, no paridad exacta con plugins
internos de OpenCode.

## Preconditions

- Ejecutar comandos desde la raiz del workspace:
  `/home/otomi/nexo/develoment`.
- `cmd status` debe mostrar autenticacion valida.
- `cmd --list-models` debe incluir `deepseek/deepseek-v4-pro`.
- `cmd mcp list` debe mostrar `chrome-devtools` y `github` con scope `project`.
- No guardar secretos reales en archivos. Si GitHub MCP requiere token, exportarlo
  en el entorno local o en el mecanismo seguro que use el operador.

## Baseline Checks

```bash
cmd --version
cmd status
cmd --list-models
cmd mcp list
```

## Resume Prompt

```bash
cmd -t --model deepseek/deepseek-v4-pro "Actua como fallback de OpenCode para Nexo. Lee AGENTS.md, harness/control/README.md, harness/control/WORKFLOW.md, harness/control/tasks.md, harness/control/state/CURRENT.md, harness/control/state/NEXT.md y el journal de hoy. Resume estado actual, tarea activa, riesgos y siguiente paso."
```

## Plan Prompt

```bash
cmd -t --plan --model deepseek/deepseek-v4-pro "Usa nexo-plan para preparar un plan/handoff segun harness/control."
```

## Build Prompt

```bash
cmd -t --permission-mode standard --model deepseek/deepseek-v4-pro "Usa nexo-build. Implementa solo desde handoff/investigacion existente, verifica y registra reporte."
```

## Non-Mutating Smoke Test

```bash
cmd -p --max-turns 2 -t --model deepseek/deepseek-v4-pro "Lee AGENTS.md y harness/control/tasks.md. No edites archivos. Resume la tarea activa y el siguiente paso."
```

El output esperado debe mencionar:

- `harness/control/` como control plane canonico.
- Tareas `NEXO-*`.
- Restricciones de workflow: no commit, push, deploy ni cambios externos sin
  confirmacion explicita.

## MCP Setup

Los MCPs de proyecto se agregaron con:

```bash
cmd mcp add --scope project --transport stdio chrome-devtools -- npx -y chrome-devtools-mcp@latest --browser-url=http://127.0.0.1:9222 --no-usage-statistics --no-performance-crux
cmd mcp add --scope project --transport stdio github -- npx -y @modelcontextprotocol/server-github
```

La configuracion resultante vive en `.mcp.json`.

### Chrome DevTools

Antes de usar el MCP de navegador, iniciar Chrome dedicado:

```bash
google-chrome-stable --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-nexo-mcp
```

Usar perfil temporal para no exponer el perfil personal del navegador.

### GitHub

`@modelcontextprotocol/server-github` puede requerir token de GitHub por entorno.
No escribir tokens reales en `.mcp.json`, `.env`, docs, reports ni prompts
persistidos.

## Interactive Command Code Shortcuts

Dentro de una sesion interactiva:

- `/usage`: sustituto parcial del budget guard de OpenCode.
- `/plan`: activar o revisar modo plan.
- `/model`: cambiar modelo.
- `/mcp`: gestionar MCPs.
- `/agents`: revisar agentes disponibles.
- `/skills`: revisar skills disponibles.

## Operational Guardrails

- Leer siempre los documentos de arranque del control plane antes de actuar.
- Usar routing canonico: `nexo-plan`, `nexo-build`, `nexo-design`, `nexo-qa`,
  `nexo-infra`, `nexo-security`, `nexo-spec`.
- Cerrar toda sesion significativa con report o closeout.
- No ejecutar prompts de build que muten archivos sin tarea, handoff o
  investigacion clara.
- Commit, push, deploy, gasto externo intencional o cambios en entornos externos
  requieren confirmacion explicita del usuario.

## Rollback

1. Remover los bloques `chrome-devtools` y `github` de `.mcp.json`.
2. Remover las reglas agregadas a `.commandcode/taste/taste.md`.
3. Actualizar `tasks.md`, `README.md` y `state/*` con el estado revertido.
4. Registrar reporte/journal de rollback.

## Related Records

- Plan: `../plans/NEXO-0030-command-code-fallback.md`
- Implementation: `../implementations/NEXO-0030-command-code-fallback.md`
- Report: `../reports/2026-07-08/NEXO-0030-command-code-fallback-session-001.md`

