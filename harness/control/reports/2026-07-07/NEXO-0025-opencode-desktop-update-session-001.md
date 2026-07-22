# NEXO-0025 OpenCode Desktop Update - Session 001

- Task ID: NEXO-0025
- Date: 2026-07-07
- Agent: Codex

## What was done

- Inspected the local OpenCode CLI and Desktop installation.
- Found CLI `opencode` at `/home/otomi/.opencode/bin/opencode`, version
  `1.17.15`.
- Found OpenCode Desktop installed at `/home/otomi/.local/opt/OpenCode`.
- Found a pending Desktop update package at
  `/home/otomi/.cache/@opencode-aidesktop-updater/pending/opencode-desktop-linux-amd64.deb`.
- Extracted the pending package in `/tmp` and confirmed package metadata:
  `opencode` version `1.17.15`.
- Copied package contents from `/opt/OpenCode` payload into the user-local
  install path `/home/otomi/.local/opt/OpenCode`.
- Preserved the local desktop launcher pointing to
  `/home/otomi/.local/opt/OpenCode/ai.opencode.desktop`.

## Files changed

- External user-local install:
  `/home/otomi/.local/opt/OpenCode`
- Harness report added:
  `harness/control/reports/2026-07-07/NEXO-0025-opencode-desktop-update-session-001.md`

## Verification performed

- Verified installed Desktop `resources/app.asar` SHA-256 matches the pending
  package payload:
  `47da6317a98699219c79d837e35e1b512717684ba083893c65dab5a85f0b3ae8`.
- Verified installed Desktop binary SHA-256 matches the pending package payload:
  `008c5cf72df686019c818d2cb0570df8137b49aa5dae64dcf017ea2656c5b7ac`.
- Verified `ai.opencode.desktop.desktop` still uses the user-local executable
  path.

## What remains

- OpenCode Desktop was not launched from this session.
- The updater cache still contains the downloaded pending `.deb`.

## Recommended next step

- Launch OpenCode Desktop normally from the desktop/app menu and confirm it
  starts cleanly.
