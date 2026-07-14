export const notificationProviderEnvironmentContract = {
  credentials:
    "Email and SMS provider credentials must be injected through environment secrets, never source files.",
  email:
    "Email delivery can bind NOTARIX_EMAIL_API_KEY, SENDGRID_API_KEY, or an equivalent provider key. SendGrid-style event callbacks should carry a notificationId in custom_args or unique_args.",
  sms:
    "SMS and phone delivery can bind NOTARIX_SMS_API_KEY, TWILIO_AUTH_TOKEN, TWILIO_ACCOUNT_SID, or equivalent provider credentials. Twilio-style status callbacks should include MessageSid, MessageStatus or SmsStatus, and notificationId.",
  webhooks:
    "Provider callbacks must be verified with HMAC-SHA256 over timestamp and raw request body before delivery state changes are accepted.",
} as const;

export const notificationProviderSecretNames = {
  emailApiKey: ["NOTARIX_EMAIL_API_KEY", "SENDGRID_API_KEY"],
  emailWebhookSecret: [
    "NOTARIX_EMAIL_WEBHOOK_SECRET",
    "SENDGRID_WEBHOOK_SECRET",
    "NOTARIX_NOTIFICATION_WEBHOOK_SECRET",
  ],
  smsApiKey: ["NOTARIX_SMS_API_KEY", "TWILIO_AUTH_TOKEN"],
  smsAccountId: ["TWILIO_ACCOUNT_SID"],
  smsWebhookSecret: [
    "NOTARIX_SMS_WEBHOOK_SECRET",
    "TWILIO_AUTH_TOKEN",
    "NOTARIX_NOTIFICATION_WEBHOOK_SECRET",
  ],
} as const;

type ProviderChannel = "Email" | "SMS";
type RuntimeEnv = Record<string, string | undefined>;

const LOCAL_PREVIEW_WEBHOOK_SECRET = "local-preview-notification-webhook-secret";
const SIGNATURE_HEADER = "x-notarix-provider-signature";
const TIMESTAMP_HEADER = "x-notarix-provider-timestamp";

export async function getNotificationProviderBinding(channel: string) {
  const env = await getRuntimeEnv();
  const normalizedChannel = normalizeProviderChannel(channel);
  if (normalizedChannel === "SMS") {
    return {
      accountId: firstEnvValue(env, notificationProviderSecretNames.smsAccountId),
      apiKey: firstEnvValue(env, notificationProviderSecretNames.smsApiKey),
      configured: Boolean(
        firstEnvValue(env, notificationProviderSecretNames.smsApiKey),
      ),
      provider: "Production SMS and voice provider",
      requiredSecrets: [
        ...notificationProviderSecretNames.smsApiKey,
        ...notificationProviderSecretNames.smsAccountId,
      ],
    };
  }

  return {
    accountId: undefined,
    apiKey: firstEnvValue(env, notificationProviderSecretNames.emailApiKey),
    configured: Boolean(
      firstEnvValue(env, notificationProviderSecretNames.emailApiKey),
    ),
    provider: "Production email provider",
    requiredSecrets: [...notificationProviderSecretNames.emailApiKey],
  };
}

export async function getNotificationProviderEnvironmentStatus() {
  const env = await getRuntimeEnv();
  return {
    email: {
      configured: Boolean(
        firstEnvValue(env, notificationProviderSecretNames.emailApiKey),
      ),
      provider: "Production email provider",
      requiredKeys: notificationProviderSecretNames.emailApiKey,
      webhookConfigured: Boolean(
        firstEnvValue(env, notificationProviderSecretNames.emailWebhookSecret),
      ),
      webhookSecretKeys: notificationProviderSecretNames.emailWebhookSecret,
    },
    sms: {
      accountConfigured: Boolean(
        firstEnvValue(env, notificationProviderSecretNames.smsAccountId),
      ),
      configured: Boolean(firstEnvValue(env, notificationProviderSecretNames.smsApiKey)),
      provider: "Production SMS and voice provider",
      requiredKeys: [
        ...notificationProviderSecretNames.smsApiKey,
        ...notificationProviderSecretNames.smsAccountId,
      ],
      webhookConfigured: Boolean(
        firstEnvValue(env, notificationProviderSecretNames.smsWebhookSecret),
      ),
      webhookSecretKeys: notificationProviderSecretNames.smsWebhookSecret,
    },
  };
}

export async function verifyNotificationProviderWebhook(input: {
  provider: string;
  rawBody: string;
  request: Request;
}) {
  const timestamp = input.request.headers.get(TIMESTAMP_HEADER);
  const signature = input.request.headers.get(SIGNATURE_HEADER);
  if (!timestamp || !signature) {
    return {
      ok: false,
      reason:
        "Notification provider callback timestamp and signature are required.",
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
        "Notification provider webhook secret is not configured in environment secrets.",
    };
  }

  const signedPayload = `${timestamp}.${input.rawBody}`;
  const expectedSignature = await hmacSha256Hex(secret, signedPayload);
  if (!constantTimeEqual(signature, expectedSignature)) {
    return {
      ok: false,
      reason: "Notification provider callback signature verification failed.",
    };
  }

  return {
    ok: true,
    reason: "Notification provider callback signature verified.",
  };
}

async function getWebhookSecret(input: { host: string | null; provider: string }) {
  const env = await getRuntimeEnv();
  const channel = normalizeProviderChannel(input.provider);
  const secret = firstEnvValue(
    env,
    channel === "SMS"
      ? notificationProviderSecretNames.smsWebhookSecret
      : notificationProviderSecretNames.emailWebhookSecret,
  );
  if (secret) return secret;
  if (isLocalPreviewHost(input.host)) return LOCAL_PREVIEW_WEBHOOK_SECRET;
  return undefined;
}

async function getRuntimeEnv(): Promise<RuntimeEnv> {
  try {
    const { env } = await import("cloudflare:workers");
    return env as RuntimeEnv;
  } catch {
    return {};
  }
}

function firstEnvValue(
  env: RuntimeEnv,
  names: readonly string[],
): string | undefined {
  return names.map((name) => env[name]).find(Boolean);
}

function normalizeProviderChannel(value: string): ProviderChannel {
  const normalized = value.toLowerCase();
  if (
    normalized.includes("sms") ||
    normalized.includes("phone") ||
    normalized.includes("voice") ||
    normalized.includes("twilio")
  ) {
    return "SMS";
  }
  return "Email";
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
