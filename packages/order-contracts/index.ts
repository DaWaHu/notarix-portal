export const ORDER_ID_PATTERN = /^ORD-[A-Z]{2}-\d{4}-\d{4}$/;
export const IDEMPOTENCY_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const portalActorRoles = [
  "SUPER_ADMIN",
  "ADMIN",
  "GEN_ADMIN",
  "NOTARY",
  "CLIENT",
  "OBSERVER",
] as const;

export const orderHoldReasons = [
  "DOCUMENT_REVIEW",
  "IDENTITY_REVIEW",
  "NOTARY_ELIGIBILITY",
  "CLIENT_REQUEST",
  "COMPLIANCE_REVIEW",
  "OPERATIONAL_RISK",
] as const;

export const orderStatuses = [
  "INTAKE",
  "ASSIGNMENT_QUEUED",
  "ASSIGNED",
  "APPOINTMENT_CONFIRMED",
  "IN_PROGRESS",
  "OPERATIONAL_HOLD",
  "COMPLETION_REVIEW",
  "CLOSED",
  "CANCELLED",
] as const;

export type PortalActorRole = (typeof portalActorRoles)[number];
export type OrderHoldReason = (typeof orderHoldReasons)[number];
export type OrderStatus = (typeof orderStatuses)[number];

export type GetOrderRequest = {
  orderId: string;
};

export type OrderProjection = {
  appointmentAtUtc: string;
  assignmentStatus: string;
  documentReadiness: string;
  id: string;
  jurisdiction: string;
  nextAction: string;
  risk: "Standard" | "Elevated";
  serviceType: string;
  status: OrderStatus;
  updatedAtUtc: string;
  version: number;
};

export type GetOrderResponse = {
  correlationId: string;
  order: OrderProjection;
};

export type PlaceOrderHoldRequest = {
  expectedVersion: number;
  idempotencyKey: string;
  note?: string;
  orderId: string;
  reasonCode: OrderHoldReason;
};

export type PlaceOrderHoldResponse = {
  auditReceiptId: string;
  correlationId: string;
  newStatus: "OPERATIONAL_HOLD";
  occurredAtUtc: string;
  orderId: string;
  previousStatus: OrderStatus;
  replayed: boolean;
  version: number;
};

export const orderApiErrorCodes = [
  "AUTHENTICATION_REQUIRED",
  "ORDER_ACTION_FORBIDDEN",
  "ORDER_NOT_FOUND",
  "VALIDATION_FAILED",
  "VERSION_CONFLICT",
  "IDEMPOTENCY_CONFLICT",
  "INVALID_STATE_TRANSITION",
  "RATE_LIMITED",
  "SERVICE_UNAVAILABLE",
  "INTERNAL_ERROR",
] as const;

export type OrderApiErrorCode = (typeof orderApiErrorCodes)[number];

export type OrderApiError = {
  code: OrderApiErrorCode;
  correlationId: string;
  message: string;
  retryable: boolean;
};

export type OrderAuthorizationRequirement = {
  authoritativeSources: readonly [
    "verified-cognito-subject",
    "active-portal-user",
    "active-role-assignment",
    "server-resolved-order-scope",
  ];
  operation: "order:read" | "order:place-hold";
  permittedRoles: readonly PortalActorRole[];
};

export const getOrderAuthorization: OrderAuthorizationRequirement = {
  authoritativeSources: [
    "verified-cognito-subject",
    "active-portal-user",
    "active-role-assignment",
    "server-resolved-order-scope",
  ],
  operation: "order:read",
  permittedRoles: ["GEN_ADMIN", "ADMIN", "SUPER_ADMIN", "CLIENT", "NOTARY"],
};

export const placeOrderHoldAuthorization: OrderAuthorizationRequirement = {
  authoritativeSources: [
    "verified-cognito-subject",
    "active-portal-user",
    "active-role-assignment",
    "server-resolved-order-scope",
  ],
  operation: "order:place-hold",
  permittedRoles: ["ADMIN", "SUPER_ADMIN"],
};

export type OrderAuditEvent = {
  action: "ORDER_READ" | "ORDER_PLACE_HOLD";
  actorUserId: string;
  authorizationDecision: "ALLOWED" | "DENIED";
  correlationId: string;
  effectiveRoleAssignmentId: string;
  eventId: string;
  idempotencyKeyFingerprint?: string;
  nextStatus?: OrderStatus;
  occurredAtUtc: string;
  orderId: string;
  previousStatus?: OrderStatus;
  reasonCode?: OrderHoldReason;
};

export type OrderIdempotencyRecord = {
  actorUserId: string;
  idempotencyKey: string;
  operation: "ORDER_PLACE_HOLD";
  orderId: string;
  payloadFingerprint: string;
  response: PlaceOrderHoldResponse;
};

export type OptimisticVersionRequirement = {
  currentVersion: number;
  expectedVersion: number;
};

export type ValidationIssue = {
  field: string;
  message: string;
};

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { issues: ValidationIssue[]; ok: false };

const prohibitedProjectionFields = new Set([
  "signerName",
  "signerEmail",
  "signerPhone",
  "clientEmail",
  "clientContact",
  "exactAddress",
  "location",
  "billingStatus",
  "payableStatus",
  "documentStorageKey",
  "objectKey",
  "internalNote",
  "databaseUrl",
  "infrastructureMetadata",
]);

export function validateGetOrderRequest(input: unknown): ValidationResult<GetOrderRequest> {
  if (!isRecord(input) || typeof input.orderId !== "string") {
    return invalid("orderId", "Order ID is required.");
  }
  if (!ORDER_ID_PATTERN.test(input.orderId)) {
    return invalid("orderId", "Order ID format is invalid.");
  }
  return { ok: true, value: { orderId: input.orderId } };
}

export function validatePlaceOrderHoldRequest(
  input: unknown,
): ValidationResult<PlaceOrderHoldRequest> {
  if (!isRecord(input)) return invalid("request", "Request body is required.");
  const allowed = new Set([
    "expectedVersion",
    "idempotencyKey",
    "note",
    "orderId",
    "reasonCode",
  ]);
  const unexpected = Object.keys(input).filter((key) => !allowed.has(key));
  if (unexpected.length) {
    return invalid(unexpected[0], "Unexpected request field.");
  }

  const issues: ValidationIssue[] = [];
  if (typeof input.orderId !== "string" || !ORDER_ID_PATTERN.test(input.orderId)) {
    issues.push({ field: "orderId", message: "Order ID format is invalid." });
  }
  if (
    typeof input.idempotencyKey !== "string" ||
    !IDEMPOTENCY_KEY_PATTERN.test(input.idempotencyKey)
  ) {
    issues.push({
      field: "idempotencyKey",
      message: "A UUID idempotency key is required.",
    });
  }
  if (!Number.isSafeInteger(input.expectedVersion) || Number(input.expectedVersion) < 1) {
    issues.push({
      field: "expectedVersion",
      message: "Expected version must be a positive integer.",
    });
  }
  if (
    typeof input.reasonCode !== "string" ||
    !orderHoldReasons.includes(input.reasonCode as OrderHoldReason)
  ) {
    issues.push({ field: "reasonCode", message: "Hold reason is invalid." });
  }
  if (input.note !== undefined) {
    if (typeof input.note !== "string") {
      issues.push({ field: "note", message: "Note must be text." });
    } else {
      const note = input.note.trim();
      if (!note || note.length > 500) {
        issues.push({ field: "note", message: "Note must contain 1 to 500 characters." });
      }
      if (/<[^>]+>/.test(note)) {
        issues.push({ field: "note", message: "HTML is not permitted." });
      }
    }
  }
  if (issues.length) return { issues, ok: false };

  return {
    ok: true,
    value: {
      expectedVersion: Number(input.expectedVersion),
      idempotencyKey: String(input.idempotencyKey),
      ...(input.note === undefined ? {} : { note: String(input.note).trim() }),
      orderId: String(input.orderId),
      reasonCode: input.reasonCode as OrderHoldReason,
    },
  };
}

export function validateGetOrderResponse(
  input: unknown,
): ValidationResult<GetOrderResponse> {
  if (!isRecord(input) || !isRecord(input.order)) {
    return invalid("order", "Order response is required.");
  }
  for (const field of prohibitedProjectionFields) {
    if (field in input.order) {
      return invalid(field, "Order response contains a prohibited field.");
    }
  }
  const order = input.order;
  const valid =
    typeof input.correlationId === "string" &&
    typeof order.id === "string" &&
    ORDER_ID_PATTERN.test(order.id) &&
    typeof order.status === "string" &&
    orderStatuses.includes(order.status as OrderStatus) &&
    typeof order.serviceType === "string" &&
    typeof order.jurisdiction === "string" &&
    typeof order.appointmentAtUtc === "string" &&
    typeof order.assignmentStatus === "string" &&
    typeof order.documentReadiness === "string" &&
    (order.risk === "Standard" || order.risk === "Elevated") &&
    typeof order.nextAction === "string" &&
    Number.isSafeInteger(order.version) &&
    Number(order.version) > 0 &&
    typeof order.updatedAtUtc === "string";

  if (!valid) return invalid("order", "Order response contract is invalid.");
  return { ok: true, value: input as GetOrderResponse };
}

export function validateAuditEvent(input: unknown): ValidationResult<OrderAuditEvent> {
  if (!isRecord(input)) return invalid("auditEvent", "Audit event is required.");
  for (const field of [
    "action",
    "actorUserId",
    "authorizationDecision",
    "correlationId",
    "effectiveRoleAssignmentId",
    "eventId",
    "occurredAtUtc",
    "orderId",
  ]) {
    if (typeof input[field] !== "string" || !String(input[field]).trim()) {
      return invalid(field, "Required audit field is missing.");
    }
  }
  if (!ORDER_ID_PATTERN.test(String(input.orderId))) {
    return invalid("orderId", "Audit Order ID is invalid.");
  }
  return { ok: true, value: input as OrderAuditEvent };
}

function invalid<T>(field: string, message: string): ValidationResult<T> {
  return { issues: [{ field, message }], ok: false };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
