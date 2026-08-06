import { readFile } from "node:fs/promises";

const requiredGroups = [
  {
    label: "storage",
    keys: [
      "AWS_ACCESS_KEY_ID",
      "AWS_SECRET_ACCESS_KEY",
      "AWS_REGION",
      "S3_BUCKET_NAME",
      "NOTARIX_STORAGE_REGION",
      "NOTARIX_STORAGE_BUCKET",
    ],
  },
  {
    label: "app_auth",
    keys: ["APP_URL", "AUTH_SECRET", "AUTH_TRUST_HOST"],
  },
  {
    label: "seed_owner",
    keys: [
      "SEED_OWNER_EMAIL",
      "SEED_OWNER_PASSWORD",
      "SEED_OWNER_FIRST_NAME",
      "SEED_OWNER_LAST_NAME",
    ],
  },
  {
    label: "database_runtime",
    keys: ["DATABASE_URL"],
  },
  {
    label: "aws_ses_email",
    keys: [
      "AWS_SES_REGION",
      "AWS_SES_FROM_EMAIL",
      "AWS_ACCESS_KEY_ID",
      "AWS_SECRET_ACCESS_KEY",
    ],
  },
];

const optionalKeys = new Set([
  "DATABASE_MIGRATION_URL",
  "NOTARIX_DATABASE_ENVIRONMENT",
  "NOTARIX_DATABASE_PROVIDER",
  "NOTARIX_DATABASE_RESOURCE_ID",
  "NOTARIX_DATABASE_ENDPOINT_ID",
  "NOTARIX_DATABASE_NAME",
  "NOTARIX_DATABASE_ROLE_CLASS",
  "NOTARIX_PRODUCTION_DATABASE_HOST_SHA256",
  "NOTARIX_PRODUCTION_MIGRATION_APPROVED",
  "AWS_SES_TO_EMAIL",
  "NOTARIX_EMAIL_WEBHOOK_SECRET",
  "NOTARIX_NOTIFICATION_WEBHOOK_SECRET",
  "AWS_SMS_REGION",
  "AWS_PINPOINT_APPLICATION_ID",
  "AWS_SNS_ORIGINATION_NUMBER",
  "NOTARIX_SMS_WEBHOOK_SECRET",
  "SITE_LOCKED",
  "NOTARIX_STORAGE_ENDPOINT",
  "NOTARIX_STORAGE_WEBHOOK_SECRET",
  "NOTARIX_MALWARE_WEBHOOK_SECRET",
  "NOTARIX_EVIDENCE_WEBHOOK_SECRET",
  "VERCEL_OIDC_TOKEN",
  "NOTARIX_AUTH_PROVIDER",
  "NOTARIX_AUTH_MODE",
  "NOTARIX_OWNER_SUPER_ADMIN_EMAIL",
  "NOTARIX_COGNITO_REGION",
  "NOTARIX_COGNITO_USER_POOL_ID",
  "NOTARIX_COGNITO_USER_POOL_DOMAIN",
  "NOTARIX_COGNITO_CLIENT_ID",
  "NOTARIX_COGNITO_CLIENT_SECRET",
  "NOTARIX_COGNITO_ISSUER",
  "NOTARIX_COGNITO_JWKS_URL",
  "NOTARIX_COGNITO_REDIRECT_URI",
  "NOTARIX_COGNITO_LOGOUT_URI",
  "NOTARIX_COGNITO_STAFF_IDP_NAME",
  "NOTARIX_COGNITO_ALLOWED_STAFF_DOMAIN",
  "NOTARIX_SESSION_COOKIE_SECRET",
  "NOTARIX_SESSION_COOKIE_NAME",
]);

const envPath = new URL("../.env.local", import.meta.url);
const source = await readFile(envPath, "utf8");
const entries = new Map();
const duplicates = [];

source.split(/\r?\n/).forEach((line, index) => {
  const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (!match) return;

  const [, key, rawValue] = match;
  if (entries.has(key)) duplicates.push({ key, line: index + 1 });
  entries.set(key, rawValue.trim());
});

console.log(`env_file=.env.local`);
console.log(`total_keys=${entries.size}`);
console.log(`duplicates=${duplicates.length}`);

for (const group of requiredGroups) {
  const missing = group.keys.filter((key) => !entries.has(key));
  const empty = group.keys.filter((key) => entries.has(key) && entries.get(key) === "");
  const status = missing.length === 0 && empty.length === 0 ? "ready" : "needs_attention";
  console.log(`${group.label}=${status}`);
  if (missing.length) console.log(`${group.label}_missing=${missing.join(",")}`);
  if (empty.length) console.log(`${group.label}_empty=${empty.join(",")}`);
}

const knownKeys = new Set(requiredGroups.flatMap((group) => group.keys));
for (const key of optionalKeys) knownKeys.add(key);

const unknown = [...entries.keys()].filter((key) => !knownKeys.has(key));
console.log(`unknown_keys=${unknown.length ? unknown.join(",") : "none"}`);
if (unknown.length) {
  console.log(
    "unknown_keys_note=Remove unsupported keys unless application code explicitly reads them.",
  );
}

if (duplicates.length) {
  console.log(
    `duplicate_keys=${duplicates.map((duplicate) => `${duplicate.key}@${duplicate.line}`).join(",")}`,
  );
}
