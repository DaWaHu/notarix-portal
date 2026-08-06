import { readFile, readdir } from "node:fs/promises";

const args = new Set(process.argv.slice(2));
const jsonOutput = args.has("--json");
const localEnv = await loadLocalEnv();
const env = { ...localEnv, ...process.env };

const journal = await readJson("../drizzle/meta/_journal.json");
const latestEntry = journal.entries.at(-1);
const migrationFiles = await readdir(new URL("../drizzle", import.meta.url));
const snapshotFiles = await readdir(new URL("../drizzle/meta", import.meta.url));
const latestSnapshotFile = latestEntry
  ? `${String(latestEntry.idx).padStart(4, "0")}_snapshot.json`
  : null;
const latestSnapshot = latestSnapshotFile
  ? await readJson(`../drizzle/meta/${latestSnapshotFile}`)
  : null;

const requiredTables = [
  "access_requests",
  "profile_verification_items",
  "evidence_files",
  "evidence_storage_controls",
  "evidence_access_receipts",
  "evidence_malware_scan_events",
  "workflow_audit_events",
  "workflow_notifications",
  "portal_users",
  "portal_user_identities",
  "portal_role_assignments",
  "portal_auth_sessions",
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

const snapshotTables = latestSnapshot ? Object.keys(latestSnapshot.tables ?? {}) : [];
const missingRequiredTables = requiredTables.filter(
  (table) => !snapshotTables.includes(`public.${table}`) && !snapshotTables.includes(table),
);
const journalSqlMissing = journal.entries
  .map((entry) => `${entry.tag}.sql`)
  .filter((file) => !migrationFiles.includes(file));
const untrackedMigrationSql = migrationFiles
  .filter((file) => /^\d{4}_.+\.sql$/.test(file))
  .filter(
    (file) => !journal.entries.some((entry) => file === `${entry.tag}.sql`),
  );

const readiness = {
  database: {
    runtimeConfigured: Boolean(env.DATABASE_URL),
    migrationConfigured: Boolean(env.DATABASE_MIGRATION_URL),
    environment: env.NOTARIX_DATABASE_ENVIRONMENT ?? "unmarked",
    provider: env.NOTARIX_DATABASE_PROVIDER ?? "unmarked",
    resourceIdentified: Boolean(env.NOTARIX_DATABASE_RESOURCE_ID),
    endpointIdentified: Boolean(env.NOTARIX_DATABASE_ENDPOINT_ID),
    nameIdentified: Boolean(env.NOTARIX_DATABASE_NAME),
    roleClass: env.NOTARIX_DATABASE_ROLE_CLASS ?? "unmarked",
    tlsVerificationDisabled: ["0", "false"].includes(
      String(env.NODE_TLS_REJECT_UNAUTHORIZED ?? "").toLowerCase(),
    ),
  },
  migrations: {
    dialect: journal.dialect,
    head: latestEntry?.tag ?? null,
    headSnapshotPresent: latestSnapshotFile
      ? snapshotFiles.includes(latestSnapshotFile)
      : false,
    journalSqlMissing,
    migrationCount: journal.entries.length,
    untrackedMigrationSql,
  },
  schema: {
    missingRequiredTables,
    requiredTableCount: requiredTables.length,
    snapshotTableCount: snapshotTables.length,
  },
  status: "needs_database_readiness_work",
};

if (
  readiness.database.runtimeConfigured &&
  readiness.database.environment !== "unmarked" &&
  readiness.database.provider !== "unmarked" &&
  readiness.database.resourceIdentified &&
  readiness.database.endpointIdentified &&
  readiness.database.nameIdentified &&
  readiness.database.roleClass !== "unmarked" &&
  !readiness.database.tlsVerificationDisabled &&
  readiness.migrations.dialect === "postgresql" &&
  readiness.migrations.headSnapshotPresent &&
  readiness.migrations.journalSqlMissing.length === 0 &&
  readiness.migrations.untrackedMigrationSql.length === 0 &&
  readiness.schema.missingRequiredTables.length === 0
) {
  readiness.status = "ready_for_postgres";
}

if (jsonOutput) {
  console.log(JSON.stringify(readiness, null, 2));
} else {
  console.log(`database_environment=${readiness.database.environment}`);
  console.log(`database_provider=${readiness.database.provider}`);
  console.log(`database_runtime_url_configured=${readiness.database.runtimeConfigured}`);
  console.log(`database_migration_url_configured=${readiness.database.migrationConfigured}`);
  console.log(`database_resource_identified=${readiness.database.resourceIdentified}`);
  console.log(`database_endpoint_identified=${readiness.database.endpointIdentified}`);
  console.log(`database_name_identified=${readiness.database.nameIdentified}`);
  console.log(`database_role_class=${readiness.database.roleClass}`);
  console.log(`tls_verification_disabled=${readiness.database.tlsVerificationDisabled}`);
  console.log(`migration_dialect=${readiness.migrations.dialect}`);
  console.log(`migration_count=${readiness.migrations.migrationCount}`);
  console.log(`migration_head=${readiness.migrations.head ?? "missing"}`);
  console.log(`head_snapshot_present=${readiness.migrations.headSnapshotPresent}`);
  console.log(
    `journal_sql_missing=${
      readiness.migrations.journalSqlMissing.length
        ? readiness.migrations.journalSqlMissing.join(",")
        : "none"
    }`,
  );
  console.log(
    `untracked_migration_sql=${
      readiness.migrations.untrackedMigrationSql.length
        ? readiness.migrations.untrackedMigrationSql.join(",")
        : "none"
    }`,
  );
  console.log(`schema_table_count=${readiness.schema.snapshotTableCount}`);
  console.log(
    `required_tables_missing=${
      readiness.schema.missingRequiredTables.length
        ? readiness.schema.missingRequiredTables.join(",")
        : "none"
    }`,
  );
  console.log(`status=${readiness.status}`);
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
