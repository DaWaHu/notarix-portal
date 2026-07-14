import { requireStaffRouteAccess } from "../../access-policy";
import {
  getNotificationProviderEnvironmentStatus,
  notificationProviderEnvironmentContract,
} from "../../notification-provider-config";

export async function GET() {
  await requireStaffRouteAccess("/staff/provider-environment", [
    "Admin",
    "SuperAdmin",
  ]);
  const notificationProviders = await getNotificationProviderEnvironmentStatus();

  return Response.json({
    contract: notificationProviderEnvironmentContract,
    notificationProviders,
  });
}
