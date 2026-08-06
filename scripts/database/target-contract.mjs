import { createHash } from "node:crypto";

const DISABLED_TLS_VALUES = new Set(["0", "false"]);

export function validateMigrationTarget(target, env = process.env) {
  if (target !== "preview" && target !== "production") {
    throw new Error("An explicit migration target is required.");
  }
  const urlValue = env.DATABASE_MIGRATION_URL;
  if (!urlValue) throw new Error("DATABASE_MIGRATION_URL is required; runtime credentials are never a fallback.");
  if (env.NODE_TLS_REJECT_UNAUTHORIZED && DISABLED_TLS_VALUES.has(env.NODE_TLS_REJECT_UNAUTHORIZED.toLowerCase())) {
    throw new Error("TLS certificate verification is disabled.");
  }

  let url;
  try {
    url = new URL(urlValue);
  } catch {
    throw new Error("Migration connection configuration is invalid.");
  }
  const role = decodeURIComponent(url.username);
  const database = decodeURIComponent(url.pathname.slice(1));
  if (role === "neondb_owner") throw new Error("Administrative roles are prohibited for migrations.");
  if (env.NOTARIX_DATABASE_ENVIRONMENT !== target) throw new Error("Migration environment marker mismatch.");
  if (env.NOTARIX_DATABASE_ROLE_CLASS !== "migrator") throw new Error("Migration role-class marker mismatch.");

  if (target === "preview") {
    exact(env.NOTARIX_DATABASE_PROVIDER, "neon", "Preview provider");
    exact(env.NOTARIX_DATABASE_RESOURCE_ID, "plain-shadow-93565861", "Preview resource");
    exact(env.NOTARIX_DATABASE_ENDPOINT_ID, "ep-orange-fog-ausod744", "Preview endpoint");
    exact(env.NOTARIX_DATABASE_NAME, "neondb", "Preview database marker");
    exact(database, "neondb", "Preview database");
    exact(role, "notarix_preview_migrator", "Preview migration role");
    if (url.hostname.split(".")[0].endsWith("-pooler")) throw new Error("Migrations require the direct Neon endpoint.");
    if (!url.hostname.endsWith(".neon.tech") || !url.hostname.startsWith("ep-orange-fog-ausod744.")) {
      throw new Error("Preview endpoint identity mismatch.");
    }
    if (url.searchParams.get("sslmode") !== "verify-full") throw new Error("Preview migration TLS must use sslmode=verify-full.");
    const productionFingerprint = env.NOTARIX_PRODUCTION_DATABASE_HOST_SHA256;
    if (productionFingerprint && sha256(url.hostname) === productionFingerprint) {
      throw new Error("Preview migration host matches the prohibited Production fingerprint.");
    }
  } else {
    exact(env.NOTARIX_DATABASE_PROVIDER, "aws-rds", "Production provider");
    if (!url.hostname.endsWith(".rds.amazonaws.com")) throw new Error("Production migration endpoint must be AWS RDS.");
  }

  return {
    target,
    provider: env.NOTARIX_DATABASE_PROVIDER,
    resourceId: env.NOTARIX_DATABASE_RESOURCE_ID,
    endpointId: env.NOTARIX_DATABASE_ENDPOINT_ID,
    database,
    roleClass: "migrator",
    endpointClass: "direct",
    hostFingerprint: sha256(url.hostname).slice(0, 16),
    roleFingerprint: sha256(role).slice(0, 16),
    sanitizedUrl: urlValue,
  };
}

function exact(actual, expected, label) {
  if (!actual || actual !== expected) throw new Error(`${label} mismatch.`);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
