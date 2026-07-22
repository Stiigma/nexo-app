# NEXO-0037 Implementation - Safe Garment Editor

## Metadata

- Task ID: NEXO-0037
- Date: 2026-07-15
- Agent: nexo-build
- Related plan: `plans/NEXO-0037-sales-readiness.md`
- Related handoff: `handoffs/HOFF-2026-07-15-garment-editor.md`
- Related report: `reports/2026-07-15/NEXO-0037-garment-editor-session-002.md`

## Summary

Implemented the first sales-readiness slice: an editor for existing garments
available to `OPERATOR` and `ADMIN`. It handles product data, classifications,
physical location, public price, and notes; it shows a readiness checklist but
does not change physical status, publish, sell, attach photos, or perform
financial corrections.

## Files Changed

- Backend: dedicated `EditItemDto`, `ItemService.edit`, protected editor route,
  response redaction, and editor/security tests.
- Frontend: editor dialog, catalog queries, update mutation, readiness helper,
  role-aware financial views, and operator inventory route.
- Product records: SRS, stories, traceability, inventory design, plan, handoff,
  security review, task state, journal, and session report.

## Behavior Changed

- `PUT /api/v1/inventory/items/:id/editor` accepts only safe editable fields
  under `OperatorWorkspace`; `ADMIN` inherits this ability.
- `PUT /api/v1/inventory/items/:id` remains administrative-only for broader
  corrections.
- `/inventory` now renders inventory for the operator as well as the existing
  `/admin/inventory` route for the admin.
- Operator API responses and UI exclude cost, exchange rate, minimum price,
  investment total, and margin. Public/list price remains visible.

## Verification

- Backend unit suite: 16 files, 64 tests passed.
- Backend TypeScript build passed.
- Frontend typecheck and production build passed; existing bundle-size warning
  remains.
- Prisma schema validation passed.
- `SEC-NEXO-0037-garment-editor.md` records a conditional security approval.

## Operational Notes

- The editor can identify a missing main photo, but the existing media API has
  no endpoint to associate a new upload with a garment. Photo management is a
  later slice.
- Listing lifecycle and publication remain specified but intentionally not
  persisted in this slice.

## Follow-Up

Run authenticated visual QA for both roles, then continue with listing review
and publication controls in the next NEXO-0037 slice.
