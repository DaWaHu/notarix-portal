import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";

const args = new Set(process.argv.slice(2));
const baseUrl = valueArg("--base-url") ?? process.env.NOTARIX_CALLBACK_BASE_URL;
const shouldSend = args.has("--send");
const timestamp = new Date().toISOString();

if (!baseUrl) {
  console.error(
    "Missing --base-url. Example: npm run callbacks:replay -- --base-url=http://localhost:3000",
  );
  process.exit(1);
}

const env = await loadLocalEnv();
const callbacks = [
  {
    body: {
      deliveryStatus: "Delivered",
      notificationId: valueArg("--notification-id") ?? "NTF-2607-0001",
      provider: "AWS SES email provider",
      providerMessageId: `replay-email-${Date.now()}`,
    },
    headers: providerHeaders,
    label: "notification-email",
    secret: notificationSecret(env, "email"),
    url: "/notifications/provider-callback",
  },
  {
    body: {
      evidenceId: valueArg("--evidence-id") ?? "DOC-2607-0001",
      fileSize: "2.4 MB",
      objectKey: "orders/ORD-2607-0001/DOC-2607-0001/seller-closing-package.pdf",
      provider: "AWS S3 ObjectCreated callback",
      providerReceipt: `replay-upload-${Date.now()}`,
      sha256: "a".repeat(64),
    },
    headers: evidenceHeaders,
    label: "evidence-upload-completion",
    secret: evidenceSecret(env, "storage"),
    url: "/staff/evidence-upload-callback",
  },
  {
    body: {
      evidenceId: valueArg("--evidence-id") ?? "DOC-2607-0001",
      malwareStatus: "Malware validation complete",
      provider: "Production malware scanning provider",
      providerReceipt: `replay-scan-${Date.now()}`,
      validationStatus: "File type and SHA-256 validated",
    },
    headers: evidenceHeaders,
    label: "evidence-malware-clearance",
    secret: evidenceSecret(env, "malware"),
    url: "/staff/evidence-malware-callback",
  },
];

let failed = false;

for (const callback of callbacks) {
  const body = JSON.stringify(callback.body);
  const signedHeaders = callback.headers(body, callback.secret);
  const url = new URL(callback.url, baseUrl);
  console.log(`callback=${callback.label}`);
  console.log(`url=${url.href}`);
  console.log(`mode=${shouldSend ? "send" : "dry-run"}`);
  console.log(`signature_header=${redactedSignatureHeader(signedHeaders)}`);

  if (!shouldSend) {
    console.log(`body=${body}`);
    console.log("status=not_sent");
    continue;
  }

  const response = await fetch(url, {
    body,
    headers: signedHeaders,
    method: "POST",
  });
  const text = await response.text();
  console.log(`status=${response.status}`);
  console.log(`accepted_signature=${response.status !== 401}`);
  console.log(`response=${truncate(text)}`);

  if (response.status === 401 || response.status >= 500) {
    failed = true;
  }
}

if (failed) process.exit(1);

function valueArg(name) {
  const prefix = `${name}=`;
  return process.argv
    .slice(2)
    .find((arg) => arg.startsWith(prefix))
    ?.slice(prefix.length);
}

async function loadLocalEnv() {
  try {
    const source = await readFile(new URL("../.env.local", import.meta.url), "utf8");
    return Object.fromEntries(
      source
        .split(/\r?\n/)
        .map((line) =>
          line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/),
        )
        .filter(Boolean)
        .map((match) => [match[1], unquote(match[2].trim())]),
    );
  } catch {
    return {};
  }
}

function notificationSecret(env, channel) {
  if (channel === "email") {
    return (
      env.NOTARIX_EMAIL_WEBHOOK_SECRET ??
      env.NOTARIX_NOTIFICATION_WEBHOOK_SECRET ??
      localPreviewNotificationSecret()
    );
  }
  return (
    env.NOTARIX_SMS_WEBHOOK_SECRET ??
    env.NOTARIX_NOTIFICATION_WEBHOOK_SECRET ??
    localPreviewNotificationSecret()
  );
}

function evidenceSecret(env, provider) {
  if (provider === "storage") {
    return (
      env.NOTARIX_STORAGE_WEBHOOK_SECRET ??
      env.NOTARIX_EVIDENCE_WEBHOOK_SECRET ??
      localPreviewEvidenceSecret()
    );
  }
  return (
    env.NOTARIX_MALWARE_WEBHOOK_SECRET ??
    env.NOTARIX_EVIDENCE_WEBHOOK_SECRET ??
    localPreviewEvidenceSecret()
  );
}

function providerHeaders(body, secret) {
  return {
    "content-type": "application/json",
    "x-notarix-provider-signature": sign(secret, body),
    "x-notarix-provider-timestamp": timestamp,
  };
}

function evidenceHeaders(body, secret) {
  return {
    "content-type": "application/json",
    "x-notarix-evidence-signature": sign(secret, body),
    "x-notarix-evidence-timestamp": timestamp,
  };
}

function sign(secret, body) {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

function redactedSignatureHeader(headers) {
  const signature =
    headers["x-notarix-provider-signature"] ??
    headers["x-notarix-evidence-signature"];
  return `${signature.slice(0, 10)}...${signature.slice(-6)}`;
}

function localPreviewNotificationSecret() {
  if (isLocalBaseUrl()) return "local-preview-notification-webhook-secret";
  return "";
}

function localPreviewEvidenceSecret() {
  if (isLocalBaseUrl()) return "local-preview-evidence-webhook-secret";
  return "";
}

function isLocalBaseUrl() {
  const url = new URL(baseUrl);
  return url.hostname === "localhost" || url.hostname === "127.0.0.1";
}

function truncate(value) {
  return value.length > 500 ? `${value.slice(0, 500)}...` : value;
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}
