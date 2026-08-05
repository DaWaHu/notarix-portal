export const portalRoles = [
  "SUPER_ADMIN",
  "ADMIN",
  "GEN_ADMIN",
  "NOTARY",
  "CLIENT",
  "OBSERVER",
] as const;

export type PortalRole = (typeof portalRoles)[number];
export type PortalAccountStatus = "ACTIVE" | "INVITED" | "SUSPENDED" | "DISABLED";

export type CognitoRuntimeConfig = {
  allowedStaffDomain: string;
  appClientId: string;
  authorizationEndpoint: string;
  issuer: string;
  jwksUrl: string;
  logoutDestination: string;
  redirectUri: string;
  region: string;
  staffIdpName: string;
  tokenEndpoint: string;
  userPoolDomain: string;
  userPoolId: string;
};

export function cognitoAuthEnabled(): boolean {
  return (
    normalizedEnv("NOTARIX_AUTH_MODE") === "cognito" ||
    normalizedEnv("NOTARIX_AUTH_PROVIDER") === "cognito"
  );
}

export function ownerSuperAdminEmail(): string {
  return (
    process.env.NOTARIX_OWNER_SUPER_ADMIN_EMAIL ??
    "owner@dawahucollective.com"
  )
    .trim()
    .toLowerCase();
}

export function readCognitoRuntimeConfig(): CognitoRuntimeConfig {
  const region = requiredEnv("NOTARIX_COGNITO_REGION");
  const userPoolId = requiredEnv("NOTARIX_COGNITO_USER_POOL_ID");
  const appClientId = requiredEnv("NOTARIX_COGNITO_CLIENT_ID");
  const issuer = requiredEnv("NOTARIX_COGNITO_ISSUER");
  const jwksUrl = requiredEnv("NOTARIX_COGNITO_JWKS_URL");
  const userPoolDomain = normalizeCognitoDomain(
    requiredEnv("NOTARIX_COGNITO_USER_POOL_DOMAIN"),
  );
  const redirectUri = requiredEnv("NOTARIX_COGNITO_REDIRECT_URI");
  const logoutDestination = requiredEnv("NOTARIX_COGNITO_LOGOUT_URI");
  const staffIdpName =
    process.env.NOTARIX_COGNITO_STAFF_IDP_NAME?.trim() ?? "GoogleWorkspace";
  const allowedStaffDomain =
    process.env.NOTARIX_COGNITO_ALLOWED_STAFF_DOMAIN?.trim().toLowerCase() ??
    "dawahucollective.com";

  return {
    allowedStaffDomain,
    appClientId,
    authorizationEndpoint: `${userPoolDomain}/oauth2/authorize`,
    issuer,
    jwksUrl,
    logoutDestination,
    redirectUri,
    region,
    staffIdpName,
    tokenEndpoint: `${userPoolDomain}/oauth2/token`,
    userPoolDomain,
    userPoolId,
  };
}

export function validatePortalRole(value: unknown): PortalRole | null {
  return portalRoles.includes(value as PortalRole) ? (value as PortalRole) : null;
}

export function isStaffPortalRole(role: PortalRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "GEN_ADMIN";
}

export function legacyStaffRole(role: PortalRole): "SuperAdmin" | "Admin" | "GenAdmin" | null {
  if (role === "SUPER_ADMIN") return "SuperAdmin";
  if (role === "ADMIN") return "Admin";
  if (role === "GEN_ADMIN") return "GenAdmin";
  return null;
}

export function canonicalStaffRole(value: unknown): PortalRole | null {
  if (value === "SuperAdmin" || value === "notarix:staff:superadmin") {
    return "SUPER_ADMIN";
  }
  if (value === "Admin" || value === "notarix:staff:admin") return "ADMIN";
  if (value === "GenAdmin" || value === "notarix:staff:genadmin") {
    return "GEN_ADMIN";
  }
  return validatePortalRole(value);
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required when Cognito authentication is enabled.`);
  }
  return value;
}

function normalizedEnv(name: string): string {
  return (process.env[name] ?? "").trim().toLowerCase();
}

function normalizeCognitoDomain(value: string): string {
  const trimmed = value.replace(/\/+$/, "");
  if (trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}
