# Harness Fixtures

This directory contains durable local fixtures that harness agents can use for
future importers, tests, seeds, and product spikes.

Fixtures are not automatically connected to the disposable React prototype or
to any product database. Each fixture owns a `manifest.json` that acts as the
stable read interface for agents and scripts.

## Available Fixtures

- `inventory/manual-stock-2026-07-06/` - manually normalized acquired-stock
  inventory captured on 2026-07-06.

