import { redirect } from "next/navigation";
import { readCognitoRuntimeConfig } from "../../auth-config";
import { safeAuthReturnPath } from "../../chatgpt-auth";
import { clearPortalSessionCookie } from "../../cognito-session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const config = readCognitoRuntimeConfig();
  const url = new URL(request.url);
  const returnTo = safeAuthReturnPath(url.searchParams.get("return_to") ?? "/");

  await clearPortalSessionCookie();

  const logoutUrl = new URL(`${config.userPoolDomain}/logout`);
  logoutUrl.searchParams.set("client_id", config.appClientId);
  logoutUrl.searchParams.set("logout_uri", config.logoutDestination);
  logoutUrl.searchParams.set("state", encodeURIComponent(returnTo));

  redirect(logoutUrl.toString());
}
