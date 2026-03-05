// app/api/intake/export/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Placeholder: replace with your real export logic later
    // This ensures the route compiles + Prisma import is valid.
    await prisma.$connect();
    await prisma.$disconnect();

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