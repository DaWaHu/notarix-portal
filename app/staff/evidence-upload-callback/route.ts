import { verifyEvidenceProviderWebhook } from "../../evidence-callback-config";
import { recordEvidenceUploadCompletion } from "../../evidence-repository";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const verification = await verifyEvidenceProviderWebhook({
    provider: "storage",
    rawBody,
    request,
  });
  if (!verification.ok) {
    return Response.json({ error: verification.reason }, { status: 401 });
  }

  const payload = parsePayload(rawBody, request);
  const evidenceId = stringValue(payload.evidenceId);

  if (!evidenceId) {
    return Response.json(
      { error: "Evidence ID is required for upload completion callback update." },
      { status: 400 },
    );
  }

  const result = await recordEvidenceUploadCompletion({
    evidenceId,
    fileSize: stringValue(payload.fileSize),
    objectKey: stringValue(payload.objectKey),
    provider: stringValue(payload.provider),
    providerReceipt: stringValue(payload.providerReceipt),
    sha256: stringValue(payload.sha256),
  });

  return Response.json(result, {
    status: result.available ? 200 : 404,
  });
}

function parsePayload(
  rawBody: string,
  request: Request,
): Record<string, unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(rawBody).entries());
  }

  try {
    return JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
