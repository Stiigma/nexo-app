# NEXO-0005 - Inventory Fixture

## Objective

Promote the manually normalized stock inventory from root `storage/` into a
canonical harness fixture and register it in the control plane.

## Done When

- The fixture exists at
  `../fixtures/inventory/manual-stock-2026-07-06/`.
- Normalized `items/` and `_legacy_raw/` have been moved from root `storage/`.
- `manifest.json` lists the 17 item records, canonical photos, and previous
  source paths.
- Control-plane task, implementation, report, closeout, journal, state, and
  indexes mention the fixture.
- The disposable React prototype and seed/demo database are unchanged.

## Scope

- Move the current normalized inventory and legacy raw evidence into the
  harness fixture tree.
- Add fixture README files and a machine-readable manifest.
- Register and close the task in the harness control plane.

## Out Of Scope

- Importing the fixture into the React prototype.
- Updating seed/demo database data.
- Renaming item directories, changing item frontmatter semantics, or editing
  photo content.

## Steps

1. Create the fixture directory structure.
2. Move `storage/items` to fixture `items`.
3. Move `storage/_legacy_raw` to fixture `_legacy_raw`.
4. Remove root `storage/` if empty.
5. Create fixture README files and `manifest.json`.
6. Register `NEXO-0005` in the control plane.
7. Verify counts, YAML frontmatter, manifest paths, and control-plane links.
8. Close the task with implementation, report, closeout, and journal records.

## Progress

- 2026-07-06: Task registered, implemented, verified, and closed.

## Decision Log

- 2026-07-06: Keep `manifest.json` as the stable fixture interface.
- 2026-07-06: Preserve legacy raw evidence under `_legacy_raw/2026-07-06/`.
- 2026-07-06: Do not wire fixture data into the prototype or seed database.

## Risks

- Future importers must use the manifest rather than hard-coded assumptions
  about folder order.
- Frontmatter still contains original `source.previous_path` values pointing to
  root `storage/`; these are historical provenance values, not live paths.

## Verification

- Confirm 17 `item.md` files under the fixture.
- Confirm 17 canonical `photos/main.jpeg` files under the fixture.
- Confirm 16 legacy `.jpeg` files under `_legacy_raw/2026-07-06/`.
- Confirm each item frontmatter parses and `photos.main` points to an existing
  file.
- Confirm every `manifest.json.items[].path` and `.photo` exists.
- Confirm root `storage/` is absent or empty.
- Confirm control README and record index mention the fixture.

