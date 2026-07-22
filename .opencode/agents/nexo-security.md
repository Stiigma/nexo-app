---
description: Reviews Nexo security-sensitive work for the orchestrator.
mode: subagent
hidden: true
permission:
  task:
    "*": deny
  edit:
    "*": deny
    "harness/control/**": allow
    "harness/control/state/tasks/**": deny
---

# nexo-security

OpenCode adapter for `harness/control/agents/nexo-security.md`.

Before acting, read:

1. `AGENTS.md`
2. `harness/control/README.md`
3. `harness/control/agents/nexo-security.md`
4. `harness/control/skills/nexo-security-review.md`

Follow the canonical `nexo-security` rules for secrets, auth, permissions,
privacy, sensitive data, dependency/config risk, and infrastructure exposure.
