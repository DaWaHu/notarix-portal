// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

export const runtime = "nodejs";

function getRequiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in .env.local`);
  return v;
}

export async function POST(req: Request) {
  try {
    const AWS_REGION =
      process.env.AWS_REGION ||
      process.env.AWS_DEFAULT_REGION ||
      getRequiredEnv("AWS_REGION"); // ensures we throw a clear error

    // Support either env name (you can keep both)
    const BUCKET =
      process.env.S3_BUCKET_NAME ||
      process.env.AWS_S3_BUCKET ||
      getRequiredEnv("S3_BUCKET_NAME");

    const AWS_ACCESS_KEY_ID = getRequiredEnv("AWS_ACCESS_KEY_ID");
    const AWS_SECRET_ACCESS_KEY = getRequiredEnv("AWS_SECRET_ACCESS_KEY");

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "No file received. Make sure you sent form field name: file" },
        { status: 400 }
      );
    }

    // Basic validation: allow PDFs only
    const filename = file.name || "upload.pdf";
    const isPdf =
      file.type === "application/pdf" || filename.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        { ok: false, error: "Only PDF files are allowed." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Store under uploads/ with a unique id to avoid name collisions
    const safeName = filename.replace(/[^\w.\-]+/g, "_");
    const key = `uploads/${crypto.randomUUID()}-${safeName}`;

    const s3 = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });

await s3.send(
  new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: "application/pdf",
    Metadata: {
      originalname: safeName, // original filename (sanitized)
    },
  })
);

    return NextResponse.json({
      ok: true,
      bucket: BUCKET,
      key,
      originalName: filename,
      size: buffer.length,
    });
  } catch (err: any) {
    const message = err?.message || "Upload failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
