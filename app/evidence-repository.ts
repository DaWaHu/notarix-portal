import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getOptionalDb } from "../db";
import * as schema from "../db/schema";
import {
  evidenceIdFromFileName,
  evidenceRecords,
  type EvidenceRecord,
} from "./evidence-data";
import {
  createSignedObjectAccessUrl,
  createSignedObjectUploadUrl,
} from "./object-storage-config";

export type EvidenceReleaseEligibility =
  | "Release Eligible"
  | "Restricted Hold"
  | "Storage Binding Required"
  | "Malware Validation Required"
  | "Quarantine";

export type EvidenceStorageControlRecord = EvidenceRecord & {
  accessUrlStatus: string;
  bucketName: string;
  contentHashStatus: string;
  custodyLedgerStatus: string;
  encryptionStatus: string;
  malwareProvider: string;
  malwareStatus: string;
  objectKey: string;
  providerReceipt: string;
  releaseBlockedReason: string;
  releaseEligibility: EvidenceReleaseEligibility;
  storageProvider: string;
  validationStatus: string;
  updatedAtUtc: string;
};

export type EvidenceAccessReceipt = {
  accessUrlExpiresAtUtc: string | null;
  actor: string;
  actorRole: string;
  blockedReason?: string;
  createdAtUtc: string;
  evidenceId: string;
  id: string;
  outcome: "Issued" | "Blocked";
  reason: string;
  signedUrl?: string;
};

export type EvidenceMalwareScanUpdate = {
  evidenceId: string;
  malwareStatus: string;
  provider: string;
  providerReceipt: string;
  validationStatus: string;
};

export type EvidenceUploadCompletionUpdate = {
  evidenceId: string;
  fileSize?: string;
  objectKey?: string;
  provider?: string;
  providerReceipt?: string;
  sha256?: string;
};

export type EvidenceUploadIntakeInput = {
  accessLevel?: string;
  actor: string;
  actorRole: string;
  category?: string;
  custody?: string;
  fileName: string;
  fileType?: EvidenceRecord["fileType"];
  orderId?: string;
  requestId?: string;
  section?: string;
  sha256?: string;
  size?: string;
  source?: EvidenceRecord["source"];
  title?: string;
};

export type EvidenceUploadIntakeReceipt = {
  accessLevel: string;
  actor: string;
  actorRole: string;
  bucketName: string;
  custody: string;
  evidenceId: string;
  expiresAtUtc: string;
  feedbackUrl: string;
  objectKey: string;
  provider: string;
  releaseEligibility: EvidenceReleaseEligibility;
  signedUploadUrl: string;
  status: string;
};

export const evidenceStorageContract = {
  access:
    "Evidence files must be opened through signed access after authorization, malware validation, custody classification, and audit attribution.",
  encryption:
    "Production evidence objects must be stored in encrypted object storage with deterministic object keys and retained SHA-256 fingerprints.",
  malware:
    "Files cannot be released into profile, order, RON, payable, or audit workflows until malware validation is complete or provider integrity is recorded.",
  custody:
    "Evidence metadata, scan status, access class, retention rule, and release eligibility are tracked separately from the file object.",
  receipts:
    "Signed access decisions and malware scan callbacks create retained evidence receipts for audit review.",
} as const;

type EvidenceStorageOverride = Partial<
  Pick<
    EvidenceStorageControlRecord,
    | "accessUrlStatus"
    | "contentHashStatus"
    | "encryptionStatus"
    | "malwareProvider"
    | "malwareStatus"
    | "objectKey"
    | "providerReceipt"
    | "releaseBlockedReason"
    | "releaseEligibility"
    | "sha256"
    | "size"
    | "storageStatus"
    | "updatedAtUtc"
    | "validationStatus"
  >
>;

const globalEvidenceStore = globalThis as typeof globalThis & {
  __notarixEvidenceAccessReceipts?: EvidenceAccessReceipt[];
  __notarixEvidenceUploadRecords?: EvidenceRecord[];
  __notarixEvidenceStorageOverrides?: Record<string, EvidenceStorageOverride>;
  __notarixEvidenceMalwareEvents?: EvidenceMalwareScanUpdate[];
};

export async function listEvidenceStorageControls(): Promise<
  EvidenceStorageControlRecord[]
> {
  const db = await getOptionalDb();
  const modeledRecords = [...evidenceRecords, ...getLocalEvidenceUploadRecords()];
  if (!db) return modeledRecords.map(buildEvidenceStorageControl);

  try {
    const rows = await db.select().from(schema.evidenceStorageControls);
    if (rows.length === 0) return modeledRecords.map(buildEvidenceStorageControl);

    const databaseRecords = rows.map((row) => {
      const modeled = modeledRecords.find(
        (record) => record.id === row.evidenceId,
      );
      return applyEvidenceOverride({
        ...(modeled ?? fallbackEvidenceRecord(row)),
        accessLevel: row.accessLevel,
        accessUrlStatus: accessUrlStatusFor(row.releaseEligibility),
        bucketName: row.bucketName,
        category: row.category,
        contentHashStatus: hashStatusFor(row.sha256),
        custody: row.custody,
        custodyLedgerStatus: "Custody ledger ready for append-only audit",
        encryptionStatus: row.encryptionStatus,
        fileName: row.fileName,
        fileType: row.fileType as EvidenceRecord["fileType"],
        lastAccessed: row.lastAccessed,
        malwareProvider: row.malwareProvider,
        malwareStatus: row.malwareStatus,
        objectKey: row.objectKey,
        orderId: row.orderId ?? undefined,
        providerReceipt: row.providerReceipt,
        releaseBlockedReason: row.releaseBlockedReason,
        releaseEligibility:
          row.releaseEligibility as EvidenceReleaseEligibility,
        requestId: row.requestId ?? undefined,
        retentionRule: row.retentionRule,
        scanStatus: row.malwareStatus,
        section: row.section,
        sha256: row.sha256,
        size: row.fileSize,
        source: row.source as EvidenceRecord["source"],
        storageProvider: row.storageProvider,
        storageStatus: row.encryptionStatus,
        updatedAtUtc: row.updatedAtUtc.toISOString(),
        validationStatus: row.validationStatus,
      });
    });
    const databaseIds = new Set(rows.map((row) => row.evidenceId));
    const localOnlyRecords = getLocalEvidenceUploadRecords()
      .filter((record) => !databaseIds.has(record.id))
      .map(buildEvidenceStorageControl);
    return [...databaseRecords, ...localOnlyRecords];
  } catch {
    return modeledRecords.map(buildEvidenceStorageControl);
  }
}

export async function getEvidenceStorageControl(
  evidenceId: string,
): Promise<EvidenceStorageControlRecord | undefined> {
  const normalizedEvidenceId = evidenceId.toLowerCase();
  const db = await getOptionalDb();
  if (db) {
    try {
      const [row] = await db
        .select()
        .from(schema.evidenceStorageControls)
        .where(eq(schema.evidenceStorageControls.evidenceId, evidenceId))
        .limit(1);
      if (row) {
        return (await listEvidenceStorageControls()).find(
          (record) => record.id === row.evidenceId,
        );
      }
    } catch {
      // Fall back to modeled records below.
    }
  }

  const modeled = [...evidenceRecords, ...getLocalEvidenceUploadRecords()].find(
    (record) =>
      record.id.toLowerCase() === normalizedEvidenceId ||
      evidenceIdFromFileName(record.fileName).toLowerCase() ===
        normalizedEvidenceId,
  );
  return modeled ? buildEvidenceStorageControl(modeled) : undefined;
}

export async function createEvidenceUploadIntake(
  input: EvidenceUploadIntakeInput,
): Promise<EvidenceUploadIntakeReceipt> {
  const evidenceId = nextEvidenceUploadId();
  const source = input.source ?? (input.orderId ? "Order Document" : "Profile Verification");
  const fileType = input.fileType ?? fileTypeFromName(input.fileName);
  const requestOrOrderId = input.orderId ?? input.requestId ?? "unassigned";
  const objectKey = `${source === "Order Document" ? "orders" : "profiles"}/${
    requestOrOrderId
  }/${evidenceId}/${sanitizeObjectFileName(input.fileName)}`;
  const record: EvidenceRecord = {
    accessLevel: input.accessLevel ?? "Restricted staff review",
    auditEvents: [
      `${staffDisplayTimestamp()} - Upload intake created by ${input.actor}.`,
      `${staffDisplayTimestamp()} - Signed upload URL issued for encrypted object storage.`,
    ],
    category: input.category ?? "Upload intake",
    custody: input.custody ?? "Upload pending",
    fileName: input.fileName,
    fileType,
    id: evidenceId,
    lastAccessed: "Not accessed",
    orderId: input.orderId,
    previewFields: [
      ["Upload status", "Signed upload URL issued"],
      ["Object key", objectKey],
      ["Release posture", "Blocked until upload validation and malware scan complete"],
    ],
    received: staffDisplayTimestamp(),
    requestId: input.requestId,
    retentionRule: "Retain according to source workflow after upload validation",
    scanStatus: "Malware validation required before release",
    section: input.section ?? "Upload Intake",
    sha256: input.sha256 ?? "SHA-256 pending upload validation",
    size: input.size ?? "Pending upload",
    source,
    storageStatus: "Encrypted object upload URL issued",
    title: input.title ?? titleFromFileName(input.fileName),
  };
  getLocalEvidenceUploadRecords().push(record);

  const storageControl = buildEvidenceStorageControl(record);
  const signedUpload = await createSignedObjectUploadUrl({
    bucketName: storageControl.bucketName,
    objectKey,
  });

  const db = await getOptionalDb();
  if (db) {
    await db.insert(schema.evidenceStorageControls).values({
      accessLevel: storageControl.accessLevel,
      bucketName: storageControl.bucketName,
      category: storageControl.category,
      custody: storageControl.custody,
      encryptionStatus: storageControl.encryptionStatus,
      evidenceId,
      fileName: storageControl.fileName,
      fileSize: storageControl.size,
      fileType: storageControl.fileType,
      lastAccessed: storageControl.lastAccessed,
      malwareProvider: storageControl.malwareProvider,
      malwareStatus: storageControl.malwareStatus,
      objectKey,
      orderId: storageControl.orderId,
      providerReceipt: storageControl.providerReceipt,
      releaseBlockedReason: storageControl.releaseBlockedReason,
      releaseEligibility: storageControl.releaseEligibility,
      requestId: storageControl.requestId,
      retentionRule: storageControl.retentionRule,
      section: storageControl.section,
      sha256: storageControl.sha256,
      source: storageControl.source,
      storageProvider: storageControl.storageProvider,
      updatedAtUtc: new Date(storageControl.updatedAtUtc),
      validationStatus: storageControl.validationStatus,
    });
  }

  return {
    accessLevel: storageControl.accessLevel,
    actor: input.actor,
    actorRole: input.actorRole,
    bucketName: storageControl.bucketName,
    custody: storageControl.custody,
    evidenceId,
    expiresAtUtc: signedUpload.expiresAtUtc,
    feedbackUrl: `/staff/evidence-intake?upload=issued&evidenceId=${encodeURIComponent(
      evidenceId,
    )}&fileName=${encodeURIComponent(record.fileName)}`,
    objectKey,
    provider: signedUpload.provider,
    releaseEligibility: storageControl.releaseEligibility,
    signedUploadUrl: signedUpload.signedUrl,
    status: "Upload URL Issued",
  };
}

export function buildEvidenceStorageControl(
  record: EvidenceRecord,
): EvidenceStorageControlRecord {
  const malwareStatus = malwareStatusFor(record);
  const releaseEligibility = releaseEligibilityFor(record, malwareStatus);
  const objectKey = `${record.source === "Order Document" ? "orders" : "profiles"}/${
    record.orderId ?? record.requestId ?? "provider"
  }/${record.id}/${record.fileName}`;

  return applyEvidenceOverride({
    ...record,
    accessUrlStatus: accessUrlStatusFor(releaseEligibility),
    bucketName: "notarix-production-evidence",
    contentHashStatus: hashStatusFor(record.sha256),
    custodyLedgerStatus: "Custody ledger ready for append-only audit",
    encryptionStatus: "Encrypted object storage required",
    malwareProvider: malwareProviderFor(record),
    malwareStatus,
    objectKey,
    providerReceipt: providerReceiptFor(record),
    releaseBlockedReason: releaseBlockedReasonFor(record, releaseEligibility),
    releaseEligibility,
    storageProvider: "AWS S3-compatible encrypted object storage",
    updatedAtUtc: "2026-07-18T21:00:00.000Z",
    validationStatus: validationStatusFor(record),
  });
}

export async function requestEvidenceSignedAccess(input: {
  actor: string;
  actorRole: string;
  evidenceId: string;
  reason: string;
}): Promise<EvidenceAccessReceipt> {
  const evidence = await getEvidenceStorageControl(input.evidenceId);
  const createdAt = evidenceWorkflowTimestampUtc();
  const id = nextEvidenceReceiptId();

  if (!evidence || evidence.releaseEligibility !== "Release Eligible") {
    const receipt: EvidenceAccessReceipt = {
      accessUrlExpiresAtUtc: null,
      actor: input.actor,
      actorRole: input.actorRole,
      blockedReason:
        evidence?.releaseBlockedReason ??
        "Evidence record was not found or is unavailable for signed access.",
      createdAtUtc: createdAt,
      evidenceId: input.evidenceId,
      id,
      outcome: "Blocked",
      reason: input.reason,
    };
    await persistEvidenceAccessReceipt(receipt);
    return receipt;
  }

  const signedAccess = await createSignedObjectAccessUrl({
    bucketName: evidence.bucketName,
    objectKey: evidence.objectKey,
  });

  const receipt: EvidenceAccessReceipt = {
    accessUrlExpiresAtUtc: signedAccess.expiresAtUtc,
    actor: input.actor,
    actorRole: input.actorRole,
    createdAtUtc: createdAt,
    evidenceId: evidence.id,
    id,
    outcome: "Issued",
    reason: input.reason,
    signedUrl: signedAccess.signedUrl,
  };
  await persistEvidenceAccessReceipt(receipt);
  return receipt;
}

export async function listEvidenceAccessReceipts(): Promise<
  EvidenceAccessReceipt[]
> {
  const db = await getOptionalDb();
  if (!db) return getLocalEvidenceAccessReceipts();

  try {
    const rows = await db.select().from(schema.evidenceAccessReceipts);
    if (rows.length === 0) return getLocalEvidenceAccessReceipts();
    return rows.map((row) => ({
      accessUrlExpiresAtUtc: row.accessUrlExpiresAtUtc?.toISOString() ?? null,
      actor: row.actor,
      actorRole: row.actorRole,
      blockedReason: row.blockedReason ?? undefined,
      createdAtUtc: row.createdAtUtc.toISOString(),
      evidenceId: row.evidenceId,
      id: row.id,
      outcome: row.outcome,
      reason: row.reason,
      signedUrl: row.signedUrl ?? undefined,
    }));
  } catch {
    return getLocalEvidenceAccessReceipts();
  }
}

export async function recordEvidenceMalwareScanUpdate(
  input: EvidenceMalwareScanUpdate,
) {
  const evidence = await getEvidenceStorageControl(input.evidenceId);
  if (!evidence) {
    return {
      available: false,
      error: "Evidence record not found",
      evidenceId: input.evidenceId,
    };
  }

  const releaseEligibility = releaseEligibilityAfterProviderUpdate(
    evidence,
    input.malwareStatus,
  );
  const releaseBlockedReason =
    releaseEligibility === "Release Eligible"
      ? "No release block"
      : releaseBlockedReasonFor(evidence, releaseEligibility);
  const updatedAt = evidenceWorkflowTimestampUtc();
  const override: EvidenceStorageOverride = {
    accessUrlStatus: accessUrlStatusFor(releaseEligibility),
    encryptionStatus: "Encrypted object stored",
    malwareProvider: input.provider,
    malwareStatus: input.malwareStatus,
    providerReceipt: input.providerReceipt,
    releaseBlockedReason,
    releaseEligibility,
    storageStatus: "Encrypted object stored",
    updatedAtUtc: updatedAt,
    validationStatus: input.validationStatus,
  };
  getEvidenceOverrides()[input.evidenceId] = override;
  getLocalMalwareEvents().push(input);

  const db = await getOptionalDb();
  if (db) {
    const timestamp = new Date(updatedAt);
    await db
      .update(schema.evidenceStorageControls)
      .set({
        encryptionStatus: override.encryptionStatus,
        malwareProvider: override.malwareProvider,
        malwareStatus: override.malwareStatus,
        providerReceipt: override.providerReceipt,
        releaseBlockedReason: override.releaseBlockedReason,
        releaseEligibility: override.releaseEligibility,
        updatedAtUtc: timestamp,
        validationStatus: override.validationStatus,
      })
      .where(eq(schema.evidenceStorageControls.evidenceId, input.evidenceId));
    await db.insert(schema.evidenceMalwareScanEvents).values({
      callbackReceivedAtUtc: timestamp,
      evidenceId: input.evidenceId,
      id: nextEvidenceMalwareEventId(),
      malwareStatus: input.malwareStatus,
      provider: input.provider,
      providerReceipt: input.providerReceipt,
      releaseEligibility,
      validationStatus: input.validationStatus,
    });
  }

  return {
    available: true,
    evidenceId: input.evidenceId,
    releaseBlockedReason,
    releaseEligibility,
    updatedAtUtc: updatedAt,
  };
}

export async function recordEvidenceUploadCompletion(
  input: EvidenceUploadCompletionUpdate,
) {
  const evidence = await getEvidenceStorageControl(input.evidenceId);
  if (!evidence) {
    return {
      available: false,
      error: "Evidence record not found",
      evidenceId: input.evidenceId,
    };
  }

  const updatedAt = evidenceWorkflowTimestampUtc();
  const sha256 = input.sha256 ?? evidence.sha256;
  const releaseEligibility: EvidenceReleaseEligibility = "Malware Validation Required";
  const override: EvidenceStorageOverride = {
    accessUrlStatus: accessUrlStatusFor(releaseEligibility),
    contentHashStatus: hashStatusFor(sha256),
    encryptionStatus: "Encrypted object stored",
    malwareProvider:
      input.provider ?? "Production malware scanning provider pending callback",
    malwareStatus: "Malware validation required before release",
    objectKey: input.objectKey ?? evidence.objectKey,
    providerReceipt: input.providerReceipt ?? `UPLOAD-${input.evidenceId}`,
    releaseBlockedReason: releaseBlockedReasonFor(evidence, releaseEligibility),
    releaseEligibility,
    sha256,
    size: input.fileSize ?? evidence.size,
    storageStatus: "Encrypted object stored",
    updatedAtUtc: updatedAt,
    validationStatus: "Upload received; malware validation pending",
  };
  getEvidenceOverrides()[input.evidenceId] = override;

  const db = await getOptionalDb();
  if (db) {
    await db
      .update(schema.evidenceStorageControls)
      .set({
        encryptionStatus: override.encryptionStatus,
        malwareProvider: override.malwareProvider,
        malwareStatus: override.malwareStatus,
        objectKey: override.objectKey,
        providerReceipt: override.providerReceipt,
        releaseBlockedReason: override.releaseBlockedReason,
        releaseEligibility: override.releaseEligibility,
        sha256: override.sha256,
        fileSize: override.size,
        updatedAtUtc: new Date(updatedAt),
        validationStatus: override.validationStatus,
      })
      .where(eq(schema.evidenceStorageControls.evidenceId, input.evidenceId));
  }

  return {
    available: true,
    evidenceId: input.evidenceId,
    feedbackUrl: `/staff/evidence-intake?upload=completed&evidenceId=${encodeURIComponent(
      input.evidenceId,
    )}`,
    releaseBlockedReason: override.releaseBlockedReason,
    releaseEligibility,
    updatedAtUtc: updatedAt,
  };
}

function fallbackEvidenceRecord(
  row: typeof schema.evidenceStorageControls.$inferSelect,
): EvidenceRecord {
  return {
    accessLevel: row.accessLevel,
    auditEvents: [
      "Jul 18 2026 at 5:00 PM ET - Evidence storage control loaded from Postgres.",
    ],
    category: row.category,
    custody: row.custody,
    fileName: row.fileName,
    fileType: row.fileType as EvidenceRecord["fileType"],
    id: row.evidenceId,
    lastAccessed: row.lastAccessed,
    orderId: row.orderId ?? undefined,
    previewFields: [
      ["Storage provider", row.storageProvider],
      ["Object key", row.objectKey],
      ["Release eligibility", row.releaseEligibility],
    ],
    received: "Jul 18 2026 at 5:00 PM ET",
    requestId: row.requestId ?? undefined,
    retentionRule: row.retentionRule,
    scanStatus: row.malwareStatus,
    section: row.section,
    sha256: row.sha256,
    size: row.fileSize,
    source: row.source as EvidenceRecord["source"],
    storageStatus: row.encryptionStatus,
    title: row.category,
  };
}

function malwareStatusFor(record: EvidenceRecord): string {
  if (record.scanStatus.toLowerCase().includes("complete")) {
    return "Malware validation complete";
  }
  if (record.scanStatus.toLowerCase().includes("integrity")) {
    return "Provider integrity accepted";
  }
  if (record.scanStatus.toLowerCase().includes("restricted")) {
    return "Malware validation required before release";
  }
  return record.scanStatus;
}

function releaseEligibilityFor(
  record: EvidenceRecord,
  malwareStatus: string,
): EvidenceReleaseEligibility {
  if (record.storageStatus.toLowerCase().includes("upload url issued")) {
    return "Storage Binding Required";
  }
  if (malwareStatus.toLowerCase().includes("required")) return "Quarantine";
  if (record.storageStatus.toLowerCase().includes("pending")) {
    return "Storage Binding Required";
  }
  if (record.accessLevel.toLowerCase().includes("restricted")) {
    return "Restricted Hold";
  }
  if (!malwareStatus.toLowerCase().includes("complete")) {
    return "Malware Validation Required";
  }
  return "Release Eligible";
}

function releaseBlockedReasonFor(
  record: EvidenceRecord,
  releaseEligibility: EvidenceReleaseEligibility,
): string {
  if (releaseEligibility === "Release Eligible") return "No release block";
  if (releaseEligibility === "Storage Binding Required") {
    return "Encrypted object storage binding is required before production release.";
  }
  if (releaseEligibility === "Restricted Hold") {
    return `${record.accessLevel} requires elevated access review before release.`;
  }
  if (releaseEligibility === "Quarantine") {
    return "Malware validation or provider integrity must be completed before release.";
  }
  return "Malware validation must complete before release.";
}

function validationStatusFor(record: EvidenceRecord): string {
  const allowedType = ["PDF", "JSON", "HTML", "CSV", "URL"].includes(
    record.fileType,
  );
  return allowedType && record.sha256.length >= 64
    ? "File type and SHA-256 validated"
    : "Validation review required";
}

function malwareProviderFor(record: EvidenceRecord): string {
  if (record.source === "Provider Result") return "Approved identity provider";
  return "Production malware scanning provider pending connection";
}

function providerReceiptFor(record: EvidenceRecord): string {
  return `SCAN-${record.id}`;
}

function hashStatusFor(sha256: string): string {
  return sha256.length >= 64 ? "SHA-256 fingerprint recorded" : "SHA-256 required";
}

function accessUrlStatusFor(releaseEligibility: string): string {
  return releaseEligibility === "Release Eligible"
    ? "Signed access URL may be issued after authorization"
    : "Signed access URL blocked until release controls clear";
}

async function persistEvidenceAccessReceipt(receipt: EvidenceAccessReceipt) {
  getLocalEvidenceAccessReceipts().push(receipt);
  const db = await getOptionalDb();
  if (!db) return;

  await db.insert(schema.evidenceAccessReceipts).values({
    accessUrlExpiresAtUtc: receipt.accessUrlExpiresAtUtc
      ? new Date(receipt.accessUrlExpiresAtUtc)
      : null,
    actor: receipt.actor,
    actorRole: receipt.actorRole,
    blockedReason: receipt.blockedReason,
    createdAtUtc: new Date(receipt.createdAtUtc),
    evidenceId: receipt.evidenceId,
    id: receipt.id,
    outcome: receipt.outcome,
    reason: receipt.reason,
    signedUrl: receipt.signedUrl,
  });
}

function releaseEligibilityAfterProviderUpdate(
  evidence: EvidenceStorageControlRecord,
  malwareStatus: string,
): EvidenceReleaseEligibility {
  if (malwareStatus.toLowerCase().includes("quarantine")) return "Quarantine";
  if (!malwareStatus.toLowerCase().includes("complete")) {
    return "Malware Validation Required";
  }
  if (evidence.accessLevel.toLowerCase().includes("restricted")) {
    return "Restricted Hold";
  }
  return "Release Eligible";
}

function applyEvidenceOverride(
  record: EvidenceStorageControlRecord,
): EvidenceStorageControlRecord {
  const override = getEvidenceOverrides()[record.id];
  if (!override) return record;
  return {
    ...record,
    ...override,
    accessUrlStatus:
      override.accessUrlStatus ??
      accessUrlStatusFor(override.releaseEligibility ?? record.releaseEligibility),
    scanStatus: override.malwareStatus ?? record.scanStatus,
    storageStatus: override.storageStatus ?? record.storageStatus,
  };
}

function getEvidenceOverrides() {
  globalEvidenceStore.__notarixEvidenceStorageOverrides ??= {};
  return globalEvidenceStore.__notarixEvidenceStorageOverrides;
}

function getLocalEvidenceAccessReceipts() {
  globalEvidenceStore.__notarixEvidenceAccessReceipts ??= [];
  return globalEvidenceStore.__notarixEvidenceAccessReceipts;
}

function getLocalEvidenceUploadRecords() {
  globalEvidenceStore.__notarixEvidenceUploadRecords ??= [];
  return globalEvidenceStore.__notarixEvidenceUploadRecords;
}

function getLocalMalwareEvents() {
  globalEvidenceStore.__notarixEvidenceMalwareEvents ??= [];
  return globalEvidenceStore.__notarixEvidenceMalwareEvents;
}

function nextEvidenceReceiptId(): string {
  return `EVR-2607-${String(getLocalEvidenceAccessReceipts().length + 1).padStart(4, "0")}`;
}

function nextEvidenceUploadId(): string {
  return `EVU-2607-${String(getLocalEvidenceUploadRecords().length + 1).padStart(4, "0")}`;
}

function nextEvidenceMalwareEventId(): string {
  return `EMS-2607-${randomUUID()}`;
}

function evidenceWorkflowTimestampUtc(): string {
  return "2026-07-18T21:00:00.000Z";
}

function staffDisplayTimestamp(): string {
  return "Jul 18 2026 at 5:00 PM ET";
}

function fileTypeFromName(fileName: string): EvidenceRecord["fileType"] {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "json") return "JSON";
  if (extension === "html" || extension === "htm") return "HTML";
  if (extension === "csv") return "CSV";
  if (extension === "url") return "URL";
  return "PDF";
}

function sanitizeObjectFileName(fileName: string): string {
  return fileName.trim().replace(/[^a-zA-Z0-9._-]+/g, "-");
}

function titleFromFileName(fileName: string): string {
  return sanitizeObjectFileName(fileName)
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
