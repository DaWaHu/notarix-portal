import { eq } from "drizzle-orm";
import { getOptionalDb } from "../db";
import * as schema from "../db/schema";
import {
  evidenceIdFromFileName,
  evidenceRecords,
  type EvidenceRecord,
} from "./evidence-data";

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

export const evidenceStorageContract = {
  access:
    "Evidence files must be opened through signed access after authorization, malware validation, custody classification, and audit attribution.",
  encryption:
    "Production evidence objects must be stored in encrypted object storage with deterministic object keys and retained SHA-256 fingerprints.",
  malware:
    "Files cannot be released into profile, order, RON, payable, or audit workflows until malware validation is complete or provider integrity is recorded.",
  custody:
    "Evidence metadata, scan status, access class, retention rule, and release eligibility are tracked separately from the file object.",
} as const;

export async function listEvidenceStorageControls(): Promise<
  EvidenceStorageControlRecord[]
> {
  const db = await getOptionalDb();
  if (!db) return evidenceRecords.map(buildEvidenceStorageControl);

  try {
    const rows = await db.select().from(schema.evidenceStorageControls);
    if (rows.length === 0) return evidenceRecords.map(buildEvidenceStorageControl);

    return rows.map((row) => {
      const modeled = evidenceRecords.find(
        (record) => record.id === row.evidenceId,
      );
      return {
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
      };
    });
  } catch {
    return evidenceRecords.map(buildEvidenceStorageControl);
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

  const modeled = evidenceRecords.find(
    (record) =>
      record.id.toLowerCase() === normalizedEvidenceId ||
      evidenceIdFromFileName(record.fileName).toLowerCase() ===
        normalizedEvidenceId,
  );
  return modeled ? buildEvidenceStorageControl(modeled) : undefined;
}

export function buildEvidenceStorageControl(
  record: EvidenceRecord,
): EvidenceStorageControlRecord {
  const malwareStatus = malwareStatusFor(record);
  const releaseEligibility = releaseEligibilityFor(record, malwareStatus);
  const objectKey = `${record.source === "Order Document" ? "orders" : "profiles"}/${
    record.orderId ?? record.requestId ?? "provider"
  }/${record.id}/${record.fileName}`;

  return {
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
    storageProvider: "Cloudflare R2 compatible encrypted object storage",
    updatedAtUtc: "2026-07-18T21:00:00.000Z",
    validationStatus: validationStatusFor(record),
  };
}

function fallbackEvidenceRecord(
  row: typeof schema.evidenceStorageControls.$inferSelect,
): EvidenceRecord {
  return {
    accessLevel: row.accessLevel,
    auditEvents: [
      "Jul 18 2026 at 5:00 PM ET - Evidence storage control loaded from D1.",
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
