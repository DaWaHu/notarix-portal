import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (!key) {
      return NextResponse.json({ ok: false, error: "Missing ?key=" }, { status: 400 });
    }

    // Safety: only allow downloads from uploads/
    if (!key.startsWith("uploads/")) {
      return NextResponse.json(
        { ok: false, error: "Invalid key. Must start with uploads/." },
        { status: 400 }
      );
    }

    const bucket = process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET || "";
    const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";

    if (!bucket) {
      return NextResponse.json(
        { ok: false, error: "Missing S3_BUCKET_NAME in .env.local" },
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

    const obj = await s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    if (!obj.Body) {
      return NextResponse.json({ ok: false, error: "File body was empty" }, { status: 500 });
    }

    const bytes = await obj.Body.transformToByteArray();

    // Your upload key format is: uploads/<uuid>-<filename>.pdf
    // This removes the uuid- part (uuid is always 36 chars) so the browser saves as the original filename.
    const keyFile = key.split("/").pop() || "document.pdf";
    const filename = keyFile.replace(/^[0-9a-fA-F-]{36}-/, "");

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": obj.ContentType || "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Download failed" },
      { status: 500 }
    );
  }
}
