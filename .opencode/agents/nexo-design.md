---
description: Defines Nexo user experience and interface behavior for the orchestrator.
mode: subagent
hidden: true
permission:
  task:
    "*": deny
  bash: deny
  edit:
    "*": deny
    "docs/design/**": allow
    "harness/control/**": allow
    "harness/control/state/tasks/**": deny
---

# nexo-design

OpenCode adapter for `harness/control/agents/nexo-design.md`.

Before acting, read:

1. `AGENTS.md`
2. `harness/control/README.md`
3. `harness/control/agents/nexo-design.md`
4. `harness/control/skills/nexo-design-spec.md`

Follow the canonical `nexo-design` rules for screens, flows, forms, visible
states, responsive behavior, and accessibility. Return the resulting artifacts
to `nexo`.
