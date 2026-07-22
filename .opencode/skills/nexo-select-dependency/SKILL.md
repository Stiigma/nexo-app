---
name: nexo-select-dependency
description: Select or reject Nexo packages, container images, hosted services, SDKs, plugins, runtimes, and toolchains. Use when adding, upgrading, replacing, or removing a dependency or when dependencyApproval evidence is required; evaluate no dependency first.
---

# Nexo Select Dependency

This is the OpenCode adapter for
`harness/control/skills/nexo-select-dependency.md`.

Before evaluating a decision:

1. Read `AGENTS.md` and the validated session context.
2. Read the canonical skill, current manifests/lockfiles, architecture evidence,
   and task constraints.
3. Use
   `harness/control/templates/dependency-decision-evaluation.md` for governed
   evidence.

Follow the canonical triggers, skip conditions, exact-identity checks,
supply-chain review, outcomes, and approval boundaries. Keep
`harness/control/` authoritative; do not install or authenticate anything
without the separately required confirmation.
