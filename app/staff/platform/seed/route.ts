import { requireStaffRouteAccess } from "../../../access-policy";
import {
  buildBaselineSeedSummary,
  d1SeedReconciliationContract,
  reconcileBaselineD1Seed,
} from "../../../d1-seed";

export async function GET() {
  await requireSeedAuthority();

  return Response.json({
    contract: d1SeedReconciliationContract,
    mode: "Dry run",
    summary: buildBaselineSeedSummary(),
  });
}

export async function POST() {
  await requireSeedAuthority();

  const result = await reconcileBaselineD1Seed();
  return Response.json(result, {
    status: result.available ? 200 : 503,
  });
}

async function requireSeedAuthority() {
  await requireStaffRouteAccess("/staff/platform/seed", ["SuperAdmin"]);
}
