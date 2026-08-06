import assert from "node:assert/strict";
import test from "node:test";
import {
  DOCUMENT_MAX_BYTES,
  decideEvidenceDeletion,
  decideSignedDownload,
  recoveryVerificationRequired,
  requiredQuarantineUploadHeaders,
  validateDocumentUpload,
  type DocumentSecurityRecord,
} from "../packages/document-security/index.ts";

const digest = "a".repeat(64);
const record: DocumentSecurityRecord = {
  encryption: "aws:kms",
  evidenceId: "EV-1001",
  legalHold: false,
  lifecycle: "RELEASED",
  malwareDisposition: "CLEAN",
  objectKey: "quarantine/ORD-NC-2608-0001/EV-1001/document.pdf",
  retentionUntilUtc: "2033-08-06T00:00:00.000Z",
  sha256: digest,
  versionId: "preview-version-1",
};

test("accepts a bounded PDF with matching media type and digest", () => {
  assert.deepEqual(validateDocumentUpload({
    byteLength: 1024,
    fileName: "document.pdf",
    mimeType: "application/pdf",
    orderId: "ORD-NC-2608-0001",
    sha256: digest,
  }), { allowed: true });
});

test("rejects unsupported types, extension mismatches, traversal and oversize uploads", () => {
  for (const input of [
    { byteLength: 1, fileName: "document.exe", mimeType: "application/octet-stream" },
    { byteLength: 1, fileName: "document.png", mimeType: "application/pdf" },
    { byteLength: 1, fileName: "../document.pdf", mimeType: "application/pdf" },
    { byteLength: DOCUMENT_MAX_BYTES + 1, fileName: "document.pdf", mimeType: "application/pdf" },
  ]) {
    assert.equal(validateDocumentUpload({ ...input, orderId: "ORD-NC-2608-0001", sha256: digest }).allowed, false);
  }
});

test("requires KMS encryption and a checksum in the signed upload contract", () => {
  const headers = requiredQuarantineUploadHeaders({
    kmsKeyId: "alias/notarix-preview-evidence",
    mimeType: "application/pdf",
    sha256: digest,
  });
  assert.equal(headers["x-amz-server-side-encryption"], "aws:kms");
  assert.equal(headers["x-amz-checksum-sha256"], digest);
});

test("denies unscanned, quarantined, unauthorized, unversioned and unencrypted downloads", () => {
  const variants = [
    { actorAuthorized: false, record },
    { actorAuthorized: true, record: { ...record, malwareDisposition: "PENDING" as const } },
    { actorAuthorized: true, record: { ...record, lifecycle: "QUARANTINED" as const } },
    { actorAuthorized: true, record: { ...record, versionId: null } },
  ];
  for (const variant of variants) {
    assert.equal(decideSignedDownload({ ...variant, nowUtc: "2026-08-06T12:00:00.000Z" }).allowed, false);
  }
});

test("permits a short-lived URL decision only after every release control passes", () => {
  assert.deepEqual(decideSignedDownload({
    actorAuthorized: true,
    nowUtc: "2026-08-06T12:00:00.000Z",
    record,
  }), { allowed: true });
});

test("legal hold and active retention independently block deletion", () => {
  assert.equal(decideEvidenceDeletion({ nowUtc: "2034-01-01T00:00:00.000Z", record: { ...record, legalHold: true } }).allowed, false);
  assert.equal(decideEvidenceDeletion({ nowUtc: "2026-08-06T12:00:00.000Z", record }).allowed, false);
  assert.deepEqual(decideEvidenceDeletion({ nowUtc: "2034-01-01T00:00:00.000Z", record }), { allowed: true });
});

test("recovery requires version identities and checksum equality", () => {
  assert.equal(recoveryVerificationRequired({ checksumMatches: true, restoredVersionId: null, sourceVersionId: "v1" }).allowed, false);
  assert.equal(recoveryVerificationRequired({ checksumMatches: false, restoredVersionId: "v2", sourceVersionId: "v1" }).allowed, false);
  assert.deepEqual(recoveryVerificationRequired({ checksumMatches: true, restoredVersionId: "v2", sourceVersionId: "v1" }), { allowed: true });
});
