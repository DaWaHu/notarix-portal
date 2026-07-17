import { requireStaffRouteAccess } from "../../access-policy";
import {
  evidenceCallbackEnvironmentContract,
  getEvidenceCallbackEnvironmentStatus,
} from "../../evidence-callback-config";
import {
  getNotificationProviderEnvironmentStatus,
  notificationProviderEnvironmentContract,
} from "../../notification-provider-config";
import {
  getObjectStorageEnvironmentStatus,
  objectStorageEnvironmentContract,
} from "../../object-storage-config";

export async function GET() {
  await requireStaffRouteAccess("/staff/provider-environment", [
    "Admin",
    "SuperAdmin",
  ]);
  const evidenceCallbacks = await getEvidenceCallbackEnvironmentStatus();
  const notificationProviders = await getNotificationProviderEnvironmentStatus();
  const objectStorage = await getObjectStorageEnvironmentStatus();

  return Response.json({
    contract: {
      evidenceCallbacks: evidenceCallbackEnvironmentContract,
      notifications: notificationProviderEnvironmentContract,
      objectStorage: objectStorageEnvironmentContract,
    },
    evidenceCallbacks,
    notificationProviders,
    objectStorage,
  });
}
