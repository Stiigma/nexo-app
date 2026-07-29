# NEXO-0031 Security Review - Vercel/ngrok Same-Origin Proxy

## Metadata

- Task ID: `NEXO-0031`
- Date: `2026-07-22`
- Decision: blocked for task close; no blocker to the scoped interstitial fix

## Scope

Reviewed the Vercel route, backend CORS and cookies, ADR, decision, runbook,
implementation record, session report, public API behavior, and production
browser bundle.

## Validated Controls

- `/api/v1/*` forwards only to the operator-controlled fixed upstream.
- The ngrok bypass header is assigned a static edge value.
- Request data cannot select an upstream.
- The production browser bundle contains no ngrok hostname.
- Untrusted origins receive no CORS allow-origin response.
- The unauthenticated catalog route reaches the backend and returns JSON `401`.

## Findings

1. **High:** Cookie-authenticated unsafe methods have no explicit CSRF token,
   dedicated request header, or server-side Origin/Fetch Metadata validation.
   `SameSite=Lax`, JSON requests, and strict CORS reduce exploitability but need
   an explicit control or accepted risk decision before security sign-off.
2. **Medium:** Hosted cookie attributes, host scope, refresh, logout, catalogs,
   and protected media remain unverified in an authenticated session.
3. **Low:** The prior deployment is not a healthy steady-state rollback because
   it restores the known ngrok interstitial. A coherent routing/environment
   rollback pair and post-rollback checks are still required.
4. **Low:** Public API responses expose unnecessary ngrok agent and Express
   identification headers.

## Required Follow-Up

- Add explicit CSRF protection or document and approve the exact SameSite,
  Origin, and request-content risk boundary.
- Complete authenticated browser acceptance while recording cookie names and
  attributes only, never values.
- Define and verify a coherent rollback pair.
- Remove unnecessary upstream-identifying response headers.

## Residual Risk

The ngrok origin remains directly reachable, tunnel rotation remains an
availability dependency, and backend authentication remains the primary
security boundary. No credential or environment-variable value was inspected
or recorded during this review.
