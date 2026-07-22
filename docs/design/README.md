# Nexo Design Process

## External Design Harness

The project can use the user's design harness as a process reference:

```text
/home/otomi/Downloads/Backup/Harness/diseno-harness
```

Use it as a UX/UI workflow, not as a UI component package.

Relevant harness files for the disposable purchase-capture prototype:

- `README.md`
- `core/templates/screen-brief-template.md`
- `core/templates/user-flow-template.md`
- `core/templates/ui-spec-template.md`
- `core/principles/mobile-design-principles.md`
- `core/rubrics/mobile-ui-checklist.md`
- `core/rubrics/visual-design-rubric.md`
- `core/rubrics/implementation-readiness-rubric.md`

## Minimal Flow For This Prototype

Use a lightweight version of the harness:

1. Brief.
2. User flow.
3. UI specification.
4. Mobile UI checklist.
5. Implementation readiness check.

For the first disposable demo, keep the design output implementable and avoid a
full multi-agent design process unless the prototype UI becomes unclear.

## Local Nexo Design Inputs

- Brand notes: `../brand/README.md`
- Logo: `../brand/nexo-logo.png`
- Demo brief: `purchase-capture-demo-brief.md`
- Auth Stitch prompt: `nexo-auth-stitch-prompt.md`
- **Complete Frontend Design**: `nexo-v1-frontend-complete-design.md` — 49 screens,
  41 components, API map, routes, data flow, mobile-first strategy
- Product context: `../../NEXO_PROJECT.md`
- Domain language: `../../CONTEXT.md`
- Requirements: `../spec/SRS.md`
- User stories: `../spec/user-stories.md`

## Design Guardrails

- The first screen should be the usable purchase-capture workflow, not a
  landing page.
- Mobile-first means compact, task-focused, touch-friendly, and scannable.
- Use the Nexo logo for orientation, but do not let the header consume too much
  vertical space.
- Use the electric blue accent for primary actions, active state, and focus.
- Keep cards and surfaces functional; avoid decorative card-heavy marketing
  composition.
- Every form control needs labels, validation, disabled/loading states, and a
  clear recovery path.
