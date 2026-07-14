import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  isLocalDevHost,
  requireChatGPTUser,
  type ChatGPTUser,
} from "./chatgpt-auth";

export type StaffRole = "GenAdmin" | "Admin" | "SuperAdmin";
export type PortalActorRole = StaffRole | "Client" | "Notary";
export type CommandAuthority =
  | "AnyStaff"
  | "AdminOrSuperAdmin"
  | "SuperAdmin"
  | "ClientUser"
  | "AssignedNotary";

export type ProtectedStaffAccess = {
  role: StaffRole;
  session: StaffIdentitySession;
  user: ChatGPTUser;
};

export const accessPolicyContract = {
  authority:
    "Protected routes and command actions are evaluated through a shared Notarix Signings RBAC policy before workflow changes are allowed.",
  identityProvider:
    "Production deployment must bind staff identity, MFA/passkeys, device posture, and role claims through the configured identity provider.",
  audit:
    "Allowed and blocked command attempts must remain attributable to the signed-in actor, role, target, timestamp, and authority requirement.",
  leastPrivilege:
    "General Admin review is separated from Administrator/Super Admin final approval, financial activation, restricted evidence release, and audit reporting.",
  productionClaims:
    "Production staff access requires x-notarix-idp-role, x-notarix-idp-mfa, x-notarix-idp-passkey, x-notarix-device-trust, and x-notarix-session-assurance claims.",
} as const;

export const productionIdentityClaimHeaders = {
  deviceTrust: "x-notarix-device-trust",
  mfa: "x-notarix-idp-mfa",
  passkey: "x-notarix-idp-passkey",
  role: "x-notarix-idp-role",
  sessionAssurance: "x-notarix-session-assurance",
} as const;

const LOCAL_PREVIEW_ROLE_HEADER = "x-notarix-staff-role";

export type StaffIdentitySession = {
  compliant: boolean;
  deviceTrusted: boolean;
  localPreview: boolean;
  mfaVerified: boolean;
  passkeyVerified: boolean;
  role: StaffRole | null;
  sessionAssurance: "High" | "Insufficient";
  source: "LocalPreview" | "ProductionIdentityProvider";
};

export async function requireStaffRouteAccess(
  returnTo: string,
  allowedRoles: readonly StaffRole[],
): Promise<ProtectedStaffAccess> {
  const user = await requireChatGPTUser(returnTo);
  const session = await getStaffIdentitySession();

  if (!session.compliant || !session.role || !allowedRoles.includes(session.role)) {
    notFound();
  }

  return { role: session.role, session, user };
}

export async function getRequestStaffRole(): Promise<StaffRole> {
  const session = await getStaffIdentitySession();
  return session.role ?? "GenAdmin";
}

export async function getStaffIdentitySession(): Promise<StaffIdentitySession> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const localPreview = !host || isLocalDevHost(host);

  if (localPreview) {
    return {
      compliant: true,
      deviceTrusted: true,
      localPreview: true,
      mfaVerified: true,
      passkeyVerified: true,
      role: normalizeStaffRole(requestHeaders.get(LOCAL_PREVIEW_ROLE_HEADER)),
      sessionAssurance: "High",
      source: "LocalPreview",
    };
  }

  const role = normalizeStaffRoleClaim(
    requestHeaders.get(productionIdentityClaimHeaders.role),
  );
  const mfaVerified = isVerifiedClaim(
    requestHeaders.get(productionIdentityClaimHeaders.mfa),
  );
  const passkeyVerified = isVerifiedClaim(
    requestHeaders.get(productionIdentityClaimHeaders.passkey),
  );
  const deviceTrusted = isTrustedDeviceClaim(
    requestHeaders.get(productionIdentityClaimHeaders.deviceTrust),
  );
  const highAssurance = isHighAssuranceClaim(
    requestHeaders.get(productionIdentityClaimHeaders.sessionAssurance),
  );

  return {
    compliant:
      Boolean(role) &&
      mfaVerified &&
      passkeyVerified &&
      deviceTrusted &&
      highAssurance,
    deviceTrusted,
    localPreview: false,
    mfaVerified,
    passkeyVerified,
    role,
    sessionAssurance: highAssurance ? "High" : "Insufficient",
    source: "ProductionIdentityProvider",
  };
}

export function normalizeStaffRole(value: unknown): StaffRole {
  if (value === "SuperAdmin") return "SuperAdmin";
  if (value === "Admin") return "Admin";
  return "GenAdmin";
}

export function normalizeLocalPreviewStaffRole(value: unknown): StaffRole {
  return normalizeStaffRole(value);
}

export function normalizeStaffRoleClaim(value: unknown): StaffRole | null {
  if (value === "SuperAdmin" || value === "notarix:staff:superadmin") {
    return "SuperAdmin";
  }
  if (value === "Admin" || value === "notarix:staff:admin") return "Admin";
  if (value === "GenAdmin" || value === "notarix:staff:genadmin") {
    return "GenAdmin";
  }
  return null;
}

export function normalizePortalActorRole(value: unknown): PortalActorRole {
  if (
    value === "Admin" ||
    value === "SuperAdmin" ||
    value === "Client" ||
    value === "Notary"
  ) {
    return value;
  }
  return "GenAdmin";
}

export function canUseCommandAuthority(
  authority: CommandAuthority,
  role: PortalActorRole,
): boolean {
  if (authority === "AnyStaff") {
    return role === "GenAdmin" || role === "Admin" || role === "SuperAdmin";
  }
  if (authority === "AdminOrSuperAdmin") {
    return role === "Admin" || role === "SuperAdmin";
  }
  if (authority === "ClientUser") return role === "Client";
  if (authority === "AssignedNotary") return role === "Notary";
  return role === "SuperAdmin";
}

export function commandAuthorityLabel(authority: CommandAuthority): string {
  if (authority === "AnyStaff") return "Authorized staff";
  if (authority === "AdminOrSuperAdmin") return "Administrator or Super Admin";
  if (authority === "ClientUser") return "Authorized client user";
  if (authority === "AssignedNotary") return "Assigned notary";
  return "Super Admin";
}

function isVerifiedClaim(value: string | null): boolean {
  return value === "verified" || value === "true" || value === "required";
}

function isTrustedDeviceClaim(value: string | null): boolean {
  return value === "managed" || value === "approved" || value === "trusted";
}

function isHighAssuranceClaim(value: string | null): boolean {
  return value === "high" || value === "phishing-resistant";
}
