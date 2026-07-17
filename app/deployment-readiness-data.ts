import manifest from "../deployment-runtime-secrets.json";

type RuntimeSecretRecord = {
  home: string;
  name: string;
  purpose: string;
  requiredForProduction: boolean;
};

export type DeploymentReadinessControl = {
  action: string;
  authority: string;
  control: string;
  id: string;
  productionHome: string;
  status: string;
};

export type DeploymentReadinessSummary = {
  callbackReplayCommand: string;
  databaseConfigured: boolean;
  missingRequiredRuntimeSecrets: string[];
  optionalRuntimeSecrets: string[];
  presentRequiredRuntimeSecretCount: number;
  productionUrlConfigured: boolean;
  providerPlatform: string;
  requiredRuntimeSecretCount: number;
  status: "Needs production binding" | "Ready for deployed callback replay";
  vercelEnvironmentDetected: boolean;
};

const runtimeSecrets = manifest.runtimeSecrets as RuntimeSecretRecord[];

const requiredRuntimeSecrets = runtimeSecrets.filter(
  (entry) =>
    entry.requiredForProduction === true &&
    entry.home === "Vercel Environment Variable",
);

const optionalRuntimeSecrets = runtimeSecrets.filter(
  (entry) =>
    entry.requiredForProduction !== true &&
    entry.home === "Vercel Environment Variable",
);

export function getDeploymentReadinessSummary(): DeploymentReadinessSummary {
  const missingRequiredRuntimeSecrets = requiredRuntimeSecrets
    .map((entry) => entry.name)
    .filter((name) => !hasRuntimeValue(name));
  const productionUrl =
    runtimeValue("NOTARIX_PRODUCTION_URL") ??
    runtimeValue("APP_URL") ??
    vercelUrl();
  const callbackReplayCommand = productionUrl
    ? `npm run callbacks:replay -- --base-url=${productionUrl} --send`
    : "npm run callbacks:replay -- --base-url=https://YOUR-PRODUCTION-URL --send";
  const databaseConfigured = hasRuntimeValue("DATABASE_URL");
  const productionUrlConfigured = Boolean(productionUrl);
  const ready =
    databaseConfigured &&
    missingRequiredRuntimeSecrets.length === 0 &&
    productionUrlConfigured;

  return {
    callbackReplayCommand,
    databaseConfigured,
    missingRequiredRuntimeSecrets,
    optionalRuntimeSecrets: optionalRuntimeSecrets.map((entry) => entry.name),
    presentRequiredRuntimeSecretCount:
      requiredRuntimeSecrets.length - missingRequiredRuntimeSecrets.length,
    productionUrlConfigured,
    providerPlatform: "Vercel + AWS services + Postgres",
    requiredRuntimeSecretCount: requiredRuntimeSecrets.length,
    status: ready
      ? "Ready for deployed callback replay"
      : "Needs production binding",
    vercelEnvironmentDetected: Boolean(runtimeValue("VERCEL")),
  };
}

export function getDeploymentReadinessControls(
  summary = getDeploymentReadinessSummary(),
): DeploymentReadinessControl[] {
  const missingRuntimeSecretSummary = summary.missingRequiredRuntimeSecrets.length
    ? `${summary.missingRequiredRuntimeSecrets.length} required environment variable(s) missing`
    : "Required environment variables present";

  return [
    {
      action: summary.databaseConfigured
        ? "Apply Postgres migrations before production launch."
        : "Configure DATABASE_URL in Vercel environment variables.",
      authority: "Super Admin",
      control: "Production Postgres database",
      id: "DEP-2607-0001",
      productionHome: "Vercel DATABASE_URL",
      status: summary.databaseConfigured ? "Configured" : "Database URL required",
    },
    {
      action: summary.missingRequiredRuntimeSecrets.length
        ? `Add ${summary.missingRequiredRuntimeSecrets.join(", ")} to Vercel.`
        : "Retain required production variables in Vercel.",
      authority: "Admin or Super Admin",
      control: "Required runtime environment",
      id: "DEP-2607-0002",
      productionHome: "Vercel Environment Variables",
      status: missingRuntimeSecretSummary,
    },
    {
      action: "Confirm AWS S3 bucket policy, IAM scope, and object lifecycle rules.",
      authority: "Admin or Super Admin",
      control: "AWS S3 evidence storage",
      id: "DEP-2607-0003",
      productionHome: "AWS S3",
      status: hasAwsStorageRuntime() ? "Configured" : "Storage variables required",
    },
    {
      action: "Confirm SES sender identity, sandbox exit, suppression handling, and callback signing.",
      authority: "Admin or Super Admin",
      control: "AWS SES email delivery",
      id: "DEP-2607-0004",
      productionHome: "AWS SES",
      status: hasAwsSesRuntime() ? "Configured" : "Email variables required",
    },
    {
      action: summary.productionUrlConfigured
        ? "Replay signed callbacks against the deployed Vercel URL."
        : "Set APP_URL or NOTARIX_PRODUCTION_URL after Vercel deployment URL is issued.",
      authority: "Admin or Super Admin",
      control: "Deployed callback replay",
      id: "DEP-2607-0005",
      productionHome: "Vercel deployment URL",
      status: summary.productionUrlConfigured
        ? "Replay command ready"
        : "Production URL required",
    },
    {
      action: siteLocked()
        ? "Confirm maintenance window authority before restoring public workflows."
        : "Keep SITE_LOCKED false unless a controlled maintenance window is active.",
      authority: "Admin or Super Admin",
      control: "Public portal maintenance lock",
      id: "DEP-2607-0006",
      productionHome: "Vercel SITE_LOCKED",
      status: siteLocked() ? "Maintenance lock active" : "Unlocked",
    },
  ];
}

export function getDeploymentRequiredRuntimeSecrets() {
  return requiredRuntimeSecrets.map((entry) => ({
    name: entry.name,
    home: entry.home,
    purpose: entry.purpose,
    configured: hasRuntimeValue(entry.name),
  }));
}

function hasAwsStorageRuntime() {
  return Boolean(
    runtimeValue("AWS_ACCESS_KEY_ID") &&
      runtimeValue("AWS_SECRET_ACCESS_KEY") &&
      (runtimeValue("NOTARIX_STORAGE_REGION") ?? runtimeValue("AWS_REGION")) &&
      runtimeValue("NOTARIX_STORAGE_BUCKET"),
  );
}

function hasAwsSesRuntime() {
  return Boolean(
    runtimeValue("AWS_ACCESS_KEY_ID") &&
      runtimeValue("AWS_SECRET_ACCESS_KEY") &&
      (runtimeValue("AWS_SES_REGION") ?? runtimeValue("AWS_REGION")) &&
      runtimeValue("AWS_SES_FROM_EMAIL"),
  );
}

function hasRuntimeValue(name: string): boolean {
  return Boolean(runtimeValue(name));
}

function siteLocked() {
  return ["1", "true", "yes", "locked"].includes(
    (runtimeValue("SITE_LOCKED") ?? "").trim().toLowerCase(),
  );
}

function runtimeValue(name: string): string | undefined {
  return process.env[name];
}

function vercelUrl() {
  const value = runtimeValue("VERCEL_URL");
  return value ? `https://${value}` : undefined;
}
