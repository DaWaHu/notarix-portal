// app/api/intake/export/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * Small helpers
 */
function getRequiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in .env.local`);
  return v;
}

function csvEscape(value: any) {
  const s = String(value ?? "");
  // If it contains comma, quote, or newline, wrap in quotes and escape quotes
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function formatUsPhone(input: any) {
  const digits = String(input ?? "").replace(/\D/g, "");
  if (digits.length !== 10) return String(input ?? "");
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Prisma client (cached) using PrismaPg + pg Pool with SSL CA bundle
 */
function getPrisma() {
  const g = globalThis as any;
  if (g.__prisma) return g.__prisma as PrismaClient;

  const connectionString = getRequiredEnv("DATABASE_URL");

  // Use env override if you want, otherwise default to a pem in your project root
  const caPath =
    process.env.PG_SSL_CA_PATH ||
    process.env.AWS_RDS_CA_BUNDLE_PATH ||
    path.join(process.cwd(), "us-east-1-bundle.pem");

  const ca = fs.readFileSync(caPath, "utf8");

  const pool = new Pool({
    connectionString,
    ssl: {
      ca,
      rejectUnauthorized: true,
    },
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  g.__prisma = prisma;
  return prisma;
}

/**
 * GET /api/intake/export
 * Returns: intake-submissions.csv
 */
export async function GET() {
  try {
    const prisma = getPrisma();

    // Pull all rows (newest first). If this grows a lot later, we can add paging.
    const rows = await prisma.intakeSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Columns for the CSV
    const headers = [
      "id",
      "createdAt",
      "ref",
      "status",
      "contactName",
      "companyName",
      "email",
      "phone",
      "companyType",
      "address1",
      "address2",
      "city",
      "state",
      "zip",
      "bestTimeWindow",
      "timeZone",
      "notes",
      "s3Bucket",
      "s3Key",
      "signerPhone", // ✅ added (formatted as (910) 229-0616 when possible)
    ];

    const lines: string[] = [];
    lines.push(headers.join(","));

    for (const r of rows as any[]) {
      const d: any = r.details || {};
      const s3 = d.s3 || {};

      // signerPhone can be either a real column OR stored in details JSON
      const signerPhoneRaw = r.signerPhone ?? d.signerPhone ?? "";

      const values = [
        r.id,
        r.createdAt,
        d.ref,
        d.status,
        d.contactName,
        d.companyName,
        d.email,
        d.phone,
        d.companyType,
        d.address1,
        d.address2,
        d.city,
        d.state,
        d.zip,
        d.bestTimeWindow,
        d.timeZone,
        d.notes,
        s3.bucket,
        s3.key,
        formatUsPhone(signerPhoneRaw),
      ].map(csvEscape);

      lines.push(values.join(","));
    }

    const csv = lines.join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="intake-submissions.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to export CSV" },
      { status: 500 }
    );
  }
}
