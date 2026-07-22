# NEXO-0003 - Requirements Spec Section

## Objective

Create a practical requirements specification section for Nexo v1 using
requirements-engineering practices: requirement IDs, priorities, story points,
acceptance criteria, and traceability.

## Done When

- `docs/spec/README.md` explains how to use the spec.
- `docs/spec/SRS.md` defines initial v1 requirements.
- `docs/spec/user-stories.md` defines prioritized and estimated stories.
- `docs/spec/traceability.md` links goals, requirements, stories, and future
  verification.
- Templates exist for future requirements, stories, acceptance criteria, and
  change requests.
- Control-plane live state, report, closeout, and journal are updated.

## Scope

- Use `NEXO_PROJECT.md` as the source.
- Create a first draft spec structure.
- Keep unclear decisions as open questions.

## Out Of Scope

- Implementing the product.
- Defining database schema.
- Creating ADRs.
- Replacing `NEXO_PROJECT.md`.
- Claiming formal certification against a paid standard.

## Steps

1. Read control-plane context and `NEXO_PROJECT.md`.
2. Create the spec directory and files.
3. Create initial requirements, stories, and traceability.
4. Update control-plane live state and historical records.
5. Verify expected files and key IDs are present.

## Progress

- 2026-06-30: Control-plane context and product source reviewed.
- 2026-06-30: Spec files and templates created.
- 2026-06-30: Control-plane records updated.

## Decision Log

- 2026-06-30: Use a lightweight ISO/IEC/IEEE 29148-inspired structure rather
  than a heavy formal standard document.
- 2026-06-30: Use `P0` to `P3`, MoSCoW, and Fibonacci story points.
- 2026-06-30: Keep `NEXO_PROJECT.md` as source document and make `docs/spec/`
  the implementable requirements layer.

## Risks

- Some requirements depend on future policy decisions, especially rounding,
  sale allocation across multiple garments, exchange-rate fallback, and admin
  corrections.
- Story points are initial estimates and should be revised after architecture
  and schema decisions.

## Verification

- Confirm all spec files exist.
- Confirm `SRS.md` includes BR, FR, NFR, DR, IR, constraints, assumptions, MVP
  acceptance criteria, and open questions.
- Confirm `user-stories.md` includes priority, MoSCoW, points, linked
  requirements, and acceptance criteria.
- Confirm `traceability.md` links business requirements to functional
  requirements and stories.

