# ADR-2026-07-01-disposable-prototype-stack

## Status

Accepted for disposable prototype only.

## Context

The first Nexo demo should validate the purchase-cart to acquired-stock flow
without committing to final product architecture. The product source document
still names React, NestJS, PostgreSQL, and S3-compatible storage as the target
architecture for v1. The current meeting demo needs a faster local feedback
loop and should avoid backend, deployment, production auth, object storage, and
external integrations.

The user confirmed the prototype stack on 2026-07-01:

- React.
- SQLite.
- Zustand.

## Decision

Build the disposable purchase-capture prototype with:

- Vite + React + TypeScript for the local PWA-style frontend.
- Zustand for UI workflow state and transient form/session state.
- SQLite in the browser through `@sqlite.org/sqlite-wasm` for local prototype
  persistence.
- A small local repository/data-access layer so SQLite usage does not leak into
  React components.
- A clearly separated prototype path, recommended:
  `prototypes/purchase-capture-demo/`.

For the first build, prefer SQLite WASM storage that keeps setup simple for a
browser-only local demo. The initial implementation may use the SQLite
key-value VFS backed by browser storage if that is enough for the meeting demo.
Move to OPFS only if the prototype needs a more file-like local database.

## Consequences

- The prototype can run locally without NestJS, PostgreSQL, S3-compatible
  storage, auth, or deployment.
- The UI can exercise real SQL-backed state transitions without designing the
  final schema yet.
- Zustand remains responsible for screen state, active selections, transient
  form drafts, and wizard flow. SQLite remains responsible for durable demo
  records.
- Prototype SQL tables must be treated as throwaway learning artifacts, not the
  final PostgreSQL schema.
- Financial calculations must stay visibly provisional until rounding and
  exchange-rate fallback policies are resolved.

## Alternatives Considered

- In-memory only state: fastest, but it would not test persistence or basic
  data boundaries.
- Durable frontend foundation in `front/`: too likely to bake in premature API
  and schema decisions before ADR/schema work.
- NestJS + PostgreSQL now: closer to the target architecture, but too much
  surface area for the first meeting demo.
- SQLite through OPFS immediately: more realistic browser persistence, but more
  setup and browser behavior to manage than the first disposable demo needs.

## Verification

- Confirm the prototype path is separate from final `front/` and `back/`
  modules.
- Confirm no production auth, deployment, object storage, or external
  exchange-rate integration is added.
- Confirm the demo can reset or seed local prototype data.
- Confirm React components access data through a local data-access boundary
  rather than inline SQL.

## Related Records

- Task: `NEXO-0002`
- Plan: `harness/control/plans/NEXO-0002-domain-context.md`
- Handoff:
  `harness/control/handoffs/HOFF-2026-07-01-purchase-capture-demo.md`
- Report:
  `harness/control/reports/2026-07-01/NEXO-0002-prototype-stack-session-006.md`
