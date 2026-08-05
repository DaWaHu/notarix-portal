import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const projectRoot = new URL("..", import.meta.url);

async function text(path) {
  return readFile(new URL(path, projectRoot), "utf8");
}

async function walk(dir, files = []) {
  for (const entry of await readdir(new URL(dir, projectRoot), {
    withFileTypes: true,
  })) {
    const relative = join(dir, entry.name);
    if (
      relative.includes("node_modules") ||
      relative.includes(".next") ||
      relative.includes(".git") ||
      relative.includes(".wrangler") ||
      relative.includes("dist")
    ) {
      continue;
    }
    if (entry.isDirectory()) {
      await walk(relative, files);
    } else {
      files.push(relative);
    }
  }
  return files;
}

test("runtime scripts target Vercel, AWS services, and Postgres", async () => {
  const packageJson = JSON.parse(await text("package.json"));
  assert.equal(packageJson.scripts.dev, "next dev");
  assert.equal(packageJson.scripts.build, "NOTARIX_BUILD_MODE=1 next build");
  assert.equal(packageJson.scripts.start, "next start");
  assert.match(packageJson.scripts.test, /test:contracts/);
  assert.ok(packageJson.dependencies.postgres);
  assert.ok(!packageJson.devDependencies?.wrangler);
  assert.ok(!packageJson.devDependencies?.vinext);
  assert.ok(!packageJson.devDependencies?.vite);

  const drizzleConfig = await text("drizzle.config.ts");
  assert.match(drizzleConfig, /dialect:\s*"postgresql"/);
  assert.match(drizzleConfig, /process\.env\.DATABASE_MIGRATION_URL/);
  assert.doesNotMatch(drizzleConfig, /process\.env\.DATABASE_URL(?:\W|$)/);

  const dbIndex = await text("db/index.ts");
  assert.match(dbIndex, /drizzle-orm\/postgres-js/);
  assert.match(dbIndex, /from "postgres"/);
  assert.doesNotMatch(dbIndex, /cloudflare:workers|sqlite|D1/i);
});

test("production builds do not open runtime database connections", async () => {
  const packageJson = await text("package.json");
  const database = await text("db/index.ts");

  assert.match(packageJson, /NOTARIX_BUILD_MODE=1 next build/);
  assert.match(database, /process\.env\.NOTARIX_BUILD_MODE === "1"/);
});

test("deployment readiness names Vercel as the production host", async () => {
  const manifest = JSON.parse(await text("deployment-runtime-secrets.json"));
  assert.equal(manifest.project.productionHost, "Vercel");
  assert.deepEqual(manifest.project.serviceProviders, ["AWS", "Postgres"]);

  const deploymentData = await text("app/deployment-readiness-data.ts");
  assert.match(deploymentData, /providerPlatform:\s*"Vercel \+ AWS services \+ Postgres"/);
  assert.match(deploymentData, /Vercel Environment Variable/);
  assert.match(deploymentData, /Production Postgres database/);
  assert.doesNotMatch(deploymentData, /Sites|D1 binding|R2 binding/);
});

test("maintenance lock is a supported Vercel environment control", async () => {
  const proxy = await text("proxy.ts");
  const envTemplate = await text("examples/notarix-env-template.txt");
  const envAudit = await text("scripts/audit-env-local.mjs");
  const manifest = await text("deployment-runtime-secrets.json");

  assert.match(proxy, /SITE_LOCKED/);
  assert.match(proxy, /\/maintenance/);
  assert.match(envTemplate, /SITE_LOCKED=false/);
  assert.match(envAudit, /"SITE_LOCKED"/);
  assert.match(manifest, /"name": "SITE_LOCKED"/);
});

test("active source no longer imports Cloudflare worker runtime", async () => {
  const activeFiles = (await walk(".")).filter((file) => {
    if (!/\.(ts|tsx|mjs|json|md)$/.test(file)) return false;
    if (file.startsWith("docs/executive-handoff-")) return false;
    if (file.startsWith("docs/progress-report-")) return false;
    if (file === "tests/source-contract.test.mjs") return false;
    if (file === "package-lock.json") return false;
    return true;
  });

  const offenders = [];
  for (const file of activeFiles) {
    const content = await text(file);
    if (/(cloudflare:workers|@cloudflare\/vite-plugin|wrangler|vinext)/i.test(content)) {
      offenders.push(file);
    }
  }

  assert.deepEqual(offenders, []);
});

test("Cognito foundation fails closed and avoids source secrets", async () => {
  const authConfig = await text("app/auth-config.ts");
  const loginRoute = await text("app/auth/login/route.ts");
  const callbackRoute = await text("app/auth/callback/route.ts");
  const logoutRoute = await text("app/auth/logout/route.ts");
  const jwtVerifier = await text("app/cognito-jwt.ts");
  const envTemplate = await text("examples/notarix-env-template.txt");

  assert.match(authConfig, /NOTARIX_AUTH_MODE/);
  assert.match(authConfig, /legacy/);
  assert.match(authConfig, /SUPER_ADMIN/);
  assert.match(authConfig, /OBSERVER/);
  assert.match(authConfig, /owner@dawahucollective\.com/);

  assert.match(loginRoute, /code_challenge_method/);
  assert.match(loginRoute, /S256/);
  assert.match(loginRoute, /identity_provider/);
  assert.match(loginRoute, /if \(!cognitoAuthEnabled\(\)\)/);
  assert.match(callbackRoute, /authorization_code/);
  assert.match(callbackRoute, /if \(!cognitoAuthEnabled\(\)\)/);
  assert.match(callbackRoute, /verifyCognitoJwt\(tokenResponse\.id_token,\s*"id"/);
  assert.match(callbackRoute, /verifyCognitoJwt\(\s*tokenResponse\.access_token,\s*"access"/);
  assert.match(callbackRoute, /nonce/);
  assert.match(logoutRoute, /clearPortalSessionCookie/);
  assert.match(logoutRoute, /if \(!cognitoAuthEnabled\(\)\)/);

  assert.match(jwtVerifier, /crypto\.subtle\.verify/);
  assert.match(jwtVerifier, /RS256/);
  assert.match(jwtVerifier, /token_use/);
  assert.match(jwtVerifier, /claims\.iss !== config\.issuer/);

  assert.match(envTemplate, /NOTARIX_COGNITO_CLIENT_SECRET=/);
  assert.doesNotMatch(envTemplate, /NOTARIX_COGNITO_CLIENT_SECRET=.+\S/);
});

test("provider-specific identity trust is removed and auth routes fail closed", async () => {
  const portalAuth = await text("app/portal-auth.ts");
  const accessPolicy = await text("app/access-policy.ts");
  const loginRoute = await text("app/auth/login/route.ts");
  const logoutRoute = await text("app/auth/logout/route.ts");
  const callbackRoute = await text("app/auth/callback/route.ts");
  const proxy = await text("proxy.ts");

  assert.match(portalAuth, /getCognitoPortalSession/);
  assert.match(portalAuth, /isLocalDevHost/);
  assert.match(portalAuth, /authUnavailablePath/);
  assert.doesNotMatch(portalAuth, /oai-|x-notarix-/i);
  assert.match(accessPolicy, /const user = await requirePortalUser\(returnTo\)/);
  assert.match(loginRoute, /authUnavailablePath/);
  assert.match(logoutRoute, /clearPortalSessionCookie/);
  assert.match(callbackRoute, /authUnavailablePath/);
  assert.doesNotMatch(`${loginRoute}${logoutRoute}${callbackRoute}${proxy}`, /signin-with-chatgpt|signout-with-chatgpt/i);

  for (const removedRoute of [
    "app/signin-with-chatgpt/page.tsx",
    "app/signout-with-chatgpt/route.ts",
  ]) {
    await assert.rejects(access(new URL(removedRoute, projectRoot)));
  }
});

test("formerly legacy-guarded staff pages enforce explicit server-side roles", async () => {
  const expected = new Map([
    ["app/credentials/expiration/page.tsx", ["GenAdmin", "Admin", "SuperAdmin"]],
    ["app/notifications/page.tsx", ["GenAdmin", "Admin", "SuperAdmin"]],
    ["app/evidence/[evidenceId]/page.tsx", ["GenAdmin", "Admin", "SuperAdmin"]],
    ["app/staff/signers/page.tsx", ["GenAdmin", "Admin", "SuperAdmin"]],
    ["app/staff/appointments/page.tsx", ["GenAdmin", "Admin", "SuperAdmin"]],
    ["app/staff/requests/page.tsx", ["GenAdmin", "Admin", "SuperAdmin"]],
    ["app/staff/requests/[requestId]/page.tsx", ["GenAdmin", "Admin", "SuperAdmin"]],
    ["app/staff/orders/page.tsx", ["GenAdmin", "Admin", "SuperAdmin"]],
    ["app/staff/orders/[orderId]/assignment/page.tsx", ["Admin", "SuperAdmin"]],
    ["app/staff/order-intake/page.tsx", ["GenAdmin", "Admin", "SuperAdmin"]],
    ["app/staff/order-closeout/page.tsx", ["Admin", "SuperAdmin"]],
    ["app/staff/evidence-intake/page.tsx", ["GenAdmin", "Admin", "SuperAdmin"]],
    ["app/staff/command-center/receipt/[receiptId]/page.tsx", ["GenAdmin", "Admin", "SuperAdmin"]],
    ["app/staff/requests/[requestId]/invitation/page.tsx", ["GenAdmin", "Admin", "SuperAdmin"]],
    ["app/staff/requests/[requestId]/profile-verification/page.tsx", ["GenAdmin", "Admin", "SuperAdmin"]],
    ["app/staff/requests/[requestId]/profile-verification/decision/[decision]/page.tsx", ["Admin", "SuperAdmin"]],
  ]);

  for (const [file, roles] of expected) {
    const content = await text(file);
    assert.match(content, /requireStaffRouteAccess/);
    for (const role of roles) assert.match(content, new RegExp(`"${role}"`));
  }
});

test("client and notary writes fail closed until ownership policy is persisted", async () => {
  const accessPolicy = await text("app/access-policy.ts");
  const clientActions = await text("app/client/order-actions/route.ts");
  const notaryActions = await text("app/notary/assignment-actions/route.ts");

  assert.match(accessPolicy, /denyUnresolvedPortalOwnership\(\): void/);
  assert.match(clientActions, /denyUnresolvedPortalOwnership\(\);/);
  assert.match(notaryActions, /denyUnresolvedPortalOwnership\(\);/);
  assert.doesNotMatch(`${clientActions}${notaryActions}`, /request\.headers\.get\("x-/);
});

test("Cognito identity persistence tables are migration-backed", async () => {
  const schema = await text("db/schema.ts");
  const migration = await text("drizzle/0001_nebulous_slipstream.sql");
  const dbReadiness = await text("scripts/db-readiness.mjs");

  for (const table of [
    "portal_users",
    "portal_user_identities",
    "portal_role_assignments",
    "portal_auth_sessions",
  ]) {
    assert.match(migration, new RegExp(`CREATE TABLE "${table}"`));
    assert.match(dbReadiness, new RegExp(`"${table}"`));
  }

  assert.match(schema, /export const portalUsers/);
  assert.match(schema, /export const portalUserIdentities/);
  assert.match(schema, /export const portalRoleAssignments/);
  assert.match(schema, /export const portalAuthSessions/);
});
