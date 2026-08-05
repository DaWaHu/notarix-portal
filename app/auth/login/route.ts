import { redirect } from "next/navigation";
import { readCognitoRuntimeConfig } from "../../auth-config";
import { createAuthFlowCookies, pkceChallenge } from "../../cognito-session";
import { safeAuthReturnPath } from "../../chatgpt-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const config = readCognitoRuntimeConfig();
  const url = new URL(request.url);
  const returnTo = safeAuthReturnPath(url.searchParams.get("return_to") ?? "/portal");
  const portal = url.searchParams.get("portal") ?? "staff";
  const flow = await createAuthFlowCookies();
  const authorizeUrl = new URL(config.authorizationEndpoint);

  authorizeUrl.searchParams.set("client_id", config.appClientId);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "openid email profile");
  authorizeUrl.searchParams.set("redirect_uri", config.redirectUri);
  authorizeUrl.searchParams.set("state", `${flow.state}.${encodeURIComponent(returnTo)}`);
  authorizeUrl.searchParams.set("nonce", flow.nonce);
  authorizeUrl.searchParams.set("code_challenge", await pkceChallenge(flow.pkceVerifier));
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  if (portal === "staff") {
    authorizeUrl.searchParams.set("identity_provider", config.staffIdpName);
  }

  redirect(authorizeUrl.toString());
}
