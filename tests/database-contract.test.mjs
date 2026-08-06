import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { validateMigrationTarget } from "../scripts/database/target-contract.mjs";

const root = new URL("..", import.meta.url);
const previewMigrationEnv = {
  DATABASE_MIGRATION_URL: "postgresql://notarix_preview_migrator:TOP-SECRET@ep-orange-fog-ausod744.us-east-1.aws.neon.tech/neondb?sslmode=verify-full",
  NOTARIX_DATABASE_ENVIRONMENT: "preview",
  NOTARIX_DATABASE_PROVIDER: "neon",
  NOTARIX_DATABASE_RESOURCE_ID: "plain-shadow-93565861",
  NOTARIX_DATABASE_ENDPOINT_ID: "ep-orange-fog-ausod744",
  NOTARIX_DATABASE_NAME: "neondb",
  NOTARIX_DATABASE_ROLE_CLASS: "migrator",
  NODE_TLS_REJECT_UNAUTHORIZED: "1",
};

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("runtime reads only DATABASE_URL and migration tooling reads only DATABASE_MIGRATION_URL", async () => {
  const runtime = await source("db/index.ts");
  const drizzle = await source("drizzle.config.ts");
  assert.match(runtime, /process\.env\.DATABASE_URL/);
  assert.doesNotMatch(runtime, /DATABASE_MIGRATION_URL/);
  assert.match(drizzle, /process\.env\.DATABASE_MIGRATION_URL/);
  assert.doesNotMatch(drizzle, /process\.env\.DATABASE_URL(?:\W|$)/);
});

test("migration target refuses missing migration credentials and never falls back", () => {
  assert.throws(
    () => validateMigrationTarget("preview", { ...previewMigrationEnv, DATABASE_MIGRATION_URL: undefined, DATABASE_URL: previewMigrationEnv.DATABASE_MIGRATION_URL }),
    /DATABASE_MIGRATION_URL is required/,
  );
});

test("preview migration validates environment, provider, direct endpoint, role, and TLS", () => {
  const identity = validateMigrationTarget("preview", previewMigrationEnv);
  assert.equal(identity.target, "preview");
  assert.equal(identity.provider, "neon");
  assert.equal(identity.endpointClass, "direct");
  assert.equal(identity.roleClass, "migrator");

  assert.throws(() => validateMigrationTarget("preview", { ...previewMigrationEnv, NOTARIX_DATABASE_PROVIDER: "aws-rds" }), /provider mismatch/i);
  assert.throws(() => validateMigrationTarget("preview", { ...previewMigrationEnv, NODE_TLS_REJECT_UNAUTHORIZED: "0" }), /TLS certificate verification is disabled/);
  assert.throws(() => validateMigrationTarget("preview", { ...previewMigrationEnv, DATABASE_MIGRATION_URL: previewMigrationEnv.DATABASE_MIGRATION_URL.replace("ep-orange-fog-ausod744.", "ep-orange-fog-ausod744-pooler.") }), /direct Neon endpoint/);
  assert.throws(() => validateMigrationTarget("preview", { ...previewMigrationEnv, DATABASE_MIGRATION_URL: previewMigrationEnv.DATABASE_MIGRATION_URL.replace("notarix_preview_migrator", "neondb_owner") }), /Administrative roles are prohibited/);
});

test("validation errors never disclose connection strings or passwords", () => {
  const secret = "UNIQUE-SECRET-DO-NOT-PRINT";
  let message = "";
  try {
    validateMigrationTarget("preview", {
      ...previewMigrationEnv,
      DATABASE_MIGRATION_URL: `postgresql://wrong:${secret}@production.example.invalid/neondb?sslmode=disable`,
    });
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  assert.ok(message);
  assert.doesNotMatch(message, new RegExp(secret));
  assert.doesNotMatch(message, /postgresql:\/\//);
});

test("migration runner selects exactly 0001 and keeps production execution approval-gated", async () => {
  const runner = await source("scripts/phase2-identity-migration.mjs");
  const packageJson = JSON.parse(await source("package.json"));
  assert.match(runner, /0001_nebulous_slipstream\.sql/);
  assert.match(runner, /e3d59b0ab29305933b468f2884bb16c739fadfb49598a47895b638f4679ba5af/);
  assert.doesNotMatch(runner, /drizzle-kit migrate/);
  assert.match(packageJson.scripts["db:migrate:production:execute"], /OWNER_APPROVED_PRODUCTION_MIGRATION/);
  assert.match(runner, /NOTARIX_PRODUCTION_MIGRATION_APPROVED/);
});

test("build remains database-inert", async () => {
  const packageJson = JSON.parse(await source("package.json"));
  const runtime = await source("db/index.ts");
  assert.equal(packageJson.scripts.build, "NOTARIX_BUILD_MODE=1 next build");
  assert.match(runtime, /NOTARIX_BUILD_MODE === "1"/);
  assert.doesNotMatch(packageJson.scripts.build, /migrat|DATABASE_/i);
});
