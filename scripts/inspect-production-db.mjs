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

const env = { ...loadLocalEnv(), ...process.env };
const databaseUrl = env.DATABASE_MIGRATION_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_MIGRATION_URL is required for administrative database inspection.");
}

const sql = postgres(sanitizePostgresUrl(databaseUrl), {
  connect_timeout: 20,
  max: 1,
  prepare: false,
});

try {
  const tables = await sql.unsafe(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
    order by table_name
  `);
  const tableNames = new Set(tables.map((row) => row.table_name));
  const missing = REQUIRED_TABLES.filter((table) => !tableNames.has(table));
  const watchedColumns = await sql.unsafe(`
    select table_name, count(*)::int as count
    from information_schema.columns
    where table_schema = 'public'
      and table_name in (
        'notification_delivery_records',
        'evidence_storage_controls',
        'evidence_malware_scan_events'
      )
    group by table_name
    order by table_name
  `);

  console.log("connection=ok");
  console.log(`public_tables=${tables.length}`);
  console.log(`required_present=${REQUIRED_TABLES.length - missing.length}/${REQUIRED_TABLES.length}`);
  console.log(`missing=${missing.length ? missing.join(",") : "none"}`);
  console.log(
    `column_counts=${
      watchedColumns.length
        ? watchedColumns.map((row) => `${row.table_name}:${row.count}`).join(",")
        : "none"
    }`,
  );
} finally {
  await sql.end();
}

function sanitizePostgresUrl(databaseUrl) {
  const parsed = new URL(databaseUrl);
  parsed.searchParams.delete("schema");
  return parsed.toString();
}
