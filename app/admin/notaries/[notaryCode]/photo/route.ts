import { NextResponse } from "next/server";
import crypto from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { prisma } from "@/lib/prisma";
import { s3 } from "@/lib/s3";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in environment variables`);
  }
  return value;
}

function getS3BucketAndRegion() {
  const region =
    process.env.AWS_REGION ||
    process.env.AWS_DEFAULT_REGION ||
    getRequiredEnv("AWS_REGION");

  const bucket =
    process.env.S3_BUCKET_NAME ||
    process.env.AWS_S3_BUCKET ||
    getRequiredEnv("S3_BUCKET_NAME");

  return { region, bucket };
}

function buildPublicS3Url(bucket: string, region: string, key: string) {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export async function POST(
  req: Request,
  { params }: { params: { notaryCode: string } }
) {
  try {
    const notaryCode = String(params.notaryCode || "").trim().toUpperCase();

    if (!notaryCode) {
      return jsonError("Missing notaryCode", 400);
    }

    const notary = await prisma.notaryProfile.findUnique({
      where: { notaryCode },
      select: {
        id: true,
        notaryCode: true,
      },
    });

    if (!notary) {
      return jsonError("Notary not found", 404);
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File) || file.size === 0) {
      return jsonError("Please choose an image file.", 400);
    }

    const allowedMimeTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/svg+xml",
      "image/gif",
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return jsonError("Notary photo must be an image file.", 400);
    }

    const { region, bucket } = getS3BucketAndRegion();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = (file.name || "notary-photo")
      .replace(/[^\w.\-]+/g, "_")
      .toLowerCase();

    const key = `uploads/notaries/${notary.notaryCode}/photo/${crypto.randomUUID()}-${safeName}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          originalname: safeName,
          purpose: "notary-photo",
        },
      })
    );

    const publicUrl = buildPublicS3Url(bucket, region, key);

    await prisma.notaryProfile.update({
      where: { id: notary.id },
      data: {
        photoUrl: publicUrl,
      },
    });

    return NextResponse.json({
      ok: true,
      photoUrl: publicUrl,
      notaryCode: notary.notaryCode,
    });
  } catch (error: any) {
    return jsonError(error?.message || "Failed to upload notary photo", 500);
  }
}