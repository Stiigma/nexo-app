# Nexo Control Plane

This directory is the operational control plane for Nexo. It keeps live state,
task plans, session reports, closeouts, daily journal entries, and evidence so a
new Codex, OpenCode, or human session can continue without reading prior chat.

## Current State

- Overall status: product implementation is now organized into the Nexo v1
  feature chain F0-F11. F0 closed the architecture/harness setup and accepted
  the durable product stack: NestJS, PostgreSQL, React PWA, and S3-compatible
  object storage. `NEXO-0018` codified the professional modular monolith
  architecture: DDD-style modules, pragmatic CQRS, Prisma repositories,
  transactional outbox, RabbitMQ, and adapter seams. `NEXO-0007` added the
  auth/permission foundation. `NEXO-0019` added local Docker PostgreSQL and
  backend DB configuration. The disposable prototype remains separate.
- Active task: NEXO-0036 (Authorized Media Access Gateway And Renewable Photo URLs). Its local data migration is applied and its technical/security checks pass. User evidence now confirms an authenticated admin session on the port-5173 runner, but catalog reads from inventory return `500`; the same runner is open locally for an authorized reproduction before closing it with NEXO-0033. Ver `handoffs/HOFF-2026-07-15-authorized-media-access-gateway.md`.
- Latest focused UI improvement: `NEXO-0029` implemented financial detail
  currency tabs in the inventory detail modal. MXN is default; USD is
  display-only from `exchangeRate`. Report:
  `reports/2026-07-07/NEXO-0029-financial-detail-currency-tabs-session-001.md`.
- Latest operational fallback: `NEXO-0030` configured Command Code (`cmd`) as
  fallback for OpenCode with Nexo control-plane taste rules, project MCPs for
  Chrome DevTools and GitHub, and a reusable runbook. Report:
  `reports/2026-07-08/NEXO-0030-command-code-fallback-session-001.md`.
- Latest Codex project configuration: `NEXO-0034` added the requested model,
  reasoning, permission, personality, verbosity, and bundled plugin defaults to
  `.codex/config.toml` while preserving the existing MCP servers. `notify` is
  intentionally global-only. Report:
  `reports/2026-07-15/NEXO-0034-codex-project-config-session-001.md`.
- Latest ChatGPT/Codex efficiency implementation: `NEXO-0038` uses Terra/High,
  low verbosity, compact validated startup, 64K history compaction and bounded
  tool output through a compiler shared with OpenCode. Report:
  `reports/2026-07-16/NEXO-0038-chatgpt-codex-token-efficiency-session-001.md`.
- Latest OpenCode configuration repair: `NEXO-0044` restored the active CLI,
  configured `openai/gpt-5.6-sol`, removed an invalid duplicate Graphify plugin
  origin, and scoped planner writes to `harness/control/**`. All 19 OpenCode
  harness tests and effective runtime checks pass. Report:
  `reports/2026-07-18/NEXO-0044-opencode-effective-config-session-001.md`.
- Latest harness task: `NEXO-0045` added one visible Nexo orchestrator with
  hidden, non-delegating role specialists and risk-tiered reasoning. All 23
  harness tests pass. Report:
  `reports/2026-07-18/NEXO-0045-single-chat-orchestrator-session-001.md`.
- Latest harness task: `NEXO-0046` closed the structured control-engine slice
  after self-hosted build, rework, QA, security, and close transitions. All 38
  harness tests pass. Report:
  `reports/2026-07-18/NEXO-0046-structured-control-engine-session-003.md`.
- Latest harness task: `NEXO-0047` closed the MCP hardening slice with
  exact-version Chrome, digest-pinned official GitHub, and
  bounded Context7 integrations. Governed security rework, all 43 tests,
  three-server discovery, QA, security, and close pass. Report:
  `reports/2026-07-18/NEXO-0047-hardened-mcp-integrations-session-002.md`.
- Latest Agent Workflow task: `NEXO-0048` closed canonical architecture and
  dependency selection skills with native OpenCode discovery, exact task-bound
  decisions, governed rework, 70 passing tests, QA pass, and security approval.
  Report:
  `reports/2026-07-18/NEXO-0048-architecture-dependency-selection-skills-session-004.md`.
- Latest Agent Workflow task: `NEXO-0049` closed the five user-approved
  OpenCode2 productivity phases with exact manual visual review, local TUI
  status/attention, privacy controls, content-free telemetry, native context
  bounds, optional loopback observability, 81 passing tests, QA pass, and
  security approval. The product focus remains `NEXO-0036`.
- Last completed task: `NEXO-0027` - Image Optimization Pipeline (Sharp + WebP), implemented in media module. Ver `reports/2026-07-07/NEXO-0027-image-optimization.md`.
- Last completed task: `NEXO-0027` - Image Optimization Pipeline (Sharp + WebP).
- Latest work: Image optimization pipeline integrated into media module. 8 new
  files (domain, application, infrastructure, tests), 5 modified. Sharp 0.35.3
  for WebP conversion, resize ≤2048px, EXIF strip, auto-rotate, adaptive quality.
  22 new tests pass, 50 total, 0 regressions. Implementation record:
  `implementations/IMPL-NEXO-0027-image-optimization.md`.
- Latest fixture: 39 items `manual-stock-2026-07-08-price-pending` prepared from `newstorage` with `status: price_pending`; not imported until real `PRICE_PENDING` app support exists.
  Azure Blob Storage (`nexo-photos` container).
- Recommended next step: sign in to the open port-5173 local runner, reproduce the reported catalog `500`, and capture its server-side cause before resuming authenticated visual QA for NEXO-0036.
- Product source: `../../NEXO_PROJECT.md`.
- FIAD ecosystem context: `FIAD-0003` created the canonical Isyte/FIAD
  context under `ecosystem/` and `projects/` for CEF, HU, SAL, and Harness
  local .NET service development. Legacy FIAD memory remains a source only, not
  live state.

## Quick Start For A New Session

1. Read `../../AGENTS.md`.
2. From the repository root, run the current surface adapter:
   - ChatGPT/Codex: `node .codex/scripts/build-session-context.mjs`.
   - OpenCode: `node .opencode/scripts/build-session-context.mjs`.
3. On success, read that surface's `state/session-context.json` plus the
   matching canonical agent/skill.
4. Use the full workflow/tasks/plan/report/journal/CURRENT/NEXT fallback only
   when compilation fails or the packet is insufficient.

## Agent Operating System

`harness/control/` is the canonical agent operating system. Use:

- `agents/` for role selection and agent behavior.
- `skills/` for reusable work procedures.
- `state/` for current and next work summaries.
- `indexes/` for navigation and routing smoke tests.
- `handoffs/` for plan-to-build transfers.
- `implementations/` for durable implementation context.
- `investigations/` for diagnosis and research.
- `runbooks/` for operational procedures.
- `security/` for security reviews and threat records.

OpenCode support lives in `../../.opencode/` and `../../opencode.json`, but
those files are adapters. If they disagree with `harness/control/`, update the
adapter and follow `harness/control/`.

## Agent Routing

- User entry point: `nexo`.
- `nexo` routes requirements, planning, build, design, QA, infrastructure, and
  security work to hidden specialists when delegation adds value.
- Specialists return results to `nexo`; they never delegate to each other.

## Live Index

- Workflow: `WORKFLOW.md`
- Task index: `tasks.md`
- Current state: `state/CURRENT.md`
- Next state: `state/NEXT.md`
- Product spec: `../../docs/spec/`
- FIAD ecosystem: `ecosystem/`
- FIAD project profiles: `projects/`
- Decision records: `decisions/`
- Agents: `agents/`
- Skills: `skills/`
- Handoffs: `handoffs/`
- Implementations: `implementations/`
- Investigations: `investigations/`
- Runbooks: `runbooks/`
- Security: `security/`
- Fixtures: `../fixtures/`
- Indexes: `indexes/`
- Plans: `plans/`
- Reports: `reports/`
- Closeouts: `closeouts/`
- Daily journal: `journal/`
- Templates: `templates/`
- OpenCode adapter: `../../.opencode/`
- OpenCode commands: `../../opencode.json`

## Latest Records

- Latest report:
  `reports/2026-07-18/NEXO-0049-opencode2-productivity-observability-session-001.md`
- Latest investigation:
  `investigations/INV-2026-07-07-catalogs-500-error.md`
- Latest handoff:
  `handoffs/HOFF-2026-07-18-opencode2-productivity-observability.md`
- Latest closeout:
  `closeouts/NEXO-0049-opencode2-productivity-observability.md`
- Latest FIAD closeout:
  `closeouts/FIAD-0003-canonical-ecosystem-context.md`
- Latest journal: `journal/2026-07-18.md`

## Closed Tasks

- `NEXO-0001` - create enriched operational control plane.
- `NEXO-0003` - create requirements spec section.
- `NEXO-0004` - upgrade agentic harness operating system.
- `NEXO-0005` - register manual stock inventory fixture.
- `NEXO-0006` - F0 architecture base and feature harness.
- `NEXO-0007` - F1 auth and base permissions.
- `NEXO-0018` - modular monolith architecture.
- `NEXO-0019` - local PostgreSQL Docker.
- `NEXO-0020` - bcrypt + Passport JWT Cookie Auth.
- `NEXO-0021` - Auth Stitch design prompt.
- `NEXO-0022` - Dual Token Auth (Access 15min + Refresh 7d).
- `NEXO-0038` - ChatGPT/Codex token-efficient workflow.
- `NEXO-0044` - repair and validate effective OpenCode configuration.
- `NEXO-0045` - single-chat Nexo orchestrator.
- `NEXO-0046` - structured task control engine.
- `NEXO-0047` - hardened MCP integrations.
- `NEXO-0048` - architecture and dependency selection skills.
- `NEXO-0049` - OpenCode2 productivity, observability, and visual workflow.
- `FIAD-0003` - canonical ecosystem context for local .NET service development.

## Pending Work

- 🟡 `NEXO-0033` imported 39 `PRICE_PENDING` fixture items and 39 Azure WebP photos successfully. Its expiring-SAS risk is remediated locally by NEXO-0036; authenticated visual QA remains before closeout.
- 🟡 `NEXO-0036` now persists provider-neutral keys and uses an authenticated, renewable media-access gateway. The local migration, data checks, fresh signed-read check, container non-public check, tests, and builds passed; authenticated UI verification remains the final gate.
- ✅ `NEXO-0044` repaired and runtime-validated OpenCode with Sol, one valid
  Graphify plugin origin, scoped planner writes, and 19 passing harness tests.
  Paid A/B benchmarking remains a separately approved follow-up.
- `NEXO-0045` closed the single-chat topology: one Nexo primary, eight hidden
  non-delegating specialists, 12 orchestrated commands, and 23 passing tests.
- `NEXO-0046` closed deterministic manifest, evidence, gate, lifecycle, and
  governed-rework validation with 38 passing harness tests.
- `NEXO-0047` closed exact Chrome, immutable GitHub, bounded Context7,
  orchestrator-only exposure, and untrusted-response controls with 43 passing
  harness tests.
- `NEXO-0048` closed architecture/dependency selection skills, native adapters,
  exact decision/review evaluations, later-gate revalidation, canonical path
  containment, and specialist manifest ownership with 70 passing tests.
- `NEXO-0049` closed exact manual Plannotator, TUI status/attention, local
  privacy guards, content-free tool telemetry, native bounds, runtime doctor,
  and loopback status with 81 tests plus QA/security approval. Restart OpenCode
  before normal use.
- ✅ `NEXO-0038` closed the matching ChatGPT/Codex workflow: Terra/High,
  compact context, bounded tool output, 21 passing tests and strict config
  validation. Open a new app task to receive the project defaults.
- 🟢 `NEXO-0032` created price-pending fixture `manual-stock-2026-07-08-price-pending` with 39 items; app import waits for real `PRICE_PENDING` support.
- 🟡 `NEXO-0037` implemented its first slice: a shared safe garment editor for
  `OPERATOR` and `ADMIN`, with API-level financial redaction for operators.
  Authenticated visual QA is pending; listing publication, price approval, and
  sales controls remain subsequent slices.
- 🔴 Resume `NEXO-0008` (F2 operational catalogs) — next product feature.
- 🟡 Implement `NEXO-0023` (security logging & alerting) — Fase 0 completada ✅.
  RequestLoggingInterceptor global captura cada HTTP request/response a Winston.
  Siguiente: Fase 1 (auth integration: warn/alert en guards + controllers).
- 🟢 `NEXO-0025` implemented local OpenCode budget guard and project-local
  Chrome DevTools MCP; no commit/push done.
- 🟢 `NEXO-0029` implemented inventory detail MXN/USD financial tabs; manual
  browser verification remains.
- 🟢 `NEXO-0030` implemented Command Code fallback for OpenCode with project
  MCPs and runbook; no commit/push/deploy done.
- Expand and execute F2-F11 in dependency order from
  `plans/NEXO-v1-feature-master-plan.md`.
- Resolve remaining SRS open questions when a feature touches them.
