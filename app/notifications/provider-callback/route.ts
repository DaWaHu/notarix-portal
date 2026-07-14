import { recordNotificationProviderCallback } from "../../notification-repository";

const PROVIDER_SIGNATURE_HEADER = "x-notarix-provider-signature";

export async function POST(request: Request) {
  const signature = request.headers.get(PROVIDER_SIGNATURE_HEADER);
  if (!signature) {
    return Response.json(
      {
        error:
          "Notification provider callback signature is required before delivery status can be recorded.",
      },
      { status: 401 },
    );
  }

  const payload = await safeJson(request);
  const notificationId = String(payload.notificationId ?? "");
  const deliveryStatus = String(payload.deliveryStatus ?? "");

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
    provider: typeof payload.provider === "string" ? payload.provider : undefined,
    providerMessageId:
      typeof payload.providerMessageId === "string"
        ? payload.providerMessageId
        : undefined,
  });

  return Response.json(event, {
    status: event.available ? 200 : 404,
  });
}

async function safeJson(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}
