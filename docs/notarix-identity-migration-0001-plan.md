# Identity Migration 0001 Execution Plan

Migration: `drizzle/0001_nebulous_slipstream.sql`

Status: reviewed and committed; not applied to production or preview

Approval: explicit owner approval required before use outside an isolated test database

## Purpose

Add the server-controlled identity, role-assignment, and session persistence
needed for the Cognito/Google Workspace preview. Cognito proves identity; these
Postgres records remain the application authority.

## Affected schema

The additive migration creates:

- `portal_users`: ID, email, display name, role, status, owner lock, and UTC timestamps.
- `portal_user_identities`: user/provider linkage, subject, issuer, email, and UTC timestamps.
- `portal_role_assignments`: user, role, assigning actor, assignment, and revocation timestamps.
- `portal_auth_sessions`: user, hashed session token, user agent, IP address, lifecycle timestamps, and revocation.

It also creates foreign keys to `portal_users`, unique indexes for session-token
hashes, provider subjects, and user emails, plus lookup indexes for users, roles,
statuses, identities, and expirations.

## Data-loss assessment

The SQL contains no `DROP`, `TRUNCATE`, destructive `ALTER`, or modification of
existing rows. Expected direct data loss is none. Operational risk remains high
because partial DDL, incorrect database targeting, or application/schema mismatch
could interrupt authentication.

## Current verification

- Repository journal: two migrations; head is `0001_nebulous_slipstream`.
- Drizzle schema: 25 tables; SQL and snapshot are internally present.
- Production read-only check on Aug 5 2026: none of the four identity tables are present.
- Value-blind comparison proved Vercel Preview and Production use the same
  `DATABASE_URL`. No isolated preview database exists on the configured server.
- Read-only Vercel reconciliation found an owned, available, unattached Neon
  Free-plan resource named `notarix-portal-preview`. It is the preferred
  candidate, but project/branch/database/region, contents, migration history,
  TLS, role, and DDL privileges remain unverified. No connection was attempted.
- Static SQL review found only standard PostgreSQL tables, foreign keys,
  `timestamp with time zone`, booleans, and btree indexes; no tablespaces,
  unsupported extensions, or host-level features. It is compatible in principle
  with Neon PostgreSQL 14–17, subject to target version and privilege checks.
- On Aug 6 2026, the canonical Preview role bootstrap committed successfully to
  Neon project `plain-shadow-93565861`, branch `br-restless-pond-aucwu8b2`,
  database `neondb`. The restricted runtime and migrator roles exist with NULL
  passwords, exact connection limits, bootstrap-only administrative memberships,
  and verified table/sequence/function defaults. No application object or
  migration journal was created. Migration 0001 remains unapplied.
- Cognito remains disabled in legacy rollback mode.

## Prerequisites

1. Owner approves the isolated preview database and migration window.
2. Confirm the target identifier without printing credentials.
3. Prove the target is not production RDS.
4. Capture and privately record a restorable snapshot.
5. Verify baseline schema and sufficient DDL privileges.
6. Confirm the preview SHA expects migration 0001.
7. Keep Cognito disabled during DDL and validation.
8. Prepare application rollback to the prior approved preview SHA.

## Backup requirement

A verified, restorable snapshot is mandatory before applying the migration to
any shared preview/staging database. Production requires a separately approved
backup and restoration plan even though the migration is additive.

## Execution procedure

1. Put the isolated preview in a controlled maintenance window.
2. Record pre-migration schema/table counts and confirm all four tables are absent.
3. Apply the exact reviewed SQL once through the approved migration runner.
4. Stop on any error; do not rerun blindly.
5. Validate tables, columns, foreign keys, unique indexes, and lookup indexes.
6. Insert only synthetic identity data through the reviewed seed path.
7. Run session, role, revocation, and authorization integration tests.
8. Deploy the exact matching application SHA to a protected preview.
9. Keep Cognito disabled until schema and rollback evidence are accepted.

## Rollback procedure

For an isolated database containing only synthetic data, rollback may drop the
four new tables in dependency-safe order after confirming no unexpected records
or references exist. For shared or production-like databases, prefer application
rollback with Cognito disabled and retain the additive tables until a separate
rollback decision is approved. Restore the verified backup if broader schema
damage occurred. Never delete identity or audit data without owner approval.

## Post-migration validation

- Four tables have exact expected columns and types.
- Foreign keys and all unique/lookup indexes are present.
- Existing 21 baseline tables and row counts are unchanged.
- Synthetic owner is `SUPER_ADMIN`, owner-locked, and unique.
- Role assignments are attributable and revocable.
- Only session-token hashes are stored; raw tokens are absent.
- Expired/revoked sessions are denied.
- GenAdmin cannot grant final approval or financial/payable activation.
- Protected preview passes the full quality and RBAC matrices.

## Expected application impact

No impact while Cognito is disabled. When enabled in preview, callbacks, role
lookup, and session validation require the new tables. Failure must remain
contained to protected preview and fail closed.

## Prohibited actions

- Do not apply migration 0001 to production under Phase 1 authorization.
- Do not target a database whose environment is uncertain.
- Do not reset, truncate, or delete production data.
- Do not seed real customer, W-9, banking, or identity-document information.
- Do not enable production Cognito or unrestricted access.
- Successful DDL does not authorize production cutover.
