import { getOptionalDb } from "../db";
import * as schema from "../db/schema";
import { evidenceRecords } from "./evidence-data";
import {
  accessControlRecords,
  auditReportRecords,
  credentialMonitorRecords,
  notificationRecords,
  orderCloseoutRecords,
  orderDeliveryReceiptRecords,
  orderLifecycleRecords,
  orderOperationRecords,
  appointmentConfirmationRecords,
  notaryCompletionReceiptRecords,
  paymentLedgerRecords,
  providerIntegrationRecords,
  retentionPolicyRecords,
  signerReadinessRecords,
  systemHealthRecords,
} from "./operations-data";
import {
  accessRequests,
  getProfileVerificationItems,
} from "./staff/requests/data";

type NotarixDb = NonNullable<Awaited<ReturnType<typeof getOptionalDb>>>;
type CommandTargetType =
  typeof schema.commandCenterTargets.$inferSelect.targetType;

const seedTimestamp = () => new Date("2026-07-18T21:00:00.000Z");
const normalizeIdPart = (value: string) =>
  value.toUpperCase().replaceAll("&", "AND").replaceAll("/", "-").replaceAll(" ", "-");

export const d1SeedReconciliationContract = {
  authority: "SuperAdmin",
  idempotency: "Every baseline seed operation uses deterministic IDs and upsert logic.",
  scope:
    "Profiles, profile verification items, profile evidence metadata, order operations, order lifecycle support records, and command-center targets.",
  sourceOfTruth:
    "Production D1 is the runtime source after seeding; local modeled records remain the preview fallback.",
} as const;

export async function reconcileBaselineD1Seed() {
  const db = await getOptionalDb();
  if (!db) {
    return {
      available: false,
      contract: d1SeedReconciliationContract,
      reason: "Cloudflare D1 binding `DB` is unavailable in this runtime.",
      summary: buildBaselineSeedSummary(),
    };
  }

  const summary = await seedBaselineRecords(db);
  return {
    available: true,
    contract: d1SeedReconciliationContract,
    summary,
  };
}

export function buildBaselineSeedSummary() {
  return {
    accessRequests: accessRequests.length,
    commandCenterTargets: buildCommandCenterTargets().length,
    evidenceFiles: buildProfileEvidenceFiles().length,
    notaryCompletionReceipts: notaryCompletionReceiptRecords.length,
    orderAppointments: appointmentConfirmationRecords.length,
    orderCloseoutControls: orderCloseoutRecords.length,
    orderDeliveryReceipts: orderDeliveryReceiptRecords.length,
    orderLifecycleStages: orderLifecycleRecords.length,
    orderOperationalRecords: orderOperationRecords.length,
    orderSignerReadiness: signerReadinessRecords.length,
    profileVerificationItems: accessRequests.reduce(
      (count, request) => count + getProfileVerificationItems(request).length,
      0,
    ),
  };
}

async function seedBaselineRecords(db: NotarixDb) {
  const timestamp = seedTimestamp();
  let accessRequestCount = 0;
  let profileVerificationCount = 0;
  let evidenceFileCount = 0;
  let commandTargetCount = 0;
  let orderRecordCount = 0;
  let orderLifecycleCount = 0;
  let signerReadinessCount = 0;
  let appointmentCount = 0;
  let closeoutControlCount = 0;
  let deliveryReceiptCount = 0;
  let notaryCompletionReceiptCount = 0;

  for (const request of accessRequests) {
    await db
      .insert(schema.accessRequests)
      .values({
        approvedProfileNumber: request.approvedProfileNumber,
        email: request.email,
        id: request.id,
        jurisdiction: request.jurisdiction,
        name: request.name,
        organization: request.organization,
        phone: request.phone,
        receivedAtUtc: timestamp,
        reviewer: request.reviewer,
        risk: request.risk,
        service: request.service,
        status: request.status,
        type: request.type,
        updatedAtUtc: timestamp,
      })
      .onConflictDoUpdate({
        set: {
          approvedProfileNumber: request.approvedProfileNumber,
          email: request.email,
          jurisdiction: request.jurisdiction,
          name: request.name,
          organization: request.organization,
          phone: request.phone,
          reviewer: request.reviewer,
          risk: request.risk,
          service: request.service,
          status: request.status,
          type: request.type,
          updatedAtUtc: timestamp,
        },
        target: schema.accessRequests.id,
      });
    accessRequestCount += 1;

    for (const item of getProfileVerificationItems(request)) {
      await db
        .insert(schema.profileVerificationItems)
        .values({
          evidence: item.evidence,
          id: `${request.id}-${normalizeIdPart(item.section)}`,
          requestId: request.id,
          requirement: item.requirement,
          reviewerNote: item.reviewerNote,
          section: item.section,
          status: item.status,
          updatedAtUtc: timestamp,
        })
        .onConflictDoUpdate({
          set: {
            evidence: item.evidence,
            requirement: item.requirement,
            reviewerNote: item.reviewerNote,
            status: item.status,
            updatedAtUtc: timestamp,
          },
          target: schema.profileVerificationItems.id,
        });
      profileVerificationCount += 1;
    }
  }

  for (const evidence of buildProfileEvidenceFiles()) {
    await db
      .insert(schema.evidenceFiles)
      .values({
        custody: evidence.custody,
        fileName: evidence.fileName,
        id: evidence.id,
        requestId: evidence.requestId,
        scanStatus: evidence.scanStatus,
        section: evidence.section,
        storageKey: evidence.storageKey,
        uploadedAtUtc: timestamp,
      })
      .onConflictDoUpdate({
        set: {
          custody: evidence.custody,
          fileName: evidence.fileName,
          scanStatus: evidence.scanStatus,
          section: evidence.section,
          storageKey: evidence.storageKey,
          uploadedAtUtc: timestamp,
        },
        target: schema.evidenceFiles.id,
      });
    evidenceFileCount += 1;
  }

  for (const order of orderOperationRecords) {
    await db
      .insert(schema.orderOperationalRecords)
      .values({
        ...order,
        createdAtUtc: timestamp,
        updatedAtUtc: timestamp,
      })
      .onConflictDoUpdate({
        set: {
          assignmentStatus: order.assignmentStatus,
          billingStatus: order.billingStatus,
          client: order.client,
          clientContact: order.clientContact,
          clientEmail: order.clientEmail,
          clientProfile: order.clientProfile,
          communicationStatus: order.communicationStatus,
          documentCount: order.documentCount,
          documentStatus: order.documentStatus,
          jurisdiction: order.jurisdiction,
          location: order.location,
          nextAction: order.nextAction,
          notary: order.notary,
          notaryProfile: order.notaryProfile,
          orderStatus: order.orderStatus,
          owner: order.owner,
          payableStatus: order.payableStatus,
          risk: order.risk,
          ronStatus: order.ronStatus,
          service: order.service,
          updatedAtUtc: timestamp,
          validationStatus: order.validationStatus,
        },
        target: schema.orderOperationalRecords.id,
      });
    orderRecordCount += 1;
  }

  for (const stage of orderLifecycleRecords) {
    await db
      .insert(schema.orderLifecycleStages)
      .values({
        ...stage,
        id: `${stage.orderId}-${normalizeIdPart(stage.stage)}`,
        updatedAtUtc: timestamp,
      })
      .onConflictDoUpdate({
        set: {
          authority: stage.authority,
          evidence: stage.evidence,
          nextAction: stage.nextAction,
          owner: stage.owner,
          status: stage.status,
          timestamp: stage.timestamp,
          updatedAtUtc: timestamp,
        },
        target: schema.orderLifecycleStages.id,
      });
    orderLifecycleCount += 1;
  }

  for (const signer of signerReadinessRecords) {
    await db
      .insert(schema.orderSignerReadiness)
      .values({ ...signer, updatedAtUtc: timestamp })
      .onConflictDoUpdate({
        set: {
          identityMethod: signer.identityMethod,
          identityStatus: signer.identityStatus,
          locationReadiness: signer.locationReadiness,
          nextAction: signer.nextAction,
          risk: signer.risk,
          signerName: signer.signerName,
          signerRole: signer.signerRole,
          specialInstructions: signer.specialInstructions,
          staffOwner: signer.staffOwner,
          updatedAtUtc: timestamp,
          witnessRequirement: signer.witnessRequirement,
        },
        target: schema.orderSignerReadiness.id,
      });
    signerReadinessCount += 1;
  }

  for (const appointment of appointmentConfirmationRecords) {
    await db
      .insert(schema.orderAppointments)
      .values({ ...appointment, updatedAtUtc: timestamp })
      .onConflictDoUpdate({
        set: {
          appointment: appointment.appointment,
          authority: appointment.authority,
          client: appointment.client,
          documentReadiness: appointment.documentReadiness,
          location: appointment.location,
          nextAction: appointment.nextAction,
          notary: appointment.notary,
          notificationStatus: appointment.notificationStatus,
          serviceType: appointment.serviceType,
          signerReadiness: appointment.signerReadiness,
          staffOwner: appointment.staffOwner,
          status: appointment.status,
          updatedAtUtc: timestamp,
        },
        target: schema.orderAppointments.id,
      });
    appointmentCount += 1;
  }

  for (const closeout of orderCloseoutRecords) {
    await db
      .insert(schema.orderCloseoutControls)
      .values({ ...closeout, updatedAtUtc: timestamp })
      .onConflictDoUpdate({
        set: {
          authority: closeout.authority,
          control: closeout.control,
          evidence: closeout.evidence,
          lastUpdated: closeout.lastUpdated,
          nextAction: closeout.nextAction,
          owner: closeout.owner,
          status: closeout.status,
          updatedAtUtc: timestamp,
        },
        target: schema.orderCloseoutControls.id,
      });
    closeoutControlCount += 1;
  }

  for (const receipt of orderDeliveryReceiptRecords) {
    await db
      .insert(schema.orderDeliveryReceipts)
      .values({ ...receipt, updatedAtUtc: timestamp })
      .onConflictDoUpdate({
        set: {
          accessControl: receipt.accessControl,
          clientNextAction: receipt.clientNextAction,
          clientStatus: receipt.clientStatus,
          clientVisibleEvidence: receipt.clientVisibleEvidence,
          deliveredAt: receipt.deliveredAt,
          deliveredTo: receipt.deliveredTo,
          deliveryChannel: receipt.deliveryChannel,
          receiptArea: receipt.receiptArea,
          updatedAtUtc: timestamp,
        },
        target: schema.orderDeliveryReceipts.id,
      });
    deliveryReceiptCount += 1;
  }

  for (const receipt of notaryCompletionReceiptRecords) {
    await db
      .insert(schema.notaryCompletionReceipts)
      .values({ ...receipt, updatedAtUtc: timestamp })
      .onConflictDoUpdate({
        set: {
          evidence: receipt.evidence,
          notaryAction: receipt.notaryAction,
          payableImpact: receipt.payableImpact,
          receiptArea: receipt.receiptArea,
          staffReview: receipt.staffReview,
          status: receipt.status,
          updatedAtUtc: timestamp,
        },
        target: schema.notaryCompletionReceipts.id,
      });
    notaryCompletionReceiptCount += 1;
  }

  for (const target of buildCommandCenterTargets()) {
    await db
      .insert(schema.commandCenterTargets)
      .values({ ...target, updatedAtUtc: timestamp })
      .onConflictDoUpdate({
        set: {
          sourceHref: target.sourceHref,
          status: target.status,
          targetType: target.targetType,
          updatedAtUtc: timestamp,
        },
        target: schema.commandCenterTargets.id,
      });
    commandTargetCount += 1;
  }

  return {
    accessRequests: accessRequestCount,
    commandCenterTargets: commandTargetCount,
    evidenceFiles: evidenceFileCount,
    notaryCompletionReceipts: notaryCompletionReceiptCount,
    orderAppointments: appointmentCount,
    orderCloseoutControls: closeoutControlCount,
    orderDeliveryReceipts: deliveryReceiptCount,
    orderLifecycleStages: orderLifecycleCount,
    orderOperationalRecords: orderRecordCount,
    orderSignerReadiness: signerReadinessCount,
    profileVerificationItems: profileVerificationCount,
  };
}

function buildProfileEvidenceFiles() {
  return evidenceRecords
    .filter((evidence) => evidence.requestId)
    .map((evidence) => ({
      custody: evidence.custody,
      fileName: evidence.fileName,
      id: evidence.id,
      requestId: evidence.requestId ?? "",
      scanStatus: evidence.scanStatus,
      section: evidence.section,
      storageKey: `evidence/${evidence.requestId}/${evidence.fileName}`,
    }));
}

function buildCommandCenterTargets() {
  const targets: Array<{
    id: string;
    sourceHref: string;
    status: string;
    targetType: CommandTargetType;
  }> = [];

  targets.push(
    ...notificationRecords.map((record) => commandTarget(record.id, "Notification", record.status, "/notifications")),
    ...credentialMonitorRecords.map((record) => commandTarget(record.id, "Credential", record.status, "/credentials/expiration")),
    ...paymentLedgerRecords.map((record) => commandTarget(record.id, "Ledger", record.status, "/staff/financial-reports")),
    ...auditReportRecords.map((record) => commandTarget(record.id, "Audit", record.risk, "/staff/audit-reports")),
    ...evidenceRecords.map((record) => commandTarget(record.id, "Evidence", record.scanStatus, "/staff/document-validation")),
    ...retentionPolicyRecords.map((record) => commandTarget(record.id, "Retention", record.status, "/staff/retention")),
    ...systemHealthRecords.map((record) => commandTarget(record.id, "System", record.status, "/staff/system-health")),
    ...accessControlRecords.map((record) => commandTarget(record.id, "Access", record.sessionStatus, "/staff/access-control")),
    ...providerIntegrationRecords.map((record) => commandTarget(record.id, "Integration", record.status, "/staff/integrations")),
    ...orderOperationRecords.map((record) => commandTarget(record.id, "Order", record.orderStatus, "/staff/orders")),
  );

  return targets;
}

function commandTarget(
  id: string,
  targetType: CommandTargetType,
  status: string,
  sourceHref: string,
) {
  return { id, sourceHref, status, targetType };
}
