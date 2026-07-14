import { requireStaffRouteAccess } from "../../../access-policy";
import {
  dispatchNotificationDelivery,
  recordNotificationConsent,
} from "../../../notification-repository";

type NotificationDispatchRouteContext = {
  params: Promise<{
    notificationId: string;
  }>;
};

export async function POST(
  request: Request,
  context: NotificationDispatchRouteContext,
) {
  const { notificationId } = await context.params;
  const { role, user } = await requireStaffRouteAccess(
    `/notifications/${notificationId}/dispatch`,
    ["GenAdmin", "Admin", "SuperAdmin"],
  );
  const payload = await safeJson(request);
  const actor = user.fullName ?? user.email;

  if (payload.action === "record-consent") {
    const consent = await recordNotificationConsent({
      actor,
      notificationId,
    });
    return Response.json(consent, { status: consent.available ? 200 : 404 });
  }

  const event = await dispatchNotificationDelivery({
    actor,
    actorRole: role,
    notificationId,
  });

  return Response.json(event, {
    status: event.available ? (event.outcome === "Completed" ? 200 : 409) : 404,
  });
}

async function safeJson(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }

  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}
