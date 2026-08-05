import { createHash } from "node:crypto";
import { readCognitoRuntimeConfig, type CognitoRuntimeConfig } from "./auth-config";

type JsonWebKeySet = {
  keys: CognitoJsonWebKey[];
};

type CognitoJsonWebKey = JsonWebKey & {
  kid?: string;
};

type CognitoJwtHeader = {
  alg?: string;
  kid?: string;
  typ?: string;
};

export type VerifiedCognitoClaims = {
  aud?: string;
  client_id?: string;
  email?: string;
  exp: number;
  iat?: number;
  iss: string;
  nonce?: string;
  sub: string;
  token_use: "access" | "id";
  username?: string;
};

const jwksCache = new Map<string, { fetchedAt: number; jwks: JsonWebKeySet }>();
const JWKS_CACHE_MS = 10 * 60 * 1000;

export async function verifyCognitoJwt(
  token: string,
  expectedTokenUse: "access" | "id",
  config: CognitoRuntimeConfig = readCognitoRuntimeConfig(),
): Promise<VerifiedCognitoClaims> {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error("Cognito JWT is malformed.");
  }

  const header = decodeJwtPart<CognitoJwtHeader>(encodedHeader);
  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Cognito JWT uses an unsupported signature algorithm.");
  }

  const claims = decodeJwtPart<VerifiedCognitoClaims>(encodedPayload);
  validateClaims(claims, expectedTokenUse, config);

  const jwk = await findJwk(header.kid, config.jwksUrl);
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { hash: "SHA-256", name: "RSASSA-PKCS1-v1_5" },
    false,
    ["verify"],
  );
  const signingInput = toArrayBuffer(
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
  );
  const signature = toArrayBuffer(base64UrlDecode(encodedSignature));
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    signature,
    signingInput,
  );

  if (!valid) throw new Error("Cognito JWT signature verification failed.");
  return claims;
}

export function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function findJwk(kid: string, jwksUrl: string): Promise<CognitoJsonWebKey> {
  const jwks = await getJwks(jwksUrl);
  const jwk = jwks.keys.find((candidate) => candidate.kid === kid);
  if (!jwk) throw new Error("Cognito JWT key id was not found in JWKS.");
  return jwk;
}

async function getJwks(jwksUrl: string): Promise<JsonWebKeySet> {
  const cached = jwksCache.get(jwksUrl);
  if (cached && Date.now() - cached.fetchedAt < JWKS_CACHE_MS) {
    return cached.jwks;
  }

  const response = await fetch(jwksUrl, {
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw new Error("Unable to load Cognito JWKS.");
  const jwks = (await response.json()) as JsonWebKeySet;
  jwksCache.set(jwksUrl, { fetchedAt: Date.now(), jwks });
  return jwks;
}

function validateClaims(
  claims: VerifiedCognitoClaims,
  expectedTokenUse: "access" | "id",
  config: CognitoRuntimeConfig,
) {
  if (claims.iss !== config.issuer) {
    throw new Error("Cognito JWT issuer does not match configuration.");
  }
  if (claims.token_use !== expectedTokenUse) {
    throw new Error("Cognito JWT token_use does not match expected use.");
  }
  const expectedAudience =
    expectedTokenUse === "id" ? claims.aud : claims.client_id;
  if (expectedAudience !== config.appClientId) {
    throw new Error("Cognito JWT audience/client does not match app client.");
  }
  if (!claims.sub) throw new Error("Cognito JWT subject is missing.");
  if (!claims.exp || Date.now() >= claims.exp * 1000) {
    throw new Error("Cognito JWT is expired.");
  }
}

function decodeJwtPart<T>(value: string): T {
  return JSON.parse(new TextDecoder().decode(base64UrlDecode(value))) as T;
}

function base64UrlDecode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );
  return Uint8Array.from(Buffer.from(padded, "base64"));
}

function toArrayBuffer(value: Uint8Array): ArrayBuffer {
  return value.buffer.slice(
    value.byteOffset,
    value.byteOffset + value.byteLength,
  ) as ArrayBuffer;
}
