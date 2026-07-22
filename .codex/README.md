# Nexo en ChatGPT/Codex

La app de ChatGPT y Codex CLI comparten `.codex/config.toml` para este
proyecto. Al abrir una tarea nueva en este repo, el default es Terra con
razonamiento alto y verbosidad baja.

## Arranque compacto

1. Ejecutar `node .codex/scripts/build-session-context.mjs`.
2. Leer `AGENTS.md`, `.codex/state/session-context.json` y el agente canonico
   correspondiente bajo `harness/control/`.
3. Usar el fallback completo de `AGENTS.md` solo si el paquete falla o no basta
   para la decision actual.

El archivo generado es local, queda ignorado y no contiene conversaciones ni
secretos. OpenCode usa su propio adaptador, pero ambos llaman al mismo
compilador canonico bajo `harness/control/scripts/`.

## Selector de razonamiento

- Medium: reanudar, resumir, registrar estado o hacer cambios mecanicos.
- High: implementacion, plan, QA y diagnostico normal.
- Extra High: seguridad, arquitectura, cambios de datos entre modulos,
  diagnosticos dificiles o revision final de alto riesgo.

El ahorro se obtiene eliminando contexto duplicado y limitando ruido, no
quitando pruebas, typecheck, schema, QA o revision de seguridad.
