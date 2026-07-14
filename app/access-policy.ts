import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { requireChatGPTUser, type ChatGPTUser } from "./chatgpt-auth";

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
} as const;

export async function requireStaffRouteAccess(
  returnTo: string,
  allowedRoles: readonly StaffRole[],
): Promise<ProtectedStaffAccess> {
  const user = await requireChatGPTUser(returnTo);
  const role = await getRequestStaffRole();

  if (!allowedRoles.includes(role)) {
    notFound();
  }

  return { role, user };
}

export async function getRequestStaffRole(): Promise<StaffRole> {
  const requestHeaders = await headers();
  return normalizeStaffRole(requestHeaders.get("x-notarix-staff-role"));
}

export function normalizeStaffRole(value: unknown): StaffRole {
  if (value === "SuperAdmin") return "SuperAdmin";
  if (value === "Admin") return "Admin";
  return "GenAdmin";
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
