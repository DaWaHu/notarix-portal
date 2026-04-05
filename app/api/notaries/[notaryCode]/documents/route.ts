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

export async function POST(
  req: Request,
  { params }: { params: { notaryCode: string } }
) {
  try {
    const notaryCode = String(params.notaryCode || "").trim().toUpperCase();

    if (!notaryCode) {
      return jsonError("Missing notary code.", 400);
    }

    const notary = await prisma.notaryProfile.findUnique({
      where: { notaryCode },
      select: {
        id: true,
        notaryCode: true,
      },
    });

    if (!notary) {
      return jsonError("Notary not found.", 404);
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const documentLabel = String(formData.get("documentLabel") || "").trim();

    if (!documentLabel) {
      return jsonError("Document label is required.", 400);
    }

    if (!file || !(file instanceof File)) {
      return jsonError("Please choose a file to upload.", 400);
    }

    const filename = file.name || "upload";
    const safeName = filename.replace(/[^\w.\-]+/g, "_");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { bucket } = getS3BucketAndRegion();

    const key = `uploads/notaries/${notary.notaryCode}/documents/${crypto.randomUUID()}-${safeName}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
        Metadata: {
          originalname: safeName,
          documentlabel: documentLabel,
          purpose: "notary-document",
        },
      })
    );

    await prisma.document.create({
      data: {
        notaryId: notary.id,
        fileName: filename,
        storageKey: key,
        mimeType: file.type || "application/octet-stream",
        fileSizeBytes: buffer.length,
        notes: documentLabel,
      },
    });

    return NextResponse.json({
      ok: true,
      notaryCode: notary.notaryCode,
      documentLabel,
    });
  } catch (error: any) {
    return jsonError(error?.message || "Failed to upload document.", 500);
  }
}