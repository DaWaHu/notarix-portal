# Notarix Signings Phase 2 Identity Environment Matrix

Date: Aug 5 2026

Owner authorization: Phase 2 preview-only identity and authorization work.

Status: **isolated Neon candidate discovered; target safety not yet proven;
migration and identity activation blocked**.

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

## Read-only Neon reconciliation — Aug 5 2026

Repository and local-configuration searches found no Neon hostname, Neon token,
Neon CLI profile, Neon-specific environment variable, or prior Neon decision
record. The package lock mentions `@neondatabase/serverless` only as an optional
peer dependency; the application does not install or import it and uses the
standard `postgres` driver.

Vercel Marketplace account inventory established the following without reading
or changing a secret:

| Attribute | Read-only evidence |
| --- | --- |
| Integration | Neon Marketplace integration installed Jul 19 2026 |
| Installation ownership | Notarix Vercel team; installation ID retained only in Vercel |
| Plan | `free_v3`; Free; no payment method required; $0 current minimum |
| Resource | `notarix-portal-preview`; Vercel resource ID redacted from documentation |
| Resource state | `available`; `owned` |
| Connected projects | None; the Notarix project reports no connected integration resources |
| Existing Preview variables | No `NEON_*`, `PG*`, `POSTGRES_*`, or Neon-specific URL variable; current `DATABASE_URL` remains the AWS RDS value |
| Administrative access | Vercel account can list and inspect the owned resource; database-console and SQL privileges are not yet proven |
| Project/branch/database/region | Not exposed by the available read-only Vercel metadata; unverified |
| Contents and migration journal | Unverified because this reconciliation prohibited database connections |

The Neon resource is physically/provider-separate from AWS RDS at the resource
control-plane level and is not attached to any Vercel project. This is strong
candidate-isolation evidence, but it is not yet sufficient to approve migration:
the database endpoint, project, branch, database, region, role, contents,
migration history, TLS mode, and privileges remain unverified.

### Candidate cost and capacity

The installed plan reports $0, 0.5 GB storage per project, up to 2 compute units
(8 GB RAM), and 100 CU-hours per project. Neon currently advertises its Free
plan at $0 with automatic scale-to-zero; its Launch plan has no fixed monthly
minimum and charges usage (currently $0.106/CU-hour and $0.35/GB-month). Free
plan point-in-time restore history is six hours. These limits are adequate for a
low-volume synthetic Preview if the migration fits within 0.5 GB.

Sources: [Neon pricing](https://neon.com/pricing),
[Neon scale to zero](https://neon.com/docs/introduction/scale-to-zero), and
[Neon Postgres compatibility](https://neon.com/docs/reference/compatibility).

### Proposed Preview-only variable mapping — not applied

| Vercel environment | Variable | Proposed source | Production action |
| --- | --- | --- | --- |
| Preview only | `DATABASE_URL` | Neon pooled, TLS-verified connection generated for the isolated branch and least-privilege Preview role | None; retain AWS RDS value |
| Preview only, migration runner only | `DATABASE_URL_UNPOOLED` | Neon direct TLS-verified connection for controlled DDL | Do not define |

The application requires only `DATABASE_URL`. Do not map Neon `PG*`,
`POSTGRES_*`, authentication, or public-client variables unless a later reviewed
implementation requires them. Connecting the Vercel integration must be scoped
explicitly to Preview and must not overwrite Production, Development, or local
configuration.

### Proposed bidirectional-isolation verification — not executed

1. Inspect Neon Console metadata through the existing owned integration and
   record redacted project ID, branch ID, database, region, Postgres version,
   owner, plan, restore window, and role.
2. Compare redacted endpoint/provider and SHA-256 fingerprints with Production;
   require a Neon endpoint and a nonmatching resource, host, database, and role.
3. Using the Neon credential only, connect to the Neon target and verify current
   database/user, TLS, server version, schemas, tables, journal, extensions,
   approximate size, and absence of non-synthetic records.
4. Prove the Neon credential cannot authenticate to the AWS RDS endpoint.
5. Prove the production RDS credential cannot authenticate to the Neon endpoint.
6. Confirm Preview-only Vercel scope after owner approval without changing the
   Production value; pull both scopes and compare only redacted metadata and
   in-memory fingerprints.
7. Take or verify a restore point, then obtain owner approval before migration.

No connection, attachment, variable change, or SQL was performed during this
reconciliation.

## Database option decision memo

| Consideration | Existing/separate Neon Preview | Separate AWS RDS PostgreSQL Preview |
| --- | --- | --- |
| Estimated monthly minimum | Existing Free resource: $0. Launch remains usage-based with no fixed minimum; intermittent 1 GB workload is typically about $15/month | Approximately $14–$18/month for single-AZ `db.t4g.micro`, 20 GB gp3, ordinary backup, and very low transfer in `us-east-1`; public IPv4, NAT, excess backup, monitoring, and transfer can increase cost |
| Compute | Free: up to 2 CU, 100 CU-hours/project; Launch $0.106/CU-hour | Continuously billed instance hours while running; estimate assumes about $0.016/hour and 730 hours |
| Storage/backups | Free: 0.5 GB/project and six-hour restore history; Launch $0.35/GB-month with seven-day history | Minimum 20 GB general-purpose SSD; automated backup storage up to allocated DB storage is generally included, with excess/snapshots charged |
| Networking/transfer | Managed public TLS endpoint; normal egress allowances/charges by plan | VPC/security-group administration; possible public IPv4 or NAT cost; regional/cross-region and internet transfer charges may apply |
| Suspend/scale to zero | Yes; Free suspends after inactivity and cannot disable scale-to-zero | No true scale-to-zero; may stop temporarily but AWS restarts after seven days; storage and backups remain billable |
| Operational complexity | Low; already owned in Vercel, standard Postgres endpoint, simple Preview-only binding | Higher; IAM, VPC/subnets, security groups, parameter groups, backups, monitoring, credentials, patching, and Vercel reachability |
| Security/isolation | Separate provider/resource and credentials; must verify branch/database/role and prevent accidental Production scoping | Strong AWS account/VPC consistency and separate resource boundary; larger IAM/network control surface |
| Migration compatibility | Static review finds only standard tables, foreign keys, `timestamptz`, btree indexes, and booleans; compatible with supported Neon PostgreSQL 14–17, subject to live version/privilege verification | Native PostgreSQL compatibility; same provider family as Production |
| Recommendation | **Preferred for protected, low-volume synthetic Preview**, subject to completing the verification procedure and owner approval to connect it to Preview only | Use if organizational policy requires AWS-only hosting, private networking, longer native backup controls, or Neon verification fails |

AWS assumptions and stop limitations are based on
[AWS RDS pricing](https://aws.amazon.com/rds/pricing/) and
[AWS RDS temporary-stop behavior](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_StopInstance.html).
The AWS figure is a planning estimate, not a quote; the AWS Pricing Calculator
must be run with the final network and retention design before authorization.

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

### Path A — reconcile the existing isolated Neon candidate

Complete the proposed verification procedure for `notarix-portal-preview`. Do
not attach it or expose credentials until the owner approves the proposed
Preview-only mapping after reviewing this reconciliation.

### Path B — new isolated managed preview database

Create a separate managed Postgres instance/cluster with distinct network,
credentials, database, backups, migration history, and synthetic data. This is
the preferred security posture but likely creates a paid resource. Owner approval
is required before creation.

### Path C — designate another existing isolated database

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

Phase 2 is blocked before migration. The recommended next gate is owner approval
for read-only administrative inspection of the existing owned Neon candidate's
provider metadata and, only afterward, a separately approved Preview-only
connection/isolation test. A new paid database is not currently recommended.
No production change is requested or authorized.
