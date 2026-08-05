import fs from "node:fs";
import postgres from "postgres";

const REQUIRED_TABLES = [
  "access_requests",
  "profile_verification_items",
  "evidence_files",
  "evidence_storage_controls",
  "evidence_access_receipts",
  "evidence_malware_scan_events",
  "workflow_audit_events",
  "workflow_notifications",
  "notification_delivery_records",
  "notification_delivery_events",
  "communication_consent_records",
  "command_center_targets",
  "command_center_events",
  "command_center_receipts",
  "order_operational_records",
  "order_lifecycle_stages",
  "order_signer_readiness",
  "order_appointments",
  "order_closeout_controls",
  "order_delivery_receipts",
  "notary_completion_receipts",
];

function loadLocalEnv() {
  if (!fs.existsSync(".env.local")) return {};

  return Object.fromEntries(
    fs
      .readFileSync(".env.local", "utf8")
      .split(/\r?\n/)
      .map((line) =>
        line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/),
      )
      .filter(Boolean)
      .map((match) => [
        match[1],
        match[2].trim().replace(/^['"]|['"]$/g, ""),
      ]),
  );
}

function sanitizePostgresUrl(databaseUrl) {
  const parsed = new URL(databaseUrl);
  parsed.searchParams.delete("schema");
  return parsed.toString();
}

const env = { ...loadLocalEnv(), ...process.env };
const databaseUrl = env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing.");
}

const sql = postgres(sanitizePostgresUrl(databaseUrl), {
  connect_timeout: 20,
  max: 1,
  prepare: false,
});

try {
  const existingTables = await sql.unsafe(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name = any($1)
    order by table_name
  `, [REQUIRED_TABLES]);

  if (existingTables.length > 0) {
    throw new Error(
      `Refusing to apply baseline because required tables already exist: ${existingTables
        .map((row) => row.table_name)
        .join(",")}`,
    );
  }

  const migration = fs.readFileSync(
    "drizzle/0000_postgres_production_baseline.sql",
    "utf8",
  );
  const statements = migration
    .split("--> statement-breakpoint")
    .map((statement) => statement.trim())
    .filter(Boolean);

  await sql.begin(async (transaction) => {
    for (const statement of statements) {
      await transaction.unsafe(statement);
    }
  });

  console.log(`baseline_applied=true`);
  console.log(`statements_executed=${statements.length}`);
} finally {
  await sql.end();
}
