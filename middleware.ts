import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const siteLocked = process.env.SITE_LOCKED === "false";
  const { pathname } = req.nextUrl;

  if (!siteLocked) {
    return NextResponse.next();
  }

  const allowedPaths = [
    "/maintenance",
    "/favicon.ico",
  ];

  const allowedPrefixes = [
    "/_next",
  ];

  const isAllowedPath = allowedPaths.includes(pathname);
  const isAllowedPrefix = allowedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isAllowedPath || isAllowedPrefix) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/maintenance";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api).*)"],
};