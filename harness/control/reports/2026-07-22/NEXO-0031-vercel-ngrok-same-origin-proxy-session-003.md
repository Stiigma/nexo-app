# NEXO-0031 Vercel/ngrok Same-Origin Proxy - Session 003

## Outcome

Production deployment `9p8buojpD` is Ready and the ngrok browser interstitial
is removed from the hosted API path. The browser bundle now uses `/api/v1`, and
Vercel forwards that path to the configured backend origin with the ngrok bypass
header.

## Evidence

- Before remediation, the browser-equivalent request returned
  `200 text/html`, content length 2847, and
  `ngrok-error-code: ERR_NGROK_6024`.
- Adding `ngrok-skip-browser-warning` reached the backend and returned
  `401 application/json`, isolating the interstitial from API and CORS behavior.
- The prior production JavaScript bundle contained the direct ngrok API URL.
- Vercel Project Settings were verified as Root Directory `front`, framework
  `vite`, Node `22.x`, with no build/install/output overrides.
- `VITE_API_BASE_URL` was changed to `/api/v1`; `BACKEND_ORIGIN` was added for
  Production and Preview without recording its value in repository artifacts.
- Redeployment of commit `4cdb514` completed Ready in 22 seconds and assigned
  `nexo-app-blond.vercel.app`.
- `GET https://nexo-app-blond.vercel.app/api/v1/catalogs/stores?page=1&limit=20`
  returns backend `401 application/json` without an authentication cookie.
- The new production bundle contains the relative API path and no direct ngrok
  hostname.
- Independent scoped QA passed the deployment and focused frontend gates.
- Independent security review found no open proxy or browser exposure of the
  ngrok hostname, but blocks task close pending explicit CSRF controls or a risk
  decision plus authenticated cookie/media acceptance.

## Files Changed

- `front/.gitignore`
- `front/.env.production.example`
- `harness/control/runbooks/RUNBOOK-NEXO-0031-operations.md`
- `harness/control/plans/NEXO-0031-cicd-deploy-domain.md`
- `harness/control/implementations/IMPL-NEXO-0031-vercel-ngrok-same-origin-proxy.md`
- NEXO-0031 task, state, README, journal, QA, and security records.

## Remaining

- Sign in through the hosted app and verify authenticated login/session,
  catalogs, and protected-photo requests.
- Resolve the same-origin security review findings before closing NEXO-0031.
- Diagnose the separate Docker healthcheck `429` that marks `nexo-api`
  unhealthy even though requests reach the API.
- Continue the remaining DNS, backup, and infrastructure acceptance gates before
  closing NEXO-0031.
