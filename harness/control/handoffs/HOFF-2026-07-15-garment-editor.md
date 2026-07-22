# HOFF-2026-07-15-garment-editor

## Metadata

- Task ID: NEXO-0037
- Date: 2026-07-15
- Authoring agent: nexo-spec / nexo-design
- Receiving agent: nexo-build
- Status: approved for implementation

## Objective

Implement the first sales-readiness slice: a safe editor for an existing
garment, available to both `OPERATOR` and `ADMIN`, with a visible readiness
checklist.

## Context

The owner approved the commercial policy and confirmed that an admin can act as
an editor. `ADMIN` already inherits `OPERATOR` workspace access. This slice
must not make financial or state corrections available to the operator.

## Source Docs

- `NEXO_PROJECT.md`
- `docs/spec/SRS.md` — FR-INV-010, FR-INV-011, FR-AUTH-004
- `docs/spec/user-stories.md` — US-023
- `docs/design/inventory-design-spec.md` — section 9
- `plans/NEXO-0037-sales-readiness.md`

## Files To Create Or Modify

- `back/src/modules/inventory/interface/http/dto/` — dedicated editor DTO.
- `back/src/modules/inventory/application/item.service.ts` and
  `back/src/modules/inventory/interface/http/items.controller.ts` — safe
  operator-workspace endpoint; preserve the administrative correction endpoint.
- `back/src/modules/inventory/application/__tests__/` — service behavior tests.
- `front/src/features/inventory/` — editor form/dialog, update mutation,
  readiness helper, and inventory refresh behavior.
- `front/src/routes.tsx` — expose the shared inventory screen at `/inventory`.

## Implementation Steps

1. Add a dedicated endpoint, for example `PUT /inventory/items/:id/editor`,
   guarded by `OperatorWorkspace`. Accept only product name, catalog IDs,
   physical location, public/list price, and notes.
2. Keep `PUT /inventory/items/:id` as the administrative correction endpoint;
   do not broaden the editor DTO to cost, minimum price, code, purchase, or
   status.
3. Build an accessible pre-filled editor dialog from the detail modal. Fetch
   active brands, categories, conditions, sizes, and colors.
4. Derive and show a non-blocking missing-file checklist from the returned
   garment (main photo, classifications, location, public price).
5. On success, invalidate inventory list/stats queries and update the detail
   from the returned item. Surface success and error feedback.
6. Route `/inventory` to the existing inventory page so both role types can
   reach the shared editor. Retain the admin route.

## Verification

- Unit-test that the editor service persists only safe fields and does not
  affect status or financial fields.
- Test that the editor route requires an authenticated operator workspace and
  therefore also accepts admin through the role policy.
- Run backend tests/build and frontend typecheck/build.
- Manual authenticated QA with an operator and an admin: save an edit, inspect
  missing-field feedback, and verify inaccessible financial/state controls.

## Risks

- The current media API cannot yet attach a newly uploaded photo to an item;
  this editor reports photo readiness but does not promise photo management.
- The listing lifecycle is specified but intentionally not persisted in this
  slice; do not expose publication controls prematurely.
- Inventory data may have blank size/color/location/price, so the form must
  tolerate and clearly display incomplete values.

## Acceptance Criteria

- An operator and an admin can both save the safe garment-editor fields.
- The editor never accepts cost, minimum price, internal code, purchase link,
  or physical inventory status.
- The editor identifies missing main photo, classifications, location, and
  public price without changing status or publishing the garment.
- Saving refreshes the inventory UI and reports errors accessibly.
- `/inventory` is available to the operator; `/admin/inventory` keeps working
  for the admin.

## Required Gates

- QA review: authenticated desktop and mobile checks for both roles.
- Security review: endpoint authorization and sensitive-field exclusion.
- User confirmation: not required for local code changes; required before any
  production deployment.
