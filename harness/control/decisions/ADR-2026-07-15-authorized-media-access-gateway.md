# ADR-2026-07-15 - Authorized Media Access Gateway

## Status

Accepted

## Context

Item photo records persisted full Azure Blob SAS URLs. A SAS is an expiring
read bearer capability, not a durable object identity. It therefore caused
otherwise valid photos to stop rendering after expiry and unnecessarily spread
Azure URL/signing knowledge through import code, inventory responses, and the
frontend.

## Decision

Persist a canonical `storageKey` only. Expose private garment photos through a
same-origin, authenticated media gateway identified by `ItemPhoto.id`. The
gateway delegates to a media resolver that looks up the key and asks the active
storage adapter for a fresh, short-lived read URL. It responds with a no-store
temporary redirect.

The resolver is the deep module. Its interface is deliberately small:
`resolve(photoId) -> freshReadUrl`. Key lookup, object existence, Azure SAS
format, TTL, protocol, and provider selection are implementation details. The
`FileStoragePort` is the external seam; Azure Blob and local storage are real
adapters whose behavior varies there.

## Consequences

- Inventory data and database backups no longer contain signed bearer URLs.
- A request for the stable gateway URL obtains a new read capability on demand;
  no scheduler, stored token, or frontend TTL arithmetic is required.
- The browser still receives a short-lived redirect URL only for an authorized
  request. It is read-only, HTTPS-only, and marked no-store by the gateway.
- Storage provider changes and token policy changes have locality in the media
  module. Inventory code has leverage from a stable photo-ID interface.
- The gateway is not a byte-stream proxy, so Azure continues serving image
  bytes directly. This avoids backend bandwidth/latency costs.

## Alternatives Considered

- Persist a new SAS periodically: rejected because it keeps credentials as data,
  needs a scheduler, and still exposes expired windows/race conditions.
- Frontend-generated or frontend-refreshed SAS: rejected because signing
  credentials must never reach the browser and provider logic would leak.
- Stream every image through NestJS: rejected for now because it increases API
  bandwidth and latency without adding authorization benefit over a protected
  redirect.
- Make the container public: rejected because garment images remain internal
  operational data.

## Verification

- Canonical data migration rejects residual URL-shaped paths.
- Media unit tests exercise fresh resolution through fakes and protected
  endpoint behavior.
- Authenticated UI verification uses a photo after the legacy SAS has expired.

## Related Records

- Task: `NEXO-0036`
- Plan: `plans/NEXO-0036-authorized-media-access-gateway.md`
- Handoff: `handoffs/HOFF-2026-07-15-authorized-media-access-gateway.md`
- Related security finding: `security/NEXO-0033-price-pending-import.md`

