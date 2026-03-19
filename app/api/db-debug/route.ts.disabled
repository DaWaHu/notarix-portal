import { NextResponse } from "next/server";

export const runtime = "nodejs";

function inspectDatabaseUrl(url: string | undefined) {
  if (!url) return { exists: false };

  try {
    const parsed = new URL(url);
    return {
      exists: true,
      username: parsed.username,
      passwordLength: parsed.password.length,
      host: parsed.host,
      pathname: parsed.pathname,
      search: parsed.search,
    };
  } catch {
    return {
      exists: true,
      invalidUrl: true,
      rawLength: url.length,
    };
  }
}

export async function GET() {
  return NextResponse.json({
    databaseUrl: inspectDatabaseUrl(process.env.DATABASE_URL),
  });
}