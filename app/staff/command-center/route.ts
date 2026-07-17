import { redirect } from "next/navigation";
import {
  normalizeLocalPreviewStaffRole,
  requireStaffRouteAccess,
} from "../../access-policy";
import {
  applyCommandCenterAction,
  listPersistedCommandCenterEvents,
  listPersistedCommandCenterReceipts,
  type CommandCenterAction,
} from "./store";

const validCommandActions = new Set<CommandCenterAction>([
  "retry-failed-notification",
  "record-phone-consent",
  "suppress-notice",
  "send-renewal-reminder",
  "request-replacement-evidence",
  "escalate-restriction",
  "hold-payment-release",
  "escalate-ledger-correction",
  "export-ledger-report",
  "export-audit-report",
  "place-retention-hold",
  "escalate-exception",
  "release-validated-evidence",
  "quarantine-failed-file",
  "request-replacement-upload",
  "escalate-restricted-document",
  "place-record-retention-hold",
  "release-retention-hold",
  "mark-deletion-review-needed",
  "escalate-retention-exception",
  "verify-backup-recovery",
  "open-recovery-drill",
  "escalate-system-incident",
  "mark-provider-degraded",
  "require-mfa-passkey-reset",
  "suspend-staff-session",
  "open-access-review",
  "escalate-privilege-exception",
  "verify-provider-integration",
  "mark-integration-degraded",
  "open-provider-callback-review",
  "escalate-provider-risk",
  "assign-notary",
  "hold-order",
  "release-order-documents",
  "escalate-order-issue",
  "request-missing-documents",
  "route-order-financial-review",
  "confirm-notary-acceptance",
  "confirm-order-appointment",
  "record-completion-package",
  "close-order",
  "client-upload-order-documents",
  "client-replace-order-documents",
  "client-acknowledge-correction",
  "notary-accept-assignment",
  "notary-decline-assignment",
  "notary-confirm-arrival",
  "notary-upload-completion-package",
]);

export async function GET() {
  await requireStaffRouteAccess("/staff/command-center", [
    "GenAdmin",
    "Admin",
    "SuperAdmin",
  ]);
  const [commandEvents, commandReceipts] = await Promise.all([
    listPersistedCommandCenterEvents(),
    listPersistedCommandCenterReceipts(),
  ]);

  return Response.json({
    availableActions: Array.from(validCommandActions),
    commandEvents,
    commandReceipts,
    persistenceTables: [
      "command_center_targets",
      "command_center_events",
      "command_center_receipts",
    ],
    persistenceContract:
      "Each command action creates a command-center receipt payload for Postgres target, event, and receipt tables; blocked attempts are retained for audit review.",
    workflowContract:
      "Command center endpoints persist operational actions as attributable audit events and update stored command target status.",
  });
}

export async function POST(request: Request) {
  const { role: claimRole, session, user } = await requireStaffRouteAccess("/staff/command-center", [
    "GenAdmin",
    "Admin",
    "SuperAdmin",
  ]);
  const payload = await safeJson(request);
  const action = String(payload.action ?? "");

  if (!validCommandActions.has(action as CommandCenterAction)) {
    return Response.json(
      {
        error: "Unsupported command center action",
        validActions: Array.from(validCommandActions),
      },
      { status: 400 },
    );
  }

  const role = session.localPreview
    ? normalizeLocalPreviewStaffRole(
        request.headers.get("x-notarix-staff-role") ?? payload.role,
      )
    : claimRole;
  const transition = await applyCommandCenterAction(
    action as CommandCenterAction,
    user.fullName ?? user.email,
    role,
    typeof payload.targetId === "string" ? payload.targetId : undefined,
  );

  if (isFormRequest(request)) {
    redirect(`/staff/command-center/receipt/${transition.receiptId}`);
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
