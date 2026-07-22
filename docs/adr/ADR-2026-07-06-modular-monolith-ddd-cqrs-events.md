# ADR-2026-07-06-modular-monolith-ddd-cqrs-events

## Status

Accepted.

## Context

`ADR-2026-07-06-product-architecture-stack.md` fixes the durable Nexo v1
baseline as NestJS, PostgreSQL, React PWA, and S3-compatible object storage.
That baseline is not enough to guide the first backend and frontend scaffolding:
future work also needs explicit module boundaries, persistence seams, async
event conventions, public interface rules, and test expectations.

Nexo v1 is an internal operations system with financial calculations,
traceable inventory state, photo storage, role-based access, and reporting.
The initial scale is small, but correctness, auditability, and future
maintainability matter more than maximizing first-day implementation speed.

## Decision

Use a professional modular monolith for Nexo v1:

- Backend: modular NestJS application under `back/`.
- Frontend: React PWA under `front/`.
- Public API: versioned REST under `/api/v1`, documented with OpenAPI.
- Persistence: PostgreSQL with Prisma, accessed through module repositories.
- Async/events: transactional outbox stored in PostgreSQL and published by a
  separate worker to RabbitMQ.
- Initial auth: local identity implementation behind an `IdentityProvider`
  interface, so an external provider can replace it later.
- Initial deployment target: simple Docker composition with stateless API,
  separate worker, PostgreSQL, RabbitMQ, and S3-compatible storage.

The backend is organized as vertical bounded-context modules:

- `identity`
- `catalogs`
- `purchases`
- `inventory`
- `customers`
- `reservations`
- `sales`
- `expenses`
- `reports`
- `media`
- `qr`

Each module uses internal layers:

- `domain`: entities, value objects, pure rules, and domain events. This layer
  must not import NestJS, Prisma, HTTP, RabbitMQ, S3, or provider SDKs.
- `application`: commands, queries, use cases, authorization checks, and
  transaction orchestration.
- `infrastructure`: Prisma repositories, RabbitMQ publishers/consumers,
  object-storage adapters, and external provider adapters.
- `interface`: REST controllers, request/response DTOs, OpenAPI metadata, and
  serializers.

Use pragmatic CQRS:

- Commands mutate normalized PostgreSQL state through application use cases.
- Commands record domain events in the outbox inside the same transaction as
  the state change.
- Queries read through application query handlers and may use optimized read
  models or specialized SQL for screens and reports.
- The `reports` module may own report queries and read models, but it does not
  own writes for purchases, inventory, sales, expenses, customers, or catalogs.

Use events without full event sourcing:

- PostgreSQL normalized tables remain the source of current truth.
- Domain events are integration facts to notify other modules and future
  services, not the only persistence model.
- The outbox publisher runs in a worker process and publishes to RabbitMQ.
- Consumers must be idempotent, using stable event IDs or recorded handling
  state.
- Retries and dead-letter handling are infrastructure concerns for the worker
  and queue setup.

Required internal interfaces:

- `IdentityProvider` for local auth now and external auth later.
- `ObjectStorage` for S3-compatible photo storage.
- `ExchangeRateProvider` for Banxico/FIX or another provider decided by a
  later ADR.
- `EventPublisher` or `OutboxPublisher` for event publication.
- Repository interfaces per module, implemented by Prisma adapters.

Keep the shared kernel small:

- `Money`
- `Currency`
- `ExchangeRate`
- typed IDs
- `InventoryState`
- `Result` and domain error types

Do not move module-specific business behavior into `shared`.

## Consequences

- F1 auth scaffolding should create or prepare the `identity` module following
  these layers and interfaces.
- Future features should add behavior inside the owning vertical module instead
  of creating broad shared services.
- Modules should not read or write another module's tables directly. They
  communicate through application interfaces, queries intentionally exposed by
  the owning module, or events.
- Prisma is an infrastructure adapter, not a domain dependency.
- RabbitMQ is accepted as a formal v1 dependency, but message publication must
  flow through the transactional outbox rather than direct publish inside
  command handlers.
- Docker is the initial deployment target; Kubernetes remains out of scope
  until there is a concrete operational reason and a separate infra plan.
- If a module grows large enough to extract later, its application interface,
  events, and database ownership should minimize rework.

## Alternatives Considered

- Microservices from the start: rejected because v1 is an internal product with
  small initial scale. The operational cost would exceed the benefit.
- CRUD-only NestJS modules without domain/application separation: rejected
  because financial calculations, inventory state transitions, and traceability
  need testable business rules outside controllers and ORM models.
- Event sourcing for all state: rejected for v1 because normalized PostgreSQL
  plus outbox events gives auditability and integration leverage with much
  lower complexity.
- Direct RabbitMQ publish from request handlers: rejected because it can lose
  events when database commits and message publication diverge.
- Kubernetes as the initial deployment target: rejected until operations demand
  it.

## Verification

- Architecture tests should block `domain` imports from NestJS, Prisma, HTTP,
  RabbitMQ, S3, and provider SDKs once `back/` exists.
- Unit tests should cover value objects, aggregate rules, domain events, and
  command handlers.
- Integration tests should cover NestJS modules with PostgreSQL and Prisma,
  including commands, queries, permissions, and transaction behavior.
- Outbox/RabbitMQ tests should cover publication, retries, and idempotent
  consumption.
- OpenAPI contract snapshots or contract tests should detect accidental REST
  interface changes.
- PWA tests should cover the main user workflows as features are implemented.

## Related Records

- Task: `NEXO-0018`
- Baseline stack ADR: `ADR-2026-07-06-product-architecture-stack.md`
- Plan:
  `harness/control/plans/NEXO-0018-modular-monolith-architecture.md`
- Report:
  `harness/control/reports/2026-07-06/NEXO-0018-modular-monolith-architecture-session-001.md`
