# nexo-node-typescript

## Purpose

Apply the engineering contract to Nexo's NestJS, React, TypeScript, Prisma, and
Vitest/Jest code.

## Boundaries

- Keep domain/application policy independent from NestJS controllers, Prisma
  models, React components, and transport DTOs when durable rules exist.
- Keep thin framework orchestration direct; do not create mapping layers with
  no policy benefit.
- Validate HTTP, form, file, environment, and persistence input at the nearest
  untrusted boundary.
- Preserve typed failure semantics and useful error context.

## Tests

- Add focused tests for changed business rules, validation, authorization,
  failures, data invariants, and UI state transitions.
- Reuse existing Vitest/Jest, Testing Library, Supertest, and Prisma test
  patterns.
- Run the smallest relevant test target first, then lint/type/build/broader
  tests in proportion to the change.
- Do not set an arbitrary coverage percentage or weaken assertions.
- If a missing test project/configuration blocks meaningful coverage, treat its
  introduction as a deliberate dependency and build decision.

