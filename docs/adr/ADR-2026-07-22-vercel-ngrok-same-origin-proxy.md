# ADR-2026-07-22 - Vercel/ngrok Same-Origin API Proxy

## Status

Accepted.

## Context

The accepted Phase-1 Vercel/ngrok topology exposed the free ngrok URL directly to the browser. ngrok returns `ERR_NGROK_6024` HTML to browser traffic unless a bypass request header is present. Client-only injection cannot cover protected photos loaded by `<img>`.

## Decision

Route browser traffic through a fixed-target Vercel edge proxy:

- Browser API base: `/api/v1`.
- Upstream: operator-controlled `BACKEND_ORIGIN` plus the original path.
- Edge request header: `ngrok-skip-browser-warning: 1`.
- Routing order: API proxy, filesystem, then SPA fallback.

The proxy target is never accepted from request data. Backend authentication, permissions, CORS fallback, and the private signed-redirect media gateway remain unchanged.

## Consequences

- API calls and native image requests share the Vercel origin and bypass the ngrok interstitial.
- No dependency, service, or paid plan is added.
- ngrok URL rotation requires updating `BACKEND_ORIGIN` and redeploying.
- Rollback restores the previous Vercel config/environment and deployment state.

## Supersedes

This narrows the direct browser-to-ngrok portion of `ADR-2026-07-07-deploy-strategy-phase1.md`; the rest of that ADR remains accepted.
