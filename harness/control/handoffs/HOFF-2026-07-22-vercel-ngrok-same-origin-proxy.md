# Handoff - NEXO-0031 Vercel/ngrok Same-Origin Proxy

## Objective

Remove the free-ngrok browser interstitial for all frontend API and protected-photo requests without changing backend authorization.

## Context

Deployment `HDtiWdWrKs4KcMDDY5FYd5wgJZbh` builds successfully, but browser requests receive `200 text/html` with `ERR_NGROK_6024`. CORS is already corrected and verified independently.

## Source Docs

- `harness/control/plans/NEXO-0031-cicd-deploy-domain.md`
- `harness/control/decisions/DEC-NEXO-0031-vercel-ngrok-same-origin-proxy.md`
- `docs/adr/ADR-2026-07-22-vercel-ngrok-same-origin-proxy.md`
- `front/vercel.json`

## Files To Create Or Modify

- `front/vercel.json`
- A focused Vercel-config regression test under `front/`
- NEXO-0031 runbook, implementation, QA/security, report, and live-state records

## Implementation Steps

1. Route `/api/v1/(.*)` to `${BACKEND_ORIGIN}/api/v1/$1`.
2. Set `ngrok-skip-browser-warning: 1` using a Vercel request-header transform.
3. Keep filesystem handling before the final SPA fallback.
4. Test config shape and run frontend tests/build.
5. Commit/push only intended files, set `BACKEND_ORIGIN`, remove the direct public API base, and deploy once.

## Verification

- Vercel-config regression test and frontend production build pass.
- Hosted root and direct SPA route return the app.
- Login/session requests return JSON, not `ERR_NGROK_6024` HTML.
- Protected card/detail/lightbox photo requests pass through the authenticated gateway.
- No CORS/network errors, arbitrary proxy target, secret exposure, or unrelated setting change.

## Risks

- Incorrect route order could swallow API or SPA requests.
- A bad upstream value could break all API traffic; target remains operator-controlled and rollback is documented.

## Acceptance Criteria

- Build and deployment are Ready.
- `/api/v1` is same-origin and fixed-target.
- Login and protected-photo smoke tests pass.
- QA and security decisions are non-blocking.
- The prior deployment/config remains the rollback reference until acceptance.

## Receiving Agent

`nexo-build`, returning to `nexo` for external deployment and verification.
