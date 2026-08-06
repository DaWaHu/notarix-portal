import {
  validateGetOrderRequest,
  validateGetOrderResponse,
  validatePlaceOrderHoldRequest,
  type GetOrderResponse,
  type OrderApiError,
  type OrderProjection,
  type PlaceOrderHoldResponse,
} from "../../packages/order-contracts/index.ts";
import {
  authorizeOrderRead,
  authorizePlaceOrderHold,
  evaluateHoldTransition,
  hasVersionConflict,
  type OrderAccessFacts,
} from "../../packages/order-domain/index.ts";

type JwtClaims = Record<string, unknown>;

export type OrderApiEvent = {
  body?: string | null;
  headers?: Record<string, string | undefined>;
  pathParameters?: { orderId?: string };
  requestContext?: {
    authorizer?: { jwt?: { claims?: JwtClaims } };
    requestId?: string;
  };
  routeKey?: string;
};

export type OrderApiResult = {
  body: string;
  headers: Record<string, string>;
  statusCode: number;
};

export type ResolvedOrderActor = {
  access: OrderAccessFacts;
  roleAssignmentId: string;
};

export type OrderApiDependencies = {
  getOrder(orderId: string): Promise<OrderProjection | null>;
  placeHold(input: {
    actorUserId: string;
    correlationId: string;
    expectedVersion: number;
    idempotencyKey: string;
    note?: string;
    orderId: string;
    reasonCode: string;
    roleAssignmentId: string;
  }): Promise<PlaceOrderHoldResponse>;
  resolveActor(input: {
    claims: JwtClaims;
    orderId: string;
  }): Promise<ResolvedOrderActor | null>;
};

export function createOrderApiHandler(dependencies: OrderApiDependencies) {
  return async function handler(event: OrderApiEvent): Promise<OrderApiResult> {
    const correlationId = event.requestContext?.requestId ?? crypto.randomUUID();
    const claims = event.requestContext?.authorizer?.jwt?.claims;
    if (!claims || typeof claims.sub !== "string") {
      return failure(401, "AUTHENTICATION_REQUIRED", correlationId);
    }

    const orderId = event.pathParameters?.orderId ?? "";
    const requestValidation = validateGetOrderRequest({ orderId });
    if (!requestValidation.ok) {
      return failure(400, "VALIDATION_FAILED", correlationId);
    }

    const actor = await dependencies.resolveActor({ claims, orderId });
    if (!actor) return failure(403, "ORDER_ACTION_FORBIDDEN", correlationId);

    if (event.routeKey === "GET /v1/orders/{orderId}") {
      const authorization = authorizeOrderRead(actor.access);
      if (!authorization.allowed) {
        return failure(403, "ORDER_ACTION_FORBIDDEN", correlationId);
      }
      const order = await dependencies.getOrder(orderId);
      if (!order) return failure(404, "ORDER_NOT_FOUND", correlationId);
      const response: GetOrderResponse = { correlationId, order };
      if (!validateGetOrderResponse(response).ok) {
        return failure(500, "INTERNAL_ERROR", correlationId);
      }
      return success(200, response, correlationId, { ETag: `\"${order.version}\"` });
    }

    if (event.routeKey === "POST /v1/orders/{orderId}/actions/place-hold") {
      const parsed = parseJson(event.body);
      const validation = validatePlaceOrderHoldRequest({
        ...(isRecord(parsed) ? parsed : {}),
        idempotencyKey: header(event.headers, "idempotency-key"),
        orderId,
      });
      if (!validation.ok) return failure(400, "VALIDATION_FAILED", correlationId);

      const authorization = authorizePlaceOrderHold(actor.access);
      if (!authorization.allowed) {
        return failure(403, "ORDER_ACTION_FORBIDDEN", correlationId);
      }
      const current = await dependencies.getOrder(orderId);
      if (!current) return failure(404, "ORDER_NOT_FOUND", correlationId);
      if (hasVersionConflict({
        currentVersion: current.version,
        expectedVersion: validation.value.expectedVersion,
      })) {
        return failure(409, "VERSION_CONFLICT", correlationId);
      }
      if (!evaluateHoldTransition(current.status).allowed) {
        return failure(409, "INVALID_STATE_TRANSITION", correlationId);
      }

      const response = await dependencies.placeHold({
        actorUserId: actor.access.actorUserId,
        correlationId,
        expectedVersion: validation.value.expectedVersion,
        idempotencyKey: validation.value.idempotencyKey,
        note: validation.value.note,
        orderId,
        reasonCode: validation.value.reasonCode,
        roleAssignmentId: actor.roleAssignmentId,
      });
      return success(200, response, correlationId, { ETag: `\"${response.version}\"` });
    }

    return failure(404, "ORDER_NOT_FOUND", correlationId);
  };
}

export const handler = createOrderApiHandler({
  async getOrder() {
    throw new Error("Preview Order database adapter is not configured.");
  },
  async placeHold() {
    throw new Error("Preview Order database adapter is not configured.");
  },
  async resolveActor() {
    return null;
  },
});

function failure(
  statusCode: number,
  code: OrderApiError["code"],
  correlationId: string,
): OrderApiResult {
  const error: OrderApiError = {
    code,
    correlationId,
    message: publicMessage(code),
    retryable: code === "SERVICE_UNAVAILABLE",
  };
  return success(statusCode, error, correlationId);
}

function success(
  statusCode: number,
  body: unknown,
  correlationId: string,
  additionalHeaders: Record<string, string> = {},
): OrderApiResult {
  return {
    body: JSON.stringify(body),
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
      "X-Correlation-Id": correlationId,
      ...additionalHeaders,
    },
    statusCode,
  };
}

function publicMessage(code: OrderApiError["code"]): string {
  if (code === "AUTHENTICATION_REQUIRED") return "Authentication is required.";
  if (code === "VALIDATION_FAILED") return "The request is invalid.";
  if (code === "VERSION_CONFLICT") return "The Order has changed.";
  if (code === "INVALID_STATE_TRANSITION") return "The Order action is not allowed.";
  if (code === "ORDER_NOT_FOUND") return "The Order was not found.";
  return "The Order action could not be completed.";
}

function parseJson(value: string | null | undefined): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function header(
  headers: Record<string, string | undefined> | undefined,
  name: string,
): string | undefined {
  const entry = Object.entries(headers ?? {}).find(
    ([key]) => key.toLowerCase() === name.toLowerCase(),
  );
  return entry?.[1];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
