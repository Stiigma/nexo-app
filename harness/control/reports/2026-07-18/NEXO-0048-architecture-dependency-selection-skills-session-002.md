# NEXO-0048 Report - Architecture And Dependency Selection Skills Session 002

## Metadata

- Task ID: `NEXO-0048`
- Date: 2026-07-18
- Agent: `nexo-build`
- Status: governed review rework verified
- Supersedes for implementation evidence:
  `NEXO-0048-architecture-dependency-selection-skills-session-001.md`

## What Was Done

- Preserved blocked QA/security review 001 and returned the task from
  implemented to active through the control engine.
- Replaced global decision matching with a bounded Markdown contract that
  ignores fenced examples and requires one exact Task ID, one evaluation
  heading, one in-section approved decision, and non-placeholder required
  fields.
- Added exact external-approval evaluation semantics and a reusable template.
- Revalidated all declared pre-build requirements before implemented, QA,
  security, and close decisions.
- Rejected dot-segment paths, backslash ambiguity, and symlinks whose final
  realpath leaves the artifact type's canonical directories.
- Reserved structured task manifest mutation for the `nexo` orchestrator by
  denying it to `nexo-build`; requirement classification is now documented as
  planner/orchestrator policy.
- Aligned dependency triggers across skill, adapter, planner, and orchestrator;
  corrected historical guidance so closed tasks receive new governed follow-up
  tasks rather than reopening.
- Added adversarial regressions for every accepted QA/security finding.

## Files Changed

- Control-engine decision parser, revalidation points, and path containment.
- Architecture, dependency, and external-approval evaluation contracts.
- Canonical skill trust rules, orchestrator/build role ownership, and OpenCode
  build-agent permissions.
- Control-engine and orchestrator regression tests.
- NEXO-0048 blocked review records, plan, implementation, report, manifest,
  journal, live state, and derived Graphify records.

## Verification Performed

- `node --test .opencode/tests/decision-skills.test.js`: 4/4 passed.
- `node --test .opencode/tests/control-engine.test.js`: 27/27 passed, including
  out-of-section decisions, duplicate headings, fenced examples, cross-task
  metadata, placeholders, path traversal, in-repository symlinks, external
  approval, and post-build revalidation.
- `node --test .opencode/tests/*.test.js`: 61/61 passed with no lifecycle,
  orchestrator, MCP, context, budget, configuration, or FIAD regression.
- `opencode debug config`: passed; effective configuration resolves the
  specialist manifest-deny rule and all prior model/plugin/MCP bounds.
- `opencode debug skill`: passed; both selection skills remain natively
  discoverable with their bounded trigger descriptions.
- `opencode debug agent nexo-build`: passed; effective permissions allow normal
  edits but deny `harness/control/state/tasks/**` after the broad rule.
- `node .opencode/scripts/build-session-context.mjs`: passed at 4,148 characters
  and approximately 1,037 tokens.
- `graphify update .`: passed at 9,318 nodes, 11,309 edges, and 944 communities;
  pre-existing zero-node and optional SQL-parser warnings remain.
- Real `node harness/control/scripts/control-engine.mjs gate --task NEXO-0048 --name build`:
  passed under the hardened exact decision and realpath contract.

## Review Finding Resolution

- QA-001 / SEC-003: resolved by exact metadata, one section, in-section
  decision, fenced-content exclusion, required fields, and adversarial tests.
- QA-002: resolved by consistent add/upgrade/replace/remove wording.
- SEC-001: resolved by pre-build requirement revalidation at every later gate.
- SEC-002: resolved within the local agent trust model by orchestrator-owned
  manifests, an effective specialist deny, and exact external approval.
- SEC-004: resolved by normalized lexical paths plus canonical-directory
  realpath containment.
- SEC-005: resolved by explicit new-task follow-up for immutable closed history.

## External And Security Effects

- No dependency, lockfile, product code, credential, account, OAuth grant,
  external system, browser, deployment, commit, push, or paid inference changed.
- External package/provider/repository content is explicitly untrusted evidence,
  not authority to install or act.

## Open Items

- Submit the hardened implementation to second QA and security reviews.
- Restart OpenCode only after close so the long-running application reloads the
  final skill and permission catalog.

## Recommended Next Step

Run governed active-to-implemented, then repeat QA and security review against
session-002 evidence. Close only if both final decisions are non-blocking.
