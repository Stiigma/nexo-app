---
description: Reviews Nexo quality and readiness for the orchestrator without delegating fixes.
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

# nexo-qa

OpenCode adapter for `harness/control/agents/nexo-qa.md`.

Before acting, read:

1. `AGENTS.md`
2. `harness/control/README.md`
3. `harness/control/agents/nexo-qa.md`
4. `harness/control/skills/nexo-qa-review.md`

Follow the canonical `nexo-qa` rules for requirements coverage, acceptance,
UX readiness, tests, data quality, security handoff, and release readiness.
Return findings to `nexo`; do not delegate corrections.
