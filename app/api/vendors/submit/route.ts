// app/api/vendors/submit/route.ts
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

import { prisma as prismaClient } from "@/lib/prisma";

export const runtime = "nodejs";

function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function getBucketName() {
  return (
    process.env.S3_BUCKET_NAME ||
    process.env.AWS_S3_BUCKET ||
    process.env.AWS_S3_BUCKET_NAME ||
    process.env.AWS_S3_BUCKETNAME ||
    process.env.S3_BUCKET ||
    ""
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));

    const bucket = getBucketName();

    const hasS3Env =
      !!bucket &&
      !!process.env.AWS_ACCESS_KEY_ID &&
      !!process.env.AWS_SECRET_ACCESS_KEY &&
      !!(process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION);

    if (hasS3Env && body?.fileBase64 && body?.fileName) {
      const region =
        process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";

      const s3 = new S3Client({
        region,
        credentials: {
          accessKeyId: required("AWS_ACCESS_KEY_ID"),
          secretAccessKey: required("AWS_SECRET_ACCESS_KEY"),
        },
      });

      const bytes = Buffer.from(body.fileBase64, "base64");
      const key = `uploads/${crypto.randomUUID()}-${String(body.fileName).replace(
        /\s+/g,
        "_"
      )}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: bytes,
          ContentType: body.contentType || "application/octet-stream",
        })
      );

      return NextResponse.json({ ok: true, uploaded: true, bucket, key });
    }

    // Keeping prismaClient referenced prevents some linters from complaining;
    // it does not open DB connections by itself.
    void prismaClient;

    return NextResponse.json({
      ok: true,
      uploaded: false,
      message:
        "Vendor submit endpoint is live. (S3 upload runs when AWS env vars + payload are provided.)",
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}