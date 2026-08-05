import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cognitoAuthEnabled } from "./auth-config";
import { getCognitoPortalSession } from "./cognito-session";

export type ChatGPTUser = {
  displayName: string;
  email: string;
  fullName: string | null;
};

const USER_EMAIL_HEADER = "oai-authenticated-user-email";
const USER_FULL_NAME_HEADER = "oai-authenticated-user-full-name";
const USER_FULL_NAME_ENCODING_HEADER =
  "oai-authenticated-user-full-name-encoding";
const PERCENT_ENCODED_UTF8 = "percent-encoded-utf-8";
const SIGN_IN_PATH = "/signin-with-chatgpt";
const SIGN_OUT_PATH = "/signout-with-chatgpt";
const CALLBACK_PATH = "/callback";
const LOCAL_STAFF_PREVIEW_PATH = "/local-staff-preview";
const LOCAL_STAFF_COOKIE = "notarix_local_staff_preview";

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  if (cognitoAuthEnabled()) {
    const session = await getCognitoPortalSession();
    if (session) {
      return {
        displayName: session.displayName,
        email: session.email,
        fullName: session.displayName,
      };
    }
  }

  const requestHeaders = await headers();
  const email = requestHeaders.get(USER_EMAIL_HEADER);
  if (!email) {
    const cookieHeader = requestHeaders.get("cookie") ?? "";
    if (
      isLocalDevHost(requestHeaders.get("host")) &&
      cookieHeader.includes(`${LOCAL_STAFF_COOKIE}=1`)
    ) {
      return {
        displayName: "Local Notarix Staff Preview",
        email: "local.staff@notarix.live",
        fullName: "Local Notarix Staff Preview",
      };
    }

    return null;
  }

  const encodedFullName = requestHeaders.get(USER_FULL_NAME_HEADER);
  const fullName =
    encodedFullName &&
    requestHeaders.get(USER_FULL_NAME_ENCODING_HEADER) === PERCENT_ENCODED_UTF8
      ? safeDecodeURIComponent(encodedFullName)
      : null;

  return {
    displayName: fullName ?? email,
    email,
    fullName,
  };
}

export async function requireChatGPTUser(
  returnTo: string,
): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();
  if (user) return user;

  const requestHeaders = await headers();
  if (isLocalDevHost(requestHeaders.get("host"))) {
    redirect(localStaffPreviewPath(returnTo));
  }

  if (cognitoAuthEnabled()) {
    redirect(cognitoSignInPath(returnTo));
  }

  redirect(chatGPTSignInPath(returnTo));
}

export function chatGPTSignInPath(returnTo: string): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

export function chatGPTSignOutPath(returnTo = "/"): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

export function cognitoSignInPath(returnTo: string): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `/auth/login?return_to=${encodeURIComponent(safeReturnTo)}`;
}

export function cognitoSignOutPath(returnTo = "/"): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `/auth/logout?return_to=${encodeURIComponent(safeReturnTo)}`;
}

export function localStaffPreviewPath(returnTo: string): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${LOCAL_STAFF_PREVIEW_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

export function localStaffCookieName(): string {
  return LOCAL_STAFF_COOKIE;
}

export function isLocalDevHost(host: string | null): boolean {
  if (!host) return false;
  const hostname = host.split(":")[0];

  return hostname === "localhost" || hostname === "127.0.0.1";
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
  return (
    pathname === SIGN_IN_PATH ||
    pathname === SIGN_OUT_PATH ||
    pathname === CALLBACK_PATH
  );
}

function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
