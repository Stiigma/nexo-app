# Session Report: Requirements Decomposition Into Individual Files

## Task

Decompose the monolithic `docs/spec/SRS.md` into individual requirement files
organized by module under `docs/spec/requirements/`, with implementation
artifact references for agents.

## What Changed

### New structure

```
docs/spec/requirements/
├── README.md                     ← Index with tables linking to every file
├── BR/        (6 files)          ← Business requirements
├── FR/
│   ├── purchases/   (6)          ← FR-PUR-001 to FR-PUR-006
│   ├── inventory/   (11)         ← FR-INV-001 to FR-INV-011
│   ├── listings/    (2)          ← FR-LST-001, FR-LST-002
│   ├── reservations/ (4)         ← FR-RES-001 to FR-RES-004
│   ├── sales/       (6)          ← FR-SAL-001 to FR-SAL-006
│   ├── expenses/    (4)          ← FR-EXP-001 to FR-EXP-004
│   ├── customers/   (3)          ← FR-CUS-001 to FR-CUS-003
│   ├── catalogs/    (9)          ← FR-CAT-001 to FR-CAT-009
│   ├── reports/     (5)          ← FR-REP-001 to FR-REP-005
│   ├── qr-labels/   (2)          ← FR-QR-001, FR-QR-002
│   └── auth/        (4)          ← FR-AUTH-001 to FR-AUTH-004
├── NFR/       (7)                ← Non-functional requirements
├── DR/        (5)                ← Data requirements
├── IR/        (3)                ← Interface/integration requirements
└── CON/       (7)                ← Constraints
```

Total: **85 files** covering all previously consolidated requirements.

### Modified files

- `docs/spec/SRS.md` — Rewritten as master index; detailed tables replaced by
  links to individual files. Preserved: metadata, scope, stakeholders,
  definitions, product context, constraints, assumptions, MVP criteria, out of
  scope, open questions.

### Key feature: `Artefactos de implementación` section

Every requirement file now includes a section that maps to actual source files:

- **Backend**: `back/src/modules/<module>/` with specific domain, application,
  infrastructure, and interface paths.
- **Frontend**: `front/src/features/<feature>/` with specific components, hooks,
  types, and services.
- **Prisma**: schema model names from `back/prisma/schema.prisma`.

This enables agents (`nexo-build`, `nexo-qa`, `nexo-design`) to navigate
directly to the relevant code without guessing.

### What was preserved unchanged

- `NEXO_PROJECT.md`
- `docs/spec/README.md`
- `docs/spec/user-stories.md`
- `docs/spec/traceability.md`
- `docs/spec/templates/`

## Requirements Covered

All 78 requirements from `SRS.md` v0.2 were decomposed:

- 6 BR
- 45 FR (PUR 6 + INV 11 + LST 2 + RES 4 + SAL 6 + EXP 4 + CUS 3 + CAT 9 + REP 5 + QR 2 + AUTH 4)
- 7 NFR
- 5 DR
- 3 IR
- 7 CON

Plus the README.md index and the updated SRS.md.

## Status

- 85 new files created.
- 1 existing file modified (`SRS.md`).
- 0 files deleted.

## Open Items

- `SRS.md` now references `requirements/` files. No other doc links to update.
- Future new requirements should follow `templates/requirement.md` and be
  placed in the appropriate module folder with the `Artefactos de
  implementación` section.
- The master feature plan (`harness/control/plans/NEXO-v1-feature-master-plan.md`)
  references `SRS.md` as a doc; it can now also reference individual module
  folders.

## Recommended Next Step

Add a journal entry and update `state/CURRENT.md` and `state/NEXT.md` if
applicable.
