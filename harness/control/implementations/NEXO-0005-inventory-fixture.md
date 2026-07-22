# NEXO-0005 Implementation - Inventory Fixture

## Metadata

- Task ID: `NEXO-0005`
- Date: 2026-07-06
- Agent: Codex
- Related plan: `../plans/NEXO-0005-inventory-fixture.md`
- Related handoff: none
- Related report:
  `../reports/2026-07-06/NEXO-0005-inventory-fixture-session-001.md`

## Summary

Moved the normalized manual inventory out of root `storage/` and registered it
as a canonical harness fixture at
`../../fixtures/inventory/manual-stock-2026-07-06/`.

## Files Changed

- `../../fixtures/README.md`
- `../../fixtures/inventory/README.md`
- `../../fixtures/inventory/manual-stock-2026-07-06/README.md`
- `../../fixtures/inventory/manual-stock-2026-07-06/manifest.json`
- `../../fixtures/inventory/manual-stock-2026-07-06/items/`
- `../../fixtures/inventory/manual-stock-2026-07-06/_legacy_raw/`
- `../plans/NEXO-0005-inventory-fixture.md`
- `../reports/2026-07-06/NEXO-0005-inventory-fixture-session-001.md`
- `../closeouts/NEXO-0005-inventory-fixture.md`
- `../journal/2026-07-06.md`
- `../tasks.md`
- `../README.md`
- `../state/CURRENT.md`
- `../state/NEXT.md`
- `../indexes/records.md`

## Behavior Changed

The harness now has a durable inventory fixture available for future importer,
test, or seed work. The disposable React prototype remains unchanged.

## Verification

- 17 normalized item markdown files are present.
- 17 canonical main photos are present.
- 16 legacy photos are present.
- All item frontmatter parses as YAML.
- Every item `photos.main` points to an existing file.
- Every manifest item path and photo path points to an existing file.
- Root `storage/` was removed after becoming empty.
- Control README and record index mention the fixture.

## Operational Notes

Use the fixture manifest as the integration entrypoint:
`../../fixtures/inventory/manual-stock-2026-07-06/manifest.json`.

## Follow-Up

- Build a future importer/seed path from the fixture when product storage or
  prototype fixture loading is in scope.

