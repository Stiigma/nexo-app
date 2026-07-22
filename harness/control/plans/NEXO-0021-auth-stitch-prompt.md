# NEXO-0021 - Auth Stitch Design Prompt

## Objective

Create a paste-ready Google Stitch prompt for a premium operational Nexo
authentication screen that covers Admin, Operator, and future Client access
without contradicting the implemented Admin/Operator auth model.

## Done When

- A dedicated design prompt exists under `docs/design/`.
- The prompt references the Nexo logo and manual-stock fixture photos.
- The prompt states the mobile-first layout, role selector, form fields,
  loading/error/permission/future-client states, copy rules, and accessibility
  requirements.
- Control-plane task, report, closeout, journal, and indexes register the
  artifact.
- No product code, secrets, deploys, commits, or external environment changes
  are made.

## Scope

- Create the Stitch prompt as a design artifact.
- Register the short task in the control plane.
- Verify referenced assets and design-spec coverage.

## Out Of Scope

- Implementing the auth screen in the React PWA.
- Adding a backend `Client` role.
- Importing assets into Google Stitch directly.
- Changing the active `NEXO-0020` bcrypt + Passport JWT Cookie Auth task.

## Steps

1. Read control-plane startup docs, active task state, journal, and design
   routing guidance.
2. Read current brand/auth/frontend context and fixture asset availability.
3. Create `docs/design/nexo-auth-stitch-prompt.md`.
4. Link the prompt from design docs and control-plane records.
5. Write report, closeout, and journal evidence.
6. Verify asset references and prompt coverage.

## Progress

- 2026-07-06: Created, verified, and closed the prompt task.

## Decision Log

- 2026-07-06: Treat `Cliente` as a future/prepared portal in the prompt because
  durable auth currently exposes only `Admin` and `Operator`.
- 2026-07-06: Keep the active product implementation task as `NEXO-0020`; this
  closed task is a standalone design support artifact.
- 2026-07-06: Do not create a plan-to-build handoff because no implementation
  transition is requested in this task.

## Risks

- Google Stitch may not be able to access local paths directly; the prompt
  includes named placeholders for the same product photos.
- A future auth implementation must continue to enforce roles from the account,
  not from the visual audience selector.

## Verification

- Confirm `docs/brand/nexo-logo.png` exists and is a 1536 x 435 PNG.
- Confirm the manual-stock fixture has 17 item records and 17 canonical product
  photos.
- Confirm the prompt covers users/roles, form validation, loading/error/disabled
  states, no-permission handling, future-client state, responsive behavior,
  copy, and accessibility expectations.
