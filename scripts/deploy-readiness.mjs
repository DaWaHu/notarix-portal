import { readFile } from "node:fs/promises";

const args = new Set(process.argv.slice(2));
const jsonOutput = args.has("--json");
const productionUrl =
  valueArg("--production-url") ??
  process.env.NOTARIX_PRODUCTION_URL ??
  process.env.APP_URL ??
  vercelUrl();

const manifest = await readJson("../deployment-runtime-secrets.json");
const localEnv = await loadLocalEnv();
const env = { ...localEnv, ...process.env };

const requiredSecrets = manifest.runtimeSecrets.filter(
  (entry) =>
    entry.requiredForProduction === true &&
    entry.home === "Vercel Environment Variable",
);
const optionalSecrets = manifest.runtimeSecrets.filter(
  (entry) =>
    entry.requiredForProduction !== true &&
    entry.home === "Vercel Environment Variable",
);
const requiredRuntimeNames = requiredSecrets.map((entry) => entry.name);
const optionalRuntimeNames = optionalSecrets.map((entry) => entry.name);
const presentRequiredLocal = requiredRuntimeNames.filter((name) => env[name]);
const missingRequiredLocal = requiredRuntimeNames.filter((name) => !env[name]);

const readiness = {
  callbackReplay: {
    command: productionUrl
      ? `npm run callbacks:replay -- --base-url=${productionUrl} --send`
      : "npm run callbacks:replay -- --base-url=https://YOUR-PRODUCTION-URL --send",
    productionUrlConfigured: Boolean(productionUrl),
  },
  localReference: {
    missingRequiredLocal,
    presentRequiredLocalCount: presentRequiredLocal.length,
    requiredRuntimeSecretCount: requiredRuntimeNames.length,
  },
  manifest: {
    optionalRuntimeNames,
    requiredRuntimeNames,
    runtimeSecretCount: manifest.runtimeSecrets.length,
  },
  platform: {
    host: manifest.project.productionHost,
    postgresConfigured: Boolean(env.DATABASE_URL),
    vercelDetected: Boolean(process.env.VERCEL),
  },
  productionHomes: {
    database:
      "DATABASE_URL must be configured as a Vercel Environment Variable pointing to production Postgres.",
    runtimeSecrets:
      "All required runtime secrets must be configured in Vercel; local .env.local is only a reference.",
    storage:
      "Object storage is configured through AWS S3 runtime variables and IAM scope.",
  },
  status: "needs_production_binding",
};

if (
  readiness.platform.postgresConfigured &&
  missingRequiredLocal.length === 0 &&
  productionUrl
) {
  readiness.status = "ready_for_deployed_callback_replay";
}

if (jsonOutput) {
  console.log(JSON.stringify(readiness, null, 2));
} else {
  console.log(`production_host=${readiness.platform.host}`);
  console.log(`vercel_detected=${readiness.platform.vercelDetected}`);
  console.log(`postgres_configured=${readiness.platform.postgresConfigured}`);
  console.log(`required_runtime_secret_count=${requiredRuntimeNames.length}`);
  console.log(`present_required_local_reference=${presentRequiredLocal.length}`);
  console.log(
    `missing_required_local_reference=${
      missingRequiredLocal.length ? missingRequiredLocal.join(",") : "none"
    }`,
  );
  console.log(`production_url_configured=${Boolean(productionUrl)}`);
  console.log(`callback_replay_command=${readiness.callbackReplay.command}`);
  console.log(`status=${readiness.status}`);
}

function valueArg(name) {
  const prefix = `${name}=`;
  return process.argv
    .slice(2)
    .find((arg) => arg.startsWith(prefix))
    ?.slice(prefix.length);
}

async function readJson(relativePath) {
  const source = await readFile(new URL(relativePath, import.meta.url), "utf8");
  return JSON.parse(source);
}

async function loadLocalEnv() {
  try {
    const source = await readFile(new URL("../.env.local", import.meta.url), "utf8");
    return Object.fromEntries(
      source
        .split(/\r?\n/)
        .map((line) =>
          line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/),
        )
        .filter(Boolean)
        .map((match) => [match[1], unquote(match[2].trim())]),
    );
  } catch {
    return {};
  }
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function vercelUrl() {
  return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
}
