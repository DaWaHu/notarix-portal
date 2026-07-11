import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  isLocalDevHost,
  localStaffCookieName,
  safeAuthReturnPath,
} from "../chatgpt-auth";

export async function GET(request: Request) {
  const requestHeaders = await headers();
  if (!isLocalDevHost(requestHeaders.get("host"))) notFound();

  const url = new URL(request.url);
  const returnTo = safeAuthReturnPath(url.searchParams.get("return_to"));
  const cookieStore = await cookies();

  cookieStore.set(localStaffCookieName(), "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: false,
  });

  redirect(returnTo);
}
