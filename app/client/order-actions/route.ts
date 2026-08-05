import { redirect } from "next/navigation";
import { denyUnresolvedPortalOwnership } from "../../access-policy";
import {
  applyCommandCenterAction,
  type CommandCenterAction,
} from "../../staff/command-center/store";

const clientOrderActions = new Set<CommandCenterAction>([
  "client-upload-order-documents",
  "client-replace-order-documents",
  "client-acknowledge-correction",
]);

export async function POST(request: Request) {
  denyUnresolvedPortalOwnership();
  const payload = await safeJson(request);
  const action = String(payload.action ?? "") as CommandCenterAction;

  if (!clientOrderActions.has(action)) {
    return Response.json(
      {
        error: "Unsupported client order action",
        validActions: Array.from(clientOrderActions),
      },
      { status: 400 },
    );
  }

  const transition = await applyCommandCenterAction(
    action,
    "Avery Coleman",
    "Client",
    typeof payload.targetId === "string" ? payload.targetId : undefined,
  );

  if (isFormRequest(request)) {
    redirect("/client/orders");
  }

  return Response.json(transition, {
    status: transition.allowed ? 200 : 409,
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

function isFormRequest(request: Request): boolean {
  const contentType = request.headers.get("content-type") ?? "";
  return (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  );
}
