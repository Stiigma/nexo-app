# NEXO-0031 Vercel/ngrok Same-Origin Proxy QA

## Metadata

- Task ID: `NEXO-0031`
- Date: `2026-07-22`
- Reviewed deployment: `9p8buojpDjRtc9X89NecjQgXHcuJ`
- Decision: pass for the scoped same-origin deployment remediation

## Evidence

- Root and direct `/login` SPA routes return `200 text/html`.
- An unauthenticated hosted catalog request returns backend
  `401 application/json`.
- The API response contains neither `ERR_NGROK_6024` nor ngrok interstitial
  HTML.
- The production JavaScript bundle contains `/api/v1` and no direct ngrok
  hostname.
- `pnpm exec vitest run src/vercel-config.test.ts` passed: one file and one test.
- `pnpm exec tsc --noEmit --incremental false` passed.
- A no-write Vite production build with `VITE_API_BASE_URL=/api/v1` passed with
  2,563 transformed modules.
- `front/vercel.json` matches the accepted fixed-target route and preserves API,
  filesystem, then SPA fallback order.

## Findings

1. No functional blocker was found for the scoped interstitial remediation.
2. Authenticated login/session and protected-photo acceptance remain pending.
3. NEXO-0031 must stay open for its security and broader infrastructure gates.

## Residual Risk

A rotated ngrok origin requires an operator-controlled `BACKEND_ORIGIN` update
and redeployment. Authenticated gateway and redirect behavior were not tested
because no credential was inspected or requested.
