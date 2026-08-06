import { createHash } from "node:crypto";

export type DatabaseEnvironment = "preview" | "production";
export type DatabaseProvider = "neon" | "aws-rds";
export type DatabaseRoleClass = "runtime" | "migrator";
export type DatabaseEndpointClass = "pooled" | "direct";

export type DatabaseTargetIdentity = {
  environment: DatabaseEnvironment;
  provider: DatabaseProvider;
  resourceId: string;
  databaseName: string;
  endpointId: string;
  endpointClass: DatabaseEndpointClass;
  roleClass: DatabaseRoleClass;
  hostFingerprint: string;
  roleFingerprint: string;
};

const DISABLED_TLS_VALUES = new Set(["0", "false"]);

export function validateRuntimeDatabaseContract(
  env: NodeJS.ProcessEnv = process.env,
): DatabaseTargetIdentity | undefined {
  const databaseUrl = env.DATABASE_URL;
  const environment = databaseEnvironment(env);

  if (!databaseUrl) {
    if (environment === "preview") {
      throw new Error("Preview runtime database binding is missing; refusing fallback.");
    }
    return undefined;
  }

  return validateDatabaseTarget(databaseUrl, "runtime", env);
}

export function validateDatabaseTarget(
  databaseUrl: string,
  expectedRoleClass: DatabaseRoleClass,
  env: NodeJS.ProcessEnv = process.env,
): DatabaseTargetIdentity {
  assertTlsEnabled(env);

  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error("Database connection configuration is invalid.");
  }

  if (!parsed.hostname || !parsed.username || !parsed.pathname.slice(1)) {
    throw new Error("Database connection configuration is incomplete.");
  }
  if (decodeURIComponent(parsed.username) === "neondb_owner") {
    throw new Error("Administrative database roles are prohibited in application tooling.");
  }

  const environment = databaseEnvironment(env);
  const provider = requiredProvider(env, environment);
  const endpointClass = classifyEndpoint(parsed.hostname, provider);
  const databaseName = decodeURIComponent(parsed.pathname.slice(1));
  const roleName = decodeURIComponent(parsed.username);

  if (environment === "preview") {
    requireExact(env.NOTARIX_DATABASE_PROVIDER, "neon", "Preview database provider");
    requireExact(env.NOTARIX_DATABASE_RESOURCE_ID, "plain-shadow-93565861", "Preview database resource");
    requireExact(env.NOTARIX_DATABASE_ENDPOINT_ID, "ep-orange-fog-ausod744", "Preview database endpoint");
    requireExact(env.NOTARIX_DATABASE_NAME, "neondb", "Preview database name");
    requireExact(databaseName, env.NOTARIX_DATABASE_NAME, "Connected database name");
    requireExact(endpointClass, expectedRoleClass === "runtime" ? "pooled" : "direct", "Preview endpoint class");
    requireExact(env.NOTARIX_DATABASE_ROLE_CLASS, expectedRoleClass, "Database role class");
    requireExact(roleName, expectedRoleClass === "runtime" ? "notarix_preview_app" : "notarix_preview_migrator", "Preview database role");
    const previewEndpointId = env.NOTARIX_DATABASE_ENDPOINT_ID;
    if (!previewEndpointId || !parsed.hostname.startsWith(previewEndpointId)) {
      throw new Error("Preview database endpoint identity mismatch.");
    }
    if (parsed.searchParams.get("sslmode") !== "verify-full") {
      throw new Error("Preview database TLS must use sslmode=verify-full.");
    }
    const productionHostFingerprint = env.NOTARIX_PRODUCTION_DATABASE_HOST_SHA256;
    if (productionHostFingerprint && fingerprint(parsed.hostname) === productionHostFingerprint) {
      throw new Error("Preview database host matches the prohibited Production fingerprint.");
    }
  }

  if (
    environment === "production" &&
    env.NOTARIX_DATABASE_ROLE_CLASS &&
    expectedRoleClass !== env.NOTARIX_DATABASE_ROLE_CLASS
  ) {
    throw new Error("Database role class does not match the requested operation.");
  }

  return {
    environment,
    provider,
    resourceId: env.NOTARIX_DATABASE_RESOURCE_ID ?? "unrecorded-production-resource",
    databaseName,
    endpointId: env.NOTARIX_DATABASE_ENDPOINT_ID ?? "unrecorded-production-endpoint",
    endpointClass,
    roleClass: expectedRoleClass,
    hostFingerprint: fingerprint(parsed.hostname),
    roleFingerprint: fingerprint(roleName),
  };
}

export function databaseEnvironment(env: NodeJS.ProcessEnv): DatabaseEnvironment {
  const value = env.NOTARIX_DATABASE_ENVIRONMENT ?? env.VERCEL_ENV;
  if (value === "preview" || value === "production") return value;
  if (value) throw new Error("Database environment marker is invalid.");
  return "production";
}

function requiredProvider(env: NodeJS.ProcessEnv, environment: DatabaseEnvironment) {
  const provider = env.NOTARIX_DATABASE_PROVIDER ?? (environment === "production" ? "aws-rds" : undefined);
  if (provider !== "neon" && provider !== "aws-rds") {
    throw new Error("Database provider marker is missing or invalid.");
  }
  return provider;
}

function classifyEndpoint(hostname: string, provider: DatabaseProvider): DatabaseEndpointClass {
  if (provider === "neon") {
    if (!hostname.endsWith(".neon.tech")) throw new Error("Database provider and endpoint mismatch.");
    return hostname.split(".")[0].endsWith("-pooler") ? "pooled" : "direct";
  }
  if (!hostname.endsWith(".rds.amazonaws.com")) throw new Error("Database provider and endpoint mismatch.");
  return "direct";
}

function assertTlsEnabled(env: NodeJS.ProcessEnv) {
  const setting = env.NODE_TLS_REJECT_UNAUTHORIZED?.toLowerCase();
  if (setting && DISABLED_TLS_VALUES.has(setting)) {
    throw new Error("TLS certificate verification is disabled.");
  }
}

function requireExact(actual: string | undefined, expected: string | undefined, label: string) {
  if (!actual || !expected || actual !== expected) throw new Error(`${label} mismatch.`);
}

function fingerprint(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}
