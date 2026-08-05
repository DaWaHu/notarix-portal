import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cognitoAuthEnabled, readCognitoRuntimeConfig } from "../../auth-config";
import {
  authUnavailablePath,
  isLocalDevHost,
  localStaffCookieName,
  safeAuthReturnPath,
} from "../../portal-auth";
import { clearPortalSessionCookie } from "../../cognito-session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = safeAuthReturnPath(url.searchParams.get("return_to") ?? "/");

  await clearPortalSessionCookie();
  if (!cognitoAuthEnabled()) {
    const requestHeaders = await headers();
    if (isLocalDevHost(requestHeaders.get("host"))) {
      const cookieStore = await cookies();
      cookieStore.delete(localStaffCookieName());
      redirect(returnTo);
    }
    redirect(authUnavailablePath(returnTo));
  }

  const config = readCognitoRuntimeConfig();

  const logoutUrl = new URL(`${config.userPoolDomain}/logout`);
  logoutUrl.searchParams.set("client_id", config.appClientId);
  logoutUrl.searchParams.set("logout_uri", config.logoutDestination);
  logoutUrl.searchParams.set("state", encodeURIComponent(returnTo));

  redirect(logoutUrl.toString());
}
