# NEXO-0044 Security Review - OpenCode Effective Configuration

## Metadata

- Task ID: `NEXO-0044`
- Date: 2026-07-18
- Security agent: `nexo-security`
- Reviewed artifact: OpenCode config and `nexo-plan` permissions
- Decision: approved

## Scope

Review the model/config repair and the planner permission change for unintended
write, secret, provider, or external-environment exposure.

## Data And Trust Boundaries

OpenCode loads project config and local plugins at startup. `nexo-plan` may
delegate only to `nexo-build` and `nexo-infra`; its direct writes are now
limited to `harness/control/**`.

## Secrets And Environment

- No secret, token, credential, or provider key was added or read.

## Authentication And Sessions

- No application authentication or session behavior changed.

## Roles And Permissions

- `nexo-plan` keeps `bash: deny`.
- Task delegation remains deny-all with explicit build/infra exceptions.
- Edit permission is deny-all followed by allow `harness/control/**`.
- Product code, application config, and external directories are outside the
  planner edit allowance.

## Sensitive Data

- No sensitive product or user data was accessed.

## Dependencies And Configuration

- The active OpenCode version was not changed.
- The bundled postinstall fetched the matching platform binary for the already
  installed version.
- Model configuration uses an ID advertised by the repaired runtime.

## Infrastructure Exposure

- No port, service, deployment, DNS, cloud resource, or repository remote was
  changed.

## Findings

- No task-scoped blocking security finding.

## Required Mitigations

- Restart OpenCode before relying on the corrected config.
- Keep commit, push, deploy, paid inference, and external mutations behind
  explicit user approval.

## Residual Risk

- The planner can edit any control-plane file, including historical records;
  canonical append-only rules remain prompt-enforced until the structured
  control engine is implemented.
- Existing GitHub and Chrome MCP commands remain globally enabled and unpinned;
  their replacement is explicitly out of scope for NEXO-0044.
