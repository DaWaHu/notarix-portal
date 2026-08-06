import type {
  OptimisticVersionRequirement,
  OrderAuditEvent,
  OrderHoldReason,
  OrderIdempotencyRecord,
  OrderStatus,
  PlaceOrderHoldRequest,
  PortalActorRole,
} from "../order-contracts/index.ts";
import { orderHoldReasons } from "../order-contracts/index.ts";

export type OrderAccessFacts = {
  actorOrganizationIds: readonly string[];
  actorUserId: string;
  assignedNotaryUserId?: string;
  clientOrganizationId: string;
  orderId: string;
  role: PortalActorRole;
  roleActive: boolean;
  staffOrderScope: boolean;
  userActive: boolean;
};

export type AuthorizationDecision =
  | { allowed: true }
  | {
      allowed: false;
      reason:
        | "USER_INACTIVE"
        | "ROLE_INACTIVE"
        | "ROLE_FORBIDDEN"
        | "ORDER_OUT_OF_SCOPE"
        | "CROSS_CLIENT"
        | "CROSS_NOTARY";
    };

export type HoldTransitionDecision =
  | { allowed: true; nextStatus: "OPERATIONAL_HOLD" }
  | {
      allowed: false;
      reason: "ALREADY_ON_HOLD" | "TERMINAL_STATE";
    };

export type IdempotencyDecision =
  | { kind: "NEW" }
  | { kind: "REPLAY"; response: OrderIdempotencyRecord["response"] }
  | { kind: "CONFLICT" };

const staffReadRoles = new Set<PortalActorRole>([
  "GEN_ADMIN",
  "ADMIN",
  "SUPER_ADMIN",
]);
const holdRoles = new Set<PortalActorRole>(["ADMIN", "SUPER_ADMIN"]);
const terminalStatuses = new Set<OrderStatus>(["CLOSED", "CANCELLED"]);

export function authorizeOrderRead(facts: OrderAccessFacts): AuthorizationDecision {
  const active = activeActorDecision(facts);
  if (!active.allowed) return active;

  if (staffReadRoles.has(facts.role)) {
    return facts.staffOrderScope
      ? { allowed: true }
      : { allowed: false, reason: "ORDER_OUT_OF_SCOPE" };
  }
  if (facts.role === "CLIENT") {
    return facts.actorOrganizationIds.includes(facts.clientOrganizationId)
      ? { allowed: true }
      : { allowed: false, reason: "CROSS_CLIENT" };
  }
  if (facts.role === "NOTARY") {
    return facts.assignedNotaryUserId === facts.actorUserId
      ? { allowed: true }
      : { allowed: false, reason: "CROSS_NOTARY" };
  }
  return { allowed: false, reason: "ROLE_FORBIDDEN" };
}

export function authorizePlaceOrderHold(
  facts: OrderAccessFacts,
): AuthorizationDecision {
  const read = authorizeOrderRead(facts);
  if (!read.allowed) return read;
  return holdRoles.has(facts.role)
    ? { allowed: true }
    : { allowed: false, reason: "ROLE_FORBIDDEN" };
}

export function isValidHoldReason(value: unknown): value is OrderHoldReason {
  return (
    typeof value === "string" &&
    orderHoldReasons.includes(value as OrderHoldReason)
  );
}

export function evaluateHoldTransition(status: OrderStatus): HoldTransitionDecision {
  if (status === "OPERATIONAL_HOLD") {
    return { allowed: false, reason: "ALREADY_ON_HOLD" };
  }
  if (terminalStatuses.has(status)) {
    return { allowed: false, reason: "TERMINAL_STATE" };
  }
  return { allowed: true, nextStatus: "OPERATIONAL_HOLD" };
}

export function hasVersionConflict(
  requirement: OptimisticVersionRequirement,
): boolean {
  return requirement.currentVersion !== requirement.expectedVersion;
}

export function evaluateIdempotency(
  existing: OrderIdempotencyRecord | undefined,
  input: {
    actorUserId: string;
    idempotencyKey: string;
    orderId: string;
    payloadFingerprint: string;
  },
): IdempotencyDecision {
  if (!existing) return { kind: "NEW" };
  const sameScope =
    existing.actorUserId === input.actorUserId &&
    existing.idempotencyKey === input.idempotencyKey &&
    existing.orderId === input.orderId &&
    existing.operation === "ORDER_PLACE_HOLD";
  if (sameScope && existing.payloadFingerprint === input.payloadFingerprint) {
    return { kind: "REPLAY", response: existing.response };
  }
  return { kind: "CONFLICT" };
}

export function requiredHoldAuditFields(
  input: PlaceOrderHoldRequest,
  actor: {
    actorUserId: string;
    correlationId: string;
    effectiveRoleAssignmentId: string;
    eventId: string;
    occurredAtUtc: string;
  },
  previousStatus: OrderStatus,
): OrderAuditEvent {
  return {
    action: "ORDER_PLACE_HOLD",
    actorUserId: actor.actorUserId,
    authorizationDecision: "ALLOWED",
    correlationId: actor.correlationId,
    effectiveRoleAssignmentId: actor.effectiveRoleAssignmentId,
    eventId: actor.eventId,
    nextStatus: "OPERATIONAL_HOLD",
    occurredAtUtc: actor.occurredAtUtc,
    orderId: input.orderId,
    previousStatus,
    reasonCode: input.reasonCode,
  };
}

function activeActorDecision(facts: OrderAccessFacts): AuthorizationDecision {
  if (!facts.userActive) return { allowed: false, reason: "USER_INACTIVE" };
  if (!facts.roleActive) return { allowed: false, reason: "ROLE_INACTIVE" };
  return { allowed: true };
}
