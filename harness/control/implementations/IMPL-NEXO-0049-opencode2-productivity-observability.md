# NEXO-0049 Implementation - OpenCode2 Productivity And Observability

## Metadata

- Task ID: `NEXO-0049`
- Date: 2026-07-18
- Agent: `nexo-build`
- Related plan:
  `../plans/NEXO-0049-opencode2-productivity-observability.md`
- Related handoff:
  `../handoffs/HOFF-2026-07-18-opencode2-productivity-observability.md`
- Related report:
  `../reports/2026-07-18/NEXO-0049-opencode2-productivity-observability-session-001.md`

## Summary

The five approved phases are implemented through native OpenCode controls, one
exact manual visual-review dependency, and project-local adapters. Nexo remains
the orchestrator, the control plane remains canonical, and the existing budget
ledger is the only telemetry store.

## Architecture And Pattern

- Architecture/technology: deepen the existing OpenCode adapter seam because
  Nexo already owns orchestration, memory, lifecycle, and evidence; rejected a
  second workflow, memory, telemetry, or agent framework because no duplicate
  authority is needed.
- Pattern: Adapter. Thin ESM modules expose exactly one plugin function to the
  OpenCode2 dev loader while CommonJS cores retain direct deterministic tests.
- Plannotator `@plannotator/opencode@0.23.1` is the only added external runtime
  dependency and runs with `workflow: manual`.

## Files Changed

- `opencode.json` and `tui.json` for exact plugin, command, native bound,
  attention, and footer configuration.
- `.opencode/plugins/*.mjs` runtime adapters and `.opencode/lib/*.cjs` testable
  plugin cores.
- `.opencode/tui/nexo-status.tsx` for bounded local task/budget status.
- `.opencode/scripts/opencode2-doctor.mjs` and
  `.opencode/scripts/serve-harness-status.mjs` for deterministic diagnosis and
  explicit loopback observability.
- `.opencode/tests/` for runtime, privacy, loader, telemetry, and regression
  coverage.
- Current harness documentation and NEXO-0049 operational evidence.

## Behavior Changed

- Visual annotation is available only through three project-local manual
  commands. Sharing is disabled, remote mode is forced off before invocation,
  and annotation is limited to project-relative `.md`, `.txt`, or `.html`
  files; URLs, folders, traversal, absolute paths, and `.env*` files are denied.
- TUI attention is enabled and a sidebar footer reads local task, cost, token,
  and tool-count summaries without reading prompt or tool content.
- User text sanitization redacts common JWT, bcrypt, bearer, base64, and named
  secret forms before model processing.
- Direct `.env*` reads/writes through file, patch, grep, or shell paths fail
  closed while `.env.example`, `.env.sample`, and `.env.template` remain usable.
- The budget ledger schema is version 3. It adds deduplicated tool-call identity,
  tool name, scope IDs, timestamps, aggregate counts, and milliseconds only;
  arguments, titles, outputs, metadata, and prompts are never persisted.
- Tool and message writes share one queue so concurrent completion cannot lose
  either ledger update.
- Native output truncation and compaction pruning replace unmeasured third-party
  compression.
- Optional status binds to `127.0.0.1:41749`, rejects mutating HTTP methods and
  product port `5173`, and starts only by explicit command.

## Performance

- Tool accounting is constant work plus one bounded local JSON read/write per
  completed call, serialized through the existing ledger queue.
- The TUI reads small local state files every two seconds. No cache, daemon,
  network telemetry, model call, or background agent was added.
- OpenCode2 startup remained near one second during diagnostics; no optimization
  was introduced without a measured bottleneck.

## Verification

- Focused privacy, telemetry, runtime, doctor, dashboard, and loader checks pass.
- The complete OpenCode harness passes 81 tests.
- Effective config resolves exact Plannotator, local commands, native bounds,
  and all server plugins.
- A pseudo-TTY launch loads server plugins and `tui.json` without loader errors.
- The compact context remains 4,148 characters, approximately 1,037 tokens.
- Graphify updated to 9,620 nodes, 11,615 edges, and 973 communities; the
  pre-existing zero-node and optional SQL-parser warnings remain.

## Operational Notes

- Restart OpenCode after close to load the new TUI and plugin boundaries in the
  user's normal process.
- `opencode2` is `0.0.0-dev-202607180310`; default `opencode` is repaired at
  `0.0.0-dev-202607181805`. The doctor reports this as a warning, not a hidden
  convergence claim.
- No global Plannotator command files were created; commands are project-local.

## Follow-Up

- Revalidate the exact plugin/TUI APIs before intentionally upgrading either
  OpenCode runtime or Plannotator.
- Keep DCP, `snip`, memory, swarm, auto-review, sharing, OAuth, and paid
  inference out until separately evaluated and approved.
