import { requireStaffRouteAccess } from "../../../access-policy";
import {
  createEvidenceUploadIntake,
  type EvidenceUploadIntakeInput,
} from "../../../evidence-repository";

export async function POST(request: Request) {
  const { role, user } = await requireStaffRouteAccess(
    "/staff/evidence-intake/upload",
    ["GenAdmin", "Admin", "SuperAdmin"],
  );
  const contentType = request.headers.get("content-type") ?? "";
  const acceptsJson = request.headers.get("accept")?.includes("application/json");
  const shouldRedirect =
    !acceptsJson &&
    (contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data"));
  const payload = await safePayload(request);
  const fileName = stringValue(payload.fileName);

  if (!fileName) {
    return Response.json(
      {
        error: "Evidence upload intake requires a fileName.",
      },
      { status: 400 },
    );
  }

  const receipt = await createEvidenceUploadIntake({
    accessLevel: stringValue(payload.accessLevel),
    actor: user.fullName ?? user.email,
    actorRole: role,
    category: stringValue(payload.category),
    custody: stringValue(payload.custody),
    fileName,
    fileType: evidenceFileType(payload.fileType),
    orderId: stringValue(payload.orderId),
    requestId: stringValue(payload.requestId),
    section: stringValue(payload.section),
    sha256: stringValue(payload.sha256),
    size: stringValue(payload.size),
    source: evidenceSource(payload.source),
    title: stringValue(payload.title),
  } satisfies EvidenceUploadIntakeInput);

  if (shouldRedirect) {
    return Response.redirect(new URL(receipt.feedbackUrl, request.url), 303);
  }

  return Response.json(receipt, { status: 201 });
}

async function safePayload(request: Request): Promise<Record<string, unknown>> {
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

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function evidenceFileType(value: unknown): EvidenceUploadIntakeInput["fileType"] {
  const normalized = stringValue(value)?.toUpperCase();
  if (
    normalized === "PDF" ||
    normalized === "JSON" ||
    normalized === "HTML" ||
    normalized === "CSV" ||
    normalized === "URL"
  ) {
    return normalized;
  }
  return undefined;
}

function evidenceSource(value: unknown): EvidenceUploadIntakeInput["source"] {
  const normalized = stringValue(value);
  if (
    normalized === "Profile Verification" ||
    normalized === "Order Document" ||
    normalized === "Provider Result"
  ) {
    return normalized;
  }
  return undefined;
}
