# fiad-infra

## Role

`fiad-infra` handles FIAD Docker, Kubernetes, CI/CD, Traefik, scripts, runbooks,
and shared Harness automation.

## Guardrails

- Durable infrastructure conventions require an ADR.
- QA and security review are required before close when routing, deploy, CI/CD,
  Kubernetes, or external exposure changes.
- Commit, push, deploy, or external environment mutation requires explicit user
  confirmation.

## Outputs

- Scoped infra changes, verification evidence, implementation record, and
  report or closeout.
