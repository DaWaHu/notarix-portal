# Notarix Preview document-security minimum

Status: **repository implementation and design only — not deployed**  
Environment: protected Preview, synthetic documents only

## Minimum secure implementation

Notarix Signings should use one private, versioned S3 Preview bucket and a dedicated customer-managed KMS key. Uploads enter a `quarantine/` namespace through a ten-minute signed PUT contract that fixes the media type, SHA-256 checksum, and SSE-KMS headers. The service accepts PDF, JPEG, and PNG only, limits each object to 25 MiB, rejects path-bearing names, and requires the extension to agree with the declared media type. Content signature inspection must still occur in the scanner because MIME and extension checks alone are not sufficient.

An object remains unavailable while its scan result is `PENDING` or `ERROR`; an `INFECTED` result keeps it quarantined. Only `CLEAN` objects may transition to `RELEASED`. A five-minute signed GET may be created only after server-side Order authorization, clean-scan verification, SSE-KMS verification, an immutable S3 version ID, a stored SHA-256 digest, and an access audit receipt. The decision must never rely on browser-supplied role, organization, or scan state.

Retention is metadata-driven and fail-closed. Deletion requires both an expired UTC retention deadline and `legalHold = false`. Legal holds take precedence over lifecycle expiration. Bucket lifecycle rules must not delete current or noncurrent evidence versions until the owner approves retention periods and the application supplies a verified deletion-eligibility process.

Recovery requires an isolated restore of a named S3 version and comparison of its SHA-256 digest with the custody record. Preview acceptance requires a recorded restore exercise; versioning alone is not recovery evidence.

## Provider recommendation

- Storage, encryption, eventing, and audit: AWS S3, AWS KMS, EventBridge, Lambda, CloudTrail data events, and CloudWatch.
- Malware scanning: begin with an AWS-native or Marketplace scanner only after price, signature-update behavior, maximum file size, encrypted-object support, regional processing, data retention, retry behavior, and failure semantics are approved. No provider is selected or purchased by this checkpoint.
- Presigning: generate URLs in the authenticated AWS service, never in the browser and never with long-lived browser credentials.

## Remaining gates

1. Owner approval of retention periods, recovery objective, KMS administration, CloudTrail retention, and malware provider/cost.
2. Cognito identity and normalized Order authorization available to the signing service.
3. CDK implementation, least-privilege IAM review, and isolated Preview deployment authorization.
4. Synthetic EICAR/provider test, scan failure/retry tests, signed-URL expiry tests, cross-tenant denial, legal-hold deletion denial, version restore, and checksum verification.

The enforceable repository rules are in `packages/document-security/index.ts`; the proposed resources are in `infrastructure/document-security/preview-resource-manifest.yaml`. Neither file creates an AWS resource or changes an environment.
