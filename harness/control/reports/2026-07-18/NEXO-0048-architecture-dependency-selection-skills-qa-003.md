# NEXO-0048 QA Review 003 - Architecture And Dependency Selection Skills

## Metadata

- Task ID: `NEXO-0048`
- Date: 2026-07-18
- QA agent: `nexo-qa`
- Reviewed artifact: final review-002 rework and session-003 evidence
- Decision: blocked

## Scope

Re-review strict fences, task-bound reviews, specialist manifest permissions,
trigger/external-approval coverage, live state, and close readiness.

## Finding

### QA3-001 - Valid Opposite-Delimiter Info Strings Are Not Recognized

Severity: high, blocking.

The shared opening-fence regex rejects valid backtick info strings beginning
with `~` and valid tilde info strings beginning with a backtick. Evidence inside
an unclosed valid fence can therefore be treated as visible authorization.

Required mitigation:

- Parse opening fences with delimiter-specific info-string rules.
- Permit tildes in backtick info strings while excluding backticks.
- Permit backticks in tilde info strings.
- Test unclosed and normally closed forms for both delimiter types.

## Live-State Finding

Severity: low.

`state/NEXT.md` still describes review-002 rework after session-003 completed it.
Update it to the actual final-review phase.

## Controls Confirmed

- Exact QA/security review contracts, external-approval coverage, trigger
  vocabulary, specialist manifest denies, later-gate revalidation, and path
  containment are otherwise resolved.
- Focused and complete tests pass for the currently represented cases.

## Required Follow-Up

Return to active through the engine, make the delimiter-specific correction,
rerun all checks, and submit new final review evidence.
