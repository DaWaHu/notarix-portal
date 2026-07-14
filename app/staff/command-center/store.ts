import {
  eq,
} from "drizzle-orm";
import {
  canUseCommandAuthority,
  commandAuthorityLabel,
  type CommandAuthority,
  type PortalActorRole,
} from "../../access-policy";
import {
  auditReportRecords,
  accessControlRecords,
  credentialMonitorRecords,
  notificationRecords,
  orderOperationRecords,
  paymentLedgerRecords,
  providerIntegrationRecords,
  retentionPolicyRecords,
  systemHealthRecords,
} from "../../operations-data";
import { getOptionalDb } from "../../../db";
import * as schema from "../../../db/schema";
import { persistOrderCommandTransition } from "../../order-repository";
import { evidenceRecords } from "../../evidence-data";

export type CommandActorRole = PortalActorRole;

export type CommandCenterAction =
  | "retry-failed-notification"
  | "record-phone-consent"
  | "suppress-notice"
  | "send-renewal-reminder"
  | "request-replacement-evidence"
  | "escalate-restriction"
  | "hold-payment-release"
  | "escalate-ledger-correction"
  | "export-ledger-report"
  | "export-audit-report"
  | "place-retention-hold"
  | "escalate-exception"
  | "release-validated-evidence"
  | "quarantine-failed-file"
  | "request-replacement-upload"
  | "escalate-restricted-document"
  | "place-record-retention-hold"
  | "release-retention-hold"
  | "mark-deletion-review-needed"
  | "escalate-retention-exception"
  | "verify-backup-recovery"
  | "open-recovery-drill"
  | "escalate-system-incident"
  | "mark-provider-degraded"
  | "require-mfa-passkey-reset"
  | "suspend-staff-session"
  | "open-access-review"
  | "escalate-privilege-exception"
  | "verify-provider-integration"
  | "mark-integration-degraded"
  | "open-provider-callback-review"
  | "escalate-provider-risk"
  | "assign-notary"
  | "hold-order"
  | "release-order-documents"
  | "escalate-order-issue"
  | "request-missing-documents"
  | "route-order-financial-review"
  | "confirm-notary-acceptance"
  | "confirm-order-appointment"
  | "record-completion-package"
  | "close-order"
  | "client-upload-order-documents"
  | "client-replace-order-documents"
  | "client-acknowledge-correction"
  | "notary-accept-assignment"
  | "notary-decline-assignment"
  | "notary-confirm-arrival"
  | "notary-upload-completion-package";

export type StoredCommandEvent = {
  id: string;
  action: CommandCenterAction;
  actor: string;
  role: CommandActorRole;
  targetId: string;
  targetType:
    | "Notification"
    | "Credential"
    | "Ledger"
    | "Audit"
    | "Evidence"
    | "Retention"
    | "System"
    | "Access"
    | "Integration"
    | "Order";
  previousStatus: string;
  nextStatus: string;
  auditEvent: string;
  timestamp: string;
};

export type StoredCommandReceipt = StoredCommandEvent & {
  allowed: boolean;
  authority: string;
  blockedReason?: string;
  consoleHref: string;
  outcome: "Completed" | "Blocked";
  nextRequiredAction: string;
  persistence: CommandCenterPersistenceRecord;
};

export type CommandCenterTargetRecord = {
  id: string;
  targetType: StoredCommandEvent["targetType"];
  status: string;
  sourceHref: string;
  updatedAtUtc: string;
};

export type CommandCenterEventRecord = {
  id: string;
  receiptId: string;
  action: CommandCenterAction;
  targetId: string;
  targetType: StoredCommandEvent["targetType"];
  actor: string;
  actorRole: CommandActorRole;
  authority: string;
  allowed: boolean;
  outcome: StoredCommandReceipt["outcome"];
  previousStatus: string;
  nextStatus: string;
  blockedReason?: string;
  auditEvent: string;
  createdAtUtc: string;
};

export type CommandCenterReceiptRecord = {
  id: string;
  eventId: string;
  targetId: string;
  action: CommandCenterAction;
  outcome: StoredCommandReceipt["outcome"];
  authority: string;
  consoleHref: string;
  nextRequiredAction: string;
  retainedForAudit: boolean;
  createdAtUtc: string;
};

export type CommandCenterPersistenceRecord = {
  target: CommandCenterTargetRecord;
  event: CommandCenterEventRecord;
  receipt: CommandCenterReceiptRecord;
};

type CommandCenterPersistenceResult = {
  persisted: boolean;
  reason?: string;
};

type CommandTargetState = {
  id: string;
  status: string;
  type: StoredCommandEvent["targetType"];
};

type CommandCenterStore = {
  events: StoredCommandEvent[];
  receipts: StoredCommandReceipt[];
  targets: Record<string, CommandTargetState>;
};

const globalStore = globalThis as typeof globalThis & {
  __notarixCommandCenterStore?: CommandCenterStore;
};

const commandDefinitions: Record<
  CommandCenterAction,
  {
    targetType: StoredCommandEvent["targetType"];
    defaultTargetId: string;
    authority: CommandAuthority;
    nextStatus: string;
    auditVerb: string;
  }
> = {
  "retry-failed-notification": {
    auditVerb: "retried failed notification delivery",
    authority: "AnyStaff",
    defaultTargetId: "NTF-2607-0005",
    nextStatus: "Retry Queued",
    targetType: "Notification",
  },
  "record-phone-consent": {
    auditVerb: "recorded phone or SMS communication consent",
    authority: "AnyStaff",
    defaultTargetId: "NTF-2607-0002",
    nextStatus: "Consent Recorded",
    targetType: "Notification",
  },
  "suppress-notice": {
    auditVerb: "suppressed notification delivery",
    authority: "AdminOrSuperAdmin",
    defaultTargetId: "NTF-2607-0005",
    nextStatus: "Suppressed",
    targetType: "Notification",
  },
  "send-renewal-reminder": {
    auditVerb: "queued credential renewal reminder",
    authority: "AnyStaff",
    defaultTargetId: "CRD-2607-0002",
    nextStatus: "Reminder Queued",
    targetType: "Credential",
  },
  "request-replacement-evidence": {
    auditVerb: "requested replacement credential evidence",
    authority: "AnyStaff",
    defaultTargetId: "CRD-2607-0002",
    nextStatus: "Replacement Requested",
    targetType: "Credential",
  },
  "escalate-restriction": {
    auditVerb: "escalated credential restriction",
    authority: "AnyStaff",
    defaultTargetId: "CRD-2607-0003",
    nextStatus: "Escalated",
    targetType: "Credential",
  },
  "hold-payment-release": {
    auditVerb: "placed payment release hold",
    authority: "AdminOrSuperAdmin",
    defaultTargetId: "LED-2607-0002",
    nextStatus: "Payment Hold Recorded",
    targetType: "Ledger",
  },
  "escalate-ledger-correction": {
    auditVerb: "escalated ledger correction",
    authority: "AdminOrSuperAdmin",
    defaultTargetId: "LED-2607-0004",
    nextStatus: "Escalated to Super Admin",
    targetType: "Ledger",
  },
  "export-ledger-report": {
    auditVerb: "exported financial ledger report",
    authority: "AdminOrSuperAdmin",
    defaultTargetId: "LED-2607-0001",
    nextStatus: "Export Logged",
    targetType: "Ledger",
  },
  "export-audit-report": {
    auditVerb: "exported restricted audit report",
    authority: "SuperAdmin",
    defaultTargetId: "AUD-2607-0001",
    nextStatus: "Export Logged",
    targetType: "Audit",
  },
  "place-retention-hold": {
    auditVerb: "placed restricted audit retention hold",
    authority: "SuperAdmin",
    defaultTargetId: "AUD-2607-0006",
    nextStatus: "Retention Hold",
    targetType: "Audit",
  },
  "escalate-exception": {
    auditVerb: "escalated restricted audit exception",
    authority: "SuperAdmin",
    defaultTargetId: "AUD-2607-0006",
    nextStatus: "Exception Escalated",
    targetType: "Audit",
  },
  "release-validated-evidence": {
    auditVerb: "released validated evidence for downstream workflow use",
    authority: "AdminOrSuperAdmin",
    defaultTargetId: "DOC-2607-0001",
    nextStatus: "Released",
    targetType: "Evidence",
  },
  "quarantine-failed-file": {
    auditVerb: "quarantined failed or restricted evidence file",
    authority: "AdminOrSuperAdmin",
    defaultTargetId: "DOC-2607-0002",
    nextStatus: "Quarantined",
    targetType: "Evidence",
  },
  "request-replacement-upload": {
    auditVerb: "requested replacement evidence upload",
    authority: "AnyStaff",
    defaultTargetId: "EV-W9-FORM",
    nextStatus: "Replacement Requested",
    targetType: "Evidence",
  },
  "escalate-restricted-document": {
    auditVerb: "escalated restricted evidence document",
    authority: "AnyStaff",
    defaultTargetId: "DOC-2607-0002",
    nextStatus: "Escalated",
    targetType: "Evidence",
  },
  "place-record-retention-hold": {
    auditVerb: "placed record retention hold",
    authority: "SuperAdmin",
    defaultTargetId: "RET-2607-0002",
    nextStatus: "Retention Hold",
    targetType: "Retention",
  },
  "release-retention-hold": {
    auditVerb: "released record retention hold",
    authority: "SuperAdmin",
    defaultTargetId: "RET-2607-0003",
    nextStatus: "Hold Released",
    targetType: "Retention",
  },
  "mark-deletion-review-needed": {
    auditVerb: "marked record for deletion eligibility review",
    authority: "AdminOrSuperAdmin",
    defaultTargetId: "RET-2607-0003",
    nextStatus: "Deletion Review Needed",
    targetType: "Retention",
  },
  "escalate-retention-exception": {
    auditVerb: "escalated retention policy exception",
    authority: "AnyStaff",
    defaultTargetId: "RET-2607-0004",
    nextStatus: "Exception Escalated",
    targetType: "Retention",
  },
  "verify-backup-recovery": {
    auditVerb: "verified backup and recovery posture",
    authority: "AdminOrSuperAdmin",
    defaultTargetId: "SYS-2607-0001",
    nextStatus: "Recovery Verified",
    targetType: "System",
  },
  "open-recovery-drill": {
    auditVerb: "opened recovery drill",
    authority: "AdminOrSuperAdmin",
    defaultTargetId: "SYS-2607-0001",
    nextStatus: "Recovery Drill Open",
    targetType: "System",
  },
  "escalate-system-incident": {
    auditVerb: "escalated system health incident",
    authority: "AnyStaff",
    defaultTargetId: "SYS-2607-0003",
    nextStatus: "Incident Escalated",
    targetType: "System",
  },
  "mark-provider-degraded": {
    auditVerb: "marked provider integration degraded",
    authority: "AdminOrSuperAdmin",
    defaultTargetId: "SYS-2607-0002",
    nextStatus: "Provider Degraded",
    targetType: "System",
  },
  "require-mfa-passkey-reset": {
    auditVerb: "required MFA and passkey reset",
    authority: "AdminOrSuperAdmin",
    defaultTargetId: "IAM-2607-0002",
    nextStatus: "MFA Reset Required",
    targetType: "Access",
  },
  "suspend-staff-session": {
    auditVerb: "suspended staff session",
    authority: "AdminOrSuperAdmin",
    defaultTargetId: "IAM-2607-0004",
    nextStatus: "Session Suspended",
    targetType: "Access",
  },
  "open-access-review": {
    auditVerb: "opened staff access review",
    authority: "AnyStaff",
    defaultTargetId: "IAM-2607-0002",
    nextStatus: "Access Review Open",
    targetType: "Access",
  },
  "escalate-privilege-exception": {
    auditVerb: "escalated privilege exception",
    authority: "AnyStaff",
    defaultTargetId: "IAM-2607-0004",
    nextStatus: "Privilege Exception Escalated",
    targetType: "Access",
  },
  "verify-provider-integration": {
    auditVerb: "verified provider integration readiness",
    authority: "AdminOrSuperAdmin",
    defaultTargetId: "INT-2607-0001",
    nextStatus: "Integration Verified",
    targetType: "Integration",
  },
  "mark-integration-degraded": {
    auditVerb: "marked provider integration degraded",
    authority: "AdminOrSuperAdmin",
    defaultTargetId: "INT-2607-0003",
    nextStatus: "Integration Degraded",
    targetType: "Integration",
  },
  "open-provider-callback-review": {
    auditVerb: "opened provider callback review",
    authority: "AnyStaff",
    defaultTargetId: "INT-2607-0002",
    nextStatus: "Callback Review Open",
    targetType: "Integration",
  },
  "escalate-provider-risk": {
    auditVerb: "escalated provider integration risk",
    authority: "AnyStaff",
    defaultTargetId: "INT-2607-0004",
    nextStatus: "Provider Risk Escalated",
    targetType: "Integration",
  },
  "assign-notary": {
    auditVerb: "queued notary assignment review",
    authority: "AdminOrSuperAdmin",
    defaultTargetId: "ORD-2607-0002",
    nextStatus: "Assignment Queued",
    targetType: "Order",
  },
  "hold-order": {
    auditVerb: "placed operational hold on order",
    authority: "AdminOrSuperAdmin",
    defaultTargetId: "ORD-2607-0002",
    nextStatus: "Operational Hold",
    targetType: "Order",
  },
  "release-order-documents": {
    auditVerb: "released validated order documents",
    authority: "AdminOrSuperAdmin",
    defaultTargetId: "ORD-2607-0001",
    nextStatus: "Documents Released",
    targetType: "Order",
  },
  "escalate-order-issue": {
    auditVerb: "escalated order operations issue",
    authority: "AnyStaff",
    defaultTargetId: "ORD-2607-0002",
    nextStatus: "Order Escalated",
    targetType: "Order",
  },
  "request-missing-documents": {
    auditVerb: "requested missing order documents",
    authority: "AnyStaff",
    defaultTargetId: "ORD-2607-0002",
    nextStatus: "Missing Documents Requested",
    targetType: "Order",
  },
  "route-order-financial-review": {
    auditVerb: "routed order to financial review",
    authority: "AdminOrSuperAdmin",
    defaultTargetId: "ORD-2607-0001",
    nextStatus: "Financial Review Routed",
    targetType: "Order",
  },
  "confirm-notary-acceptance": {
    auditVerb: "confirmed notary assignment acceptance",
    authority: "AdminOrSuperAdmin",
    defaultTargetId: "ORD-2607-0001",
    nextStatus: "Notary Accepted",
    targetType: "Order",
  },
  "confirm-order-appointment": {
    auditVerb: "confirmed order appointment",
    authority: "AnyStaff",
    defaultTargetId: "ORD-2607-0001",
    nextStatus: "Appointment Confirmed",
    targetType: "Order",
  },
  "record-completion-package": {
    auditVerb: "recorded order completion package",
    authority: "AdminOrSuperAdmin",
    defaultTargetId: "ORD-2607-0001",
    nextStatus: "Completion Package Received",
    targetType: "Order",
  },
  "close-order": {
    auditVerb: "closed order case file",
    authority: "AdminOrSuperAdmin",
    defaultTargetId: "ORD-2607-0001",
    nextStatus: "Closed",
    targetType: "Order",
  },
  "client-upload-order-documents": {
    auditVerb: "submitted order document upload for validation",
    authority: "ClientUser",
    defaultTargetId: "ORD-2607-0001",
    nextStatus: "Client Documents Submitted",
    targetType: "Order",
  },
  "client-replace-order-documents": {
    auditVerb: "submitted replacement order documents",
    authority: "ClientUser",
    defaultTargetId: "ORD-2607-0001",
    nextStatus: "Replacement Documents Submitted",
    targetType: "Order",
  },
  "client-acknowledge-correction": {
    auditVerb: "acknowledged order correction notice",
    authority: "ClientUser",
    defaultTargetId: "ORD-2607-0001",
    nextStatus: "Client Correction Acknowledged",
    targetType: "Order",
  },
  "notary-accept-assignment": {
    auditVerb: "accepted notary assignment",
    authority: "AssignedNotary",
    defaultTargetId: "ORD-2607-0001",
    nextStatus: "Assignment Accepted",
    targetType: "Order",
  },
  "notary-decline-assignment": {
    auditVerb: "declined notary assignment",
    authority: "AssignedNotary",
    defaultTargetId: "ORD-2607-0001",
    nextStatus: "Assignment Declined",
    targetType: "Order",
  },
  "notary-confirm-arrival": {
    auditVerb: "confirmed appointment arrival",
    authority: "AssignedNotary",
    defaultTargetId: "ORD-2607-0001",
    nextStatus: "Notary Arrival Confirmed",
    targetType: "Order",
  },
  "notary-upload-completion-package": {
    auditVerb: "uploaded order completion package",
    authority: "AssignedNotary",
    defaultTargetId: "ORD-2607-0001",
    nextStatus: "Completion Package Uploaded",
    targetType: "Order",
  },
};

export function listCommandCenterEvents(): StoredCommandEvent[] {
  return getCommandStore().events.map((event) => ({ ...event }));
}

export function listCommandCenterReceipts(): StoredCommandReceipt[] {
  return getCommandStore().receipts.map((receipt) => ({ ...receipt }));
}

export function getLatestCommandCenterReceiptForHref(
  consoleHref: string,
): StoredCommandReceipt | undefined {
  return getCommandStore()
    .receipts.filter((receipt) => receipt.consoleHref === consoleHref)
    .at(-1);
}

export function getCommandCenterReceipt(
  receiptId: string,
): StoredCommandReceipt | undefined {
  return getCommandStore().receipts.find(
    (receipt) => receipt.id.toLowerCase() === receiptId.toLowerCase(),
  );
}

export async function listPersistedCommandCenterReceipts(): Promise<
  StoredCommandReceipt[]
> {
  const db = await getOptionalDb();
  if (!db) return listCommandCenterReceipts();

  try {
    const [receiptRows, eventRows, targetRows] = await Promise.all([
      db.select().from(schema.commandCenterReceipts),
      db.select().from(schema.commandCenterEvents),
      db.select().from(schema.commandCenterTargets),
    ]);

    if (receiptRows.length === 0) return listCommandCenterReceipts();

    const eventsById = new Map(eventRows.map((event) => [event.id, event]));
    const targetsById = new Map(targetRows.map((target) => [target.id, target]));

    return receiptRows
      .map((receipt) => {
        const event = eventsById.get(receipt.eventId);
        const target = targetsById.get(receipt.targetId);
        if (!event || !target) return undefined;
        return commandReceiptFromRows({ event, receipt, target });
      })
      .filter((receipt): receipt is StoredCommandReceipt => Boolean(receipt));
  } catch {
    return listCommandCenterReceipts();
  }
}

export async function listPersistedCommandCenterEvents(): Promise<
  StoredCommandEvent[]
> {
  return (await listPersistedCommandCenterReceipts()).map((receipt) => ({
    action: receipt.action,
    actor: receipt.actor,
    auditEvent: receipt.auditEvent,
    id: receipt.id,
    nextStatus: receipt.nextStatus,
    previousStatus: receipt.previousStatus,
    role: receipt.role,
    targetId: receipt.targetId,
    targetType: receipt.targetType,
    timestamp: receipt.timestamp,
  }));
}

export async function getPersistedCommandCenterReceipt(
  receiptId: string,
): Promise<StoredCommandReceipt | undefined> {
  const db = await getOptionalDb();
  if (!db) return getCommandCenterReceipt(receiptId);

  try {
    const [receipt] = await db
      .select()
      .from(schema.commandCenterReceipts)
      .where(eq(schema.commandCenterReceipts.id, receiptId))
      .limit(1);
    if (!receipt) return getCommandCenterReceipt(receiptId);

    const [event] = await db
      .select()
      .from(schema.commandCenterEvents)
      .where(eq(schema.commandCenterEvents.id, receipt.eventId))
      .limit(1);
    const [target] = await db
      .select()
      .from(schema.commandCenterTargets)
      .where(eq(schema.commandCenterTargets.id, receipt.targetId))
      .limit(1);

    if (!event || !target) return getCommandCenterReceipt(receiptId);
    return commandReceiptFromRows({ event, receipt, target });
  } catch {
    return getCommandCenterReceipt(receiptId);
  }
}

export async function applyCommandCenterAction(
  action: CommandCenterAction,
  actor: string,
  role: CommandActorRole,
  targetId?: string,
): Promise<{
  action: CommandCenterAction;
  allowed: boolean;
  auditEvent: string;
  authority: string;
  blockedReason?: string;
  currentStatus: string;
  nextStatus: string;
  persisted: boolean;
  targetId: string;
  targetType: StoredCommandEvent["targetType"];
  event?: StoredCommandEvent;
  receipt: StoredCommandReceipt;
  receiptId: string;
}> {
  const definition = commandDefinitions[action];
  const resolvedTargetId = (targetId || definition.defaultTargetId).toUpperCase();
  const authority = commandAuthorityLabel(definition.authority);
  const store = getCommandStore();
  const target = store.targets[resolvedTargetId];

  if (!target || target.type !== definition.targetType) {
    const receipt = storeReceipt(store, {
      action,
      actor,
      allowed: false,
      auditEvent: `${workflowTimestamp()} - ${actor} attempted ${action} for missing target ${resolvedTargetId}.`,
      authority,
      blockedReason: "The requested command target does not exist for this command center action.",
      currentStatus: "Missing",
      nextStatus: "Missing",
      role,
      targetId: resolvedTargetId,
      targetType: definition.targetType,
    });
    const event = appendCommandEvent(store, receipt);
    await persistCommandCenterReceipt(receipt);
    return {
      action,
      allowed: false,
      auditEvent: receipt.auditEvent,
      authority,
      blockedReason: receipt.blockedReason,
      currentStatus: "Missing",
      nextStatus: "Missing",
      event,
      persisted: true,
      receipt,
      receiptId: receipt.id,
      targetId: resolvedTargetId,
      targetType: definition.targetType,
    };
  }

  if (!canUseCommandAuthority(definition.authority, role)) {
    const receipt = storeReceipt(store, {
      action,
      actor,
      allowed: false,
      auditEvent: `${workflowTimestamp()} - ${actor} attempted ${action} for ${resolvedTargetId} without ${authority} authority.`,
      authority,
      blockedReason: `${authority} authority is required for this command center action.`,
      currentStatus: target.status,
      nextStatus: target.status,
      role,
      targetId: resolvedTargetId,
      targetType: target.type,
    });
    const event = appendCommandEvent(store, receipt);
    await persistCommandCenterReceipt(receipt);
    return {
      action,
      allowed: false,
      auditEvent: receipt.auditEvent,
      authority,
      blockedReason: receipt.blockedReason,
      currentStatus: target.status,
      nextStatus: target.status,
      event,
      persisted: true,
      receipt,
      receiptId: receipt.id,
      targetId: resolvedTargetId,
      targetType: target.type,
    };
  }

  const previousStatus = target.status;
  target.status = definition.nextStatus;
  const auditEvent = `${workflowTimestamp()} - ${actor} ${definition.auditVerb} for ${resolvedTargetId}; status changed from ${previousStatus} to ${definition.nextStatus}.`;
  const receipt = storeReceipt(store, {
    action,
    actor,
    allowed: true,
    auditEvent,
    authority,
    currentStatus: previousStatus,
    nextStatus: definition.nextStatus,
    role,
    targetId: resolvedTargetId,
    targetType: target.type,
  });
  const event = appendCommandEvent(store, receipt);
  const commandPersistence = await persistCommandCenterReceipt(receipt);
  const orderPersistence =
    target.type === "Order"
      ? await persistOrderCommandTransition({
          auditEvent,
          nextStatus: definition.nextStatus,
          targetId: resolvedTargetId,
        })
      : { persisted: false };

  return {
    action,
    allowed: true,
    auditEvent,
    authority,
    currentStatus: previousStatus,
    event: { ...event },
    nextStatus: definition.nextStatus,
    persisted: commandPersistence.persisted || target.type !== "Order" || orderPersistence.persisted,
    receipt,
    receiptId: receipt.id,
    targetId: resolvedTargetId,
    targetType: target.type,
  };
}

async function persistCommandCenterReceipt(
  receipt: StoredCommandReceipt,
): Promise<CommandCenterPersistenceResult> {
  const db = await getOptionalDb();
  if (!db) {
    return {
      persisted: false,
      reason: "D1 binding unavailable; command receipt remains in local preview store.",
    };
  }

  const createdAtUtc = new Date(receipt.persistence.receipt.createdAtUtc);
  const updatedAtUtc = new Date(receipt.persistence.target.updatedAtUtc);

  await db
    .insert(schema.commandCenterTargets)
    .values({
      id: receipt.persistence.target.id,
      sourceHref: receipt.persistence.target.sourceHref,
      status: receipt.persistence.target.status,
      targetType: receipt.persistence.target.targetType,
      updatedAtUtc,
    })
    .onConflictDoUpdate({
      set: {
        sourceHref: receipt.persistence.target.sourceHref,
        status: receipt.persistence.target.status,
        targetType: receipt.persistence.target.targetType,
        updatedAtUtc,
      },
      target: schema.commandCenterTargets.id,
    });

  await db
    .insert(schema.commandCenterEvents)
    .values({
      action: receipt.persistence.event.action,
      actor: receipt.persistence.event.actor,
      actorRole: receipt.persistence.event.actorRole,
      allowed: receipt.persistence.event.allowed,
      auditEvent: receipt.persistence.event.auditEvent,
      authority: receipt.persistence.event.authority,
      blockedReason: receipt.persistence.event.blockedReason,
      createdAtUtc,
      id: receipt.persistence.event.id,
      nextStatus: receipt.persistence.event.nextStatus,
      outcome: receipt.persistence.event.outcome,
      previousStatus: receipt.persistence.event.previousStatus,
      receiptId: receipt.persistence.event.receiptId,
      targetId: receipt.persistence.event.targetId,
      targetType: receipt.persistence.event.targetType,
    })
    .onConflictDoUpdate({
      set: {
        action: receipt.persistence.event.action,
        actor: receipt.persistence.event.actor,
        actorRole: receipt.persistence.event.actorRole,
        allowed: receipt.persistence.event.allowed,
        auditEvent: receipt.persistence.event.auditEvent,
        authority: receipt.persistence.event.authority,
        blockedReason: receipt.persistence.event.blockedReason,
        createdAtUtc,
        nextStatus: receipt.persistence.event.nextStatus,
        outcome: receipt.persistence.event.outcome,
        previousStatus: receipt.persistence.event.previousStatus,
        receiptId: receipt.persistence.event.receiptId,
        targetId: receipt.persistence.event.targetId,
        targetType: receipt.persistence.event.targetType,
      },
      target: schema.commandCenterEvents.id,
    });

  await db
    .insert(schema.commandCenterReceipts)
    .values({
      action: receipt.persistence.receipt.action,
      authority: receipt.persistence.receipt.authority,
      consoleHref: receipt.persistence.receipt.consoleHref,
      createdAtUtc,
      eventId: receipt.persistence.receipt.eventId,
      id: receipt.persistence.receipt.id,
      nextRequiredAction: receipt.persistence.receipt.nextRequiredAction,
      outcome: receipt.persistence.receipt.outcome,
      retainedForAudit: receipt.persistence.receipt.retainedForAudit,
      targetId: receipt.persistence.receipt.targetId,
    })
    .onConflictDoUpdate({
      set: {
        action: receipt.persistence.receipt.action,
        authority: receipt.persistence.receipt.authority,
        consoleHref: receipt.persistence.receipt.consoleHref,
        createdAtUtc,
        eventId: receipt.persistence.receipt.eventId,
        nextRequiredAction: receipt.persistence.receipt.nextRequiredAction,
        outcome: receipt.persistence.receipt.outcome,
        retainedForAudit: receipt.persistence.receipt.retainedForAudit,
        targetId: receipt.persistence.receipt.targetId,
      },
      target: schema.commandCenterReceipts.id,
    });

  return { persisted: true };
}

function commandReceiptFromRows(input: {
  event: typeof schema.commandCenterEvents.$inferSelect;
  receipt: typeof schema.commandCenterReceipts.$inferSelect;
  target: typeof schema.commandCenterTargets.$inferSelect;
}): StoredCommandReceipt {
  const createdAtUtc = input.receipt.createdAtUtc.toISOString();
  const updatedAtUtc = input.target.updatedAtUtc.toISOString();

  return {
    action: input.receipt.action as CommandCenterAction,
    actor: input.event.actor,
    allowed: input.event.allowed,
    auditEvent: input.event.auditEvent,
    authority: input.receipt.authority,
    blockedReason: input.event.blockedReason ?? undefined,
    consoleHref: input.receipt.consoleHref,
    id: input.receipt.id,
    nextRequiredAction: input.receipt.nextRequiredAction,
    nextStatus: input.event.nextStatus,
    outcome: input.receipt.outcome,
    persistence: {
      event: {
        action: input.event.action as CommandCenterAction,
        actor: input.event.actor,
        actorRole: input.event.actorRole as CommandActorRole,
        allowed: input.event.allowed,
        auditEvent: input.event.auditEvent,
        authority: input.event.authority,
        blockedReason: input.event.blockedReason ?? undefined,
        createdAtUtc,
        id: input.event.id,
        nextStatus: input.event.nextStatus,
        outcome: input.event.outcome,
        previousStatus: input.event.previousStatus,
        receiptId: input.event.receiptId,
        targetId: input.event.targetId,
        targetType: input.event.targetType,
      },
      receipt: {
        action: input.receipt.action as CommandCenterAction,
        authority: input.receipt.authority,
        consoleHref: input.receipt.consoleHref,
        createdAtUtc,
        eventId: input.receipt.eventId,
        id: input.receipt.id,
        nextRequiredAction: input.receipt.nextRequiredAction,
        outcome: input.receipt.outcome,
        retainedForAudit: input.receipt.retainedForAudit,
        targetId: input.receipt.targetId,
      },
      target: {
        id: input.target.id,
        sourceHref: input.target.sourceHref,
        status: input.target.status,
        targetType: input.target.targetType,
        updatedAtUtc,
      },
    },
    previousStatus: input.event.previousStatus,
    role: input.event.actorRole as CommandActorRole,
    targetId: input.receipt.targetId,
    targetType: input.event.targetType,
    timestamp: createdAtUtc,
  };
}

function getCommandStore(): CommandCenterStore {
  if (!globalStore.__notarixCommandCenterStore) {
    globalStore.__notarixCommandCenterStore = createInitialCommandStore();
  }

  return globalStore.__notarixCommandCenterStore;
}

function createInitialCommandStore(): CommandCenterStore {
  const targets: Record<string, CommandTargetState> = {};

  for (const notification of notificationRecords) {
    targets[notification.id] = {
      id: notification.id,
      status: notification.status,
      type: "Notification",
    };
  }
  for (const credential of credentialMonitorRecords) {
    targets[credential.id] = {
      id: credential.id,
      status: credential.status,
      type: "Credential",
    };
  }
  for (const ledger of paymentLedgerRecords) {
    targets[ledger.id] = {
      id: ledger.id,
      status: ledger.status,
      type: "Ledger",
    };
  }
  for (const audit of auditReportRecords) {
    targets[audit.id] = {
      id: audit.id,
      status: audit.risk,
      type: "Audit",
    };
  }
  for (const evidence of evidenceRecords) {
    targets[evidence.id] = {
      id: evidence.id,
      status: evidence.scanStatus,
      type: "Evidence",
    };
  }
  for (const retention of retentionPolicyRecords) {
    targets[retention.id] = {
      id: retention.id,
      status: retention.status,
      type: "Retention",
    };
  }
  for (const system of systemHealthRecords) {
    targets[system.id] = {
      id: system.id,
      status: system.status,
      type: "System",
    };
  }
  for (const access of accessControlRecords) {
    targets[access.id] = {
      id: access.id,
      status: access.sessionStatus,
      type: "Access",
    };
  }
  for (const integration of providerIntegrationRecords) {
    targets[integration.id] = {
      id: integration.id,
      status: integration.status,
      type: "Integration",
    };
  }
  for (const order of orderOperationRecords) {
    targets[order.id] = {
      id: order.id,
      status: order.orderStatus,
      type: "Order",
    };
  }

  return {
    events: [],
    receipts: [],
    targets,
  };
}

function storeReceipt(
  store: CommandCenterStore,
  input: {
    action: CommandCenterAction;
    actor: string;
    allowed: boolean;
    auditEvent: string;
    authority: string;
    blockedReason?: string;
    currentStatus: string;
    nextStatus: string;
    role: CommandActorRole;
    targetId: string;
    targetType: StoredCommandEvent["targetType"];
  },
): StoredCommandReceipt {
  const consoleHref = consoleHrefForTarget(input.targetType);
  const createdAtUtc = workflowTimestampUtc();
  const id = `CMD-2607-${String(store.receipts.length + 1).padStart(4, "0")}`;
  const nextAction = nextRequiredAction(input.action, input.allowed);
  const outcome = input.allowed ? "Completed" : "Blocked";
  const receipt: StoredCommandReceipt = {
    action: input.action,
    actor: input.actor,
    allowed: input.allowed,
    auditEvent: input.auditEvent,
    authority: input.authority,
    blockedReason: input.blockedReason,
    consoleHref,
    id,
    nextRequiredAction: nextAction,
    nextStatus: input.nextStatus,
    outcome,
    persistence: {
      event: {
        action: input.action,
        actor: input.actor,
        actorRole: input.role,
        allowed: input.allowed,
        auditEvent: input.auditEvent,
        authority: input.authority,
        blockedReason: input.blockedReason,
        createdAtUtc,
        id,
        nextStatus: input.nextStatus,
        outcome,
        previousStatus: input.currentStatus,
        receiptId: id,
        targetId: input.targetId,
        targetType: input.targetType,
      },
      receipt: {
        action: input.action,
        authority: input.authority,
        consoleHref,
        createdAtUtc,
        eventId: id,
        id,
        nextRequiredAction: nextAction,
        outcome,
        retainedForAudit: true,
        targetId: input.targetId,
      },
      target: {
        id: input.targetId,
        sourceHref: consoleHref,
        status: input.nextStatus,
        targetType: input.targetType,
        updatedAtUtc: createdAtUtc,
      },
    },
    previousStatus: input.currentStatus,
    role: input.role,
    targetId: input.targetId,
    targetType: input.targetType,
    timestamp: workflowTimestamp(),
  };
  store.receipts.push(receipt);
  return { ...receipt };
}

function appendCommandEvent(
  store: CommandCenterStore,
  receipt: StoredCommandReceipt,
): StoredCommandEvent {
  const event: StoredCommandEvent = {
    action: receipt.action,
    actor: receipt.actor,
    auditEvent: receipt.auditEvent,
    id: receipt.id,
    nextStatus: receipt.nextStatus,
    previousStatus: receipt.previousStatus,
    role: receipt.role,
    targetId: receipt.targetId,
    targetType: receipt.targetType,
    timestamp: receipt.timestamp,
  };
  store.events.push(event);
  return { ...event };
}

function consoleHrefForTarget(
  targetType: StoredCommandEvent["targetType"],
): string {
  if (targetType === "Notification") return "/notifications";
  if (targetType === "Credential") return "/credentials/expiration";
  if (targetType === "Ledger") return "/staff/financial-reports";
  if (targetType === "Evidence") return "/staff/document-validation";
  if (targetType === "Retention") return "/staff/retention";
  if (targetType === "System") return "/staff/system-health";
  if (targetType === "Access") return "/staff/access-control";
  if (targetType === "Integration") return "/staff/integrations";
  if (targetType === "Order") return "/staff/orders";
  return "/staff/audit-reports";
}

function nextRequiredAction(
  action: CommandCenterAction,
  allowed: boolean,
): string {
  if (!allowed) {
    return "Review role authority, target record, and required approval level before attempting the action again.";
  }
  if (action === "retry-failed-notification") {
    return "Monitor delivery callback and escalate if the retry fails again.";
  }
  if (action === "record-phone-consent") {
    return "Proceed with phone or SMS delivery only for the consented notification purpose.";
  }
  if (action === "suppress-notice") {
    return "Retain suppression rationale and review communication history before any future delivery.";
  }
  if (action === "send-renewal-reminder") {
    return "Wait for replacement credential response or schedule the next reminder interval.";
  }
  if (action === "request-replacement-evidence") {
    return "Review replacement evidence after upload validation and malware scanning complete.";
  }
  if (action === "escalate-restriction") {
    return "Keep restricted services disabled until elevated review clears the control.";
  }
  if (action === "hold-payment-release") {
    return "Keep payment release disabled until financial authority clears the ledger control.";
  }
  if (action === "escalate-ledger-correction") {
    return "Route the correction to Super Admin review with supporting evidence.";
  }
  if (action === "export-ledger-report") {
    return "Retain the export purpose, actor, timestamp, and report scope.";
  }
  if (action === "export-audit-report") {
    return "Retain export details under restricted Super Admin audit controls.";
  }
  if (action === "place-retention-hold") {
    return "Preserve affected records until the hold is formally released.";
  }
  if (action === "release-validated-evidence") {
    return "Allow the validated file to continue into the linked profile, order, financial, or credential workflow.";
  }
  if (action === "quarantine-failed-file") {
    return "Keep the file unavailable and preserve quarantine evidence until security review is complete.";
  }
  if (action === "request-replacement-upload") {
    return "Wait for replacement upload, then restart validation, scan, custody, and access classification.";
  }
  if (action === "escalate-restricted-document") {
    return "Route the restricted document to elevated review before any release decision.";
  }
  if (action === "place-record-retention-hold") {
    return "Preserve the affected record set until Super Admin releases the hold.";
  }
  if (action === "release-retention-hold") {
    return "Document the release reason and keep the hold receipt with the retention record.";
  }
  if (action === "mark-deletion-review-needed") {
    return "Route the record to retention eligibility review before any deletion action is allowed.";
  }
  if (action === "escalate-retention-exception") {
    return "Send the retention exception to elevated compliance review with supporting context.";
  }
  if (action === "verify-backup-recovery") {
    return "Retain verification evidence and schedule the next backup restore validation.";
  }
  if (action === "open-recovery-drill") {
    return "Track recovery drill milestones until restore, evidence access, and notification checks pass.";
  }
  if (action === "escalate-system-incident") {
    return "Open incident review and keep affected workflows restricted until service health is restored.";
  }
  if (action === "mark-provider-degraded") {
    return "Show degraded provider posture and route dependent workflows through fallback review.";
  }
  if (action === "require-mfa-passkey-reset") {
    return "Require the staff user to complete MFA and passkey enrollment before elevated access resumes.";
  }
  if (action === "suspend-staff-session") {
    return "Keep the staff session suspended until role, device, and identity controls are reviewed.";
  }
  if (action === "open-access-review") {
    return "Review role claim, route access, session posture, and least privilege before closing the review.";
  }
  if (action === "escalate-privilege-exception") {
    return "Send the privilege exception to elevated access review and restrict sensitive routes.";
  }
  if (action === "verify-provider-integration") {
    return "Retain provider readiness evidence and confirm dependent workflow routing before launch.";
  }
  if (action === "mark-integration-degraded") {
    return "Route dependent workflows through fallback review until provider health is restored.";
  }
  if (action === "open-provider-callback-review") {
    return "Verify callback payloads, retry behavior, and delivery-status updates before closing review.";
  }
  if (action === "escalate-provider-risk") {
    return "Escalate provider risk to operational leadership and restrict affected workflow release.";
  }
  if (action === "assign-notary") {
    return "Confirm credential, RON, payable, location, and availability controls before notifying the notary.";
  }
  if (action === "hold-order") {
    return "Keep client, notary, document release, billing, and payable actions locked until the hold is cleared.";
  }
  if (action === "release-order-documents") {
    return "Notify the authorized client and assigned notary that validated order documents are available.";
  }
  if (action === "escalate-order-issue") {
    return "Route the order issue to the appropriate Admin or Super Admin queue with supporting order context.";
  }
  if (action === "request-missing-documents") {
    return "Wait for replacement upload, then restart malware validation and order document release review.";
  }
  if (action === "route-order-financial-review") {
    return "Keep invoice and payable activity restricted until financial review is completed.";
  }
  if (action === "confirm-notary-acceptance") {
    return "Notify the client and assigned notary that assignment is accepted and appointment confirmation may proceed.";
  }
  if (action === "confirm-order-appointment") {
    return "Keep appointment confirmation with the order file and monitor document availability before signing.";
  }
  if (action === "record-completion-package") {
    return "Route the completion package through document validation, delivery, invoice, and payable controls.";
  }
  if (action === "close-order") {
    return "Retain closeout receipts with order audit, delivery, invoice, payable, and document retention records.";
  }
  if (action === "client-upload-order-documents") {
    return "Route uploaded client documents into evidence intake, malware validation, custody review, and staff release controls.";
  }
  if (action === "client-replace-order-documents") {
    return "Restart document validation and notify staff that replacement evidence is ready for review.";
  }
  if (action === "client-acknowledge-correction") {
    return "Keep the correction acknowledgement with the order communications record and wait for corrected materials.";
  }
  if (action === "notary-accept-assignment") {
    return "Notify staff and client that the assignment is accepted and appointment confirmation may continue.";
  }
  if (action === "notary-decline-assignment") {
    return "Return the order to assignment review and prevent appointment confirmation until a new notary is selected.";
  }
  if (action === "notary-confirm-arrival") {
    return "Record arrival confirmation with the order file and monitor completion package upload after service.";
  }
  if (action === "notary-upload-completion-package") {
    return "Route the completion package to document validation, delivery review, invoice release, and payable controls.";
  }
  return "Track the escalated exception through restricted audit review.";
}

function workflowTimestamp(): string {
  return "Jul 18 2026 at 5:00 PM ET";
}

function workflowTimestampUtc(): string {
  return "2026-07-18T21:00:00.000Z";
}
