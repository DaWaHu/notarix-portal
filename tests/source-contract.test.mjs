import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
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
  assert.equal(packageJson.scripts.build, "next build");
  assert.equal(packageJson.scripts.start, "next start");
  assert.match(packageJson.scripts.test, /test:contracts/);
  assert.ok(packageJson.dependencies.postgres);
  assert.ok(!packageJson.devDependencies?.wrangler);
  assert.ok(!packageJson.devDependencies?.vinext);
  assert.ok(!packageJson.devDependencies?.vite);

  const drizzleConfig = await text("drizzle.config.ts");
  assert.match(drizzleConfig, /dialect:\s*"postgresql"/);
  assert.match(drizzleConfig, /process\.env\.DATABASE_URL/);

  const dbIndex = await text("db/index.ts");
  assert.match(dbIndex, /drizzle-orm\/postgres-js/);
  assert.match(dbIndex, /from "postgres"/);
  assert.doesNotMatch(dbIndex, /cloudflare:workers|sqlite|D1/i);
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
