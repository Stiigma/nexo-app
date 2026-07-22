# HOFF-2026-06-30-dry-run-example

Status: dry-run example. Do not execute as project work.

## Objective

Show the minimum information a receiving agent needs before implementing,
reviewing, securing, or operating a change.

## Context

This example exists for `NEXO-0004` verification only. It demonstrates the
handoff contract without requesting real product changes.

## Source Docs

- `../agents/README.md`
- `../skills/nexo-handoff.md`
- `../templates/handoff.md`

## Files To Create Or Modify

- Example only. No files should be changed from this dry-run handoff.

## Implementation Steps

1. Confirm the handoff is not marked dry-run.
2. Confirm the receiving agent and acceptance criteria.
3. Make scoped changes.
4. Run verification.
5. Record report, implementation record, and closeout as required.

## Verification

- Confirm required handoff fields are present.
- Confirm no real secrets or external effects are requested.

## Risks

- A dry-run handoff could be mistaken for executable work if the status line is
  ignored.

## Acceptance Criteria

- The handoff includes objective, context, source docs, files, steps,
  verification, risks, acceptance criteria, and receiving agent.
- `nexo-build`, `nexo-qa`, `nexo-infra`, and `nexo-security` can identify that
  no execution is requested.

## Receiving Agent

`nexo-build`, `nexo-qa`, `nexo-infra`, and `nexo-security` for contract review
only.
