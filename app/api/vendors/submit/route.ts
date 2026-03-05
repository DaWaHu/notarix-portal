// app/api/vendors/submit/route.ts
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { Pool } from "pg";

export const runtime = "nodejs";

function getRequiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in .env.local`);
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

const ca = fs.readFileSync(path.join(process.cwd(), "us-east-1-bundle.pem"), "utf8");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { ca },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function POST(req: Request) {
  try {
    const region =
      process.env.AWS_REGION ||
      process.env.AWS_DEFAULT_REGION ||
      getRequiredEnv("AWS_REGION");

    const bucket = getBucketName() || getRequiredEnv("S3_BUCKET_NAME");

    const accessKeyId = getRequiredEnv("AWS_ACCESS_KEY_ID");
    const secretAccessKey = getRequiredEnv("AWS_SECRET_ACCESS_KEY");

    const body = await req.json();

    // Required fields validation
    const required = [
      "contactName",
      "companyName",
      "companyType",
      "address1",
      "city",
      "state",
      "zip",
      "phone",
      "bestTimeWindow",
      "timeZone",
      "email",
    ];

    const missing = required.filter((k) => !String(body?.[k] ?? "").trim());
    if (missing.length) {
      return NextResponse.json(
        { ok: false, error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    // Create a stable reference + storage key
    const ref = `VI-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const now = new Date();
    const yyyy = String(now.getUTCFullYear());
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(now.getUTCDate()).padStart(2, "0");

    const key = `vendor-inquiries/${yyyy}/${mm}/${dd}/${ref}.json`;

    const record = {
      ref,
      createdAt: now.toISOString(),
      status: "new",

      contactName: String(body.contactName || "").trim(),
      companyName: String(body.companyName || "").trim(),
      companyType: String(body.companyType || "").trim(),
      address1: String(body.address1 || "").trim(),
      address2: String(body.address2 || "").trim(),
      city: String(body.city || "").trim(),
      state: String(body.state || "").trim(),
      zip: String(body.zip || "").trim(),
      phone: String(body.phone || "").trim(),
      bestTimeWindow: String(body.bestTimeWindow || "").trim(),
      timeZone: String(body.timeZone || "").trim(),
      email: String(body.email || "").trim(),
      notes: String(body.notes || "").trim(),

      userAgent: req.headers.get("user-agent") || null,
      ipHint:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        null,
    };

    // 1) Save full record to S3
    const s3 = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: JSON.stringify(record, null, 2),
        ContentType: "application/json",
      })
    );

    // 2) Save searchable record to Postgres via Prisma
    await prisma.intakeSubmission.create({
      data: {
        role: "NOTARY",
        fullName: record.contactName,
        email: record.email,
        phone: record.phone || null,
        message: record.notes || null,
        status: "NEW",
        details: {
          ...record,
          s3: { bucket, key },
        },
      },
    });

    return NextResponse.json({ ok: true, ref, bucket, key });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to store vendor inquiry" },
      { status: 500 }
    );
  }
}
