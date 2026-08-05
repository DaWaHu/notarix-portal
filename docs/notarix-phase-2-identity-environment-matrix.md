# Notarix Signings Phase 2 Identity Environment Matrix

Date: Aug 5 2026

Owner authorization: Phase 2 preview-only identity and authorization work.

Status: **database isolation not proven; migration and identity activation blocked**.

## Isolation conclusion

The existing Vercel Preview environment is not isolated from Production.
Cryptographic, value-blind comparison proved that Preview and Production use the
same values for:

- `DATABASE_URL`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `NOTARIX_STORAGE_BUCKET`
- `NOTARIX_EVIDENCE_WEBHOOK_SECRET`
- `NOTARIX_NOTIFICATION_WEBHOOK_SECRET`
- `APP_URL`
- `SITE_LOCKED`

No values or fingerprints were recorded. Temporary environment files were
deleted immediately after comparison.

The current Postgres server exposes only the production `postgres` database and
AWS-managed `rdsadmin` database. There is no existing preview database. Although
the current database role can create databases and roles, creating a preview
database inside the production RDS instance is rejected because it shares the
production infrastructure and does not meet the owner's complete-isolation rule.

AWS read-only inventory through the application IAM user was denied for RDS
instances, RDS clusters, and Cognito pools. This is consistent with least
privilege, but it prevents designation of an unseen existing managed resource.

## Current and required matrix

| Control | Local development | Current Vercel Preview | Required Phase 2 Preview | Production |
| --- | --- | --- | --- | --- |
| Access | Developer workstation | Vercel SSO protected | Vercel SSO protected; no public alias | Public application domain with application auth |
| Source branch | Working branch | `codex/notarix-portal-checkpoint` | Same protected branch | Existing production artifact; unchanged |
| Database infrastructure | Local reference points to production-compatible Postgres | Same URL as Production | Separate managed instance/cluster or owner-designated isolated service | AWS RDS production |
| Database credentials | Local secret file | Same as Production | Unique preview-only role/password | Production-only credentials |
| Database name/data | Production-connected reference | Production database | Unique database with synthetic data only | Production records |
| Migration history | Repository has 0000 and 0001 | Production schema currently lacks 0001 | Independent journal; apply 0001 only after proof/backup | 0000 baseline; 0001 prohibited |
| AWS credentials | Local application credentials | Same as Production | Unique least-privilege preview credentials | Production application credentials |
| S3 bucket | Production-compatible reference | Same as Production | Separate preview bucket; synthetic objects only | Production bucket |
| Callback secrets | Local reference | Same as Production | Unique preview-only secrets | Production secrets |
| `APP_URL` | Local URL | Same value as Production | Exact protected preview origin or approved callback origin | `https://notarix.live` |
| Site lock | Local/configured | Same value as Production | Preview-specific locked state | Production value unchanged |
| Cognito | Disabled | Disabled; variables absent | Preview-only configuration | Disabled and unchanged |
| Google Workspace | Not connected | Not connected | Preview SAML app/access assignment only | Unchanged |
| MFA/passkeys | Modeled | Not active | Enforced and tested for synthetic staff | Unchanged |
| Identity data | Synthetic only | Must not write | Synthetic users only | No Phase 2 changes |
| TLS CA | Local platform trust | Secure Preview variables added Aug 5 2026 | `/etc/ssl/certs/ca-certificates.crt`; verification explicitly enabled | Existing secure Production settings unchanged |

## Proof procedure and evidence

1. Pulled Vercel Preview and Production variables into temporary files.
2. Parsed selected values in memory.
3. Compared SHA-256 results for equality without emitting values or hashes.
4. Confirmed all eight selected values were identical.
5. Deleted both temporary files and their directory; deletion check passed.
6. Queried Postgres catalogs read-only: current database `postgres`; available
   databases `postgres` and `rdsadmin`; no preview database.
7. Queried production schema read-only: all four migration 0001 identity tables
   remain absent.

Result: **failed isolation gate**. Do not apply migration 0001 and do not enable
Cognito against the current Vercel Preview configuration.

## Acceptable isolation paths

### Path A — new isolated managed preview database

Create a separate managed Postgres instance/cluster with distinct network,
credentials, database, backups, migration history, and synthetic data. This is
the preferred security posture but likely creates a paid resource. Owner approval
is required before creation.

### Path B — designate an existing isolated database

The owner or AWS administrator identifies an existing non-production managed
Postgres resource and provides a preview-only credential through Vercel's secret
store. Required evidence must prove separate resource identity, credential,
database, backups, migration journal, and absence of production data.

### Rejected path — another database on production RDS

Do not create a preview database or role on the production RDS instance. Logical
separation alone does not meet complete isolation and would mutate production
infrastructure.

## Isolation acceptance criteria

- Different managed resource identity from Production.
- Different `DATABASE_URL` value and database user.
- Preview variable scoped only to Vercel Preview.
- Production variable and deployment unchanged.
- Empty/synthetic-only schema before migration.
- Independent migration journal.
- Encryption and TLS verification enabled.
- Backup/snapshot available before migration 0001.
- Preview application can connect; Production cannot use preview credentials.
- Preview credentials cannot connect to the production database.
- Evidence is recorded without credentials or customer data.

## Identity-provider discovery

The documented Cognito user pool's public OIDC configuration endpoint returned
200 and its JWKS endpoint exposed two RS256 public keys. This proves the pool's
public verification endpoints exist; it does not prove app-client, domain,
Google SAML, MFA, passkey, or administrative configuration. The application IAM
user cannot enumerate Cognito resources. Vercel Preview has no Cognito variables.

## TLS warning disposition

The prior protected-preview build reported a missing
`./us-east-1-bundle.pem`. Vercel Preview lacked the explicit secure settings used
in Production. Preview-only variables were added:

- `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt`
- `NODE_TLS_REJECT_UNAUTHORIZED=1`

TLS verification was not weakened. A fresh protected-preview build is required
to close the warning with log evidence.

The fresh protected-preview deployment
`dpl_5Qn9b37WnTXAAMLQWBo7CNRyF1Pk` completed successfully from checkpoint
`321f87c`. Its build log did not report the missing
`./us-east-1-bundle.pem` warning or a disabled-TLS warning. Vercel reports the
deployment as `READY`, `target: null`, and `public: false`. An anonymous request
returned HTTP 302 to Vercel SSO with `noindex` and HSTS headers. No public alias
was created. The remaining build warning concerns the broad Node.js engine
range and is unrelated to certificate verification.

## Approval gate

Phase 2 is blocked before migration. The owner must either approve creation of a
separate paid managed preview database or designate an existing isolated
resource accessible to the project administrator. No production change is
requested or authorized.
