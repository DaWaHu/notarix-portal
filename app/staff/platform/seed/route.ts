import { requireStaffRouteAccess } from "../../../access-policy";
import {
  buildBaselineSeedSummary,
  postgresSeedReconciliationContract,
  reconcileBaselinePostgresSeed,
} from "../../../postgres-seed";

export async function GET() {
  await requireSeedAuthority();

  return Response.json({
    contract: postgresSeedReconciliationContract,
    mode: "Dry run",
    summary: buildBaselineSeedSummary(),
  });
}

export async function POST() {
  await requireSeedAuthority();

  const result = await reconcileBaselinePostgresSeed();
  return Response.json(result, {
    status: result.available ? 200 : 503,
  });
}

async function requireSeedAuthority() {
  await requireStaffRouteAccess("/staff/platform/seed", ["SuperAdmin"]);
}
