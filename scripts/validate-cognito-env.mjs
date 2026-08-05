const localEnv = await loadLocalEnv();
const env = { ...localEnv, ...process.env };

const requiredWhenCognito = [
  "NOTARIX_COGNITO_REGION",
  "NOTARIX_COGNITO_USER_POOL_ID",
  "NOTARIX_COGNITO_USER_POOL_DOMAIN",
  "NOTARIX_COGNITO_CLIENT_ID",
  "NOTARIX_COGNITO_ISSUER",
  "NOTARIX_COGNITO_JWKS_URL",
  "NOTARIX_COGNITO_REDIRECT_URI",
  "NOTARIX_COGNITO_LOGOUT_URI",
  "NOTARIX_COGNITO_STAFF_IDP_NAME",
  "NOTARIX_COGNITO_ALLOWED_STAFF_DOMAIN",
  "NOTARIX_OWNER_SUPER_ADMIN_EMAIL",
];

const secretWhenCognito = [
  "NOTARIX_COGNITO_CLIENT_SECRET",
  "NOTARIX_SESSION_COOKIE_SECRET",
];

const authMode = normalized("NOTARIX_AUTH_MODE");
const authProvider = normalized("NOTARIX_AUTH_PROVIDER");
const cognitoEnabled = authMode === "cognito" || authProvider === "cognito";

console.log(`cognito_auth_mode=${authMode || "unset"}`);
console.log(`cognito_auth_provider=${authProvider || "unset"}`);
console.log(`cognito_enabled=${cognitoEnabled}`);

if (!cognitoEnabled) {
  console.log("status=legacy_rollback_mode");
  process.exit(0);
}

const missing = requiredWhenCognito.filter((name) => !env[name]);
const missingSecrets = secretWhenCognito.filter((name) => !env[name]);
const ownerEmail = String(env.NOTARIX_OWNER_SUPER_ADMIN_EMAIL ?? "").toLowerCase();
const staffDomain = String(env.NOTARIX_COGNITO_ALLOWED_STAFF_DOMAIN ?? "").toLowerCase();
const ownerMatchesDomain = Boolean(
  ownerEmail && staffDomain && ownerEmail.endsWith(`@${staffDomain}`),
);
const issuerMatchesPool = String(env.NOTARIX_COGNITO_ISSUER ?? "").endsWith(
  `/${env.NOTARIX_COGNITO_USER_POOL_ID}`,
);
const jwksMatchesIssuer =
  String(env.NOTARIX_COGNITO_JWKS_URL ?? "") ===
  `${env.NOTARIX_COGNITO_ISSUER}/.well-known/jwks.json`;

console.log(`required_missing=${missing.length ? missing.join(",") : "none"}`);
console.log(
  `secret_presence_missing=${missingSecrets.length ? missingSecrets.join(",") : "none"}`,
);
console.log(`owner_domain_valid=${ownerMatchesDomain}`);
console.log(`issuer_pool_valid=${issuerMatchesPool}`);
console.log(`jwks_issuer_valid=${jwksMatchesIssuer}`);

const ready =
  missing.length === 0 &&
  missingSecrets.length === 0 &&
  ownerMatchesDomain &&
  issuerMatchesPool &&
  jwksMatchesIssuer;

console.log(`status=${ready ? "ready_for_cognito_preview" : "needs_cognito_configuration"}`);
process.exitCode = ready ? 0 : 1;

function normalized(name) {
  return String(env[name] ?? "").trim().toLowerCase();
}

async function loadLocalEnv() {
  try {
    const { readFile } = await import("node:fs/promises");
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

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}
