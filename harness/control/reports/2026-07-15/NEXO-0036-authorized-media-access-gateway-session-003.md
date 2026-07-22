# NEXO-0036 Report - Reported 500 Responses Session 003

## Metadata

- Date: 2026-07-15
- Agent: nexo-qa
- Task: NEXO-0036
- Status: diagnosis blocked pending authenticated reproduction

## What Was Done

- Reviewed the user-supplied browser errors: the port-5173 runner returned
  HTTP `500` for catalog reads and protected photo-content requests.
- Identified the active local runners. The reported errors originated from
  port 5173, while the separate QA runner currently shown to the user is on
  port 5176.
- Established the closest safe request loop without credentials: three direct
  reads of `catalogs/brands?active=true&limit=100` through port 5173 returned
  `401 Unauthorized` consistently.

## Verification Performed

- The unauthenticated loop is deterministic, but it cannot assert the user's
  `500` symptom because the requested route is correctly stopped by the
  session guard before application logic executes.
- No server-side root cause has been inferred from an unauthenticated response.

## Files Changed

- Control-plane live state and this session report only.

## Open Items

- A user-controlled operator session is needed to reproduce the `500` and
  collect the corresponding server error without handling credentials.
- After reproduction, run the diagnostic hypothesis/fix loop, then resume the
  visual acceptance checks for cards, detail, and lightbox.

## Recommended Next Step

The user signs in through the local QA screen and confirms it. Re-run the
catalog and photo requests under that session before changing code or data.
