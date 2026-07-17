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

Expected readiness signals when `DATABASE_URL` is configured:

```text
database_provider=Postgres
database_url_configured=true
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

1. Configure `DATABASE_URL` in Vercel.
2. Confirm `npm run db:readiness` reports `ready_for_postgres`.
3. Apply the Postgres migration SQL to the production database.
4. Deploy the application on Vercel with all required environment variables.
5. Open `/staff/platform/seed` as Admin or Super Admin to reconcile baseline
   records after the database is available.
6. Confirm `/staff/deployment-readiness` reports the Postgres database as
   configured.

Production launch should remain held if `DATABASE_URL` is missing, migration
SQL is untracked, the migration head snapshot is missing, or required workflow
tables are absent from the schema snapshot.
