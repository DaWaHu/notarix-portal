# Notarix Signings Phase 2 Preview Database Binding Plan

Status: **code contract and runtime credential completed; Vercel binding not executed**
Prepared: Aug 6 2026  
Decision gate: protected Vercel Preview binding

## Executive status

The isolated Neon resource is technically suitable for the protected Phase 2
Preview. The owner-controlled procedure has established and verified the
`notarix_preview_app` credential without displaying or recording it. Vercel
Preview remains database-disabled and has no `DATABASE_URL`; no branch-specific
Preview binding exists.

Runtime/migration separation and the guarded exact-file runner are now
implemented in source. The remaining safe path is to deploy while Preview is
locked and database-disabled, then bind a branch-specific Neon runtime
credential. The migration credential remains outside Vercel. `neondb_owner`
remains provider-controlled and outside application runtime.

Only the isolated Preview runtime role credential changed. The migration role
remains passwordless. No credential was viewed or recorded, and no Vercel
variable, deployment, migration, Cognito, Google Workspace, DNS, or Production
change was made.

## Approved resource identities

| Resource | Approved non-secret identity |
| --- | --- |
| Vercel team | `owner-9915's projects` (Hobby) |
| Vercel project | `notarix-portal` / `prj_CsXZ0PzV6Ekdv2AjzniVcIxdnbt2` |
| Vercel organization | `team_Omt8ARCl1DNPdSamAc8pogzh` |
| Preview branch | `codex/notarix-portal-checkpoint` |
| Current repository HEAD | `c3b74511c66d4369d8649196f8e7ab1b0fcf53c2` |
| Latest visible ready Preview | Git `19b8103f5fd3c7f638dd4083f5c4ddad8084f65e`; deployment masked as `FJj2…RMk4` |
| Previously verified protected Preview | `dpl_5Qn9…F1Pk`, Git `321f87c55e3c89d09c01aaceda3f11c2a86ada5b`; Vercel SSO protected |
| Neon project | `plain-shadow-93565861` / `notarix-portal-preview` |
| Neon branch | `br-restless-pond-aucwu8b2` / `main` |
| Neon read-write endpoint | `ep-orange-fog-ausod744` (hostname not recorded) |
| Neon database | `neondb` |
| Neon region/version/plan | AWS US East 1; PostgreSQL 17; Free |
| Administrative role | `neondb_owner` |
| Runtime role | `notarix_preview_app`, credential established and login verified, connection limit 20 |
| Migration role | `notarix_preview_migrator`, `PASSWORD NULL`, connection limit 2 |

The latest visible Preview and the previously proven protected Preview are not the current repository HEAD. A later cutover deployment must map to its exact Git SHA and reverify protection.

## Current Vercel environment inventory

Values were neither opened nor recorded. The inventory reflects the authorized read-only project-settings inspection.

| Scope | Variable names |
| --- | --- |
| Preview only | `NODE_EXTRA_CA_CERTS`, `NODE_TLS_REJECT_UNAUTHORIZED` |
| Production only | Separate records for `NODE_EXTRA_CA_CERTS`, `NODE_TLS_REJECT_UNAUTHORIZED` |
| All environments | `SITE_LOCKED`, `DATABASE_URL`, `APP_URL`, `AWS_SES_REGION`, `AWS_SES_FROM_EMAIL`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AUTH_TRUST_HOST`, `AUTH_SECRET`, `NOTARIX_NOTIFICATION_WEBHOOK_SECRET`, `NOTARIX_EVIDENCE_WEBHOOK_SECRET`, `NOTARIX_MALWARE_WEBHOOK_SECRET`, `NOTARIX_STORAGE_WEBHOOK_SECRET`, `NOTARIX_STORAGE_REGION`, `NOTARIX_STORAGE_BUCKET` |

`DATABASE_URL` is not separately defined for Preview and Production. It is one all-environments record, has no branch-specific Preview override, and its documented value is the Production AWS RDS connection. Preview can therefore reach Production today; Preview runtime database testing remains prohibited.

Variables whose scope can allow Preview to reach Production:

- `DATABASE_URL`: direct Production database access.
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `NOTARIX_STORAGE_REGION`, and `NOTARIX_STORAGE_BUCKET`: shared AWS identity and resource selection can expose Production services or storage.
- Shared notification, evidence, malware, and storage webhook secrets can cross environment trust boundaries.
- Shared `AUTH_SECRET`, `AUTH_TRUST_HOST`, `APP_URL`, and `SITE_LOCKED` are not database credentials but prevent a claim of complete environment separation.

Database binding can isolate PostgreSQL, but full Preview isolation cannot be attested while Production-capable AWS credentials remain available to Preview. No AWS-dependent Preview test should run until that separate gate is resolved.

Vercel variables are available during builds and function execution, changes apply only to new deployments, and branch-specific Preview variables override general Preview variables. Sources: [Vercel environment variables](https://vercel.com/docs/environment-variables) and [managing variables across environments](https://vercel.com/docs/environment-variables/manage-across-environments).

## Application database-variable contract

Current behavior:

- `db/index.ts` uses only `process.env.DATABASE_URL` at runtime with `max: 1` and `prepare: false`.
- `drizzle.config.ts` also uses only `DATABASE_URL`; runtime and DDL authority are conflated.
- `db/database-url.ts` removes only the unsupported `schema` query parameter and preserves TLS parameters.
- `NOTARIX_BUILD_MODE=1` prevents `getOptionalDb()` from opening a database during `npm run build`. Vercel can still inject the secret into the build environment, so this is a code control rather than secret non-availability.
- No `DATABASE_MIGRATION_URL` or `DATABASE_ADMIN_URL` contract exists.
- Several stores catch database errors and use local Preview state. This can mask a failed binding; identity and authorization verification must fail closed.

### Smallest safe target design

| Purpose | Variable/channel | Availability | Role |
| --- | --- | --- | --- |
| Preview runtime | `DATABASE_URL` | Sensitive, Preview only, restricted to `codex/notarix-portal-checkpoint`; build and runtime receive it, but build code must not connect | `notarix_preview_app`, pooled endpoint |
| Preview migration | `DATABASE_MIGRATION_URL` | Ephemeral approved local/CI migration process only; **never Vercel application runtime** | `notarix_preview_migrator`, direct endpoint |
| Administration | No application variable | Authenticated Neon console or separately approved ephemeral session | `neondb_owner` |
| TLS | URL `sslmode=verify-full`; `NODE_TLS_REJECT_UNAUTHORIZED=1`; system CA store | Preview only | All Preview database clients |
| Build isolation | `NOTARIX_BUILD_MODE=1` | Build command only | No connection |

Do not introduce `DATABASE_ADMIN_URL`.

### Code changes required before credential generation

1. Change `drizzle.config.ts` to require `DATABASE_MIGRATION_URL` and forbid fallback to `DATABASE_URL`.
2. Add a guarded Preview runner that verifies project, branch, endpoint, database, role, filename, and checksum before executing exactly `0001_nebulous_slipstream.sql`. It must refuse Production fingerprints and must not implicitly run every journal migration.
3. Update `examples/notarix-env-template.txt`, `deployment-runtime-secrets.json`, `scripts/db-readiness.mjs`, and `tests/source-contract.test.mjs` to enforce the separation. The migration URL is operator-only, not a Vercel runtime secret.
4. Add a Preview database identity health check exposing only provider, database, and role fingerprints and failing closed for identity/RBAC paths.
5. Preserve `db/index.ts` on `DATABASE_URL` only and preserve build-time no-connect behavior.

## Neon connection design

| Use | Endpoint | Account | Settings and constraints |
| --- | --- | --- | --- |
| Vercel runtime | Neon pooled endpoint derived from the approved endpoint ID | `notarix_preview_app` | `neondb`; `sslmode=verify-full`; `max: 1`; `prepare: false`; role limit 20; monitor aggregate serverless concurrency |
| Migration | Direct, non-pooled endpoint | `notarix_preview_migrator` | `neondb`; `sslmode=verify-full`; one connection; role limit 2; ephemeral operator environment only |
| Administration | Neon console/direct provider channel | `neondb_owner` | Never Vercel, source, documentation, or routine migration runtime |

Neon requires TLS and supports `verify-full`, which validates the CA chain and hostname. Neon recommends its pooled PgBouncer endpoint for serverless traffic and a direct connection for ORM migrations. Sources: [Neon security overview](https://neon.com/docs/security/security-overview) and [Neon connection pooling](https://neon.com/docs/connect/connection-pooling).

Later URLs must include the approved role, database, endpoint type, `sslmode=verify-full`, and any provider-required channel binding parameter. A non-writing compatibility probe must first prove that `postgres@3.4.9` preserves certificate and hostname verification. Failure is a stop condition, not a reason to downgrade TLS.

## Credential-generation and transfer procedure

Separate execution approval is required.

1. The owner uses an approved password manager to generate two independent passwords of at least 48 cryptographically random bytes (about 256 bits or more after encoding). Never reuse them.
2. Create separate password-manager records containing role, approved Neon IDs, timestamp, custodian, and rotation date.
3. Assign each through the authenticated Neon Roles UI or an interactive `psql` password prompt that does not echo input. Never place a secret literal in a command, pipe, history, file, clipboard manager, screenshot, log, or Codex output.
4. Build the percent-encoded runtime URL inside the password manager and paste it directly into Vercel's sensitive branch-specific field.
5. Keep the migrator URL only in the approved password manager. At migration time, expose it to one process through ephemeral password-manager injection; never persist it in `.env`, Vercel, CI logs, or files.
6. Evidence contains only provider record IDs, role names, timestamps, approved resource IDs, and non-secret configuration fingerprints. Do not hash or record the complete URL or password.

## Atomic, fail-closed Vercel Preview cutover

A branch override alone is insufficient because removing it would expose the inherited Production URL again.

1. Verify exact Vercel and Neon IDs, approved SHA, protection, and encrypted variable record IDs. Stop on any mismatch.
2. Implement, test, commit, and push the database-contract code changes. Do not deploy or generate credentials yet.
3. Add branch-specific Preview `SITE_LOCKED=1` and deploy the exact approved SHA. Verify Vercel SSO and fail-closed behavior without invoking a database path.
4. Edit the existing encrypted `DATABASE_URL` target from **All Environments** to **Production only**, retaining its encrypted value without viewing/copying it. This requires explicit authorization even though the Production value is unchanged.
5. Redeploy Preview with no `DATABASE_URL`. Prove it fails closed and Production's environment record and deployment fingerprint are unchanged. If Vercel cannot preserve the encrypted Production value during the scope edit, stop.
6. Generate and assign credentials through the approved procedure.
7. Add sensitive `DATABASE_URL` for Preview restricted to `codex/notarix-portal-checkpoint`, containing only the pooled Neon runtime role. Never add `DATABASE_MIGRATION_URL` or an admin URL to Vercel.
8. Inspect names/scopes only: Production has AWS RDS, branch Preview has Neon, no all-environments database variable exists, and no Preview fallback exists.
9. Trigger one protected Preview deployment at the exact approved SHA. Create no public alias; reverify Vercel SSO.
10. Use non-secret health evidence to prove Preview matches Neon. Independently verify Production still matches AWS RDS by existing non-secret fingerprints without querying or changing Production.
11. Remove the branch maintenance override only after all gates pass and anonymous access remains blocked.

### Rollback

If binding fails, retain `SITE_LOCKED=1`, remove/disable the branch-specific Neon `DATABASE_URL`, redeploy Preview without database access, and leave it failed closed. Leave the Production-only record untouched. Never restore a Production credential into Preview.

## TLS certificate resolution

No active source or variable reference to `./us-east-1-bundle.pem` was found; it appears only in historical documentation. It was for AWS RDS, is unnecessary for Neon, and must not be reused for Preview.

Preview and Production have separate `NODE_EXTRA_CA_CERTS` and `NODE_TLS_REJECT_UNAUTHORIZED` records. The documented configuration uses Vercel's system trust store (`/etc/ssl/certs/ca-certificates.crt`) and verification enabled (`1`). Preview Neon must additionally use `sslmode=verify-full`. Never set `NODE_TLS_REJECT_UNAUTHORIZED=0`, weaken SSL mode, or bundle an unverified CA. Production AWS RDS TLS remains unchanged.

Before cutover, verify chain, hostname, validity, protocol, cipher, and redacted certificate fingerprint for pooled and direct Neon endpoints.

## Least-privilege validation plan

Run only after migration approval, against isolated Neon, with synthetic data. Record SQLSTATE/error class without secrets.

Runtime `notarix_preview_app` must:

- Connect to `neondb`, use `public`, and after migration perform only approved table DML and sequence access.
- Be rejected when creating schemas/tables/roles/databases, altering/dropping tables, granting roles, or assuming the migrator.
- Remain non-superuser, no createdb/createrole/replication/bypass-RLS, and no authority-bearing membership.
- Fail a controlled Production cross-endpoint authentication attempt before SQL.
- Have no migrator credential in the deployment.

`notarix_preview_migrator` must:

- Connect only to Preview and create the approved four tables, indexes, and constraints in `public`.
- Own its objects and retain the approved default table/sequence grants and global function default.
- Be rejected when creating roles/databases or authenticating to Production.
- Be absent from normal runtime and Vercel variables.

RLS bypass denial is an attribute test; the four tables do not currently enable RLS. Tenant RLS requires separate design before claiming row-level isolation.

## Migration 0001 readiness

`drizzle/0001_nebulous_slipstream.sql` SHA-256 is `e3d59b0ab29305933b468f2884bb16c739fadfb49598a47895b638f4679ba5af`.

It creates four identity tables, three foreign keys, and eleven indexes. It creates no function, procedure, extension, role, database, schema, or owner override. Execution as `notarix_preview_migrator` assigns correct ownership and activates its approved default table/sequence privileges. No migration SQL correction is needed for ownership.

Later sequence:

1. Complete binding and non-secret target verification.
2. Confirm the six-hour restore history and create a branch/restore checkpoint only if separately authorized; otherwise record the provider restore position.
3. Recalculate the checksum; stop on mismatch.
4. Inventory schemas, relations, routines, types, extensions, roles, journals, owners, grants, and row counts. Stop on unexpected objects/data.
5. Ephemerally inject `DATABASE_MIGRATION_URL`; verify direct endpoint, database, migrator, TLS, and resource fingerprints.
6. Execute exactly 0001 in one transaction with stop-on-error. Do not invoke a generic migration that might also apply `0000`.
7. Resolve journal recording explicitly. The repository journal lists `0000` and `0001`, while empty Preview has not applied `0000`; do not fabricate a `0000` entry.
8. Verify four tables, three FKs, eleven indexes, constraints, ownership, grants, and absence of unexpected objects/data.
9. Verify protected Preview startup, target fingerprint, identity health, fail-closed behavior, and privileges with synthetic data.
10. Reverify Production fingerprints without querying or changing Production.

Failure before commit rolls back. After commit, use a pre-approved Neon restore/branch procedure or separately reviewed down migration; never improvise destructive DDL.

## Evidence template

| Field | Non-secret evidence |
| --- | --- |
| Time | UTC and ET |
| Neon | Project, branch, endpoint ID/type, database, region, version |
| Vercel | Team, project, branch, deployment, exact Git SHA, SSO result |
| Variables | Names, encrypted record IDs, scopes/branch restrictions; no values |
| Credentials | Method, entropy, timestamp, custodian, password-manager item ID fingerprint |
| Assignment | Role, timestamp, pass/fail; no password/URL |
| Runtime target | Provider/region/endpoint/database/role fingerprints |
| Production non-impact | Unchanged record/deployment/endpoint fingerprints |
| TLS | Mode, protocol/cipher, issuer/validity/certificate fingerprint |
| Privileges | Positive/negative results and SQLSTATE |
| Migration | Filename, checksum, transaction, object/owner/grant inventory |
| Rollback | Restore position/checkpoint and procedure readiness |

## Proposed later commands (placeholders only)

```sh
# Read-only scope inventory.
vercel env ls preview codex/notarix-portal-checkpoint
vercel env ls production

# Enter the secret only at Vercel's protected prompt.
vercel env add DATABASE_URL preview codex/notarix-portal-checkpoint --sensitive

# Ephemeral migration injection after separate approval.
<PASSWORD_MANAGER_RUN> --env DATABASE_MIGRATION_URL -- \
  npm run db:migrate:identity-preview -- \
  --project plain-shadow-93565861 \
  --branch br-restless-pond-aucwu8b2 \
  --endpoint ep-orange-fog-ausod744 \
  --database neondb \
  --role notarix_preview_migrator \
  --migration drizzle/0001_nebulous_slipstream.sql \
  --sha256 e3d59b0ab29305933b468f2884bb16c739fadfb49598a47895b638f4679ba5af
```

Perform the all-environments-to-Production-only scope correction in the Vercel dashboard without revealing the value unless a verified CLI supports a value-preserving target edit. Do not use `vercel env pull` or write secrets to disk.

## Planned changes

Code before credentials:

- `drizzle.config.ts`
- `examples/notarix-env-template.txt`
- `deployment-runtime-secrets.json`
- `scripts/db-readiness.mjs`
- `tests/source-contract.test.mjs`
- New guarded exact-file Preview migration runner and tests

Later Vercel changes, separately approved:

- Retarget existing `DATABASE_URL` from All Environments to Production only without changing/viewing its value.
- Add sensitive branch-specific Preview `DATABASE_URL`.
- Add/remove branch-specific Preview `SITE_LOCKED` during cutover.
- Never add `DATABASE_MIGRATION_URL` or `DATABASE_ADMIN_URL` to Vercel.

Later database change, separately approved: set independent passwords for the two existing roles. Do not change attributes, memberships, grants, ownership, schema, or data.

## Risks and stop conditions

Stop if any identifier differs; project/branch is ambiguous; Preview and Production fingerprints match; the shared variable cannot be safely retargeted; Preview can fall back to Production; admin/migrator credentials enter runtime; TLS verification weakens; exact-SHA protection cannot be proven; a public alias, paid resource, Production access, or real data is required; or unexpected database objects/data exist.

Material risks:

- Shared AWS credentials mean database isolation alone is not full environment isolation.
- Old deployments retain old variables and must remain protected.
- Aggregate Vercel concurrency can exceed role limit 20 despite `max: 1`; pooled connections and monitoring are required.
- Generic Drizzle migration state includes `0000`; it is not the authorized exact 0001 action.
- Optional database fallbacks can conceal a bad binding unless identity paths fail closed.

## Owner decisions required

1. Approve the listed code-contract changes before credential generation.
2. Approve value-preserving retargeting of encrypted `DATABASE_URL` to Production only, then a locked database-disabled Preview deployment.
3. Completed Sep 7 2026: password generation and assignment through the owner-controlled password manager.
4. Approve the branch-specific sensitive runtime binding and protected exact-SHA deployment.
5. Decide whether database-only isolation may proceed while shared AWS/service credentials remain, or require their separation first.
6. Separately approve the guarded migration 0001 and restore/checkpoint method.

## Exact next action

Approve the fail-closed, branch-specific Vercel Preview `DATABASE_URL` mapping
as a separately controlled operation. The runtime credential is established;
the migration credential remains unset and migration 0001 remains unapplied.
