# Nexo Spec

This directory contains the requirements specification for Nexo v1.

It is a practical requirements-engineering workspace inspired by
ISO/IEC/IEEE 29148-style practices: explicit requirement IDs, attributes,
traceability, acceptance criteria, verification planning, and controlled
changes. It is not a verbatim copy of any standard.

## External References

- ISO listing for ISO/IEC/IEEE 29148:2018:
  https://www.iso.org/standard/72089.html
- IEEE listing for ISO/IEC/IEEE 29148:2018:
  https://standards.ieee.org/ieee/29148/6937/

## Source Hierarchy

Use this order when resolving conflicts:

1. Explicit user decisions.
2. `NEXO_PROJECT.md`.
3. Files under `docs/spec/`.
4. Implementation details discovered later.

`NEXO_PROJECT.md` remains the product source document. The spec turns that
source into implementable and verifiable requirements.

## Files

- `SRS.md`: software requirements specification for v1.
- `user-stories.md`: prioritized and estimated story backlog.
- `traceability.md`: links business goals, requirements, stories, and future
  tests.
- `templates/`: templates for future requirements work.

## Requirement ID Scheme

- `BR-*`: business requirement.
- `FR-*`: functional requirement.
- `NFR-*`: non-functional requirement.
- `DR-*`: data requirement.
- `IR-*`: interface or integration requirement.
- `CON-*`: constraint.
- `US-*`: user story.
- `AC-*`: acceptance criterion, when a standalone criterion needs tracking.

## Requirement Attributes

Each requirement should capture:

- ID.
- Title.
- Type.
- Priority.
- Status.
- Source.
- Rationale.
- Fit criterion or acceptance test.
- Verification method.
- Dependencies.

## Priority Model

Use both a simple priority and MoSCoW classification:

- `P0 / Must`: required for a usable MVP.
- `P1 / Should`: important for v1, but not the first vertical slice.
- `P2 / Could`: valuable after the core workflow is stable.
- `P3 / Won't for v1`: explicitly out of v1.

## Story Point Model

Use Fibonacci-style points:

- `1`: tiny, low uncertainty.
- `2`: small, clear.
- `3`: moderate, one normal workflow.
- `5`: larger workflow or several states.
- `8`: complex workflow, integration, or meaningful unknowns.
- `13`: too large for one implementation slice; split before building.

Story points estimate implementation effort plus uncertainty. They are not time
commitments.

## Requirement Quality Checklist

A requirement should be:

- Necessary: tied to a business need.
- Atomic: one requirement, not many hidden requirements.
- Unambiguous: one reasonable interpretation.
- Feasible: technically and operationally possible.
- Verifiable: a test, inspection, demo, or report can prove it.
- Traceable: linked to source, story, and verification evidence.
- Bounded: clear enough to avoid uncontrolled scope growth.

## Workflow

1. Capture rough intent in `NEXO_PROJECT.md` or a control task.
2. Formalize the requirement in `SRS.md`.
3. Add or update user stories in `user-stories.md`.
4. Link the requirement and story in `traceability.md`.
5. Implement the smallest useful vertical slice.
6. Add verification evidence to the relevant task report.
7. Update status after review or implementation.

## Change Control

Do not silently replace requirements after implementation starts.

For meaningful changes:

- Add a change request from `templates/change-request.md`.
- Update impacted requirements and stories.
- Update traceability.
- Record the decision in `harness/control/journal/`.
