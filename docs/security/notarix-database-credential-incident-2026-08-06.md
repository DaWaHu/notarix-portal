# Notarix Signings Production Database Credential Incident — Aug 6 2026

Status: credential containment complete; owner closure review pending; Preview work paused

## Detection

- Detected: approximately Aug 6 2026 at 11:40 AM ET.
- Exposure mechanism: while attempting an authorized value-preserving Vercel
  environment-scope edit, Vercel's edit form automatically rendered the complete
  existing Production `DATABASE_URL` in the browser DOM without a reveal or copy
  action. Browser control was stopped immediately and the form was cancelled
  without saving.
- Secret values and connection strings are intentionally excluded from this
  record.
- Potentially affected systems: the Production AWS RDS PostgreSQL login named by
  the RDS instance's master-user metadata, Vercel Production, and Preview and
  Development environments that inherit the all-environments variable.
- Exposure window: approximately Aug 6 2026 at 11:40 AM ET through successful
  immediate RDS password reset at Aug 6 2026, 12:04 PM ET. Vercel scope repair
  and replacement Production deployment completed later the same day.
- Actions prohibited after detection: use or retest the old credential; continue
  Preview binding; migrations; identity-provider work; Production source changes;
  disclosure or preservation of the credential.

## Pre-rotation identifiers

- Repository branch: `codex/notarix-portal-checkpoint`
- Repository HEAD: `df2322e83aed98d631aac495e7580f9b23f2fddd`
- Repository status at detection: clean and synchronized with origin
- Vercel project: `notarix-portal`
- Vercel project ID: `prj_CsXZ0PzV6Ekdv2AjzniVcIxdnbt2`
- Active Production source revision: `47b807f`
- Current visible Production deployment: `5wjupjmcHyzoL2ehXuPUmzkV3ymh`
- Production domains: `notarix.live`; `www.notarix.live` redirects with 308;
  `notarix-portal.vercel.app` is valid Production configuration
- Vercel variable: `DATABASE_URL`, currently one All Environments record;
  Production, Preview, and Development inherit it
- AWS account: DaWaHu Collective, L.L.C. (`987081394982`)
- AWS region/AZ: `us-east-1` / `us-east-1a`
- RDS instance: `notary-portal-db`; resource ID
  `db-N3OB3FEI3KBCUXHBKDGE5EEAM4`
- Engine: Amazon RDS for PostgreSQL 17.9
- Endpoint identifier: `notary-portal-db` in `us-east-1.rds.amazonaws.com`;
  database `postgres`
- Affected master username: `notaryadmin`; this matches the username identified
  in the exposed Vercel connection metadata without reopening the variable
- Password management: manually managed RDS master password (Path B); no managed
  Secrets Manager ARN/status is present in RDS configuration, and IAM database
  authentication is disabled
- Existing network finding: security group `sg-02311929d683f8259` includes
  inbound `0.0.0.0/0`; remediation is outside this credential-only operation
- Approximate exposure timestamp: recorded above; Vercel/AWS audit timestamps
  will provide the authoritative incident timeline

## Immediate containment

- Vercel edit was cancelled without saving.
- No Preview runtime credential was generated.
- No Neon password, migration, deployment, database object, application record,
  DNS entry, or Production source changed.
- Neon Preview work is paused.
- The old Production database credential is considered compromised and must not
  be restored or reused.

## Remediation checklist

- [x] Identify RDS resource and credential-management path without retrieving a secret.
- [x] Rotate and invalidate the old Production database password.
- [x] Owner privately installs a replacement Production-only sensitive
      `DATABASE_URL` in Vercel.
- [x] Verify Preview and Development have no `DATABASE_URL`.
- [x] Redeploy the currently active Production source revision.
- [x] Validate the Production deployment and public domain without exercising
      customer, payment, document, identity, W-9, or banking workflows.
- [x] Review available Vercel, CloudTrail, RDS, and CloudWatch evidence.
- [x] Record whether available logging can or cannot prove absence of misuse.
- [x] Complete documentation and keep Preview work paused.

## Rotation and Vercel remediation

- Owner completed the replacement password entry privately. Codex did not view,
  enter, retrieve, copy, log, or transmit either the old or replacement secret.
- CloudTrail event `7a0a1d4e-799f-4dc9-876e-bff7cb8874f3` records an
  MFA-authenticated root `ModifyDBInstance` for `notary-portal-db` at Aug 6 2026,
  12:04:12 PM ET, with `applyImmediately=true` and no error. AWS redacted the
  password in the event record. RDS event history records `Reset master
  credentials` at 12:04 PM ET.
- A preceding password attempt at 12:02:55 PM ET failed with
  `InvalidParameterValueException`; it did not change the credential. The
  successful 12:04 event is the authoritative invalidation point.
- Final Vercel metadata shows exactly one `DATABASE_URL`, marked `Sensitive` and
  scoped to Production. Preview and Development have no `DATABASE_URL`, no
  branch-specific Production database variable was visible, and
  `DATABASE_MIGRATION_URL` is absent.
- Vercel Production deployment `ZJtCwJb1bJ9jCe8tDKG67ofhDK19` is `READY`, uses
  unchanged source commit `47b807f` on `codex/notarix-portal-checkpoint`, and is
  current for `notarix.live`. No application source, branch, DNS, Preview alias,
  or migration changed.
- `https://notarix.live/` loaded the Notarix Signings Portal after remediation.
  This safe public check proves the deployment and domain were operational; it
  does not independently prove a successful database query because the public
  route does not require one.

## Vercel activity review

The visible Aug 6 activity history contains the expected project-owner/Codex
sequence only:

- all-environment `DATABASE_URL` views and edits associated with detection and
  initial replacement entry;
- two Production deployments from approved commit `47b807f`;
- Production alias assignment to the replacement deployments; and
- the final Production-only `DATABASE_URL` edit.

No unexpected Vercel actor, team/project access change, branch deployment, or
unrelated environment-variable mutation was visible during the incident window.
The activity record also confirms the variable was viewed while it still applied
to Production, Preview, and Development; this is the exposure mechanism already
contained by rotation and scope repair.

## AWS, RDS, and log review

- CloudTrail Event History was reviewed in `us-east-1`. During the incident
  window it showed the expected MFA-authenticated root console session,
  CloudShell session-management events, the failed password-change request, and
  the successful `ModifyDBInstance`. No security-group, IAM, Secrets Manager,
  Cognito, database deletion, snapshot, or unrelated RDS write event was visible
  in the window.
- RDS remained `Available` after rotation. The reviewed configuration shows
  PostgreSQL, database `postgres`, master username `notaryadmin`, IAM database
  authentication disabled, and no attached IAM role.
- No CloudWatch alarm is configured for the instance, and no existing exported
  CloudWatch database log group was available in the reviewed RDS console. No
  new logging, alarm, parameter-group, or retention setting was enabled during
  evidence preservation.
- Existing PostgreSQL error logs from the exposure window contained routine
  checkpoints plus unsolicited failed probes. At 12:02:38 PM ET, source
  `64.89.163.83` attempted password authentication as user `postgres` and failed;
  a second unencrypted attempt was rejected by `pg_hba.conf`. Later external
  addresses sent malformed PostgreSQL startup packets and a `test@test`
  unencrypted attempt, all rejected.
- The RDS security group still permits inbound PostgreSQL reachability from
  `0.0.0.0/0`. No networking change was authorized or performed during this
  incident.
- No successful unauthorized login appears in the reviewed error logs. However,
  those logs do not provide affirmative successful-connection attribution, and
  CloudTrail management history does not record PostgreSQL data-plane logins.
  Therefore the available evidence is **insufficient to prove that the exposed
  credential was never used**. The correct conclusion is that no misuse was
  identified, not that misuse was disproven.

## Closure determination

Credential containment is complete: the old password is invalid, the replacement
value is Production-only and sensitive in Vercel, the approved Production source
was redeployed, and the public Production portal is operational. Preview remains
fail-closed with no `DATABASE_URL` and all Phase 2 Preview work remains paused.

The project owner must review and accept this closure record. Closure does not
accept the public-ingress or logging risks for unrestricted production use.

## Repository verification

- ESLint completed with zero errors and 199 pre-existing warnings.
- TypeScript completed successfully.
- Source-contract tests passed 7/7; database-contract tests passed 6/6.
- The normal Turbopack build could not create its internal local process/port in
  the restricted execution environment. The equivalent Next.js production build
  using webpack completed successfully and generated all routes.
- Documentation diff and sensitive-pattern checks passed; no credential,
  connection string, access key, or private key was added.
- `npm audit --audit-level=high` reported one high-severity `js-yaml` advisory
  (`GHSA-5p4m-2wfm-xmqj`). Dependency changes were outside this
  documentation-only closure and remain separately approval-gated.

## Remaining risks

- **Critical network exposure:** RDS security group `sg-02311929d683f8259`
  retains inbound `0.0.0.0/0`. Replace this with an approved restricted network
  path before full production authorization.
- **Audit gap:** successful PostgreSQL connection attribution was not available
  in the reviewed logs. Design and approve connection/audit logging, retention,
  alerting, and privacy controls before relying on logs for misuse exclusion.
- **Root-user operations:** the incident response used the AWS root principal
  with MFA. Establish named least-privilege administrative roles and break-glass
  procedures.
- **Dependency advisory:** remediate and verify the high-severity `js-yaml`
  advisory before the next release approval.
- Preview database binding, migration 0001, Cognito, Google Workspace, and all
  later Phase 2 work remain paused pending a new owner instruction.
