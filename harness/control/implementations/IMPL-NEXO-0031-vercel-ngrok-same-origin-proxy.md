# NEXO-0031 Implementation - Vercel/ngrok Same-Origin Proxy

## Metadata

- Task ID: `NEXO-0031`
- Date: `2026-07-22`
- Deployment: `9p8buojpDjRtc9X89NecjQgXHcuJ`
- Source commit: `4cdb5147871ac21698076afd0013836969087441`
- Related ADR: `docs/adr/ADR-2026-07-22-vercel-ngrok-same-origin-proxy.md`
- Related handoff: `harness/control/handoffs/HOFF-2026-07-22-vercel-ngrok-same-origin-proxy.md`

## Summary

The production browser no longer calls free ngrok directly. Vercel serves a
relative `/api/v1` browser surface, injects `ngrok-skip-browser-warning: 1`, and
forwards requests to an operator-controlled `BACKEND_ORIGIN`.

## External Changes

- Confirmed Root Directory `front`, framework `vite`, Node `22.x`, and no
  build/install/output overrides in the Vercel project.
- Set `VITE_API_BASE_URL=/api/v1` for Production and Preview.
- Added the current `BACKEND_ORIGIN` for Production and Preview as a sensitive
  Vercel variable. Its value is intentionally not recorded here.
- Redeployed production without reusing the old build cache.

## Repository Changes

- Corrected the NEXO-0031 runbook to rotate `BACKEND_ORIGIN`, not the browser
  API base.
- Corrected the production environment example and made it trackable.
- Updated task, plan, live-state, journal, and report records.

## Verification

- Deployment `9p8buojpD`: `Ready`, 22-second duration.
- Production domain retained: `https://nexo-app-blond.vercel.app`.
- Hosted catalog request: `401 application/json` from the backend when no
  authentication cookie is supplied.
- No `ngrok-error-code` or `ERR_NGROK_6024` appears through the hosted route.
- Production bundle contains `/api/v1` and does not contain the direct ngrok
  hostname.
- Scoped QA passed; security found no open proxy or client hostname exposure but
  blocks task close pending explicit CSRF and authenticated-cookie acceptance.
- Authenticated browser acceptance remains pending because no credential was
  requested, inspected, or stored during deployment verification.

## Rollback

Promote deployment `77JGsAdDSS8y1E8Pi463BYpgnQV1` only if a regression requires
rollback, then restore the prior Vercel environment values. That rollback also
restores the known ngrok interstitial failure and is therefore an emergency
fallback, not an accepted steady state.
