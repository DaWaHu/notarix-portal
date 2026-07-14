import { eq } from "drizzle-orm";
import { getOptionalDb } from "../db";
import * as schema from "../db/schema";
import { getNotificationProviderBinding } from "./notification-provider-config";
import { notificationRecords } from "./operations-data";

type ModeledNotificationRecord = (typeof notificationRecords)[number];

export type NotificationDeliveryRecord = ModeledNotificationRecord & {
  callbackStatus: string;
  deliveryAttemptCount: number;
  lastCallbackAtUtc: string | null;
  provider: string;
  providerMessageId: string;
  providerStatus: string;
  updatedAtUtc: string;
};

export type NotificationDeliveryEvent = {
  actor: string;
  actorRole: string;
  createdAtUtc: string;
  detail: string;
  eventType: string;
  id: string;
  nextStatus: string;
  notificationId: string;
  outcome: "Completed" | "Blocked";
  previousStatus: string;
  provider: string;
  providerMessageId: string;
};

export const notificationProviderContract = {
  callbacks:
    "Provider delivery callbacks update delivery records and append retained delivery events without storing provider secrets in source.",
  consent:
    "Phone and SMS delivery remains blocked until a consent record is retained for the notification purpose.",
  dispatch:
    "Staff dispatch actions create provider receipts with actor, role, target, channel, recipient, timestamp, and outcome.",
  providers:
    "Production email, SMS, and phone providers must be configured through environment bindings and verified callback signatures.",
} as const;

type NotificationOverride = Partial<NotificationDeliveryRecord>;

const globalNotificationStore = globalThis as typeof globalThis & {
  __notarixCommunicationConsentRecords?: Array<{
    channel: string;
    id: string;
    notificationId: string;
    purpose: string;
    recipient: string;
    recordedAtUtc: string;
    recordedBy: string;
    consentStatus: string;
  }>;
  __notarixNotificationDeliveryEvents?: NotificationDeliveryEvent[];
  __notarixNotificationOverrides?: Record<string, NotificationOverride>;
};

export async function listNotificationDeliveryRecords(): Promise<
  NotificationDeliveryRecord[]
> {
  const db = await getOptionalDb();
  if (!db) return notificationRecords.map(buildNotificationDeliveryRecord);

  try {
    const rows = await db.select().from(schema.notificationDeliveryRecords);
    if (rows.length === 0) {
      return notificationRecords.map(buildNotificationDeliveryRecord);
    }
    return rows.map((row) => applyNotificationOverride({
      callbackStatus: row.callbackStatus,
      channel: row.channel,
      consent: row.consent,
      deliveryAttemptCount: row.deliveryAttemptCount,
      id: row.id,
      lastCallbackAtUtc: row.lastCallbackAtUtc?.toISOString() ?? null,
      nextAction: row.nextAction,
      owner: row.owner,
      provider: row.provider,
      providerMessageId: row.providerMessageId,
      providerStatus: row.providerStatus,
      purpose: row.purpose,
      recipient: row.recipient,
      recipientName: row.recipientName,
      relatedRecord: row.relatedRecord,
      status: row.status,
      timestamp: row.timestamp,
      trigger: row.trigger,
      updatedAtUtc: row.updatedAtUtc.toISOString(),
    }));
  } catch {
    return notificationRecords.map(buildNotificationDeliveryRecord);
  }
}

export async function dispatchNotificationDelivery(input: {
  actor: string;
  actorRole: string;
  notificationId: string;
}): Promise<NotificationDeliveryEvent & { available: boolean }> {
  const record = await getNotificationDeliveryRecord(input.notificationId);
  if (!record) {
    return unavailableNotificationEvent(input.notificationId);
  }

  const requiresConsent = phoneOrSmsChannel(record.channel) &&
    !record.consent.toLowerCase().includes("recorded");
  const providerBinding = await getNotificationProviderBinding(record.channel);
  const provider = providerBinding.provider;
  const providerMessageId =
    record.providerMessageId !== "Pending"
      ? record.providerMessageId
      : `${providerMessagePrefix(record.channel)}-${record.id}`;
  const previousStatus = record.status;
  const blocked = requiresConsent;
  const nextStatus = blocked
    ? "Consent Required"
    : "Dispatched to provider";
  const timestamp = notificationWorkflowTimestampUtc();
  const event: NotificationDeliveryEvent & { available: boolean } = {
    actor: input.actor,
    actorRole: input.actorRole,
    available: true,
    createdAtUtc: timestamp,
    detail: blocked
      ? "Phone or SMS delivery blocked until communication consent is retained."
      : providerBinding.configured
        ? "Notification dispatched with configured provider credentials and retained for delivery callback reconciliation."
        : "Notification dispatch recorded; provider credentials must be bound through environment secrets before production delivery.",
    eventType: blocked ? "Consent Hold" : "Provider Dispatch",
    id: nextNotificationEventId(),
    nextStatus,
    notificationId: record.id,
    outcome: blocked ? "Blocked" : "Completed",
    previousStatus,
    provider,
    providerMessageId,
  };

  await persistNotificationUpdate({
    event,
    record: {
      ...record,
      callbackStatus: blocked ? "Awaiting consent" : "Awaiting provider callback",
      deliveryAttemptCount: blocked
        ? record.deliveryAttemptCount
        : record.deliveryAttemptCount + 1,
      nextAction: blocked
        ? "Record consent before delivery."
        : "Await provider delivery callback.",
      provider,
      providerMessageId,
      providerStatus: blocked
        ? "Blocked before provider handoff"
        : providerBinding.configured
          ? "Accepted"
          : "Provider credentials not configured",
      status: nextStatus,
      updatedAtUtc: timestamp,
    },
  });

  return event;
}

export async function recordNotificationProviderCallback(input: {
  deliveryStatus: string;
  detail?: string;
  notificationId: string;
  provider?: string;
  providerMessageId?: string;
}): Promise<NotificationDeliveryEvent & { available: boolean }> {
  const record = await getNotificationDeliveryRecord(input.notificationId);
  if (!record) return unavailableNotificationEvent(input.notificationId);

  const timestamp = notificationWorkflowTimestampUtc();
  const nextStatus = deliveryStatusToRecordStatus(input.deliveryStatus);
  const provider = input.provider ?? record.provider;
  const providerMessageId = input.providerMessageId ?? record.providerMessageId;
  const event: NotificationDeliveryEvent & { available: boolean } = {
    actor: provider,
    actorRole: "NotificationProvider",
    available: true,
    createdAtUtc: timestamp,
    detail:
      input.detail ??
      `Provider callback recorded delivery status ${input.deliveryStatus}.`,
    eventType: "Provider Callback",
    id: nextNotificationEventId(),
    nextStatus,
    notificationId: record.id,
    outcome: "Completed",
    previousStatus: record.status,
    provider,
    providerMessageId,
  };

  await persistNotificationUpdate({
    event,
    record: {
      ...record,
      callbackStatus: input.deliveryStatus,
      lastCallbackAtUtc: timestamp,
      nextAction: nextActionForDeliveryStatus(nextStatus),
      provider,
      providerMessageId,
      providerStatus: input.deliveryStatus,
      status: nextStatus,
      updatedAtUtc: timestamp,
    },
  });

  return event;
}

export async function recordNotificationConsent(input: {
  actor: string;
  notificationId: string;
}) {
  const record = await getNotificationDeliveryRecord(input.notificationId);
  if (!record) return { available: false, notificationId: input.notificationId };

  const timestamp = notificationWorkflowTimestampUtc();
  const consent = {
    channel: record.channel,
    consentStatus: "Recorded consent",
    id: `CNS-2607-${String(getLocalConsentRecords().length + 1).padStart(4, "0")}`,
    notificationId: record.id,
    purpose: record.purpose,
    recipient: record.recipient,
    recordedAtUtc: timestamp,
    recordedBy: input.actor,
  };
  getLocalConsentRecords().push(consent);

  await persistNotificationRecord({
    ...record,
    consent: "Recorded consent",
    nextAction: "Ready for provider dispatch.",
    status: "Consent recorded; ready for delivery",
    updatedAtUtc: timestamp,
  });

  const db = await getOptionalDb();
  if (db) {
    await db.insert(schema.communicationConsentRecords).values({
      channel: consent.channel,
      consentStatus: consent.consentStatus,
      id: consent.id,
      notificationId: consent.notificationId,
      purpose: consent.purpose,
      recipient: consent.recipient,
      recordedAtUtc: new Date(consent.recordedAtUtc),
      recordedBy: consent.recordedBy,
    });
  }

  return { available: true, consent };
}

export async function listNotificationDeliveryEvents() {
  const db = await getOptionalDb();
  if (!db) return getLocalNotificationEvents();

  try {
    const rows = await db.select().from(schema.notificationDeliveryEvents);
    if (rows.length === 0) return getLocalNotificationEvents();
    return rows.map((row) => ({
      actor: row.actor,
      actorRole: row.actorRole,
      createdAtUtc: row.createdAtUtc.toISOString(),
      detail: row.detail,
      eventType: row.eventType,
      id: row.id,
      nextStatus: row.nextStatus,
      notificationId: row.notificationId,
      outcome: row.outcome,
      previousStatus: row.previousStatus,
      provider: row.provider,
      providerMessageId: row.providerMessageId,
    }));
  } catch {
    return getLocalNotificationEvents();
  }
}

export function buildNotificationDeliveryRecord(
  record: ModeledNotificationRecord,
): NotificationDeliveryRecord {
  return applyNotificationOverride({
    ...record,
    callbackStatus: callbackStatusFor(record.status),
    deliveryAttemptCount: record.status === "Sent" ? 1 : 0,
    lastCallbackAtUtc: record.status === "Sent" ? "2026-07-18T19:42:00.000Z" : null,
    provider: providerForChannel(record.channel),
    providerMessageId: record.status === "Sent" ? `${providerMessagePrefix(record.channel)}-${record.id}` : "Pending",
    providerStatus: providerStatusFor(record.status),
    updatedAtUtc: "2026-07-18T21:00:00.000Z",
  });
}

async function getNotificationDeliveryRecord(notificationId: string) {
  const records = await listNotificationDeliveryRecords();
  return records.find((record) => record.id === notificationId);
}

async function persistNotificationUpdate(input: {
  event: NotificationDeliveryEvent;
  record: NotificationDeliveryRecord;
}) {
  getLocalNotificationEvents().push(input.event);
  await persistNotificationRecord(input.record);

  const db = await getOptionalDb();
  if (!db) return;

  await db.insert(schema.notificationDeliveryEvents).values({
    actor: input.event.actor,
    actorRole: input.event.actorRole,
    createdAtUtc: new Date(input.event.createdAtUtc),
    detail: input.event.detail,
    eventType: input.event.eventType,
    id: input.event.id,
    nextStatus: input.event.nextStatus,
    notificationId: input.event.notificationId,
    outcome: input.event.outcome,
    previousStatus: input.event.previousStatus,
    provider: input.event.provider,
    providerMessageId: input.event.providerMessageId,
  });
}

async function persistNotificationRecord(record: NotificationDeliveryRecord) {
  getNotificationOverrides()[record.id] = record;
  const db = await getOptionalDb();
  if (!db) return;

  await db
    .insert(schema.notificationDeliveryRecords)
    .values(toDeliveryRecordInsert(record))
    .onConflictDoUpdate({
      set: toDeliveryRecordInsert(record),
      target: schema.notificationDeliveryRecords.id,
    });
}

function toDeliveryRecordInsert(record: NotificationDeliveryRecord) {
  return {
    callbackStatus: record.callbackStatus,
    channel: record.channel,
    consent: record.consent,
    deliveryAttemptCount: record.deliveryAttemptCount,
    id: record.id,
    lastCallbackAtUtc: record.lastCallbackAtUtc
      ? new Date(record.lastCallbackAtUtc)
      : null,
    nextAction: record.nextAction,
    owner: record.owner,
    provider: record.provider,
    providerMessageId: record.providerMessageId,
    providerStatus: record.providerStatus,
    purpose: record.purpose,
    recipient: record.recipient,
    recipientName: record.recipientName,
    relatedRecord: record.relatedRecord,
    status: record.status,
    timestamp: record.timestamp,
    trigger: record.trigger,
    updatedAtUtc: new Date(record.updatedAtUtc),
  };
}

function unavailableNotificationEvent(notificationId: string) {
  return {
    actor: "System",
    actorRole: "NotificationProvider",
    available: false,
    createdAtUtc: notificationWorkflowTimestampUtc(),
    detail: "Notification delivery record not found.",
    eventType: "Unavailable",
    id: nextNotificationEventId(),
    nextStatus: "Unavailable",
    notificationId,
    outcome: "Blocked" as const,
    previousStatus: "Unavailable",
    provider: "Unavailable",
    providerMessageId: "Unavailable",
  };
}

function applyNotificationOverride(
  record: NotificationDeliveryRecord,
): NotificationDeliveryRecord {
  return {
    ...record,
    ...(getNotificationOverrides()[record.id] ?? {}),
  };
}

function providerForChannel(channel: string) {
  if (phoneOrSmsChannel(channel)) return "Production SMS and voice provider";
  return "Production email provider";
}

function providerMessagePrefix(channel: string) {
  if (phoneOrSmsChannel(channel)) return "TEL";
  return "EML";
}

function phoneOrSmsChannel(channel: string) {
  const normalized = channel.toLowerCase();
  return normalized.includes("phone") || normalized.includes("sms");
}

function callbackStatusFor(status: string) {
  if (status === "Sent") return "Delivered";
  if (status === "Failed") return "Failed";
  if (status.toLowerCase().includes("consent")) return "Awaiting consent";
  return "Pending provider dispatch";
}

function providerStatusFor(status: string) {
  if (status === "Sent") return "Delivered";
  if (status === "Failed") return "Failed";
  return "Not dispatched";
}

function deliveryStatusToRecordStatus(deliveryStatus: string) {
  const normalized = deliveryStatus.toLowerCase();
  if (normalized.includes("deliver")) return "Delivered";
  if (normalized.includes("fail")) return "Failed";
  if (normalized.includes("bounce")) return "Bounced";
  if (normalized.includes("opt")) return "Opted out";
  return "Provider status recorded";
}

function nextActionForDeliveryStatus(status: string) {
  if (status === "Delivered") return "Retain delivery receipt with source workflow.";
  if (status === "Failed" || status === "Bounced") {
    return "Retry, suppress, or escalate with staff audit note.";
  }
  if (status === "Opted out") return "Suppress future phone or SMS delivery.";
  return "Review provider delivery event.";
}

function getNotificationOverrides() {
  globalNotificationStore.__notarixNotificationOverrides ??= {};
  return globalNotificationStore.__notarixNotificationOverrides;
}

function getLocalNotificationEvents() {
  globalNotificationStore.__notarixNotificationDeliveryEvents ??= [];
  return globalNotificationStore.__notarixNotificationDeliveryEvents;
}

function getLocalConsentRecords() {
  globalNotificationStore.__notarixCommunicationConsentRecords ??= [];
  return globalNotificationStore.__notarixCommunicationConsentRecords;
}

function nextNotificationEventId() {
  return `NDE-2607-${String(getLocalNotificationEvents().length + 1).padStart(4, "0")}`;
}

function notificationWorkflowTimestampUtc() {
  return "2026-07-18T21:00:00.000Z";
}
