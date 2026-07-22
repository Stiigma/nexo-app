# NEXO-0037 Security Review - Garment Editor

## Metadata

- Task ID: NEXO-0037
- Date: 2026-07-15
- Security agent: nexo-security
- Reviewed artifact: `HOFF-2026-07-15-garment-editor.md` and editor implementation
- Decision: conditionally approved

## Scope

Review the shared `OPERATOR`/`ADMIN` garment editor, its endpoint, and the
inventory data exposed when the inventory route becomes available to operators.

## Data And Trust Boundaries

- Browser input crosses `PUT /api/v1/inventory/items/:id/editor`.
- The API is the authorization boundary; the user interface is defense in
  depth only.
- Cost, exchange rate, minimum price, and margin are sensitive internal
  financial data. Public/list price is operational data required by the editor.

## Secrets And Environment

- No new secret, environment variable, storage access, or external service was
  introduced.

## Authentication And Sessions

- The editor route inherits `SessionAuthGuard` from `ItemsController`.
- It additionally requires `Permission.OperatorWorkspace`; existing role policy
  grants that permission to both `OPERATOR` and `ADMIN`.
- The broader administrative update route remains protected by
  `Permission.AdminWorkspace`.

## Roles And Permissions

- `EditItemDto` exposes only product name, catalog classifications, location,
  public/list price, and notes.
- `ItemService.edit` copies an explicit runtime allow-list, so unexpected
  fields cannot reach persistence even if a client bypasses DTO validation.
- `ADMIN` uses the same editor action through inherited operator permission;
  no duplicate editor or role bypass is present.

## Sensitive Data

- Finding SEC-0037-1 (remediated): opening `/inventory` to operators would have
  exposed cost and margin from pre-existing inventory list, detail, and stats
  responses.
- Mitigation: operator list, detail, and editor responses remove cost currency,
  cost amounts, exchange rate, and minimum price. Operator stats omit invested
  USD and average margin. The UI independently hides financial panels for that
  role.
- Evidence: `items.controller-security.spec.ts` verifies redaction; the role
  policy test verifies `ADMIN` inherits operator access.

## Dependencies And Configuration

- No dependency or configuration change.

## Infrastructure Exposure

- No new network route outside the existing authenticated API, object-storage
  setting, deployment, or public endpoint.

## Findings

| ID | Severity | Status | Finding |
| --- | --- | --- | --- |
| SEC-0037-1 | High | Remediated | Operators could have received internal cost/margin data after `/inventory` became reachable. |
| SEC-0037-2 | Low | Open | Authenticated visual checks with real `OPERATOR` and `ADMIN` sessions remain pending. |

## Required Mitigations

- Before closing the editor slice, verify with a real operator session that the
  editor saves allowed data and no financial values appear in cards, detail,
  dashboard, or network responses.
- Verify with a real admin session that the same editor works and that
  administrative financial views remain available only to that role.

## Residual Risk

The authorization and response-shaping behavior is covered by source review,
unit tests, builds, and Prisma validation, but no authenticated browser session
was available in this work session. The decision is conditional until that QA
evidence is recorded.
