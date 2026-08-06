export const DOCUMENT_MAX_BYTES = 25 * 1024 * 1024;
export const SIGNED_UPLOAD_TTL_SECONDS = 10 * 60;
export const SIGNED_DOWNLOAD_TTL_SECONDS = 5 * 60;

export const allowedDocumentTypes = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
} as const;

export type AllowedDocumentMimeType = keyof typeof allowedDocumentTypes;
export type MalwareDisposition = "PENDING" | "CLEAN" | "INFECTED" | "ERROR";
export type EvidenceLifecycle = "QUARANTINED" | "RELEASED" | "RETAINED";

export type DocumentUploadRequest = {
  byteLength: number;
  fileName: string;
  mimeType: string;
  orderId: string;
  sha256: string;
};

export type DocumentSecurityRecord = {
  encryption: "aws:kms";
  evidenceId: string;
  legalHold: boolean;
  lifecycle: EvidenceLifecycle;
  malwareDisposition: MalwareDisposition;
  objectKey: string;
  retentionUntilUtc: string;
  sha256: string;
  versionId: string | null;
};

export type DocumentSecurityDecision =
  | { allowed: true }
  | { allowed: false; code: string; reason: string };

const SHA256 = /^[a-f0-9]{64}$/i;
const SAFE_ORDER_ID = /^ORD-[A-Z]{2}-\d{4}-\d{4}$/;

export function validateDocumentUpload(
  input: DocumentUploadRequest,
): DocumentSecurityDecision {
  if (!SAFE_ORDER_ID.test(input.orderId)) {
    return deny("INVALID_ORDER_ID", "A valid Order identifier is required.");
  }
  if (!Number.isSafeInteger(input.byteLength) || input.byteLength <= 0) {
    return deny("INVALID_SIZE", "The file must have a positive byte length.");
  }
  if (input.byteLength > DOCUMENT_MAX_BYTES) {
    return deny("FILE_TOO_LARGE", "The file exceeds the 25 MiB Preview limit.");
  }
  const extensions = allowedDocumentTypes[input.mimeType as AllowedDocumentMimeType];
  if (!extensions) {
    return deny("UNSUPPORTED_MEDIA_TYPE", "The declared media type is not allowed.");
  }
  const normalizedName = input.fileName.trim().toLowerCase();
  if (
    !normalizedName ||
    normalizedName.includes("/") ||
    normalizedName.includes("\\") ||
    !extensions.some((extension) => normalizedName.endsWith(extension))
  ) {
    return deny(
      "FILE_TYPE_MISMATCH",
      "The file extension must match the declared media type.",
    );
  }
  if (!SHA256.test(input.sha256)) {
    return deny("INVALID_SHA256", "A lowercase or uppercase SHA-256 digest is required.");
  }
  return { allowed: true };
}

export function requiredQuarantineUploadHeaders(input: {
  kmsKeyId: string;
  mimeType: AllowedDocumentMimeType;
  sha256: string;
}) {
  if (!input.kmsKeyId.trim()) throw new Error("A customer-managed KMS key identifier is required.");
  if (!SHA256.test(input.sha256)) throw new Error("A valid SHA-256 digest is required.");
  return {
    "Content-Type": input.mimeType,
    "x-amz-checksum-sha256": input.sha256,
    "x-amz-server-side-encryption": "aws:kms",
    "x-amz-server-side-encryption-aws-kms-key-id": input.kmsKeyId,
  } as const;
}

export function decideSignedDownload(input: {
  actorAuthorized: boolean;
  nowUtc: string;
  record: DocumentSecurityRecord;
}): DocumentSecurityDecision {
  if (!input.actorAuthorized) return deny("FORBIDDEN", "The actor is not authorized for this evidence.");
  if (!input.record.versionId) return deny("VERSION_REQUIRED", "Access must target an immutable S3 version.");
  if (input.record.encryption !== "aws:kms") return deny("ENCRYPTION_REQUIRED", "SSE-KMS is required.");
  if (input.record.lifecycle !== "RELEASED") return deny("NOT_RELEASED", "Only released evidence may be downloaded.");
  if (input.record.malwareDisposition !== "CLEAN") {
    return deny("MALWARE_CLEARANCE_REQUIRED", "A clean malware result is required.");
  }
  if (!SHA256.test(input.record.sha256)) return deny("HASH_REQUIRED", "A SHA-256 digest is required.");
  if (!isValidUtc(input.nowUtc) || !isValidUtc(input.record.retentionUntilUtc)) {
    return deny("INVALID_RETENTION_METADATA", "Valid UTC retention metadata is required.");
  }
  return { allowed: true };
}

export function decideEvidenceDeletion(input: {
  nowUtc: string;
  record: DocumentSecurityRecord;
}): DocumentSecurityDecision {
  if (input.record.legalHold) return deny("LEGAL_HOLD", "Evidence under legal hold cannot be deleted.");
  const now = Date.parse(input.nowUtc);
  const retention = Date.parse(input.record.retentionUntilUtc);
  if (!Number.isFinite(now) || !Number.isFinite(retention)) {
    return deny("INVALID_RETENTION_METADATA", "Valid UTC retention metadata is required.");
  }
  if (now < retention) return deny("RETENTION_ACTIVE", "The retention period has not expired.");
  return { allowed: true };
}

export function recoveryVerificationRequired(input: {
  checksumMatches: boolean;
  restoredVersionId: string | null;
  sourceVersionId: string | null;
}): DocumentSecurityDecision {
  if (!input.restoredVersionId || !input.sourceVersionId) {
    return deny("VERSION_REQUIRED", "Recovery evidence requires source and restored version identifiers.");
  }
  if (!input.checksumMatches) return deny("CHECKSUM_MISMATCH", "The restored object digest does not match.");
  return { allowed: true };
}

function deny(code: string, reason: string): DocumentSecurityDecision {
  return { allowed: false, code, reason };
}

function isValidUtc(value: string) {
  return value.endsWith("Z") && Number.isFinite(Date.parse(value));
}
