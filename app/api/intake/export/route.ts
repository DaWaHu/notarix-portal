// app/api/intake/export/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({
      ok: true,
      message: "Intake export endpoint is live.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}