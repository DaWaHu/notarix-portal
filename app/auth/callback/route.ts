import { redirect } from "next/navigation";
import { cognitoAuthEnabled, readCognitoRuntimeConfig } from "../../auth-config";
import { authUnavailablePath, safeAuthReturnPath } from "../../portal-auth";
import { verifyCognitoJwt } from "../../cognito-jwt";
import {
  clearAuthFlowCookies,
  newSessionToken,
  readAuthFlowCookies,
  setPortalSessionCookie,
} from "../../cognito-session";
import { upsertCognitoPortalUser } from "../../portal-user-repository";

export const runtime = "nodejs";

type TokenResponse = {
  access_token?: string;
  expires_in?: number;
  id_token?: string;
  refresh_token?: string;
  token_type?: string;
};

export async function GET(request: Request) {
  if (!cognitoAuthEnabled()) {
    redirect(authUnavailablePath());
  }

  const config = readCognitoRuntimeConfig();
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const stateParam = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");
  const flow = await readAuthFlowCookies();

  if (error) {
    await clearAuthFlowCookies();
    redirect(authUnavailablePath());
  }

  if (!code || !stateParam || !flow) {
    await clearAuthFlowCookies();
    redirect(authUnavailablePath());
  }

  const separator = stateParam.indexOf(".");
  const state = separator === -1 ? stateParam : stateParam.slice(0, separator);
  const encodedReturnTo =
    separator === -1 ? "%2Fportal" : stateParam.slice(separator + 1);
  if (state !== flow.state) {
    await clearAuthFlowCookies();
    redirect(authUnavailablePath());
  }

  const tokenResponse = await exchangeCodeForTokens(
    code,
    flow.pkceVerifier,
    config,
  );
  if (!tokenResponse.id_token || !tokenResponse.access_token) {
    await clearAuthFlowCookies();
    redirect(authUnavailablePath());
  }

  const idClaims = await verifyCognitoJwt(tokenResponse.id_token, "id", config);
  const accessClaims = await verifyCognitoJwt(
    tokenResponse.access_token,
    "access",
    config,
  );

  if (idClaims.nonce !== flow.nonce) {
    await clearAuthFlowCookies();
    redirect(authUnavailablePath());
  }
  if (idClaims.sub !== accessClaims.sub) {
    await clearAuthFlowCookies();
    redirect(authUnavailablePath());
  }
  if (!idClaims.email) {
    await clearAuthFlowCookies();
    redirect(authUnavailablePath());
  }

  const email = idClaims.email.toLowerCase();
  const isStaffEmail = email.endsWith(`@${config.allowedStaffDomain}`);
  const displayName = idClaims.username ?? email;
  const user = await upsertCognitoPortalUser({
    displayName,
    email,
    issuer: idClaims.iss,
    provider: isStaffEmail ? config.staffIdpName : "Cognito",
    subject: idClaims.sub,
  });

  await setPortalSessionCookie({
    sessionToken: newSessionToken(),
    userId: user.userId,
  });
  await clearAuthFlowCookies();

  redirect(safeAuthReturnPath(decodeURIComponent(encodedReturnTo)));
}

async function exchangeCodeForTokens(
  code: string,
  pkceVerifier: string,
  config: ReturnType<typeof readCognitoRuntimeConfig>,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    client_id: config.appClientId,
    code,
    code_verifier: pkceVerifier,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUri,
  });
  const headers: Record<string, string> = {
    "content-type": "application/x-www-form-urlencoded",
  };
  const clientSecret = process.env.NOTARIX_COGNITO_CLIENT_SECRET?.trim();
  if (clientSecret) {
    headers.authorization = `Basic ${Buffer.from(
      `${config.appClientId}:${clientSecret}`,
    ).toString("base64")}`;
  }

  const response = await fetch(config.tokenEndpoint, {
    body,
    headers,
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Cognito authorization-code token exchange failed.");
  }

  return (await response.json()) as TokenResponse;
}
