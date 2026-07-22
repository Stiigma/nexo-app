# NEXO-0033 Security Review — Price-Pending Import

## Metadata

- Task ID: NEXO-0033
- Date: 2026-07-15
- Security agent: nexo-security
- Reviewed artifact: Fixture importer, Azure upload adapter, and local execution
- Decision: conditionally approved

## Scope

Review the storage, data, authentication, and credential boundaries affected by importing 39 fixture images and garment records.

## Data And Trust Boundaries

- The importer reads a repository-local fixture, validates its code range/status/pricing/photo format, and writes only the required catalog, item, photo, and Azure blob records.
- The source JPEG is processed before upload; the upload path is derived from the persisted item ID as `items/{itemId}/main.webp`.
- The importer is a local CLI, not an HTTP endpoint. Access requires local project/environment access.

## Secrets And Environment

- Azure credentials are read only from environment configuration and were not logged, copied, or committed during this work.
- Import output reports counts only. Verification reported the Azure host and normalized paths without exposing stored SAS query strings.

## Authentication And Sessions

- The local inventory API rejected an unauthenticated request with HTTP 401.
- No browser credentials, tokens, or session data were entered or exposed during QA.

## Roles And Permissions

- The CLI runs outside user-facing role enforcement and therefore must remain limited to trusted local operators with Azure/database access.
- Role behavior in the rendered inventory UI remains pending authenticated QA.

## Sensitive Data

- ItemPhoto records currently store full read-only Azure SAS URLs. They are necessary for the existing image-display pattern but are sensitive bearer links and may appear in database backups or any authorized API response that exposes photos.
- Generated SAS permissions are read-only, HTTPS-only, and expire according to `AZURE_SAS_EXPIRY_HOURS` (seven days by default).

## Dependencies And Configuration

- The import reuses the existing Sharp processor and Azure Blob adapter; no new third-party dependency or secret format was introduced.
- Azure container public/private access configuration was not changed or independently verified in this session.

## Infrastructure Exposure

- Confirmed photo URLs resolve to the configured Azure Blob Storage host; 39 paths use the expected WebP main-photo convention.
- No deploy, public endpoint, DNS, or Azure access-policy change was made.

## Findings

- SEC-1 (medium, existing pattern): Persisted SAS URLs expire and can become unusable after their configured lifetime. They are also read-capability bearer URLs while valid.
- SEC-2 (low): Container access-policy posture was not independently verified; the adapter's signed-URL use does not itself prove the container is private.

## Required Mitigations

- Before production/release closeout, either implement a signed-URL refresh/storage-key strategy or explicitly accept the seven-day SAS expiry and bearer-link exposure risk.
- Verify the Azure container is private and restrict database/API access to authorized users.

## Residual Risk

The local authorized import is conditionally approved. NEXO-0033 must remain open until authenticated UI QA is complete and the user accepts SEC-1 or authorizes its remediation.
