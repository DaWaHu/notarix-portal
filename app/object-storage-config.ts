type RuntimeEnv = Record<string, string | undefined>;

const DEFAULT_SIGNED_URL_TTL_SECONDS = 15 * 60;

export const objectStorageEnvironmentContract = {
  access:
    "AWS S3-compatible storage is the primary evidence and order document storage provider.",
  credentials:
    "Storage credentials must be injected through environment secrets and never stored in source files.",
  signedUrls:
    "Evidence access uses short-lived signed GET URLs after authorization, malware validation, release eligibility, and receipt creation.",
} as const;

export const objectStorageSecretNames = {
  accessKeyId: ["AWS_ACCESS_KEY_ID"],
  bucket: ["NOTARIX_STORAGE_BUCKET", "S3_BUCKET_NAME"],
  endpoint: ["NOTARIX_STORAGE_ENDPOINT"],
  region: ["NOTARIX_STORAGE_REGION", "AWS_REGION"],
  secretAccessKey: ["AWS_SECRET_ACCESS_KEY"],
} as const;

export type ObjectStorageEnvironmentStatus = {
  bucketConfigured: boolean;
  configured: boolean;
  endpointConfigured: boolean;
  provider: string;
  regionConfigured: boolean;
  requiredKeys: readonly string[];
};

export type SignedObjectAccessInput = {
  bucketName: string;
  expiresInSeconds?: number;
  objectKey: string;
};

export type SignedObjectAccessResult = {
  configured: boolean;
  expiresAtUtc: string;
  provider: string;
  signedUrl: string;
};

export type SignedObjectUploadInput = SignedObjectAccessInput & {
  contentType?: string;
};

export async function getObjectStorageEnvironmentStatus(): Promise<ObjectStorageEnvironmentStatus> {
  const env = await getRuntimeEnv();
  return {
    bucketConfigured: Boolean(firstEnvValue(env, objectStorageSecretNames.bucket)),
    configured: isObjectStorageConfigured(env),
    endpointConfigured: Boolean(firstEnvValue(env, objectStorageSecretNames.endpoint)),
    provider: "AWS S3-compatible encrypted object storage",
    regionConfigured: Boolean(firstEnvValue(env, objectStorageSecretNames.region)),
    requiredKeys: [
      ...objectStorageSecretNames.region,
      ...objectStorageSecretNames.bucket,
      ...objectStorageSecretNames.accessKeyId,
      ...objectStorageSecretNames.secretAccessKey,
    ],
  };
}

export async function createSignedObjectAccessUrl(
  input: SignedObjectAccessInput,
): Promise<SignedObjectAccessResult> {
  return createSignedObjectUrl({
    ...input,
    method: "GET",
    previewAction: "signed-access",
  });
}

export async function createSignedObjectUploadUrl(
  input: SignedObjectUploadInput,
): Promise<SignedObjectAccessResult> {
  return createSignedObjectUrl({
    ...input,
    method: "PUT",
    previewAction: "signed-upload",
  });
}

async function createSignedObjectUrl(
  input: SignedObjectAccessInput & {
    method: "GET" | "PUT";
    previewAction: string;
  },
): Promise<SignedObjectAccessResult> {
  const env = await getRuntimeEnv();
  const expiresInSeconds = input.expiresInSeconds ?? DEFAULT_SIGNED_URL_TTL_SECONDS;
  const expiresAtUtc = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

  if (!isObjectStorageConfigured(env)) {
    return {
      configured: false,
      expiresAtUtc,
      provider: "Local preview signed access token",
      signedUrl: `/evidence/${encodeURIComponent(input.objectKey)}/signed?preview=${input.previewAction}-storage-binding-required`,
    };
  }

  const region = firstEnvValue(env, objectStorageSecretNames.region) as string;
  const accessKeyId = firstEnvValue(env, objectStorageSecretNames.accessKeyId) as string;
  const secretAccessKey = firstEnvValue(
    env,
    objectStorageSecretNames.secretAccessKey,
  ) as string;
  const bucket = firstEnvValue(env, objectStorageSecretNames.bucket) ?? input.bucketName;
  const endpoint = firstEnvValue(env, objectStorageSecretNames.endpoint);
  const signedUrl = await createAwsS3PresignedGetUrl({
    accessKeyId,
    bucket,
    endpoint,
    expiresInSeconds,
    objectKey: input.objectKey,
    method: input.method,
    region,
    secretAccessKey,
  });

  return {
    configured: true,
    expiresAtUtc,
    provider: "AWS S3-compatible encrypted object storage",
    signedUrl,
  };
}

async function createAwsS3PresignedGetUrl(input: {
  accessKeyId: string;
  bucket: string;
  endpoint?: string;
  expiresInSeconds: number;
  method: "GET" | "PUT";
  objectKey: string;
  region: string;
  secretAccessKey: string;
}) {
  const now = new Date();
  const amzDate = formatAmzDate(now);
  const dateStamp = amzDate.slice(0, 8);
  const service = "s3";
  const credentialScope = `${dateStamp}/${input.region}/${service}/aws4_request`;
  const { canonicalUri, host, origin } = objectUrlParts(input);
  const params: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${input.accessKeyId}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(input.expiresInSeconds),
    "X-Amz-SignedHeaders": "host",
  };
  const canonicalQueryString = canonicalQuery(params);
  const canonicalRequest = [
    input.method,
    canonicalUri,
    canonicalQueryString,
    `host:${host}`,
    "",
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join("\n");
  const signingKey = await getSignatureKey(
    input.secretAccessKey,
    dateStamp,
    input.region,
    service,
  );
  const signature = await hmacSha256Hex(signingKey, stringToSign);
  return `${origin}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}

function objectUrlParts(input: {
  bucket: string;
  endpoint?: string;
  objectKey: string;
  region: string;
}) {
  const encodedKey = encodeObjectKey(input.objectKey);
  if (input.endpoint) {
    const endpoint = new URL(input.endpoint);
    return {
      canonicalUri: `/${encodeURIComponent(input.bucket)}/${encodedKey}`,
      host: endpoint.host,
      origin: endpoint.origin,
    };
  }

  const host = `${input.bucket}.s3.${input.region}.amazonaws.com`;
  return {
    canonicalUri: `/${encodedKey}`,
    host,
    origin: `https://${host}`,
  };
}

function canonicalQuery(params: Record<string, string>) {
  return Object.keys(params)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join("&");
}

function encodeObjectKey(objectKey: string) {
  return objectKey
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function isObjectStorageConfigured(env: RuntimeEnv) {
  return Boolean(
    firstEnvValue(env, objectStorageSecretNames.region) &&
      firstEnvValue(env, objectStorageSecretNames.bucket) &&
      firstEnvValue(env, objectStorageSecretNames.accessKeyId) &&
      firstEnvValue(env, objectStorageSecretNames.secretAccessKey),
  );
}

async function getRuntimeEnv(): Promise<RuntimeEnv> {
  return process.env as RuntimeEnv;
}

function firstEnvValue(
  env: RuntimeEnv,
  names: readonly string[],
): string | undefined {
  return names.map((name) => env[name]).find(Boolean);
}

function formatAmzDate(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return bytesToHex(new Uint8Array(digest));
}

async function getSignatureKey(
  secretAccessKey: string,
  dateStamp: string,
  region: string,
  service: string,
) {
  const kDate = await hmacSha256Bytes(
    new TextEncoder().encode(`AWS4${secretAccessKey}`),
    dateStamp,
  );
  const kRegion = await hmacSha256Bytes(kDate, region);
  const kService = await hmacSha256Bytes(kRegion, service);
  return hmacSha256Bytes(kService, "aws4_request");
}

async function hmacSha256Bytes(keyBytes: Uint8Array, payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    arrayBufferFromBytes(keyBytes),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return new Uint8Array(signature);
}

async function hmacSha256Hex(keyBytes: Uint8Array, payload: string) {
  return bytesToHex(await hmacSha256Bytes(keyBytes, payload));
}

function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function arrayBufferFromBytes(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}
