import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { localStaffCookieName, safeAuthReturnPath } from "../chatgpt-auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = safeAuthReturnPath(url.searchParams.get("return_to"));
  const cookieStore = await cookies();

  cookieStore.delete(localStaffCookieName());

  redirect(returnTo);
}
