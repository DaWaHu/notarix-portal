import { eq } from "drizzle-orm";
import { getOptionalDb } from "../../../db";
import * as schema from "../../../db/schema";
import { formatPermanentRecordIdentifier } from "../../identifier-policy";
import {
  type AccessRequest,
  type AccessRequestStatus,
  accessRequests,
  getProfileVerificationItems,
  profileNumberFormatExample,
  type ProfileVerificationItem,
  type VerificationDecision,
} from "./data";
import type { WorkflowNotification } from "./workflow";

export type StoredAuditEvent = {
  actor: string;
  event: string;
  timestamp: string;
};

export type StoredNotification = WorkflowNotification & {
  id: string;
  requestId: string;
  timestamp: string;
};

export type StoredAccessRequest = AccessRequest & {
  storedAuditEvents: StoredAuditEvent[];
  storedNotifications: StoredNotification[];
  verificationItems: ProfileVerificationItem[];
};

type NotarixWorkflowStore = {
  requests: Record<string, StoredAccessRequest>;
  nextClientProfileSequence: number;
  nextNotaryProfileSequence: number;
};

const globalStore = globalThis as typeof globalThis & {
  __notarixWorkflowStore?: NotarixWorkflowStore;
};

const persistedWorkflowDate = () => new Date("2026-07-18T21:00:00.000Z");

export function getStoredAccessRequest(requestId: string): StoredAccessRequest | undefined {
  const store = getWorkflowStore();
  return cloneStoredRequest(store.requests[requestId.toUpperCase()]);
}

export async function getPersistedAccessRequest(
  requestId: string,
): Promise<StoredAccessRequest | undefined> {
  const db = await getOptionalDb();
  if (!db) return getStoredAccessRequest(requestId);

  try {
    const [requestRow] = await db
      .select()
      .from(schema.accessRequests)
      .where(eq(schema.accessRequests.id, requestId.toUpperCase()))
      .limit(1);
    if (!requestRow) return getStoredAccessRequest(requestId);

    const [verificationRows, auditRows, notificationRows] = await Promise.all([
      db
        .select()
        .from(schema.profileVerificationItems)
        .where(eq(schema.profileVerificationItems.requestId, requestRow.id)),
      db
        .select()
        .from(schema.workflowAuditEvents)
        .where(eq(schema.workflowAuditEvents.requestId, requestRow.id)),
      db
        .select()
        .from(schema.workflowNotifications)
        .where(eq(schema.workflowNotifications.requestId, requestRow.id)),
    ]);

    return storedRequestFromRows({
      auditRows,
      notificationRows,
      requestRow,
      verificationRows,
    });
  } catch {
    return getStoredAccessRequest(requestId);
  }
}

export function listStoredAccessRequests(): StoredAccessRequest[] {
  const store = getWorkflowStore();
  return Object.values(store.requests).map(cloneStoredRequest);
}

export async function persistStoredAccessRequest(
  request: StoredAccessRequest,
): Promise<{ persisted: boolean; reason?: string }> {
  const db = await getOptionalDb();
  if (!db) {
    return {
      persisted: false,
      reason: "Postgres DATABASE_URL unavailable; profile workflow remains in local preview store.",
    };
  }

  const timestamp = persistedWorkflowDate();

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

  await Promise.all(
    request.verificationItems.map((item) =>
      db
        .insert(schema.profileVerificationItems)
        .values({
          evidence: item.evidence,
          id: `${request.id}-${item.section.toUpperCase().replaceAll(" ", "-")}`,
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
        }),
    ),
  );

  await Promise.all(
    request.storedAuditEvents.map((auditEvent, index) =>
      db
        .insert(schema.workflowAuditEvents)
        .values({
          action: auditEvent.event.split(" - ")[1]?.split(" for ")[0] ?? "workflow-update",
          actorEmail: auditEvent.actor,
          actorRole: auditEvent.actor.startsWith("GenAdmin")
            ? "GenAdmin"
            : auditEvent.actor.includes("super")
              ? "SuperAdmin"
              : "Admin",
          createdAtUtc: timestamp,
          event: auditEvent.event,
          id: `${request.id}-AUD-${String(index + 1).padStart(4, "0")}`,
          nextStatus: request.status,
          previousStatus: "Recorded",
          requestId: request.id,
        })
        .onConflictDoUpdate({
          set: {
            action: auditEvent.event.split(" - ")[1]?.split(" for ")[0] ?? "workflow-update",
            actorEmail: auditEvent.actor,
            createdAtUtc: timestamp,
            event: auditEvent.event,
            nextStatus: request.status,
            previousStatus: "Recorded",
          },
          target: schema.workflowAuditEvents.id,
        }),
    ),
  );

  await Promise.all(
    request.storedNotifications.map((notification) =>
      db
        .insert(schema.workflowNotifications)
        .values({
          channel: notification.channel,
          createdAtUtc: timestamp,
          id: notification.id,
          purpose: notification.purpose,
          recipient: notification.recipient,
          requestId: request.id,
          status: notification.status,
        })
        .onConflictDoUpdate({
          set: {
            channel: notification.channel,
            createdAtUtc: timestamp,
            purpose: notification.purpose,
            recipient: notification.recipient,
            status: notification.status,
          },
          target: schema.workflowNotifications.id,
        }),
    ),
  );

  return { persisted: true };
}

export function updateRequestStatus(
  requestId: string,
  nextStatus: AccessRequestStatus,
  actor: string,
  auditEvent: string,
): StoredAccessRequest | undefined {
  const store = getWorkflowStore();
  const request = store.requests[requestId.toUpperCase()];
  if (!request) return undefined;

  request.status = nextStatus;
  request.auditEvents = [...request.auditEvents, auditEvent];
  request.storedAuditEvents.push({
    actor,
    event: auditEvent,
    timestamp: workflowTimestamp(),
  });

  return cloneStoredRequest(request);
}

export function updateVerificationSection(
  requestId: string,
  section: string,
  nextStatus: VerificationDecision,
  actor: string,
  auditEvent: string,
): StoredAccessRequest | undefined {
  const store = getWorkflowStore();
  const request = store.requests[requestId.toUpperCase()];
  if (!request) return undefined;

  request.verificationItems = request.verificationItems.map((item) =>
    item.section.toLowerCase() === section.toLowerCase()
      ? { ...item, status: nextStatus }
      : item,
  );
  request.auditEvents = [...request.auditEvents, auditEvent];
  request.storedAuditEvents.push({
    actor,
    event: auditEvent,
    timestamp: workflowTimestamp(),
  });

  return cloneStoredRequest(request);
}

export function activateStoredProfile(
  requestId: string,
  actor: string,
  auditEvent: string,
  notifications: WorkflowNotification[],
): StoredAccessRequest | undefined {
  const store = getWorkflowStore();
  const request = store.requests[requestId.toUpperCase()];
  if (!request) return undefined;

  if (!request.approvedProfileNumber) {
    request.approvedProfileNumber = nextProfileNumber(request, store);
  }

  request.status = "Active";
  request.nextAction = "Profile activated; monitor approved permissions, credential expirations, and notification delivery.";
  request.auditEvents = [...request.auditEvents, auditEvent];
  request.storedAuditEvents.push({
    actor,
    event: auditEvent,
    timestamp: workflowTimestamp(),
  });
  request.storedNotifications.push(
    ...notifications.map((notification, index) => ({
      ...notification,
      id: `NTF-${request.id}-${request.storedNotifications.length + index + 1}`,
      requestId: request.id,
      timestamp: workflowTimestamp(),
    })),
  );

  return cloneStoredRequest(request);
}

export function appendStoredNotifications(
  requestId: string,
  notifications: WorkflowNotification[],
): StoredAccessRequest | undefined {
  const store = getWorkflowStore();
  const request = store.requests[requestId.toUpperCase()];
  if (!request) return undefined;

  request.storedNotifications.push(
    ...notifications.map((notification, index) => ({
      ...notification,
      id: `NTF-${request.id}-${request.storedNotifications.length + index + 1}`,
      requestId: request.id,
      timestamp: workflowTimestamp(),
    })),
  );

  return cloneStoredRequest(request);
}

export function resetWorkflowStoreForTests() {
  globalStore.__notarixWorkflowStore = createInitialStore();
}

function getWorkflowStore(): NotarixWorkflowStore {
  if (!globalStore.__notarixWorkflowStore) {
    globalStore.__notarixWorkflowStore = createInitialStore();
  }

  return globalStore.__notarixWorkflowStore;
}

function createInitialStore(): NotarixWorkflowStore {
  return {
    nextClientProfileSequence: 0,
    nextNotaryProfileSequence: 0,
    requests: Object.fromEntries(
      accessRequests.map((request) => [
        request.id,
        {
          ...request,
          storedAuditEvents: request.auditEvents.map((event) => ({
            actor: event.split(" - ")[1]?.split(" ")[0] ?? "System",
            event,
            timestamp: event.split(" - ")[0] ?? request.received,
          })),
          storedNotifications: [],
          verificationItems: getProfileVerificationItems(request).map((item) =>
            request.status === "Ready for Elevated Approval" ||
            request.status === "Admin/Super Admin Review" ||
            request.status === "Approved" ||
            request.status === "Active"
              ? { ...item, status: "Verified" as VerificationDecision }
              : { ...item },
          ),
        },
      ]),
    ),
  };
}

function cloneStoredRequest(request: StoredAccessRequest): StoredAccessRequest {
  return {
    ...request,
    activationItems: [...request.activationItems],
    auditEvents: [...request.auditEvents],
    credentialItems: [...request.credentialItems],
    eligibilityItems: [...request.eligibilityItems],
    storedAuditEvents: request.storedAuditEvents.map((event) => ({ ...event })),
    storedNotifications: request.storedNotifications.map((notification) => ({
      ...notification,
    })),
    verificationItems: request.verificationItems.map((item) => ({ ...item })),
  };
}

function storedRequestFromRows(input: {
  auditRows: (typeof schema.workflowAuditEvents.$inferSelect)[];
  notificationRows: (typeof schema.workflowNotifications.$inferSelect)[];
  requestRow: typeof schema.accessRequests.$inferSelect;
  verificationRows: (typeof schema.profileVerificationItems.$inferSelect)[];
}): StoredAccessRequest {
  const seed = getStoredAccessRequest(input.requestRow.id);
  const base = seed ?? {
    activationItems: [],
    auditEvents: [],
    credentialItems: [],
    eligibilityItems: [],
    invitationTarget: input.requestRow.email,
    invitationUrl: `/profile/complete/${input.requestRow.id}`,
    nextAction: "Review stored workflow record.",
    notes: "Stored workflow record reconstructed from Postgres.",
    received: "Jul 18 2026 at 5:00 PM ET",
  };

  return {
    ...base,
    approvedProfileNumber: input.requestRow.approvedProfileNumber,
    email: input.requestRow.email,
    id: input.requestRow.id,
    jurisdiction: input.requestRow.jurisdiction,
    name: input.requestRow.name,
    organization: input.requestRow.organization,
    phone: input.requestRow.phone,
    reviewer: input.requestRow.reviewer,
    risk: input.requestRow.risk,
    service: input.requestRow.service,
    status: input.requestRow.status as AccessRequestStatus,
    type: input.requestRow.type,
    auditEvents:
      input.auditRows.length > 0
        ? input.auditRows.map((row) => row.event)
        : [...base.auditEvents],
    storedAuditEvents:
      input.auditRows.length > 0
        ? input.auditRows.map((row) => ({
            actor: row.actorEmail,
            event: row.event,
            timestamp: row.createdAtUtc.toISOString(),
          }))
        : seed?.storedAuditEvents ?? [],
    storedNotifications: input.notificationRows.map((row) => ({
      channel: row.channel,
      id: row.id,
      purpose: row.purpose,
      recipient: row.recipient,
      requestId: row.requestId,
      status: row.status as StoredNotification["status"],
      timestamp: row.createdAtUtc.toISOString(),
    })),
    verificationItems:
      input.verificationRows.length > 0
        ? input.verificationRows.map((row) => ({
            evidence: row.evidence,
            requirement: row.requirement,
            reviewerNote: row.reviewerNote,
            section: row.section,
            status: row.status as VerificationDecision,
          }))
        : seed?.verificationItems ?? [],
  };
}

function nextProfileNumber(
  request: StoredAccessRequest,
  store: NotarixWorkflowStore,
): string {
  if (request.type === "Client") {
    store.nextClientProfileSequence += 1;
    return formatPermanentRecordIdentifier({
      kind: "ClientProfile",
      jurisdiction: request.jurisdiction,
      effectiveDateUtc: persistedWorkflowDate(),
      sequence: store.nextClientProfileSequence,
    });
  }

  store.nextNotaryProfileSequence += 1;
  return formatPermanentRecordIdentifier({
    kind: "NotaryProfile",
    jurisdiction: request.jurisdiction,
    effectiveDateUtc: persistedWorkflowDate(),
    sequence: store.nextNotaryProfileSequence,
  });
}

function workflowTimestamp(): string {
  return "Jul 18 2026 at 5:00 PM ET";
}
