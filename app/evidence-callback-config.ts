type RuntimeEnv = Record<string, string | undefined>;

const LOCAL_PREVIEW_EVIDENCE_WEBHOOK_SECRET =
  "local-preview-evidence-webhook-secret";
const SIGNATURE_HEADER = "x-notarix-evidence-signature";
const TIMESTAMP_HEADER = "x-notarix-evidence-timestamp";

export const evidenceCallbackEnvironmentContract = {
  callbacks:
    "Evidence upload and malware scan callbacks must be verified with HMAC-SHA256 over timestamp and raw request body before evidence status changes are accepted.",
  malware:
    "Malware scan providers may use a dedicated malware callback secret or the shared evidence callback secret.",
  storage:
    "Storage upload completion callbacks may use a dedicated storage callback secret or the shared evidence callback secret.",
} as const;

export const evidenceCallbackSecretNames = {
  malwareWebhookSecret: [
    "NOTARIX_MALWARE_WEBHOOK_SECRET",
    "NOTARIX_EVIDENCE_WEBHOOK_SECRET",
  ],
  storageWebhookSecret: [
    "NOTARIX_STORAGE_WEBHOOK_SECRET",
    "NOTARIX_EVIDENCE_WEBHOOK_SECRET",
  ],
} as const;

export async function getEvidenceCallbackEnvironmentStatus() {
  const env = await getRuntimeEnv();
  return {
    malware: {
      configured: Boolean(
        firstEnvValue(env, evidenceCallbackSecretNames.malwareWebhookSecret),
      ),
      provider: "Evidence malware scanning callback",
      webhookSecretKeys: evidenceCallbackSecretNames.malwareWebhookSecret,
    },
    storage: {
      configured: Boolean(
        firstEnvValue(env, evidenceCallbackSecretNames.storageWebhookSecret),
      ),
      provider: "Evidence storage upload completion callback",
      webhookSecretKeys: evidenceCallbackSecretNames.storageWebhookSecret,
    },
  };
}

export async function verifyEvidenceProviderWebhook(input: {
  provider: "malware" | "storage";
  rawBody: string;
  request: Request;
}) {
  const timestamp = input.request.headers.get(TIMESTAMP_HEADER);
  const signature = input.request.headers.get(SIGNATURE_HEADER);
  if (!timestamp || !signature) {
    return {
      ok: false,
      reason: "Evidence provider callback timestamp and signature are required.",
    };
  }

  const secret = await getWebhookSecret({
    host: input.request.headers.get("host"),
    provider: input.provider,
  });
  if (!secret) {
    return {
      ok: false,
      reason:
        "Evidence provider webhook secret is not configured in environment secrets.",
    };
  }

  const signedPayload = `${timestamp}.${input.rawBody}`;
  const expectedSignature = await hmacSha256Hex(secret, signedPayload);
  if (!constantTimeEqual(signature, expectedSignature)) {
    return {
      ok: false,
      reason: "Evidence provider callback signature verification failed.",
    };
  }

  return {
    ok: true,
    reason: "Evidence provider callback signature verified.",
  };
}

async function getWebhookSecret(input: {
  host: string | null;
  provider: "malware" | "storage";
}) {
  const env = await getRuntimeEnv();
  const secret = firstEnvValue(
    env,
    input.provider === "malware"
      ? evidenceCallbackSecretNames.malwareWebhookSecret
      : evidenceCallbackSecretNames.storageWebhookSecret,
  );
  if (secret) return secret;
  if (isLocalPreviewHost(input.host)) return LOCAL_PREVIEW_EVIDENCE_WEBHOOK_SECRET;
  return undefined;
}

async function getRuntimeEnv(): Promise<RuntimeEnv> {
  return process.env as RuntimeEnv;
}

function firstEnvValue(
  env: RuntimeEnv,
  names: readonly string[],
): string | undefined {
  return names.map((name) => env[name]).find(Boolean);
}

function isLocalPreviewHost(host: string | null) {
  if (!host) return true;
  return host.startsWith("localhost") || host.startsWith("127.0.0.1");
}

async function hmacSha256Hex(secret: string, payload: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(a: string, b: string) {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  const length = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;

  for (let index = 0; index < length; index += 1) {
    diff |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }

  return diff === 0;
}
