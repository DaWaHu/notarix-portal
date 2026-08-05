import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cognitoAuthEnabled } from "../auth-config";
import {
  cognitoSignOutPath,
  localStaffCookieName,
  safeAuthReturnPath,
} from "../chatgpt-auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = safeAuthReturnPath(url.searchParams.get("return_to"));
  if (cognitoAuthEnabled()) {
    redirect(cognitoSignOutPath(returnTo));
  }

  const cookieStore = await cookies();

  cookieStore.delete(localStaffCookieName());

  redirect(returnTo);
}
