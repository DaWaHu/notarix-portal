import { verifyNotificationProviderWebhook } from "../../notification-provider-config";
import { recordNotificationProviderCallback } from "../../notification-repository";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const payload = safeJson(rawBody);
  const notificationId = String(payload.notificationId ?? "");
  const deliveryStatus = String(payload.deliveryStatus ?? "");
  const provider =
    typeof payload.provider === "string"
      ? payload.provider
      : "Production email provider";

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
    detail:
      typeof payload.detail === "string" ? payload.detail : undefined,
    notificationId,
    provider,
    providerMessageId:
      typeof payload.providerMessageId === "string"
        ? payload.providerMessageId
        : undefined,
  });

  return Response.json(event, {
    status: event.available ? 200 : 404,
  });
}

function safeJson(rawBody: string): Record<string, unknown> {
  try {
    return JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return {};
  }
}
