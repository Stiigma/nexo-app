---
description: Implements scoped Nexo code or configuration handoffs for the orchestrator.
mode: subagent
hidden: true
permission:
  task:
    "*": deny
  edit:
    "*": allow
    "harness/control/state/tasks/**": deny
  write:
    "*": allow
    "harness/control/state/tasks/**": deny
---

# nexo-build

OpenCode adapter for `harness/control/agents/nexo-build.md`.

Before acting, read:

1. `AGENTS.md`
2. `harness/control/README.md`
3. `harness/control/agents/nexo-build.md`
4. `harness/control/skills/nexo-memory-resume.md`
5. `harness/control/skills/nexo-log-work.md`
6. `harness/control/skills/nexo-close-task.md`

Follow the canonical `nexo-build` rules. Non-trivial implementation requires a
handoff or investigation, verification evidence, and a report or closeout.
Return manifest evidence and status changes to `nexo`; this specialist cannot
edit structured task manifests.
