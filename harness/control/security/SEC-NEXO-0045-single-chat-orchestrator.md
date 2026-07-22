# NEXO-0045 Security Review - Single-Chat Orchestrator

## Metadata

- Task ID: `NEXO-0045`
- Date: 2026-07-18
- Security agent: `nexo-security`
- Reviewed artifact: Nexo delegation and tool-permission topology
- Decision: approved

## Scope

Review primary-agent privileges, specialist delegation, role write scopes,
external-action approvals, and unchanged integrations.

## Data And Trust Boundaries

- `nexo` owns the user conversation and may invoke only eight allowlisted Nexo
  specialists.
- Every specialist has Task denied, preventing model-initiated nested
  delegation.
- External-directory access asks for approval.

## Secrets And Environment

- No secret, credential, token, environment value, or provider data was read or
  written.

## Authentication And Sessions

- Product authentication and session behavior did not change.

## Roles And Permissions

- `nexo` retains local edit and shell access needed to orchestrate end-to-end
  work.
- Common commit, push, tag, release, and package-publish commands ask for
  approval.
- Planner, spec, design, QA, and security writes are scoped to their documented
  areas; resume cannot edit; build and infra retain implementation access.

## Sensitive Data

- No product or user data was accessed.

## Dependencies And Configuration

- No dependency or OpenCode version changed.
- Native OpenCode primary/subagent, hidden, and ordered task-permission features
  were verified against current official documentation and runtime output.

## Infrastructure Exposure

- No port, service, repository remote, deployment, DNS, cloud resource, or MCP
  configuration changed.

## Findings

- No blocking finding.

## Required Mitigations

- Restart OpenCode before relying on the new topology.
- Keep commit, push, deploy, paid inference, and external mutations behind
  explicit user confirmation.

## Residual Risk

- `hidden: true` removes specialists from autocomplete but is not an access
  control against a user who invokes a known subagent directly.
- External-action bash patterns cover common commands, not every possible tool
  spelling; canonical approval rules remain prompt-enforced.
- Existing GitHub and Chrome MCP commands remain globally enabled and mutable.
- Historical control-plane immutability remains policy-enforced until the
  structured control engine is implemented.
