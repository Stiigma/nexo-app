# NEXO-0018 Closeout - Modular Monolith Architecture

## Metadata

- Task ID: `NEXO-0018`
- Completion date: 2026-07-06
- Agent: Codex / `nexo-plan`
- Final status: closed

## Objective

Codify the user-approved Nexo v1 architecture recommendation so future product
code is scaffolded as a modular monolith with explicit module, persistence,
event, adapter, and test conventions.

## Outcome

The architecture recommendation is now accepted in
`docs/adr/ADR-2026-07-06-modular-monolith-ddd-cqrs-events.md`. F1 auth planning
and handoff records now reference it, while the active executable task remains
`NEXO-0007`.

## Files Changed

- `docs/adr/ADR-2026-07-06-modular-monolith-ddd-cqrs-events.md`
- `harness/control/plans/NEXO-0018-modular-monolith-architecture.md`
- `harness/control/implementations/NEXO-0018-modular-monolith-architecture.md`
- `harness/control/reports/2026-07-06/NEXO-0018-modular-monolith-architecture-session-001.md`
- `harness/control/plans/NEXO-v1-feature-master-plan.md`
- `harness/control/plans/NEXO-0007-auth-permissions-base.md`
- `harness/control/handoffs/HOFF-2026-07-06-auth-permissions-base.md`
- `harness/control/tasks.md`
- `harness/control/README.md`
- `harness/control/state/CURRENT.md`
- `harness/control/state/NEXT.md`
- `harness/control/indexes/records.md`
- `harness/control/journal/2026-07-06.md`

## Verification

- Confirmed source documents and existing ADRs before writing the new ADR.
- Confirmed no product runtime files were changed.
- Confirmed F1 planning records now point to the architecture ADR.
- Confirmed report and implementation records capture the work and remaining
  follow-up.

## Remaining Follow-Up

- Implement `NEXO-0007` auth and base permissions under the new architecture
  constraints.
- Create later ADRs for exchange-rate provider/fallback and rounding policy
  before those features are built.
- Add architecture import tests when `back/` exists.

## Links

- Plan:
  `harness/control/plans/NEXO-0018-modular-monolith-architecture.md`
- Report:
  `harness/control/reports/2026-07-06/NEXO-0018-modular-monolith-architecture-session-001.md`
- Implementation:
  `harness/control/implementations/NEXO-0018-modular-monolith-architecture.md`
- ADR:
  `docs/adr/ADR-2026-07-06-modular-monolith-ddd-cqrs-events.md`
