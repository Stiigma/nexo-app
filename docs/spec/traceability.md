# Nexo v1 Traceability Matrix

This file links business needs, requirements, user stories, and future tests.
Update it whenever requirements or stories change.

## Business To Functional Requirements

| Business requirement | Functional/data requirements |
| --- | --- |
| BR-001 | FR-INV-004, FR-INV-008, FR-INV-010, FR-INV-011, FR-LST-001, FR-LST-002, FR-REP-004 |
| BR-002 | FR-INV-005, FR-EXP-003, DR-001, DR-002 |
| BR-003 | FR-SAL-005, FR-REP-005 |
| BR-004 | FR-PUR-001, FR-PUR-003, FR-PUR-004, FR-PUR-005, FR-PUR-006 |
| BR-005 | NFR-UX-001, FR-PUR-001, FR-PUR-002, FR-INV-001, FR-INV-010, FR-SAL-001 |
| BR-006 | FR-AUTH-001, FR-AUTH-002, FR-AUTH-003, FR-AUTH-004, FR-CAT-001, FR-CAT-002, FR-CAT-003, FR-CAT-004, FR-CAT-005, FR-CAT-006, FR-CAT-007, FR-CAT-008, FR-CAT-009 |

## Requirement To Story Matrix

| Requirement | Stories |
| --- | --- |
| FR-PUR-001 | US-001 |
| FR-PUR-002 | US-002 |
| FR-PUR-003 | US-001 |
| FR-PUR-004 | US-001 |
| FR-PUR-005 | US-003 |
| FR-PUR-006 | US-003 |
| FR-INV-001 | US-003 |
| FR-INV-002 | US-002 |
| FR-INV-003 | US-017 |
| FR-INV-004 | US-003, US-004, US-005, US-009, US-016, US-017 |
| FR-INV-005 | US-003, US-008 |
| FR-INV-006 | US-015, US-021 |
| FR-INV-007 | US-009, US-015 |
| FR-INV-008 | US-017 |
| FR-INV-009 | US-002, US-017 |
| FR-INV-010 | US-023 |
| FR-INV-011 | US-023 |
| FR-LST-001 | US-024 |
| FR-LST-002 | US-024 |
| FR-RES-001 | US-004 |
| FR-RES-002 | US-004 |
| FR-RES-003 | US-016 |
| FR-RES-004 | US-016 |
| FR-SAL-001 | US-005 |
| FR-SAL-002 | US-005 |
| FR-SAL-003 | US-005 |
| FR-SAL-004 | US-006 |
| FR-SAL-005 | US-005 |
| FR-SAL-006 | US-005 |
| FR-EXP-001 | US-007 |
| FR-EXP-002 | US-007 |
| FR-EXP-003 | US-008 |
| FR-EXP-004 | US-007, US-020 |
| FR-CUS-001 | US-004 |
| FR-CUS-002 | US-014 |
| FR-CUS-003 | US-014 |
| FR-CAT-001 | US-013 |
| FR-CAT-002 | US-017, US-020 |
| FR-CAT-003 | US-020 |
| FR-CAT-004 | US-013 |
| FR-CAT-005 | US-018 |
| FR-CAT-006 | US-017, US-019 |
| FR-CAT-007 | US-022 |
| FR-CAT-008 | US-015, US-021 |
| FR-CAT-009 | US-022 |
| FR-REP-001 | US-010 |
| FR-REP-002 | US-010 |
| FR-REP-003 | US-010 |
| FR-REP-004 | US-009, US-010 |
| FR-REP-005 | US-010 |
| FR-QR-001 | US-012 |
| FR-QR-002 | US-012 |
| FR-AUTH-001 | US-011 |
| FR-AUTH-002 | US-011 |
| FR-AUTH-003 | US-011 |
| FR-AUTH-004 | US-023 |
| DR-001 | US-001, US-006 |
| DR-002 | US-001, US-006 |
| DR-003 | US-002 |
| DR-004 | US-003, US-012 |
| DR-005 | US-011 |
| IR-001 | US-002 |
| IR-002 | US-001, US-006 |
| IR-003 | US-001, US-006 |

## MVP Acceptance To Stories

| MVP criterion | Stories |
| --- | --- |
| AC-MVP-001 | US-001 |
| AC-MVP-002 | US-002 |
| AC-MVP-003 | US-001, US-002 |
| AC-MVP-004 | US-003 |
| AC-MVP-005 | US-007 |
| AC-MVP-006 | US-003, US-008 |
| AC-MVP-007 | US-004 |
| AC-MVP-008 | US-005 |
| AC-MVP-009 | US-006 |
| AC-MVP-010 | US-005 |
| AC-MVP-011 | US-005, US-010 |
| AC-MVP-012 | US-009, US-010 |
| AC-MVP-013 | US-012 |
| AC-MVP-014 | US-011 |

## Future Verification Evidence

| Requirement/story | Verification method | Evidence location |
| --- | --- | --- |
| FR-PUR-* | Integration tests and workflow demo | TBD |
| FR-INV-* | Unit, integration, and UI workflow tests | TBD |
| FR-RES-* | Integration tests and workflow demo | TBD |
| FR-SAL-* | Unit tests for calculations plus workflow tests | TBD |
| FR-CAT-* | API integration and UI workflow tests | TBD |
| FR-EXP-* | Unit tests for allocation plus workflow tests | TBD |
| FR-REP-* | Report query tests and sample data checks | TBD |
| FR-AUTH-* | API authorization tests | TBD |
| NFR-UX-* | Responsive screenshots and manual review | TBD |
| NFR-SEC-* | Deployment and API checks | TBD |

## Open Traceability Gaps

- No implementation tests exist yet.
- No ADR exists yet for exchange-rate provider and fallback policy.
- No ADR exists yet for rounding policy.
- Domain `CONTEXT.md` exists, but remaining open questions still need to be
  resolved before schema work.
