import { notFound } from "next/navigation";
import { requireChatGPTUser } from "../../../../../chatgpt-auth";
import {
  resolveSectionTransition,
  type WorkflowSectionTransition,
} from "../../../../requests/workflow";
import {
  getPersistedAccessRequest,
  persistStoredAccessRequest,
  updateVerificationSection,
} from "../../../../requests/store";

type SectionRouteContext = {
  params: Promise<{
    requestId: string;
    section: string;
  }>;
};

const validSectionActions = new Set<WorkflowSectionTransition["action"]>([
  "mark-section-verified",
  "request-section-correction",
  "escalate-section",
]);

export async function POST(request: Request, context: SectionRouteContext) {
  const { requestId, section } = await context.params;
  const user = await requireChatGPTUser(`/staff/workflow/${requestId}/section/${section}`);

  const profileRequest = await getPersistedAccessRequest(requestId);
  if (!profileRequest) notFound();

  const payload = await safeJson(request);
  const action = String(payload.action ?? "");
  if (!validSectionActions.has(action as WorkflowSectionTransition["action"])) {
    return Response.json(
      {
        error: "Unsupported verification section action",
        validActions: Array.from(validSectionActions),
      },
      { status: 400 },
    );
  }

  const transition = resolveSectionTransition(
    profileRequest,
    decodeURIComponent(section),
    action as WorkflowSectionTransition["action"],
    String(payload.reviewer ?? "GenAdmin001"),
  );

  if (!transition.allowed || transition.nextStatus === "Missing") {
    return Response.json(transition, { status: 404 });
  }

  const storedRequest = updateVerificationSection(
    profileRequest.id,
    transition.section,
    transition.nextStatus,
    user.fullName ?? user.email,
    transition.auditEvent,
  );
  const persistence = storedRequest
    ? await persistStoredAccessRequest(storedRequest)
    : { persisted: false };

  return Response.json({
    ...transition,
    persisted: true,
    persistence,
    storedRequest: {
      auditEventCount: storedRequest?.storedAuditEvents.length ?? 0,
      sectionStatus:
        storedRequest?.verificationItems.find(
          (item) => item.section === transition.section,
        )?.status ?? transition.nextStatus,
      status: storedRequest?.status ?? profileRequest.status,
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
