# HOFF-2026-07-16-chatgpt-codex-token-efficient-workflow

## Metadata

- Task ID: `NEXO-0038`
- Date: 2026-07-16
- Authoring agent: `nexo-plan`
- Receiving agent: `nexo-build`
- Status: completed

## Objective

Dar a la app de ChatGPT/Codex un flujo nativo y eficiente en tokens que
mantenga razonamiento fuerte, codigo de calidad y todos los gates de Nexo.

## Context

NEXO-0035 redujo el arranque estimado de unas 12,200 a unas 1,029 tokens para
OpenCode. La app de ChatGPT comparte `.codex/config.toml` con Codex CLI y puede
usar Terra, controlar esfuerzo, compactacion y limite de salida, pero el
arranque del repo todavia nombra rutas exclusivas de `.opencode/`.

## Source Docs

- `AGENTS.md`.
- `harness/control/plans/NEXO-0038-chatgpt-codex-token-efficient-workflow.md`.
- `harness/control/implementations/IMPL-NEXO-0035-terra-token-efficient-workflow.md`.
- `.codex/config.toml`.
- `.opencode/scripts/build-session-context.mjs`.
- Manual oficial de Codex: modelos, `config.toml` y `AGENTS.md`.

## Files To Create Or Modify

- `harness/control/scripts/build-session-context.mjs`.
- `.opencode/scripts/build-session-context.mjs`.
- `.codex/scripts/build-session-context.mjs`.
- `.codex/config.toml`.
- `.codex/.gitignore`.
- `.codex/tests/codex-token-efficiency.test.js`.
- `AGENTS.md` y documentos vivos del control plane que describen el arranque.
- Registros de implementacion, QA, seguridad, reporte y journal de NEXO-0038.

## Implementation Steps

1. Mover la implementacion real del compilador al control plane y convertir el
   archivo de OpenCode en un adaptador compatible.
2. Crear el adaptador Codex con salida fail-closed bajo `.codex/state/`.
3. Ajustar la configuracion local a Terra/high/low verbosity, compactacion a
   64K, limite de salida de 8K y un prompt corto de compactacion segura.
4. Documentar el selector de esfuerzo por riesgo y el fallback completo.
5. Agregar pruebas que cubran igualdad de paquetes, configuracion y carga.

## Verification

- Ejecutar todas las pruebas sinteticas de `.opencode` y `.codex`.
- Validar ambos paquetes y su limite duro.
- Cargar la configuracion con `codex --strict-config`.
- Revisar diff, ignores, secretos y preservacion de gates.

## Risks

- Divergencia futura entre los adaptadores si contienen logica propia.
- Diferencia de version entre la app y el CLI.
- Perdida de contexto por compactacion o salida truncada.

## Acceptance Criteria

- Una sola implementacion compartida del compilador.
- Paquetes Codex/OpenCode deterministas e iguales.
- Terra y esfuerzo `high` cargan como defaults del proyecto.
- `xhigh` no se usa globalmente para tareas ordinarias.
- Fallas de frescura/hash/conflicto eliminan el paquete viejo y activan el
  fallback completo.
- Pruebas, QA y seguridad permanecen sin reduccion.

## Required Gates

- QA review: required.
- Security review: required because context and local-state boundaries change.
- User confirmation: already provided for local implementation; separately
  required for commit, push, deploy or paid benchmark.
