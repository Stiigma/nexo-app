# NEXO-0034 - Codex Project Configuration

## Objective

Aplicar al repositorio la configuración de Codex mostrada por el usuario,
usando la capa local `.codex/config.toml` y preservando los MCP ya configurados.

## Done When

- `.codex/config.toml` contiene los defaults solicitados y los plugins indicados.
- Los MCP existentes de Chrome DevTools y GitHub permanecen configurados.
- La configuración carga correctamente en Codex `0.144.1`.
- El cambio queda registrado en el control plane sin secretos reales.

## Scope

- `.codex/config.toml`.
- Registro operativo `NEXO-0034`.

## Out Of Scope

- Modificar la configuración global de `~/.codex/config.toml`.
- Instalar plugins o cambiar credenciales externas.
- Commit, push o deploy.

## Steps

1. Revisar la configuración actual y la compatibilidad de las claves con Codex.
2. Agregar los defaults de modelo, razonamiento, permisos, personalidad y plugins.
3. Validar sintaxis y carga estricta de la configuración.
4. Registrar reporte, implementación, closeout y journal.

## Progress

- 2026-07-15: Configuración aplicada y verificada con Codex `0.144.1`.

## Decision Log

- 2026-07-15: Se usa `.codex/config.toml` porque la solicitud es específica al
  repositorio.
- 2026-07-15: Se omiten `notify` y `enabled-reasoning-efforts`: `notify` no
  aplica en configuración de proyecto y la versión local no documenta la segunda
  clave. `model_reasoning_effort = "xhigh"` conserva el ajuste solicitado.

## Risks

- `gpt-5.6-sol` puede depender de disponibilidad de la cuenta o del entorno.
- `danger-full-access` y `approval_policy = "never"` eliminan las confirmaciones
  interactivas; el cambio queda limitado al repositorio mediante su config local.

## Verification

- `codex --strict-config` desde el repositorio.
- `codex doctor --summary --no-color` desde el repositorio.
- Parseo TOML y revisión de diff.
