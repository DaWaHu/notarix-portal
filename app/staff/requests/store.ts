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

export function getStoredAccessRequest(requestId: string): StoredAccessRequest | undefined {
  const store = getWorkflowStore();
  return cloneStoredRequest(store.requests[requestId.toUpperCase()]);
}

export function listStoredAccessRequests(): StoredAccessRequest[] {
  const store = getWorkflowStore();
  return Object.values(store.requests).map(cloneStoredRequest);
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
    nextClientProfileSequence: 1,
    nextNotaryProfileSequence: 1,
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

function nextProfileNumber(
  request: StoredAccessRequest,
  store: NotarixWorkflowStore,
): string {
  if (request.type === "Client") {
    store.nextClientProfileSequence += 1;
    return profileNumberFormatExample(request.type);
  }

  store.nextNotaryProfileSequence += 1;
  return profileNumberFormatExample(request.type);
}

function workflowTimestamp(): string {
  return "Jul 18 2026 at 5:00 PM ET";
}
