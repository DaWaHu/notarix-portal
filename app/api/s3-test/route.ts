import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "s3-test route is reachable",
    hasRegion: Boolean(process.env.AWS_REGION),
    hasBucket: Boolean(process.env.S3_BUCKET_NAME),
  });
}
