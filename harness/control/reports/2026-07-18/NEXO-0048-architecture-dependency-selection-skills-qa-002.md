# NEXO-0048 QA Review 002 - Architecture And Dependency Selection Skills

## Metadata

- Task ID: `NEXO-0048`
- Date: 2026-07-18
- QA agent: `nexo-qa`
- Reviewed artifact: governed rework and session-002 evidence
- Decision: blocked

## Scope

Re-review QA-001 and QA-002, adversarial decision parsing, specialist ownership,
historical guidance, regression evidence, and close readiness.

## Findings

### QA2-001 - Malformed Fence Closers Expose Hidden Evaluations

Severity: high, blocking.

Fence parsing remembers only the delimiter character. A shorter delimiter or a
same-character marker with trailing text can incorrectly close a longer fence,
making a still-fenced evaluation visible to the engine.

Required mitigation:

- Track delimiter character and opening length.
- Close only on the same character at least as long as the opener and followed
  only by whitespace.
- Fail closed on unterminated fences and test backtick/tilde mismatches plus
  pseudo-closing text.

### QA2-002 - Manifest Ownership Does Not Cover Every Mutating Specialist

Severity: high, blocking.

`nexo-build` is denied manifest edits, but spec, design, QA, infrastructure, and
security roles still have edit rules that can reach structured task manifests.

Required mitigation:

- Apply the manifest deny after broad edit allows for every mutating specialist
  except the planner, which owns initial requirement classification.
- Expand effective-permission regression coverage across all affected roles.

### QA2-003 - Live Guidance Is Stale

Severity: low.

The plan still suggests reopening closed historical tasks and `state/NEXT.md`
does not reflect the current review phase.

Required mitigation:

- Align both records with immutable history and the active rework state.

## Confirmed Resolution

- QA-002 trigger vocabulary is aligned for add, upgrade, replace, and remove.
- Exact task metadata, evaluation sections, required fields, revalidation, and
  realpath containment work for normal well-formed Markdown.
- All 61 pre-review tests passed.

## Required Follow-Up

Return to active through the control engine, implement all findings, add a valid
external-approval positive case, rerun acceptance, and submit a third QA review.
