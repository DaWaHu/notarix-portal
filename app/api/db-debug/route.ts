import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

function maskDatabaseUrl(url: string | undefined) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return {
      protocol: u.protocol,
      username: u.username,
      passwordLength: u.password ? u.password.length : 0,
      host: u.host,
      pathname: u.pathname,
      search: u.search,
    };
  } catch {
    return { invalid: true, rawLength: url.length };
  }
}

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;

  const result: Record<string, unknown> = {
    env: maskDatabaseUrl(dbUrl),
  };

  try {
    const prisma = new PrismaClient({
      log: ["error", "warn"],
    });

    const rows = await prisma.$queryRawUnsafe<
      Array<{ current_user: string; current_database: string }>
    >(`SELECT current_user, current_database()`);

    result.connection = {
      ok: true,
      rows,
    };

    await prisma.$disconnect();
  } catch (error) {
    result.connection = {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    };
  }

  return NextResponse.json(result);
}