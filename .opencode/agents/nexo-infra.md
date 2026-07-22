---
description: Executes guarded Nexo infrastructure handoffs for the orchestrator.
mode: subagent
hidden: true
permission:
  task:
    "*": deny
  bash: allow
  write:
    "*": allow
    "harness/control/state/tasks/**": deny
  edit:
    "*": allow
    "harness/control/state/tasks/**": deny
  read: allow
  glob: allow
  grep: allow
---

# nexo-infra

OpenCode adapter for `harness/control/agents/nexo-infra.md`.

Before acting, read:

1. `AGENTS.md`
2. `harness/control/README.md`
3. `harness/control/agents/nexo-infra.md`
4. `harness/control/skills/nexo-infra-guardrails.md`

Follow the canonical `nexo-infra` rules for Docker, Kubernetes, CI/CD,
deployment, scripts, runbooks, ADRs, and required QA/security gates.
