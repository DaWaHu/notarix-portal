import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

const maintenanceAllowedPrefixes = [
  "/maintenance",
  "/auth",
  "/local-staff-preview",
  "/staff",
  "/notifications/provider-callback",
  "/staff/evidence-malware-callback",
  "/staff/evidence-upload-callback",
] as const;

export function proxy(request: NextRequest) {
  if (!siteLocked()) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (isAllowedDuringMaintenance(pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/maintenance";
  url.searchParams.set("return_to", pathname);
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|favicon.svg|notarix-logo.png|notarix-hero-notarial-session.png).*)"],
};

function siteLocked() {
  return ["1", "true", "yes", "locked"].includes(
    (process.env.SITE_LOCKED ?? "").trim().toLowerCase(),
  );
}

function isAllowedDuringMaintenance(pathname: string) {
  if (pathname === "/" || PUBLIC_FILE.test(pathname)) return false;
  return maintenanceAllowedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
