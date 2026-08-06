# Postgres Database And Migration Readiness

This document records the current Notarix Signings production database posture
for the Vercel + AWS services + Postgres architecture. It contains binding names
and schema status only. Do not store production database credentials or secret
values in this repository.

## Production Database

The production database is Postgres and must be provided to the Vercel runtime
through:

```text
DATABASE_URL
```

The application database helper uses `DATABASE_URL` through the `postgres`
driver and Drizzle ORM. Vercel environment variables are the production home for
that value.

Migration and administrative inspection commands fail closed unless an approved
operator process supplies `DATABASE_MIGRATION_URL`. Non-secret
`NOTARIX_DATABASE_*` markers identify environment, provider, resource, endpoint,
database, and role class. Preview additionally requires the approved Neon
identity, pooled runtime/direct migration classification, and
`sslmode=verify-full`.

## Schema Coverage

The current Postgres schema contains 21 workflow tables covering:

- intake requests
- profile verification items
- profile evidence files
- evidence storage controls
- evidence access receipts
- malware scan events
- workflow audit events
- workflow notifications
- notification delivery records
- notification delivery events
- communication consent records
- command-center targets, events, and receipts
- order operations
- order lifecycle stages
- signer readiness
- appointments
- closeout controls
- client delivery receipts
- notary completion receipts

## Migration Head

Current migration head:

```text
0000_postgres_production_baseline
```

This is the first Postgres baseline migration for the Vercel production
architecture.

## Readiness Checks

Run the Postgres readiness gate:

```bash
npm run db:readiness
```

Readiness reports runtime and migration configuration separately without values:

```text
database_environment=production
database_provider=aws-rds
database_runtime_url_configured=true
database_migration_url_configured=false
database_resource_identified=true
database_endpoint_identified=true
database_name_identified=true
database_role_class=runtime
tls_verification_disabled=false
migration_dialect=postgresql
migration_count=1
migration_head=0000_postgres_production_baseline
head_snapshot_present=true
journal_sql_missing=none
untracked_migration_sql=none
schema_table_count=21
required_tables_missing=none
status=ready_for_postgres
```

Run schema generation after schema edits:

```bash
npm run db:generate
```

When no schema edits are pending, the expected result is:

```text
No schema changes, nothing to migrate
```

## Production Deployment Sequence

1. Confirm the Production-scoped runtime `DATABASE_URL` remains in Vercel.
2. Confirm `npm run db:readiness` reports `ready_for_postgres`.
3. Obtain separate authorization, inject `DATABASE_MIGRATION_URL` only into the
   migration process, validate Production identity, and apply only the approved
   migration.
4. Deploy the application on Vercel with all required environment variables.
5. Open `/staff/platform/seed` as Admin or Super Admin to reconcile baseline
   records after the database is available.
6. Confirm `/staff/deployment-readiness` reports the Postgres database as
   configured.

Production launch should remain held if `DATABASE_URL` is missing, migration
SQL is untracked, the migration head snapshot is missing, or required workflow
tables are absent from the schema snapshot.
