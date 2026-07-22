# NEXO-0008 Login API URL Fix - Session 001

- Task ID: NEXO-0008
- Date: 2026-07-07
- Agent: Codex

## What changed

- Fixed the frontend local API base URL in `front/.env`.
- Replaced invalid `http:localhost:3000` with `/api/v1`, matching the Vite proxy
  configuration and backend global prefix.

## Files changed

- `front/.env`

## Verification

- Read `front/.env` after the edit and confirmed:
  `VITE_API_BASE_URL=/api/v1`.
- Did not run the frontend server in this session.

## Open items

- Restart the frontend dev server so Vite reloads the environment variable.
- Retry login in the browser.

## Recommended next step

- If login still fails after restart, inspect the backend response for
  `/api/v1/auth/login`; the original browser error was caused by the malformed
  frontend URL before the request could reach the backend.
