# NEXO-0049 QA Review 001 - OpenCode2 Productivity And Observability

## Metadata

- Task ID: `NEXO-0049`
- Date: 2026-07-18
- QA agent: `nexo-qa`
- Reviewed artifact: session-001 implementation, runtime adapters, config,
  tests, runbook, and implemented transition

## QA Decision Evaluation

- Decision: pass
- Reviewed evidence: NEXO-0049 plan, handoff, architecture/dependency/external
  approvals, implementation record, session-001 report, exact package metadata,
  81-test suite, effective config/info/startup, doctor, pseudo-TTY startup,
  compact context, Graphify, and governed QA gate.
- Findings: no blocking quality finding remains. The real TTY smoke exposed and
  resolved CommonJS loader incompatibility; the first full suite exposed and
  resolved one stale FIAD test import; pre-close security review narrowed manual
  annotation to supported project-relative files.
- Residual risk: the current process must restart before the normal user TUI can
  display the footer, and final human interaction with the visual annotation UI
  remains runtime acceptance rather than automated browser coverage.

## Scope

Verify all five approved phases, effective runtime loading, regression safety,
privacy constraints, operational rollback, and governed close readiness.

## Requirements Coverage

- Runtime diagnosis/repair: covered by the deterministic doctor and both CLI
  identities.
- Manual visual review: covered by exact Plannotator `0.23.1`, three project
  commands, manual workflow, local-only guards, and effective plugin discovery.
- TUI status/attention: covered by valid `tui.json`, typed footer source,
  runtime config load, and focused tests.
- Sanitization/secret access: covered by direct redaction and denial tests.
- Tool telemetry: covered by deduplication, duration, privacy, and concurrent
  ledger-write tests.
- Native bounds/optional observability: covered by effective config and
  loopback HTTP tests.

## Acceptance Criteria

- All five phases have implemented native/local output: pass.
- Nexo and canonical memory remain unchanged in authority: pass.
- One exact dependency and no overlapping workflow package: pass.
- Content-free telemetry and local-only visual/status behavior: pass.
- Required gates and rollback documentation: pass.

## UX And Accessibility

- TUI status uses theme colors and two compact text rows; it does not consume
  prompt content.
- The status page is responsive at its mobile breakpoint, uses semantic
  headings/articles, auto-refreshes without script, and escapes all dynamic
  text.
- Attention uses the native notification/sound system at bounded volume.

## Automated Tests

- Runtime productivity: 4/4 passed.
- Productivity privacy plugin: 4/4 passed.
- Budget guard: 9/9 passed.
- Complete OpenCode harness: 81/81 passed.

## Manual Verification

- Effective config resolves exact Plannotator, local adapters/commands, native
  bounds, and disabled sharing.
- Effective info resolves five server plugins.
- Pseudo-TTY launch loads server plugins and `tui.json` without loader errors.
- Doctor reports no blocker and one explicit runtime-version warning.

## Data Integrity

- Ledger migration is additive to schema version 3 and preserves existing
  message/session/task/model/agent/phase summaries.
- One queue serializes tool and message writes; the concurrency regression test
  proves neither update is lost.
- No product database or persisted product data changed.

## Security Handoff

- Security review is required and follows this QA pass.
- Pre-review secret scan found no credential signature in the changed OpenCode
  surface.

## Release Readiness

- Ready for local use after OpenCode restart.
- No deploy, release, commit, push, service installation, or external mutation
  is part of this task.

## Findings

- No blocking finding remains.

## Required Follow-Up

- Restart OpenCode after governed close.
- Revalidate plugin/TUI compatibility before changing either runtime version.
