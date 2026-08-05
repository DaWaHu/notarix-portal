import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cognitoAuthEnabled } from "./auth-config";
import { getCognitoPortalSession } from "./cognito-session";

export type PortalUser = {
  displayName: string;
  email: string;
  fullName: string | null;
};

const LOCAL_STAFF_PREVIEW_PATH = "/local-staff-preview";
const LOCAL_STAFF_COOKIE = "notarix_local_staff_preview";

export async function getPortalUser(): Promise<PortalUser | null> {
  if (cognitoAuthEnabled()) {
    const session = await getCognitoPortalSession();
    return session
      ? {
          displayName: session.displayName,
          email: session.email,
          fullName: session.displayName,
        }
      : null;
  }

  const requestHeaders = await headers();
  if (!isLocalDevHost(requestHeaders.get("host"))) return null;

  const cookieHeader = requestHeaders.get("cookie") ?? "";
  if (!cookieHeader.includes(`${LOCAL_STAFF_COOKIE}=1`)) return null;

  return {
    displayName: "Local Notarix Staff Preview",
    email: "local.staff@notarix.live",
    fullName: "Local Notarix Staff Preview",
  };
}

export async function requirePortalUser(returnTo: string): Promise<PortalUser> {
  const user = await getPortalUser();
  if (user) return user;

  const requestHeaders = await headers();
  if (isLocalDevHost(requestHeaders.get("host"))) {
    redirect(localStaffPreviewPath(returnTo));
  }

  if (cognitoAuthEnabled()) {
    redirect(cognitoSignInPath(returnTo));
  }

  redirect(authUnavailablePath(returnTo));
}

export function cognitoSignInPath(returnTo: string): string {
  return `/auth/login?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

export function cognitoSignOutPath(returnTo = "/"): string {
  return `/auth/logout?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

export function authUnavailablePath(returnTo = "/"): string {
  return `/auth/unavailable?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

export function localStaffPreviewPath(returnTo: string): string {
  return `${LOCAL_STAFF_PREVIEW_PATH}?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

export function localStaffCookieName(): string {
  return LOCAL_STAFF_COOKIE;
}

export function isLocalDevHost(host: string | null): boolean {
  if (!host) return false;
  const hostname = host.split(":")[0].toLowerCase();
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

export function safeAuthReturnPath(value: string | null): string {
  return safeRelativeReturnPath(value ?? "/");
}

function safeRelativeReturnPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";

  let url: URL;
  try {
    url = new URL(value, "https://app.local");
  } catch {
    return "/";
  }
  if (url.origin !== "https://app.local") return "/";
  if (isReservedAuthPath(url.pathname)) return "/";
  return `${url.pathname}${url.search}${url.hash}`;
}

function isReservedAuthPath(pathname: string): boolean {
  return pathname.startsWith("/auth/") || pathname === LOCAL_STAFF_PREVIEW_PATH;
}
