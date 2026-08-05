import { cookies, headers } from "next/headers";
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { tokenHash } from "./cognito-jwt";
import {
  createPortalAuthSession,
  getPortalSessionByHash,
  revokePortalSession,
  type PortalUserSessionRecord,
} from "./portal-user-repository";

const DEFAULT_COOKIE_NAME = "notarix_portal_session";
const STATE_COOKIE_NAME = "notarix_auth_state";
const NONCE_COOKIE_NAME = "notarix_auth_nonce";
const PKCE_COOKIE_NAME = "notarix_auth_pkce";
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const AUTH_FLOW_TTL_SECONDS = 10 * 60;

export type AuthFlowCookies = {
  nonce: string;
  pkceVerifier: string;
  state: string;
};

export async function createAuthFlowCookies(): Promise<AuthFlowCookies> {
  const cookieStore = await cookies();
  const values = {
    nonce: randomNonce(),
    pkceVerifier: randomNonce(),
    state: randomNonce(),
  };

  cookieStore.set(STATE_COOKIE_NAME, values.state, authCookieOptions(AUTH_FLOW_TTL_SECONDS));
  cookieStore.set(NONCE_COOKIE_NAME, values.nonce, authCookieOptions(AUTH_FLOW_TTL_SECONDS));
  cookieStore.set(PKCE_COOKIE_NAME, values.pkceVerifier, authCookieOptions(AUTH_FLOW_TTL_SECONDS));

  return values;
}

export async function readAuthFlowCookies(): Promise<AuthFlowCookies | null> {
  const cookieStore = await cookies();
  const state = cookieStore.get(STATE_COOKIE_NAME)?.value;
  const nonce = cookieStore.get(NONCE_COOKIE_NAME)?.value;
  const pkceVerifier = cookieStore.get(PKCE_COOKIE_NAME)?.value;
  if (!state || !nonce || !pkceVerifier) return null;
  return { nonce, pkceVerifier, state };
}

export async function clearAuthFlowCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(STATE_COOKIE_NAME);
  cookieStore.delete(NONCE_COOKIE_NAME);
  cookieStore.delete(PKCE_COOKIE_NAME);
}

export async function setPortalSessionCookie(input: {
  sessionToken: string;
  userId: string;
}) {
  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const expiresAtUtc = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  await createPortalAuthSession({
    expiresAtUtc,
    ipAddress: requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
    sessionTokenHash: tokenHash(input.sessionToken),
    userAgent: requestHeaders.get("user-agent") ?? "unknown",
    userId: input.userId,
  });

  cookieStore.set(
    sessionCookieName(),
    signSessionToken(input.sessionToken),
    authCookieOptions(SESSION_TTL_SECONDS),
  );
}

export async function getCognitoPortalSession(): Promise<PortalUserSessionRecord | null> {
  const cookieStore = await cookies();
  const sessionToken = verifySignedSessionToken(
    cookieStore.get(sessionCookieName())?.value,
  );
  if (!sessionToken) return null;
  return getPortalSessionByHash(tokenHash(sessionToken));
}

export async function clearPortalSessionCookie() {
  const cookieStore = await cookies();
  const sessionToken = verifySignedSessionToken(
    cookieStore.get(sessionCookieName())?.value,
  );
  if (sessionToken) await revokePortalSession(tokenHash(sessionToken));
  cookieStore.delete(sessionCookieName());
}

export function newSessionToken(): string {
  return `st_${randomUUID()}_${randomNonce()}`;
}

export async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return base64UrlEncode(new Uint8Array(digest));
}

function sessionCookieName(): string {
  return process.env.NOTARIX_SESSION_COOKIE_NAME?.trim() || DEFAULT_COOKIE_NAME;
}

function signSessionToken(sessionToken: string): string {
  const signature = hmac(sessionToken);
  return `${sessionToken}.${signature}`;
}

function verifySignedSessionToken(value: string | undefined): string | null {
  if (!value) return null;
  const separator = value.lastIndexOf(".");
  if (separator < 1) return null;
  const sessionToken = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  const expected = hmac(sessionToken);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null;
  return sessionToken;
}

function hmac(value: string): string {
  const secret = process.env.NOTARIX_SESSION_COOKIE_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "NOTARIX_SESSION_COOKIE_SECRET is required when Cognito authentication is enabled.",
    );
  }
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function authCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: true,
  };
}

function randomNonce(): string {
  return base64UrlEncode(randomBytes(32));
}

function base64UrlEncode(value: Uint8Array): string {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
