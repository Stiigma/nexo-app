# Manual Stock Fixture - 2026-07-06

This fixture is the canonical harness copy of the manually normalized inventory
created on 2026-07-06.

## Contents

- `manifest.json` - stable fixture interface for agents and future scripts.
- `items/` - normalized item records, one directory per internal code.
- `_legacy_raw/2026-07-06/` - original raw item notes and photos preserved for
  audit/reference.

## Counts

- Items: 17
- Canonical photos: 17
- Legacy photos: 16

## Use

Use `manifest.json` as the entrypoint. Do not assume directory traversal order
or infer inventory identity from folder names when an `internal_code` is
available.

This fixture is not wired into the disposable React prototype or a seed/demo
database yet.

