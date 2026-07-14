import { verifyNotificationProviderWebhook } from "../../notification-provider-config";
import { recordNotificationProviderCallback } from "../../notification-repository";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const payload = parseCallbackPayload(rawBody, request);
  const normalized = normalizeProviderCallbackPayload(payload);
  const notificationId = normalized.notificationId;
  const deliveryStatus = normalized.deliveryStatus;
  const provider = normalized.provider;

  const verification = await verifyNotificationProviderWebhook({
    provider,
    rawBody,
    request,
  });
  if (!verification.ok) {
    return Response.json(
      {
        error: verification.reason,
      },
      { status: 401 },
    );
  }

  if (!notificationId || !deliveryStatus) {
    return Response.json(
      {
        error:
          "Notification ID and delivery status are required for provider callback updates.",
      },
      { status: 400 },
    );
  }

  const event = await recordNotificationProviderCallback({
    deliveryStatus,
    detail: normalized.detail,
    notificationId,
    provider,
    providerMessageId: normalized.providerMessageId,
  });

  return Response.json(event, {
    status: event.available ? 200 : 404,
  });
}

function parseCallbackPayload(
  rawBody: string,
  request: Request,
): Record<string, unknown> | Record<string, unknown>[] {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(rawBody).entries());
  }

  try {
    return JSON.parse(rawBody) as Record<string, unknown> | Record<string, unknown>[];
  } catch {
    return {};
  }
}

function normalizeProviderCallbackPayload(
  payload: Record<string, unknown> | Record<string, unknown>[],
) {
  const event = Array.isArray(payload) ? payload[0] ?? {} : payload;
  const customArgs =
    objectValue(event.custom_args) ??
    objectValue(event.unique_args) ??
    objectValue(event.customArgs) ??
    {};
  const notificationId = stringValue(event.notificationId) ??
    stringValue(customArgs.notificationId) ??
    stringValue(event.NotificationId) ??
    "";
  const deliveryStatus = stringValue(event.deliveryStatus) ??
    stringValue(event.event) ??
    stringValue(event.MessageStatus) ??
    stringValue(event.SmsStatus) ??
    stringValue(event.status) ??
    "";
  const provider = stringValue(event.provider) ??
    (stringValue(event.MessageSid) || stringValue(event.SmsSid)
      ? "Production SMS and voice provider"
      : "Production email provider");
  const providerMessageId = stringValue(event.providerMessageId) ??
    stringValue(event.sg_message_id) ??
    stringValue(event.MessageSid) ??
    stringValue(event.SmsSid);

  return {
    deliveryStatus,
    detail: stringValue(event.detail) ??
      stringValue(event.reason) ??
      `${provider} callback recorded native delivery event ${deliveryStatus}.`,
    notificationId,
    provider,
    providerMessageId,
  };
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
