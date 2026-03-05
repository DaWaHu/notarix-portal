import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function GET() {
  try {
    const region = process.env.AWS_REGION;
    const bucket = process.env.S3_BUCKET_NAME;

    if (!region || !bucket) {
      return NextResponse.json(
        { ok: false, error: "Missing AWS_REGION or S3_BUCKET_NAME in .env.local", items: [] },
        { status: 500 }
      );
    }

    const s3 = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });

    const out = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        // If you later decide to store everything under a folder like "documents/",
        // we can add: Prefix: "documents/",
      })
    );

    const items =
      (out.Contents || [])
        .filter((o) => !!o.Key)
        .map((o) => ({
          key: o.Key as string,
          size: o.Size ?? 0,
          lastModified: o.LastModified ? o.LastModified.toISOString() : null,
        })) || [];

    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to list S3 objects", items: [] },
      { status: 500 }
    );
  }
}
