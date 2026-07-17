import { eq } from "drizzle-orm";
import { getOptionalDb } from "../db";
import * as schema from "../db/schema";
import {
  appointmentConfirmationRecords,
  closeoutControlsForOrder,
  completionControlsForOrder,
  deliveryReceiptsForOrder,
  documentsForOrder,
  findOrderOperationRecord,
  lifecycleForOrder,
  notaryAssignmentRecords,
  notaryCompletionReceiptsForOrder,
  orderCloseoutRecords,
  orderLifecycleIntakeRecords,
  orderOperationRecords,
  signerReadinessRecords,
  signersForOrder,
} from "./operations-data";

const cloneRecord = <T extends Record<string, unknown>>(record: T): T => ({ ...record });
const cloneRecords = <T extends Record<string, unknown>>(records: readonly T[]): T[] =>
  records.map(cloneRecord);
const nowUtc = () => new Date();

export const orderRepositoryPersistenceContract = {
  sourceOfTruth: "Order remains the central system record for Notarix Signings.",
  currentMode: "Postgres-first repository with seed-backed local preview fallback.",
  productionBinding:
    "Order workflow actions update Postgres operational records when DATABASE_URL is present.",
  requiredControls:
    "RBAC, MFA/passkeys, audit attribution, document custody, delivery receipts, and financial release authority.",
} as const;

export async function listOrderOperations() {
  const db = await getOptionalDb();
  if (db) {
    try {
      const records = await db.select().from(schema.orderOperationalRecords);
      if (records.length > 0) return cloneRecords(records);
    } catch {
      return cloneRecords(orderOperationRecords);
    }
  }

  return cloneRecords(orderOperationRecords);
}

export async function getOrderOperation(orderId: string) {
  const db = await getOptionalDb();
  if (db) {
    try {
      const [record] = await db
        .select()
        .from(schema.orderOperationalRecords)
        .where(eq(schema.orderOperationalRecords.id, orderId.toUpperCase()))
        .limit(1);
      if (record) return cloneRecord(record);
    } catch {
      const order = findOrderOperationRecord(orderId);
      return order ? cloneRecord(order) : undefined;
    }
  }

  const order = findOrderOperationRecord(orderId);
  return order ? cloneRecord(order) : undefined;
}

export async function listNotaryAssignments() {
  const records = await listOrderOperations();
  if (records.length > 0) {
    return records.filter((order) => order.notary !== "Unassigned");
  }

  return cloneRecords(notaryAssignmentRecords);
}

export function listOrderDocuments(orderId: string) {
  return cloneRecords(documentsForOrder(orderId));
}

export async function listOrderLifecycle(orderId: string) {
  const db = await getOptionalDb();
  if (db) {
    try {
      const records = await db
        .select()
        .from(schema.orderLifecycleStages)
        .where(eq(schema.orderLifecycleStages.orderId, orderId.toUpperCase()));
      if (records.length > 0) return cloneRecords(records);
    } catch {
      return cloneRecords(lifecycleForOrder(orderId));
    }
  }

  return cloneRecords(lifecycleForOrder(orderId));
}

export function listOrderCompletionControls(orderId: string) {
  return cloneRecords(completionControlsForOrder(orderId));
}

export async function listOrderCloseoutControls(orderId?: string) {
  const db = await getOptionalDb();
  if (db) {
    try {
      const query = db.select().from(schema.orderCloseoutControls);
      const records = orderId
        ? await query.where(eq(schema.orderCloseoutControls.orderId, orderId.toUpperCase()))
        : await query;
      if (records.length > 0) return cloneRecords(records);
    } catch {
      return cloneRecords(
        orderId ? closeoutControlsForOrder(orderId) : orderCloseoutRecords,
      );
    }
  }

  return cloneRecords(
    orderId ? closeoutControlsForOrder(orderId) : orderCloseoutRecords,
  );
}

export async function listOrderDeliveryReceipts(orderId: string) {
  const db = await getOptionalDb();
  if (db) {
    try {
      const records = await db
        .select()
        .from(schema.orderDeliveryReceipts)
        .where(eq(schema.orderDeliveryReceipts.orderId, orderId.toUpperCase()));
      if (records.length > 0) return cloneRecords(records);
    } catch {
      return cloneRecords(deliveryReceiptsForOrder(orderId));
    }
  }

  return cloneRecords(deliveryReceiptsForOrder(orderId));
}

export async function listNotaryCompletionReceipts(orderId: string) {
  const db = await getOptionalDb();
  if (db) {
    try {
      const records = await db
        .select()
        .from(schema.notaryCompletionReceipts)
        .where(eq(schema.notaryCompletionReceipts.orderId, orderId.toUpperCase()));
      if (records.length > 0) return cloneRecords(records);
    } catch {
      return cloneRecords(notaryCompletionReceiptsForOrder(orderId));
    }
  }

  return cloneRecords(notaryCompletionReceiptsForOrder(orderId));
}

export async function listAppointmentConfirmations() {
  const db = await getOptionalDb();
  if (db) {
    try {
      const records = await db.select().from(schema.orderAppointments);
      if (records.length > 0) return cloneRecords(records);
    } catch {
      return cloneRecords(appointmentConfirmationRecords);
    }
  }

  return cloneRecords(appointmentConfirmationRecords);
}

export async function listSignerReadiness() {
  const db = await getOptionalDb();
  if (db) {
    try {
      const records = await db.select().from(schema.orderSignerReadiness);
      if (records.length > 0) return cloneRecords(records);
    } catch {
      return cloneRecords(signerReadinessRecords);
    }
  }

  return cloneRecords(signerReadinessRecords);
}

export async function listOrderSigners(orderId: string) {
  const db = await getOptionalDb();
  if (db) {
    try {
      const records = await db
        .select()
        .from(schema.orderSignerReadiness)
        .where(eq(schema.orderSignerReadiness.orderId, orderId.toUpperCase()));
      if (records.length > 0) return cloneRecords(records);
    } catch {
      return cloneRecords(signersForOrder(orderId));
    }
  }

  return cloneRecords(signersForOrder(orderId));
}

export function listOrderLifecycleIntakeRecords() {
  return cloneRecords(orderLifecycleIntakeRecords);
}

export async function persistOrderCommandTransition(input: {
  auditEvent: string;
  nextStatus: string;
  targetId: string;
}) {
  const db = await getOptionalDb();
  if (!db) {
    return {
      persisted: false,
      reason: "Postgres DATABASE_URL unavailable; command receipt remains in local preview store.",
    };
  }

  const targetId = input.targetId.toUpperCase();
  const seed = findOrderOperationRecord(targetId);
  const existing = await getOrderOperation(targetId);

  if (!seed && !existing) {
    return {
      persisted: false,
      reason: "Order target was not found in the repository.",
    };
  }

  const base = {
    ...(seed ? cloneRecord(seed) : {}),
    ...(existing ? cloneRecord(existing) : {}),
  } as typeof orderOperationRecords[number];
  const timestamp = nowUtc();

  await db
    .insert(schema.orderOperationalRecords)
    .values({
      ...base,
      createdAtUtc: timestamp,
      nextAction: input.auditEvent,
      orderStatus: input.nextStatus,
      updatedAtUtc: timestamp,
    })
    .onConflictDoUpdate({
      set: {
        nextAction: input.auditEvent,
        orderStatus: input.nextStatus,
        updatedAtUtc: timestamp,
      },
      target: schema.orderOperationalRecords.id,
    });

  return { persisted: true };
}
