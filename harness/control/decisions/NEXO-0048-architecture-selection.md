# NEXO-0048 Architecture Selection

## Metadata

- Task ID: `NEXO-0048`
- Date: 2026-07-18
- Evaluator: `nexo`
- Scope: reusable selection skills and governed decision validation

## Context

The control engine already consumes repository evidence before build, while the
control plane already owns reusable skills. The missing seam is a consistent
procedure and artifact contract for architecture decisions.

## Constraints

- Keep `harness/control/` canonical across agent surfaces.
- Keep the control engine read-only and deterministic.
- Avoid a parallel workflow engine or model-scoring service.
- Preserve the existing manifest artifact interface.

## Options Considered

1. Keep architecture decisions as unconstrained plan prose. This is minimal but
   cannot distinguish an approved decision from discussion or deferral.
2. Add canonical skills and templates, then validate their structural contract
   in the current control engine. This reuses existing seams and fails closed.
3. Add a separate executable evaluation framework. This adds dependencies,
   another state model, and paid or non-deterministic grading without a current
   need.

## Criteria

- Control-plane fit and canonical ownership.
- Deterministic authorization behavior.
- Implementation and operational simplicity.
- Reversibility and compatibility with task manifests.
- Testability without network or model inference.

## Architecture Decision Evaluation

- Decision: approved
- Selected option: canonical skills and templates with validation in the
  existing control engine.
- Rationale: this reuses the current manifest and evidence seams while adding
  deterministic fail-closed authorization without another framework.
- Architecture: one deeper control-plane module rather than a second evaluator.
- Pattern decision: no application design pattern; direct contract validation
  is clearer than Strategy or Chain of Responsibility for two stable evidence
  types.
- Reversibility: remove the heading/decision checks while retaining all task
  evidence if the contract later proves too strict.

## Consequences

- Future governed builds receive explicit architecture outcomes.
- Historical closed evidence is not migrated.
- Qualitative correctness remains a human/agent review responsibility; the
  engine validates authorization shape and outcome only.

## Decision Log

- 2026-07-18: Approved option 2 for NEXO-0048 implementation.
