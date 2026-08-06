import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import postgres from "postgres";
import { validateMigrationTarget } from "./database/target-contract.mjs";

const EXPECTED_SHA256 = "e3d59b0ab29305933b468f2884bb16c739fadfb49598a47895b638f4679ba5af";
const EXPECTED_TABLES = [
  "portal_auth_sessions",
  "portal_role_assignments",
  "portal_user_identities",
  "portal_users",
];
const args = parseArgs(process.argv.slice(2));
const target = args.target;
const mode = args.mode;

if (!target || !mode || !["readiness", "execute", "verify"].includes(mode)) {
  throw new Error("Use --target=preview|production and --mode=readiness|execute|verify.");
}
if (target === "production" && (mode === "execute" || mode === "verify")) {
  if (args.approval !== "OWNER_APPROVED_PRODUCTION_MIGRATION" || process.env.NOTARIX_PRODUCTION_MIGRATION_APPROVED !== "true") {
    throw new Error("Production migration activity requires explicit owner approval in both flag and environment gate.");
  }
}

const migrationUrl = new URL("../drizzle/0001_nebulous_slipstream.sql", import.meta.url);
const sqlSource = await readFile(migrationUrl, "utf8");
const checksum = createHash("sha256").update(sqlSource).digest("hex");
if (checksum !== EXPECTED_SHA256) throw new Error("Migration 0001 checksum mismatch.");
assertSafeMigration(sqlSource);
const identity = validateMigrationTarget(target);

if (mode === "readiness") {
  printEvidence(identity, { checksum, status: "ready_for_separately_approved_execution" });
  process.exit(0);
}

const client = postgres(identity.sanitizedUrl, { max: 1, prepare: false, connect_timeout: 10 });
try {
  if (mode === "execute") {
    await client.begin(async (transaction) => {
      for (const statement of sqlSource.split("--> statement-breakpoint").map((value) => value.trim()).filter(Boolean)) {
        await transaction.unsafe(statement);
      }
    });
  }
  const verification = await verifyIdentityMigration(client, target);
  printEvidence(identity, { checksum, mode, ...verification });
} finally {
  await client.end({ timeout: 5 });
}

async function verifyIdentityMigration(client, targetName) {
  const tables = await client`
    select c.relname as table_name, owner.rolname as owner_name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    join pg_roles owner on owner.oid = c.relowner
    where n.nspname = 'public' and c.relkind in ('r', 'p')
      and c.relname = any(${EXPECTED_TABLES})
    order by c.relname
  `;
  if (tables.length !== EXPECTED_TABLES.length) throw new Error("Migration verification did not find exactly four identity tables.");
  const expectedOwner = targetName === "preview" ? "notarix_preview_migrator" : process.env.NOTARIX_EXPECTED_MIGRATION_OWNER;
  if (!expectedOwner || tables.some((row) => row.owner_name !== expectedOwner)) throw new Error("Migration table ownership mismatch.");

  const grants = await client`
    select table_name, privilege_type, is_grantable
    from information_schema.role_table_grants
    where table_schema = 'public'
      and grantee = ${targetName === "preview" ? "notarix_preview_app" : process.env.NOTARIX_EXPECTED_RUNTIME_ROLE ?? ""}
      and table_name = any(${EXPECTED_TABLES})
    order by table_name, privilege_type
  `;
  const allowed = new Set(["SELECT", "INSERT", "UPDATE", "DELETE"]);
  if (grants.length !== 16 || grants.some((grant) => !allowed.has(grant.privilege_type) || grant.is_grantable === "YES")) {
    throw new Error("Runtime table grants do not match the approved non-grantable DML set.");
  }
  return { tableCount: tables.length, runtimeGrantCount: grants.length, status: "verified" };
}

function assertSafeMigration(source) {
  for (const forbidden of [
    /\bDROP\b/i,
    /\bTRUNCATE\b/i,
    /\bDELETE\s+FROM\b/i,
    /\bUPDATE\s+\w+\s+SET\b/i,
    /\bCREATE\s+(?:ROLE|DATABASE|SCHEMA|EXTENSION)\b/i,
    /\bALTER\s+(?:ROLE|DATABASE)\b/i,
  ]) {
    if (forbidden.test(source)) throw new Error("Migration 0001 contains a prohibited statement.");
  }
  const tables = [...source.matchAll(/CREATE TABLE "([^"]+)"/g)].map((match) => match[1]).sort();
  if (JSON.stringify(tables) !== JSON.stringify([...EXPECTED_TABLES].sort())) throw new Error("Migration 0001 table set mismatch.");
}

function printEvidence(identityValue, details) {
  const { sanitizedUrl: _secret, ...safeIdentity } = identityValue;
  console.log(JSON.stringify({ identity: safeIdentity, ...details }, null, 2));
}

function parseArgs(values) {
  return Object.fromEntries(values.filter((value) => value.startsWith("--") && value.includes("=")).map((value) => {
    const [name, ...rest] = value.slice(2).split("=");
    return [name, rest.join("=")];
  }));
}
