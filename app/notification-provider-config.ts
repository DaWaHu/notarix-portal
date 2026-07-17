export const notificationProviderEnvironmentContract = {
  credentials:
    "Email and SMS provider credentials must be injected through environment secrets, never source files.",
  email:
    "AWS SES is the primary email provider. SES delivery should bind AWS_SES_REGION, AWS_SES_FROM_EMAIL, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.",
  sms:
    "AWS SNS or Pinpoint is the primary SMS and phone-message provider path. SMS delivery should bind AWS_SMS_REGION or AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and the selected origination/application identifier.",
  webhooks:
    "Provider callbacks must be verified with HMAC-SHA256 over timestamp and raw request body before delivery state changes are accepted.",
} as const;

export const notificationProviderSecretNames = {
  emailAwsAccessKey: ["AWS_ACCESS_KEY_ID"],
  emailAwsFromAddress: ["AWS_SES_FROM_EMAIL"],
  emailAwsRegion: ["AWS_SES_REGION", "AWS_REGION"],
  emailAwsSecretKey: ["AWS_SECRET_ACCESS_KEY"],
  emailWebhookSecret: [
    "NOTARIX_EMAIL_WEBHOOK_SECRET",
    "NOTARIX_NOTIFICATION_WEBHOOK_SECRET",
  ],
  smsAwsAccessKey: ["AWS_ACCESS_KEY_ID"],
  smsAwsApplicationId: ["AWS_PINPOINT_APPLICATION_ID"],
  smsAwsOriginationNumber: ["AWS_SNS_ORIGINATION_NUMBER"],
  smsAwsRegion: ["AWS_SMS_REGION", "AWS_REGION"],
  smsAwsSecretKey: ["AWS_SECRET_ACCESS_KEY"],
  smsWebhookSecret: [
    "NOTARIX_SMS_WEBHOOK_SECRET",
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
    const awsSmsConfigured = isAwsSmsConfigured(env);
    return {
      accountId:
        firstEnvValue(env, notificationProviderSecretNames.smsAwsApplicationId) ??
        firstEnvValue(env, notificationProviderSecretNames.smsAwsOriginationNumber),
      apiKey: undefined,
      configured: awsSmsConfigured,
      provider: "AWS SNS or Pinpoint SMS provider",
      requiredSecrets: [
        ...notificationProviderSecretNames.smsAwsRegion,
        ...notificationProviderSecretNames.smsAwsApplicationId,
        ...notificationProviderSecretNames.smsAwsOriginationNumber,
        ...notificationProviderSecretNames.smsAwsAccessKey,
        ...notificationProviderSecretNames.smsAwsSecretKey,
      ],
    };
  }

  const awsSesConfigured = isAwsSesEmailConfigured(env);
  return {
    accountId: undefined,
    apiKey: undefined,
    configured: awsSesConfigured,
    provider: "AWS SES email provider",
    requiredSecrets: [
      ...notificationProviderSecretNames.emailAwsRegion,
      ...notificationProviderSecretNames.emailAwsFromAddress,
      ...notificationProviderSecretNames.emailAwsAccessKey,
      ...notificationProviderSecretNames.emailAwsSecretKey,
    ],
  };
}

export async function getNotificationProviderEnvironmentStatus() {
  const env = await getRuntimeEnv();
  const awsSesConfigured = isAwsSesEmailConfigured(env);
  const awsSmsConfigured = isAwsSmsConfigured(env);
  return {
    email: {
      awsSesConfigured,
      configured: awsSesConfigured,
      provider: "AWS SES email provider",
      requiredKeys: [
        ...notificationProviderSecretNames.emailAwsRegion,
        ...notificationProviderSecretNames.emailAwsFromAddress,
        ...notificationProviderSecretNames.emailAwsAccessKey,
        ...notificationProviderSecretNames.emailAwsSecretKey,
      ],
      webhookConfigured: Boolean(
        firstEnvValue(env, notificationProviderSecretNames.emailWebhookSecret),
      ),
      webhookSecretKeys: notificationProviderSecretNames.emailWebhookSecret,
    },
    sms: {
      accountConfigured: Boolean(
        firstEnvValue(env, notificationProviderSecretNames.smsAwsApplicationId) ??
          firstEnvValue(env, notificationProviderSecretNames.smsAwsOriginationNumber),
      ),
      awsSmsConfigured,
      configured: awsSmsConfigured,
      provider: "AWS SNS or Pinpoint SMS provider",
      requiredKeys: [
        ...notificationProviderSecretNames.smsAwsRegion,
        ...notificationProviderSecretNames.smsAwsApplicationId,
        ...notificationProviderSecretNames.smsAwsOriginationNumber,
        ...notificationProviderSecretNames.smsAwsAccessKey,
        ...notificationProviderSecretNames.smsAwsSecretKey,
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
  return process.env as RuntimeEnv;
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

function isAwsSesEmailConfigured(env: RuntimeEnv): boolean {
  return Boolean(
    firstEnvValue(env, notificationProviderSecretNames.emailAwsRegion) &&
      firstEnvValue(env, notificationProviderSecretNames.emailAwsFromAddress) &&
      firstEnvValue(env, notificationProviderSecretNames.emailAwsAccessKey) &&
      firstEnvValue(env, notificationProviderSecretNames.emailAwsSecretKey),
  );
}

function isAwsSmsConfigured(env: RuntimeEnv): boolean {
  const hasOrigination =
    firstEnvValue(env, notificationProviderSecretNames.smsAwsApplicationId) ||
    firstEnvValue(env, notificationProviderSecretNames.smsAwsOriginationNumber);
  return Boolean(
    firstEnvValue(env, notificationProviderSecretNames.smsAwsRegion) &&
      hasOrigination &&
      firstEnvValue(env, notificationProviderSecretNames.smsAwsAccessKey) &&
      firstEnvValue(env, notificationProviderSecretNames.smsAwsSecretKey),
  );
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
