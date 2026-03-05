import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    const region = process.env.AWS_REGION;
    const bucket = process.env.S3_BUCKET_NAME;

    if (!key) {
      return NextResponse.json({ ok: false, error: "Missing ?key= parameter" }, { status: 400 });
    }
    if (!region || !bucket) {
      return NextResponse.json(
        { ok: false, error: "Missing AWS_REGION or S3_BUCKET_NAME in .env.local" },
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

    // Use the last part of the key as the filename (ex: "uploads/myfile.pdf" -> "myfile.pdf")
    const filenameFromKey = key.split("/").pop() || "document.pdf";

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": obj.ContentType || "application/pdf",
        "Content-Disposition": `attachment; filename="${filenameFromKey}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Download failed" },
      { status: 500 }
    );
  }
}
