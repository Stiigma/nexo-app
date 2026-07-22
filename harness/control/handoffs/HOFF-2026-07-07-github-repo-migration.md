# HOFF-2026-07-07-github-repo-migration

## Metadata

- Task ID: NEXO-0030
- Date: 2026-07-07
- Authoring agent: nexo-plan
- Receiving agent: nexo-infra
- Status: ready

## Objective

Migrar los repositorios `back/` y `front/` desde la organización `nexoens` al perfil personal `Stiigma` en GitHub, y configurar el MCP de GitHub en OpenCode para automatización futura.

## Context

Los repos locales `back/` y `front/` fueron conectados erróneamente a repos de la
organización `nexoens` (`nexoens/backend` y `nexoens/front`). Deben residir bajo
el perfil personal `Stiigma` (Eduardo Castro).

El token classic PAT `$GITHUB_PERSONAL_ACCESS_TOKEN` fue provisto y
validado (HTTP 200 contra `/user` → `Stiigma`, Eduardo Castro, tipo User).

Los repos destino (`Stiigma/nexo-api`, `Stiigma/nexo-app`) **no existen** aún (HTTP 404 confirmado).

## Source Docs

- `opencode.json` (proyecto raíz) — configuración actual del MCP `chrome-devtools`
- `harness/control/agents/nexo-infra.md`
- `harness/control/skills/nexo-infra-guardrails.md`

## Files To Create Or Modify

- `opencode.json` — agregar entrada MCP `github` en la sección `mcp`
- `back/.git/config` — cambiar remote `origin`
- `front/.git/config` — cambiar remote `origin`

## Implementation Steps

1. **Validar que `npx gh` funciona** con el token provisto:
   ```bash
   GH_TOKEN=$GITHUB_PERSONAL_ACCESS_TOKEN npx gh auth status
   ```

2. **Crear repos en GitHub bajo `Stiigma`** usando la API:
   ```bash
   curl -X POST -H "Authorization: Bearer $GITHUB_PERSONAL_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
      -d '{"name":"nexo-api","private":false,"description":"Nexo backend API - NestJS modular monolith"}' \
      https://api.github.com/user/repos
   ```
   Y lo mismo para `nexo-app`:
   ```bash
   curl -X POST -H "Authorization: Bearer $GITHUB_PERSONAL_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"nexo-app","private":false,"description":"Nexo frontend app - React PWA"}' \
     https://api.github.com/user/repos
   ```

3. **Actualizar remotes locales**:
   ```bash
   git -C back remote set-url origin git@github.com:Stiigma/nexo-api.git
   git -C front remote set-url origin git@github.com:Stiigma/nexo-app.git
   ```

4. **Hacer push del código** a los nuevos repos (requiere confirmación del usuario):
   ```bash
   git -C back push -u origin main
   git -C front push -u origin main
   ```

5. **Configurar MCP de GitHub en `opencode.json`** (sin hardcodear el token):
   ```json
   "github": {
     "type": "local",
     "command": ["npx", "-y", "@modelcontextprotocol/server-github"],
     "enabled": true
   }
   ```
   El token se provee vía variable de entorno `GITHUB_PERSONAL_ACCESS_TOKEN` en `~/.zshrc`.

6. **Verificar configuración final**:
   ```bash
   git -C back remote -v
   git -C front remote -v
   ```

## Verification

- [ ] Repos `Stiigma/nexo-api` y `Stiigma/nexo-app` existen en GitHub (HTTP 200).
- [ ] `git -C back remote -v` muestra `git@github.com:Stiigma/nexo-api.git`.
- [ ] `git -C front remote -v` muestra `git@github.com:Stiigma/nexo-app.git`.
- [ ] Push exitoso a ambos repos (confirmar manualmente en github.com/Stiigma).
- [ ] `opencode.json` contiene la entrada MCP `github` sin token hardcodeado.
- [ ] El MCP de GitHub aparece como herramienta disponible en la siguiente sesión.

## Risks

- **Token expuesto**: Se migró a `~/.zshrc` como variable de entorno. El handoff ya no contiene el token en texto plano. Se recomienda rotar el token y actualizar la variable.
- **Colisión de nombres**: Si `Stiigma/nexo-api` o `Stiigma/nexo-app` se crean manualmente durante la operación, fallará el POST.
- **Push force**: Si los repos `nexoens` tienen commits que no están en local, git avisará. No hacer force push sin revisar.
- **`npx gh` no instalado como binario**: Se usa `npx` on-demand. Si el MCP de GitHub requiere el binario `gh`, instalar con `sudo pacman -S github-cli`.

## Acceptance Criteria

1. Ambos repos (`back` y `front`) tienen su remote `origin` apuntando a `git@github.com:Stiigma/<repo>.git`.
2. El código está pusheado a ambos repos bajo `Stiigma`.
3. El MCP de GitHub está configurado en `opencode.json` y funcional.

## Required Gates

- QA review: no
- Security review: yes (token migrado a variable de entorno en ~/.zshrc, rotar recomendado)
- User confirmation: yes (antes del push a GitHub)
