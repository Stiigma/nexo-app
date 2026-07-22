# NEXO-0049 Dependency Selection - Visual Review Surface

## Metadata

- Task ID: `NEXO-0049`
- Date: 2026-07-18
- Evaluator: `nexo`
- Capability gap: Visual annotation and approval of canonical Markdown plans and diffs.

## Current Capabilities

Nexo can create and validate Markdown plans but has no interactive browser
surface for line-level human annotations. Native attention, compaction, output
bounds, local hooks, the existing ledger, and Node standard library cover the
other requested phases without new dependencies.

## Options Considered

1. No new dependency: retain terminal-only plan review and implement all other capabilities locally.
2. `@plannotator/opencode@0.23.1`: mature local visual plan/diff review with manual workflow support.
3. `open-plan-annotator@1.8.7`: smaller plan-only surface with less adoption and no broader diff-review value.

## Criteria

- Necessity and API fit: Plannotator uniquely supplies visual annotation; local code covers every other capability.
- Official source and maintenance: `backnotprop/plannotator`, active repository with frequent releases and documented OpenCode adapter.
- Exact version or immutable identity: npm package `@plannotator/opencode@0.23.1`; floating tags are prohibited.
- License and advisories: MIT OR Apache-2.0; no advisory was identified in reviewed primary metadata.
- Runtime compatibility: Declares Bun 1+ and `@opencode-ai/plugin ^1.1.10`; effective compatibility must pass on the OpenCode2 dev build.
- Transitives, binaries, and install behavior: Package includes local server/UI assets and a postinstall that copies Plannotator commands to the OpenCode config directory.
- Secrets, scopes, network, and data access: Run manually with sharing and Jina URL retrieval disabled; no credentials or external URL review.
- Performance and operating cost: No model call is required to render the UI; it runs only when explicitly invoked.
- Upgrade, exit, and rollback cost: Pin upgrades explicitly; rollback removes one config entry and cached package/global commands if created.

## Dependency Decision Evaluation

- Decision: approved
- Selected identity: `@plannotator/opencode@0.23.1`; no other external productivity dependency is approved.
- Rationale: It provides unique visual review value while local/native OpenCode features satisfy notifications, telemetry, sanitization, context, and visual status.
- Required user approval: Provided for all five phases; sharing, OAuth, credentials, paid inference, commit, push, and deploy remain unapproved.
- Verification: Resolve exact plugin origin, run config/startup diagnostics, manually bounded plugin load checks where possible, and run all harness tests.
- Upgrade path: Create a new governed dependency evaluation for a specific later version before changing the pin.
- Rollback path: Remove the exact plugin tuple and Plannotator-specific environment/config, clear only its cache if needed, and restart OpenCode.

## Supply-Chain Effects

- Manifest and lockfile changes: Exact project config entry; no product manifest or lockfile changes.
- Transitive dependencies: Package-provided local server/UI and `@opencode-ai/plugin` peer integration; no additional package is approved.
- Runtime or image changes: No product runtime or container image change.

## Residual Risks

- Package postinstall can add global commands and the OpenCode2 version uses a dev identifier rather than stable semver.

## Related Evidence

- Plan: `harness/control/plans/NEXO-0049-opencode2-productivity-observability.md`
- Architecture evaluation: `harness/control/decisions/NEXO-0049-architecture-selection.md`
- Security review: required before close.
