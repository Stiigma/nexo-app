# HOFF-2026-07-08-import-price-pending-fixture

## Objective

Implement `NEXO-0033`: import the `manual-stock-2026-07-08-price-pending` fixture into DB/storage with catalog enrichment, real `PRICE_PENDING`, nullable costs, and pre-upload WebP optimization.

## Context

`NEXO-0032` created a prepared fixture of 39 physical items from `newstorage`, but intentionally did not import it because the app lacked `PRICE_PENDING`. A planning session confirmed the next implementation should add the missing app/data support first, then provide a dry-run-first import script.

## Source Docs

- Plan: `plans/NEXO-0033-import-price-pending-fixture.md`
- Fixture manifest: `../fixtures/inventory/manual-stock-2026-07-08-price-pending/manifest.json`
- Fixture README: `../fixtures/inventory/manual-stock-2026-07-08-price-pending/README.md`
- Prior closeout: `closeouts/NEXO-0032-price-pending-inventory-fixture.md`
- Existing legacy import script: `../../back/prisma/seed-inventory-fixture.ts`
- Existing image pipeline: `../../back/src/modules/media/infrastructure/adapters/sharp-image-processor.adapter.ts`

## Files To Create Or Modify

- `../../back/prisma/schema.prisma` and a Prisma migration for `PRICE_PENDING` + nullable `costAmount`.
- Backend inventory domain/API/repository code for status labels, transitions, DTOs, stats, and nullable cost.
- Frontend inventory status/cost display code.
- `../fixtures/inventory/manual-stock-2026-07-08-price-pending/catalog-enrichment.json`.
- `../../back/scripts/import-inventory-fixture.ts` and optionally `../../back/package.json` script entry.
- Control-plane implementation/report/closeout records when work is executed.

## Implementation Steps

1. Read the plan and fixture before editing.
2. Add migrations and code support for `PRICE_PENDING` and nullable costs.
3. Update UI types/badges/financial displays for price-pending and pending cost.
4. Generate or author catalog enrichment JSON using the decisions in the plan.
5. Build dry-run-first import script with explicit `--execute` for mutations.
6. Wire image optimization before storage upload using the existing Sharp adapter behavior.
7. Verify dry-run before any DB/storage mutation.
8. Ask user for explicit confirmation before running `--execute`.

## Verification

- DB validate and relevant backend tests pass.
- Frontend typecheck/tests pass where available.
- Dry-run reports 39 item upserts, 39 photo uploads, 10 nullable costs, and required catalog upserts.
- Execute, if approved, results in 56 total DB items and 39 new WebP-backed main photos.

## Risks

- Do not use `0` for unknown costs.
- Do not map missing brand/category to existing empty-name catalog rows.
- Do not run import execution without explicit user confirmation.
- Do not write real secrets; use existing environment only.

## Acceptance Criteria

- Another agent can start from this handoff and implement without asking product/data policy questions.
- The first safe command after implementation should be dry-run, not execute.

## Receiving Agent

`nexo-build`
