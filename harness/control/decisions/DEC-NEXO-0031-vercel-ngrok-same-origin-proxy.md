# NEXO-0031 Architecture Selection - Vercel/ngrok Same-Origin Proxy

## Metadata

- Task ID: `NEXO-0031`
- Date: 2026-07-22
- Evaluator: nexo
- Decision boundary: Browser-to-backend routing for the Phase-1 Vercel/ngrok topology.

## Context

The Vercel build is healthy, but browser requests sent directly to the free ngrok URL receive the `ERR_NGROK_6024` HTML interstitial. A client-only header is insufficient because protected photos use native `<img>` requests.

## Constraints

- Keep Vercel, ngrok, Docker Compose, authentication, and the private media gateway.
- Add no dependency, paid plan, arbitrary proxy target, or public storage access.
- Preserve SPA deep links and make ngrok URL rotation operationally bounded.

## Options Considered

1. Keep direct browser-to-ngrok routing: rejected; the interstitial breaks API and image requests.
2. Add the bypass header only to Axios: rejected; native image requests cannot send it.
3. Proxy `/api/v1/*` through Vercel and inject the header server-side: selected.
4. Buy a custom ngrok domain or replace the tunnel: deferred; adds cost or topology.

## Criteria

- Requirement fit: Covers Axios, refresh, cookies, and native image requests.
- Coupling and cohesion: Keeps provider-specific bypass policy at the deployment edge.
- Data integrity and security: Fixed upstream only; backend auth remains authoritative.
- Operability and performance: One extra edge hop; URL rotation becomes one environment update and redeploy.
- Testability and compatibility: Static config assertions plus hosted smoke tests.
- Cost and reversibility: No new cost; restore the prior Vercel config/environment to roll back.

## Architecture Decision Evaluation

- Decision: approved
- Selected option: Fixed-target same-origin Vercel reverse proxy for `/api/v1/*`.
- Rationale: It is the smallest solution that covers every browser request type without changing media authorization or adding infrastructure.
- Pattern decision: Edge reverse proxy/gateway using existing Vercel routing; no application module.
- Required evidence or approval: User approved implementation, commit, push, Vercel environment change, and production redeploy; QA and security reviews remain required.
- Reversibility: Restore the prior SPA-only `vercel.json`, direct API environment value, and prior deployment state.

## Consequences

- The browser uses relative `/api/v1`; Vercel injects `ngrok-skip-browser-warning: 1` and forwards to `BACKEND_ORIGIN`.
- `BACKEND_ORIGIN` is operator-controlled and must never come from request input.

## Residual Risks

- A rotated ngrok URL requires updating `BACKEND_ORIGIN` and redeploying.
- Hosted verification must confirm cookies and redirect-based protected photos.

## Related Evidence

- Plan: `harness/control/plans/NEXO-0031-cicd-deploy-domain.md`
- ADR: `docs/adr/ADR-2026-07-22-vercel-ngrok-same-origin-proxy.md`
- Dependency evaluation: none; no dependency added.
- Migration plan: none.
