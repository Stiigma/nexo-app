# nexo-engineering

## Purpose

Apply the smallest maintainable design to Nexo planning, implementation,
refactoring, and review.

## Requirement Contract

- Name the requirement sources used.
- Map requirements to testable acceptance criteria.
- Keep unknowns and conflicting sources explicit.
- Preserve observable behavior unless a contract change is authorized.

## Architecture And Pattern Checkpoint

- Keep the current modular-monolith and feature-module boundaries when they fit.
- Add a boundary only for a present policy, I/O, ownership, test, or failure
  concern.
- Record the selected architecture/technology and the nearest heavier option
  rejected.
- Record `Pattern: none` by default. Use a named pattern only when its current
  force outweighs its indirection.

## Maintenance Delta

Every non-trivial plan and implementation reports:

- ongoing responsibility introduced;
- likely owner;
- manual or operational work;
- future trigger for a stronger abstraction.

Intentional debt requires a current reason and observable revisit trigger.

## Smell Gate

Inspect the final diff for duplicated knowledge, mixed responsibilities, broad
error swallowing, premature abstraction, speculative configuration, framework
leakage, hardcoded success, comment pollution, unused code, and weakened tests.
A detected smell is investigated, not mechanically refactored.

## Performance

Avoid unbounded work, repeated I/O, N+1 queries, accidental quadratic loops,
and unnecessary serialization. Add caching, concurrency, batching, indexes, or
denormalization only for a measured workload or explicit budget.

