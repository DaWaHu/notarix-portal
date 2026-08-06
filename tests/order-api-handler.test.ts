import assert from "node:assert/strict";
import test from "node:test";
import type { OrderProjection } from "../packages/order-contracts/index.ts";
import {
  createOrderApiHandler,
  type OrderApiDependencies,
  type OrderApiEvent,
} from "../services/order-api/handler.ts";

const order: OrderProjection = {
  appointmentAtUtc: "2026-08-07T22:00:00Z",
  assignmentStatus: "Pending",
  documentReadiness: "Restricted",
  id: "ORD-NC-2607-0001",
  jurisdiction: "NC",
  nextAction: "Complete assignment review",
  risk: "Standard",
  serviceType: "Traditional Notarization",
  status: "ASSIGNED",
  updatedAtUtc: "2026-08-06T20:00:00Z",
  version: 7,
};

function dependencies(
  overrides: Partial<OrderApiDependencies> = {},
): OrderApiDependencies {
  return {
    async getOrder() {
      return order;
    },
    async placeHold(input) {
      return {
        auditReceiptId: "aud_preview_001",
        correlationId: input.correlationId,
        newStatus: "OPERATIONAL_HOLD",
        occurredAtUtc: "2026-08-06T21:00:00Z",
        orderId: input.orderId,
        previousStatus: "ASSIGNED",
        replayed: false,
        version: 8,
      };
    },
    async resolveActor() {
      return {
        access: {
          actorOrganizationIds: [],
          actorUserId: "usr_preview_admin",
          clientOrganizationId: "org_preview_client",
          orderId: order.id,
          role: "ADMIN",
          roleActive: true,
          staffOrderScope: true,
          userActive: true,
        },
        roleAssignmentId: "role_preview_admin",
      };
    },
    ...overrides,
  };
}

function event(routeKey: string): OrderApiEvent {
  return {
    headers: { "Idempotency-Key": "11111111-1111-4111-8111-111111111111" },
    pathParameters: { orderId: order.id },
    requestContext: {
      authorizer: { jwt: { claims: { sub: "cognito-preview-subject" } } },
      requestId: "cor_preview_001",
    },
    routeKey,
  };
}

test("denies anonymous requests before resolving any Order", async () => {
  let queried = false;
  const handler = createOrderApiHandler(dependencies({
    async getOrder() {
      queried = true;
      return order;
    },
  }));
  const result = await handler({
    pathParameters: { orderId: order.id },
    routeKey: "GET /v1/orders/{orderId}",
  });
  assert.equal(result.statusCode, 401);
  assert.equal(queried, false);
});

test("returns only the minimal Order projection with defensive headers", async () => {
  const handler = createOrderApiHandler(dependencies());
  const result = await handler(event("GET /v1/orders/{orderId}"));
  assert.equal(result.statusCode, 200);
  assert.equal(result.headers["Cache-Control"], "no-store");
  assert.equal(result.headers.ETag, '"7"');
  assert.deepEqual(JSON.parse(result.body).order, order);
});

test("denies a cross-client read using server-resolved scope", async () => {
  const base = dependencies();
  const handler = createOrderApiHandler(dependencies({
    async resolveActor(input) {
      const actor = await base.resolveActor(input);
      if (!actor) return null;
      return {
        ...actor,
        access: {
          ...actor.access,
          actorOrganizationIds: ["org_other"],
          role: "CLIENT",
          staffOrderScope: false,
        },
      };
    },
  }));
  assert.equal(
    (await handler(event("GET /v1/orders/{orderId}"))).statusCode,
    403,
  );
});

test("denies General Admin hold before mutation", async () => {
  let mutated = false;
  const base = dependencies();
  const handler = createOrderApiHandler(dependencies({
    async placeHold() {
      mutated = true;
      throw new Error("must not run");
    },
    async resolveActor(input) {
      const actor = await base.resolveActor(input);
      return actor
        ? { ...actor, access: { ...actor.access, role: "GEN_ADMIN" } }
        : null;
    },
  }));
  const holdEvent = event("POST /v1/orders/{orderId}/actions/place-hold");
  holdEvent.body = JSON.stringify({
    expectedVersion: 7,
    reasonCode: "COMPLIANCE_REVIEW",
  });
  assert.equal((await handler(holdEvent)).statusCode, 403);
  assert.equal(mutated, false);
});

test("rejects optimistic version conflict before mutation", async () => {
  let mutated = false;
  const handler = createOrderApiHandler(dependencies({
    async placeHold() {
      mutated = true;
      throw new Error("must not run");
    },
  }));
  const holdEvent = event("POST /v1/orders/{orderId}/actions/place-hold");
  holdEvent.body = JSON.stringify({
    expectedVersion: 6,
    reasonCode: "COMPLIANCE_REVIEW",
  });
  assert.equal((await handler(holdEvent)).statusCode, 409);
  assert.equal(mutated, false);
});

test("passes trusted actor and concurrency controls to the atomic hold port", async () => {
  let captured: Parameters<OrderApiDependencies["placeHold"]>[0] | undefined;
  const handler = createOrderApiHandler(dependencies({
    async placeHold(input) {
      captured = input;
      return {
        auditReceiptId: "aud_preview_001",
        correlationId: input.correlationId,
        newStatus: "OPERATIONAL_HOLD",
        occurredAtUtc: "2026-08-06T21:00:00Z",
        orderId: input.orderId,
        previousStatus: "ASSIGNED",
        replayed: false,
        version: 8,
      };
    },
  }));
  const holdEvent = event("POST /v1/orders/{orderId}/actions/place-hold");
  holdEvent.body = JSON.stringify({
    expectedVersion: 7,
    reasonCode: "COMPLIANCE_REVIEW",
  });
  assert.equal((await handler(holdEvent)).statusCode, 200);
  assert.equal(captured?.actorUserId, "usr_preview_admin");
  assert.equal(captured?.roleAssignmentId, "role_preview_admin");
  assert.equal(captured?.idempotencyKey, "11111111-1111-4111-8111-111111111111");
});
