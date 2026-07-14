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

export const orderRepositoryPersistenceContract = {
  sourceOfTruth: "Order remains the central system record for Notarix Signings.",
  currentMode: "Seed-backed repository with schema-ready D1 persistence boundary.",
  productionBinding:
    "Replace repository reads with D1 queries and UTC writes without changing page composition.",
  requiredControls:
    "RBAC, MFA/passkeys, audit attribution, document custody, delivery receipts, and financial release authority.",
} as const;

export function listOrderOperations() {
  return cloneRecords(orderOperationRecords);
}

export function getOrderOperation(orderId: string) {
  const order = findOrderOperationRecord(orderId);
  return order ? cloneRecord(order) : undefined;
}

export function listNotaryAssignments() {
  return cloneRecords(notaryAssignmentRecords);
}

export function listOrderDocuments(orderId: string) {
  return cloneRecords(documentsForOrder(orderId));
}

export function listOrderLifecycle(orderId: string) {
  return cloneRecords(lifecycleForOrder(orderId));
}

export function listOrderCompletionControls(orderId: string) {
  return cloneRecords(completionControlsForOrder(orderId));
}

export function listOrderCloseoutControls(orderId?: string) {
  return cloneRecords(
    orderId ? closeoutControlsForOrder(orderId) : orderCloseoutRecords,
  );
}

export function listOrderDeliveryReceipts(orderId: string) {
  return cloneRecords(deliveryReceiptsForOrder(orderId));
}

export function listNotaryCompletionReceipts(orderId: string) {
  return cloneRecords(notaryCompletionReceiptsForOrder(orderId));
}

export function listAppointmentConfirmations() {
  return cloneRecords(appointmentConfirmationRecords);
}

export function listSignerReadiness() {
  return cloneRecords(signerReadinessRecords);
}

export function listOrderSigners(orderId: string) {
  return cloneRecords(signersForOrder(orderId));
}

export function listOrderLifecycleIntakeRecords() {
  return cloneRecords(orderLifecycleIntakeRecords);
}
