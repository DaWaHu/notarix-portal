import { notFound } from "next/navigation";
import {
  normalizeLocalPreviewStaffRole,
  requireStaffRouteAccess,
} from "../../../access-policy";
import {
  resolveWorkflowTransition,
  type WorkflowAction,
} from "../../requests/workflow";
import {
  activateStoredProfile,
  appendStoredNotifications,
  getPersistedAccessRequest,
  persistStoredAccessRequest,
  updateRequestStatus,
} from "../../requests/store";

type RouteContext = {
  params: Promise<{
    requestId: string;
  }>;
};

const validActions = new Set<WorkflowAction>([
  "create-nsr",
  "send-profile-invitation",
  "submit-profile",
  "complete-genadmin-verification",
  "request-corrections",
  "grant-final-approval",
  "keep-inactive",
]);

export async function GET(_request: Request, context: RouteContext) {
  const { requestId } = await context.params;
  await requireStaffRouteAccess(`/staff/workflow/${requestId}`, [
    "GenAdmin",
    "Admin",
    "SuperAdmin",
  ]);

  const profileRequest = await getPersistedAccessRequest(requestId);
  if (!profileRequest) notFound();

  return Response.json({
    auditEvents: profileRequest.storedAuditEvents,
    requestId: profileRequest.id,
    status: profileRequest.status,
    notifications: profileRequest.storedNotifications,
    profileNumber: profileRequest.approvedProfileNumber,
    verificationItems: profileRequest.verificationItems,
    availableActions: Array.from(validActions),
    workflowContract:
      "Workflow endpoints enforce status transitions, audit requirements, notification intent, and profile number assignment rules through the stored workflow repository.",
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { requestId } = await context.params;
  const { role: claimRole, session, user } = await requireStaffRouteAccess(
    `/staff/workflow/${requestId}`,
    ["GenAdmin", "Admin", "SuperAdmin"],
  );

  const profileRequest = await getPersistedAccessRequest(requestId);
  if (!profileRequest) notFound();

  const payload = await safeJson(request);
  const action = String(payload.action ?? "");
  if (!validActions.has(action as WorkflowAction)) {
    return Response.json(
      { error: "Unsupported workflow action", validActions: Array.from(validActions) },
      { status: 400 },
    );
  }

  const role = session.localPreview
    ? normalizeLocalPreviewStaffRole(
        request.headers.get("x-notarix-staff-role") ?? payload.role,
      )
    : claimRole;
  const transition = resolveWorkflowTransition(
    profileRequest,
    action as WorkflowAction,
    role,
  );
  if (!transition.allowed) {
    return Response.json(transition, { status: 409 });
  }

  const actor = user.fullName ?? user.email;
  let storedRequest =
    transition.action === "grant-final-approval"
      ? activateStoredProfile(
          profileRequest.id,
          actor,
          transition.auditEvent,
          transition.notifications,
        )
      : updateRequestStatus(
          profileRequest.id,
          transition.nextStatus,
          actor,
          transition.auditEvent,
        );

  if (storedRequest && transition.action !== "grant-final-approval") {
    storedRequest = appendStoredNotifications(
      storedRequest.id,
      transition.notifications,
    );
  }
  const persistence = storedRequest
    ? await persistStoredAccessRequest(storedRequest)
    : { persisted: false };

  return Response.json({
    ...transition,
    persisted: true,
    persistence,
    storedRequest: {
      auditEventCount: storedRequest?.storedAuditEvents.length ?? 0,
      notifications: storedRequest?.storedNotifications ?? [],
      profileNumber: storedRequest?.approvedProfileNumber ?? null,
      status: storedRequest?.status ?? transition.nextStatus,
    },
  });
}

async function safeJson(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }

  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}
