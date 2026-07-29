# Current State

Last updated: 2026-07-22

## Default Focus

- `NEXO-0036` is active: Authorized Media Access Gateway And Renewable Photo
  URLs.
- Plan: `../plans/NEXO-0036-authorized-media-access-gateway.md`.
- Latest report:
  `../reports/2026-07-16/NEXO-0036-authorized-media-access-gateway-session-004.md`.
- Migration and technical verification are complete. User evidence shows an
  authenticated admin session and catalog `500` responses on the port-5173
  runner; exact authenticated reproduction precedes the remaining visual QA.

## User-Selected Parallel Work

- `NEXO-0031` deployed the Vercel/ngrok same-origin proxy after explicit user
  authorization. Deployment `9p8buojpD` is Ready; the production bundle uses
  `/api/v1`, Vercel forwards to the operator-controlled `BACKEND_ORIGIN`, and
  unauthenticated API requests return backend JSON without `ERR_NGROK_6024`.
  The verified local backup restore now serves 78 items/photos and local
  authenticated login, catalog, inventory, and protected-photo checks pass.
  Hosted authenticated acceptance and the broader infrastructure gates remain
  pending.

## Agent Workflow

- `NEXO-0049` is closed without changing the product focus. Its five OpenCode2
  productivity phases pass 81 harness tests, runtime/TTY diagnostics, QA,
  security, and the governed close transition. Restart OpenCode to load the
  final server/TUI boundaries in the user's normal process.
- `NEXO-0048` is closed. Canonical architecture/dependency selection skills,
  native OpenCode adapters, exact task-bound decision and review evaluations,
  strict fenced-content handling, later-gate revalidation, canonical realpath
  containment, and specialist manifest ownership pass 70 tests. Final QA passed
  and security approved; no product focus was changed.
- `NEXO-0047` is closed after governed security rework with exact-version Chrome DevTools,
  digest-pinned local read-only/lockdown GitHub, bounded read-only Context7,
  orchestrator-only MCP exposure, and untrusted-response handling. All three
  MCPs connect; QA and security passed.
- `NEXO-0046` is closed. New non-trivial tasks use read-only structured
  manifests and deterministic build, review, implemented, rework, and close
  decisions. `tasks.md` remains canonical.
- `NEXO-0045` is closed. `nexo` is the sole selectable Nexo primary, runs at
  `medium`, and may invoke eight hidden specialists. Every specialist has Task
  denied; ordinary role work uses `high` and security uses `xhigh`.
- `NEXO-0044` is closed. The active OpenCode CLI is repaired and project config
  defaults to `openai/gpt-5.6-sol`, low text verbosity, and `medium`, `high`, or
  `xhigh` reasoning by risk.
- `NEXO-0038` is closed. ChatGPT/Codex defaults to `gpt-5.6-terra`, `high`
  reasoning and low verbosity, with 64K compaction and 8K tool-output storage.
- `harness/control/state/focus.json` plus the shared compiler under
  `harness/control/scripts/` generate the normal startup packet. ChatGPT/Codex
  writes `.codex/state/session-context.json`; OpenCode writes
  `.opencode/state/session-context.json`.
- The packet is deterministic, source-hash validated, freshness checked, and
  limited to 10,000 characters. The current packet is 4,148 characters
  (approximately 1,037 tokens); failure requires the full resume path.
- FIAD context is only active in sessions marked by `fiad:*` or `isyte:*`.
- Budget state binds session to task explicitly and summarizes tokens/cost by
  session, task, model, agent, and phase.
- All 81 OpenCode harness tests pass. The validated `opencode2` runtime resolves
  `0.0.0-dev-202607180310`; the repaired default `opencode` resolves
  `0.0.0-dev-202607181805`, and the deterministic doctor retains this version
  difference as a warning.
  The validated runtime resolves the Sol model, one auto-discovered Graphify
  plugin, one Nexo primary, hidden non-delegating specialists, 12 commands
  routed through `nexo`, scoped role permissions, and governed-task command
  integration. Codex was not revalidated in NEXO-0046.

## Canonical Navigation

- Task index: `../tasks.md`.
- Next actions: `NEXT.md`.
- Product source: `../../../NEXO_PROJECT.md`.
- Plans, handoffs, reports, implementations, security reviews, and closeouts
  remain under their canonical `harness/control/` directories.
