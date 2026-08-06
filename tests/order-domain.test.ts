import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  validateAuditEvent,
  validateGetOrderRequest,
  validateGetOrderResponse,
  validatePlaceOrderHoldRequest,
  type GetOrderResponse,
  type OrderIdempotencyRecord,
  type PlaceOrderHoldRequest,
} from "../packages/order-contracts/index.ts";
import {
  authorizeOrderRead,
  authorizePlaceOrderHold,
  evaluateHoldTransition,
  evaluateIdempotency,
  hasVersionConflict,
  isValidHoldReason,
  requiredHoldAuditFields,
  type OrderAccessFacts,
} from "../packages/order-domain/index.ts";
import { orderSeedFallbackAllowed } from "../app/order-seed-policy.ts";

const validOrderResponse: GetOrderResponse = {
  correlationId: "cor_93fe1127",
  order: {
    appointmentAtUtc: "2026-08-07T22:00:00Z",
    assignmentStatus: "Pending",
    documentReadiness: "Restricted",
    id: "ORD-NC-2607-0001",
    jurisdiction: "NC",
    nextAction: "Complete assignment review",
    risk: "Standard",
    serviceType: "Traditional Notarization",
    status: "ASSIGNMENT_QUEUED",
    updatedAtUtc: "2026-08-06T20:00:00Z",
    version: 7,
  },
};

const validHoldRequest: PlaceOrderHoldRequest = {
  expectedVersion: 7,
  idempotencyKey: "2ebf7e5e-d8c2-4b74-b651-ffbf4d6db223",
  note: "Validated documents require administrator review.",
  orderId: "ORD-NC-2607-0001",
  reasonCode: "DOCUMENT_REVIEW",
};

const staffFacts: OrderAccessFacts = {
  actorOrganizationIds: [],
  actorUserId: "usr_staff_001",
  clientOrganizationId: "org_client_001",
  orderId: "ORD-NC-2607-0001",
  role: "ADMIN",
  roleActive: true,
  staffOrderScope: true,
  userActive: true,
};

test("valid Order read request and minimal response satisfy the contract", () => {
  assert.deepEqual(validateGetOrderRequest({ orderId: validOrderResponse.order.id }), {
    ok: true,
    value: { orderId: validOrderResponse.order.id },
  });
  assert.equal(validateGetOrderResponse(validOrderResponse).ok, true);
});

test("Order response rejects prohibited sensitive fields", () => {
  for (const field of [
    "signerName",
    "exactAddress",
    "billingStatus",
    "documentStorageKey",
    "internalNote",
    "databaseUrl",
  ]) {
    const response = structuredClone(validOrderResponse) as unknown as Record<
      string,
      Record<string, unknown>
    >;
    response.order[field] = "prohibited";
    const result = validateGetOrderResponse(response);
    assert.equal(result.ok, false, field);
  }
});

test("unauthorized role cannot read an Order", () => {
  const result = authorizeOrderRead({ ...staffFacts, role: "OBSERVER" });
  assert.deepEqual(result, { allowed: false, reason: "ROLE_FORBIDDEN" });
});

test("client can read only Orders owned by an active organization membership", () => {
  const client = {
    ...staffFacts,
    actorOrganizationIds: ["org_client_001"],
    role: "CLIENT" as const,
    staffOrderScope: false,
  };
  assert.deepEqual(authorizeOrderRead(client), { allowed: true });
  assert.deepEqual(
    authorizeOrderRead({ ...client, actorOrganizationIds: ["org_other"] }),
    { allowed: false, reason: "CROSS_CLIENT" },
  );
});

test("notary can read only an actively assigned Order", () => {
  const notary = {
    ...staffFacts,
    actorUserId: "usr_notary_001",
    assignedNotaryUserId: "usr_notary_001",
    role: "NOTARY" as const,
    staffOrderScope: false,
  };
  assert.deepEqual(authorizeOrderRead(notary), { allowed: true });
  assert.deepEqual(
    authorizeOrderRead({ ...notary, assignedNotaryUserId: "usr_notary_002" }),
    { allowed: false, reason: "CROSS_NOTARY" },
  );
});

test("Admin and Super Admin may place an Order on hold", () => {
  assert.deepEqual(authorizePlaceOrderHold(staffFacts), { allowed: true });
  assert.deepEqual(
    authorizePlaceOrderHold({ ...staffFacts, role: "SUPER_ADMIN" }),
    { allowed: true },
  );
});

test("General Admin, client, and notary cannot place an Order on hold", () => {
  for (const role of ["GEN_ADMIN", "CLIENT", "NOTARY"] as const) {
    const facts: OrderAccessFacts = {
      ...staffFacts,
      actorOrganizationIds:
        role === "CLIENT" ? [staffFacts.clientOrganizationId] : [],
      assignedNotaryUserId:
        role === "NOTARY" ? staffFacts.actorUserId : undefined,
      role,
    };
    assert.deepEqual(authorizePlaceOrderHold(facts), {
      allowed: false,
      reason: "ROLE_FORBIDDEN",
    });
  }
});

test("inactive users and revoked roles are denied server-side", () => {
  assert.deepEqual(authorizeOrderRead({ ...staffFacts, userActive: false }), {
    allowed: false,
    reason: "USER_INACTIVE",
  });
  assert.deepEqual(authorizeOrderRead({ ...staffFacts, roleActive: false }), {
    allowed: false,
    reason: "ROLE_INACTIVE",
  });
});

test("hold request requires valid reason, version, and idempotency key", () => {
  assert.equal(validatePlaceOrderHoldRequest(validHoldRequest).ok, true);
  assert.equal(isValidHoldReason(validHoldRequest.reasonCode), true);

  for (const invalid of [
    { ...validHoldRequest, reasonCode: "ANY_REASON" },
    { ...validHoldRequest, expectedVersion: 0 },
    { ...validHoldRequest, idempotencyKey: "" },
    { ...validHoldRequest, note: "<script>unsafe</script>" },
  ]) {
    assert.equal(validatePlaceOrderHoldRequest(invalid).ok, false);
  }
});

test("missing idempotency key is rejected", () => {
  const { idempotencyKey: _removed, ...request } = validHoldRequest;
  void _removed;
  assert.equal(validatePlaceOrderHoldRequest(request).ok, false);
});

test("terminal and duplicate hold transitions are denied", () => {
  assert.deepEqual(evaluateHoldTransition("CLOSED"), {
    allowed: false,
    reason: "TERMINAL_STATE",
  });
  assert.deepEqual(evaluateHoldTransition("CANCELLED"), {
    allowed: false,
    reason: "TERMINAL_STATE",
  });
  assert.deepEqual(evaluateHoldTransition("OPERATIONAL_HOLD"), {
    allowed: false,
    reason: "ALREADY_ON_HOLD",
  });
  assert.deepEqual(evaluateHoldTransition("ASSIGNED"), {
    allowed: true,
    nextStatus: "OPERATIONAL_HOLD",
  });
});

test("optimistic version mismatch is a conflict", () => {
  assert.equal(hasVersionConflict({ currentVersion: 8, expectedVersion: 7 }), true);
  assert.equal(hasVersionConflict({ currentVersion: 7, expectedVersion: 7 }), false);
});

test("duplicate idempotency key replays only the identical scoped request", () => {
  const response = {
    auditReceiptId: "aud_001",
    correlationId: "cor_001",
    newStatus: "OPERATIONAL_HOLD" as const,
    occurredAtUtc: "2026-08-06T20:00:00Z",
    orderId: validHoldRequest.orderId,
    previousStatus: "ASSIGNED" as const,
    replayed: false,
    version: 8,
  };
  const existing: OrderIdempotencyRecord = {
    actorUserId: staffFacts.actorUserId,
    idempotencyKey: validHoldRequest.idempotencyKey,
    operation: "ORDER_PLACE_HOLD",
    orderId: validHoldRequest.orderId,
    payloadFingerprint: "sha256:abc",
    response,
  };
  assert.deepEqual(
    evaluateIdempotency(existing, {
      actorUserId: staffFacts.actorUserId,
      idempotencyKey: validHoldRequest.idempotencyKey,
      orderId: validHoldRequest.orderId,
      payloadFingerprint: "sha256:abc",
    }),
    { kind: "REPLAY", response },
  );
  assert.deepEqual(
    evaluateIdempotency(existing, {
      actorUserId: staffFacts.actorUserId,
      idempotencyKey: validHoldRequest.idempotencyKey,
      orderId: validHoldRequest.orderId,
      payloadFingerprint: "sha256:changed",
    }),
    { kind: "CONFLICT" },
  );
});

test("hold audit event includes every attributable atomic requirement", () => {
  const event = requiredHoldAuditFields(
    validHoldRequest,
    {
      actorUserId: staffFacts.actorUserId,
      correlationId: "cor_001",
      effectiveRoleAssignmentId: "role_001",
      eventId: "evt_001",
      occurredAtUtc: "2026-08-06T20:00:00Z",
    },
    "ASSIGNED",
  );
  assert.equal(validateAuditEvent(event).ok, true);
  assert.equal(event.authorizationDecision, "ALLOWED");
  assert.equal(event.nextStatus, "OPERATIONAL_HOLD");
});

test("audit event validator rejects missing actor attribution", () => {
  const event = requiredHoldAuditFields(
    validHoldRequest,
    {
      actorUserId: "",
      correlationId: "cor_001",
      effectiveRoleAssignmentId: "role_001",
      eventId: "evt_001",
      occurredAtUtc: "2026-08-06T20:00:00Z",
    },
    "ASSIGNED",
  );
  assert.equal(validateAuditEvent(event).ok, false);
});

test("Order domain layer has no database, AWS, Vercel, HTTP, or browser dependency", async () => {
  const source = await readFile(
    new URL("../packages/order-domain/index.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    source,
    /from\s+["'](?:drizzle|postgres|@aws-sdk|next\/)|process\.env|globalThis\.(?:window|document)|fetch\s*\(/i,
  );
});

test("Production Order paths prohibit synthetic seed fallback", () => {
  assert.equal(orderSeedFallbackAllowed({ VERCEL_ENV: "production" }), false);
  assert.equal(
    orderSeedFallbackAllowed({ NOTARIX_DATABASE_ENVIRONMENT: "production" }),
    false,
  );
  assert.equal(orderSeedFallbackAllowed({ VERCEL_ENV: "preview" }), true);
  assert.equal(orderSeedFallbackAllowed({ NOTARIX_BUILD_MODE: "1" }), true);
});
