# Nexo OpenCode Adapter

OpenCode files in this directory adapt the canonical Nexo control plane to
OpenCode. They are not the source of truth.

Canonical sources:

- `../AGENTS.md`
- `../harness/control/README.md`
- `../harness/control/agents/`
- `../harness/control/skills/`
- `../harness/control/tasks.md`

When an adapter conflicts with `harness/control/`, follow `harness/control/`
and update the adapter.

Nexo startup is deterministic: run
`node .opencode/scripts/build-session-context.mjs`, then read `AGENTS.md` and
`.opencode/state/session-context.json`. Use the full canonical resume path only
when the compiler fails or the packet is insufficient. FIAD context is scoped
to sessions started with `fiad:*` or `isyte:*` commands.
