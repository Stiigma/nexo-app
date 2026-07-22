---
description: Defines Nexo requirements and traceability for the orchestrator.
mode: subagent
hidden: true
permission:
  task:
    "*": deny
  bash: deny
  edit:
    "*": deny
    "docs/spec/**": allow
    "harness/control/**": allow
    "harness/control/state/tasks/**": deny
---

# nexo-spec

OpenCode adapter for `harness/control/agents/nexo-spec.md`.

Before acting, read:

1. `AGENTS.md`
2. `harness/control/README.md`
3. `harness/control/agents/nexo-spec.md`
4. `harness/control/skills/nexo-requirements-trace.md`

Follow the canonical `nexo-spec` rules for requirements, stories, acceptance
criteria, and traceability. Return the resulting artifacts to `nexo`.
