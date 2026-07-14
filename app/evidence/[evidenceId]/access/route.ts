import { requireStaffRouteAccess } from "../../../access-policy";
import {
  listEvidenceAccessReceipts,
  requestEvidenceSignedAccess,
} from "../../../evidence-repository";

type EvidenceAccessRouteContext = {
  params: Promise<{
    evidenceId: string;
  }>;
};

export async function GET(_request: Request, context: EvidenceAccessRouteContext) {
  const { evidenceId } = await context.params;
  await requireStaffRouteAccess(`/evidence/${evidenceId}/access`, [
    "GenAdmin",
    "Admin",
    "SuperAdmin",
  ]);

  const receipts = await listEvidenceAccessReceipts();
  return Response.json({
    accessContract:
      "Evidence access receipts record signed URL issuance or blocked release decisions with staff identity, role, reason, target, timestamp, and outcome.",
    evidenceId,
    receipts: receipts.filter((receipt) => receipt.evidenceId === evidenceId),
  });
}

export async function POST(request: Request, context: EvidenceAccessRouteContext) {
  const { evidenceId } = await context.params;
  const { role, user } = await requireStaffRouteAccess(
    `/evidence/${evidenceId}/access`,
    ["GenAdmin", "Admin", "SuperAdmin"],
  );
  const payload = await safeJson(request);
  const reason =
    typeof payload.reason === "string" && payload.reason.trim()
      ? payload.reason.trim()
      : "Staff evidence review";

  const receipt = await requestEvidenceSignedAccess({
    actor: user.fullName ?? user.email,
    actorRole: role,
    evidenceId,
    reason,
  });

  return Response.json(receipt, {
    status: receipt.outcome === "Issued" ? 200 : 409,
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
