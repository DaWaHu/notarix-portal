# Notarix Signings Phase B Track F — Operational Security Design

Status: repository-only design; no AWS, Vercel, database, credential, logging,
backup, deployment, or Production change performed

## Executive decision package

Track F establishes the evidence and operational controls required to operate
Notarix Signings safely. It does not authorize implementation. The current
Production deficiencies—shared/root-centered administration, incomplete
successful PostgreSQL connection attribution, no certified immutable audit,
and no measured restore exercise—remain open until separately approved work is
implemented and verified.

The normative machine-readable design is
`infrastructure/phase-b-operational-security/operational-security-manifest.yaml`.

## 1. Named AWS administration

Use AWS IAM Identity Center with one named identity per administrator. Human
access must use short-lived federated sessions and MFA; shared IAM users and
standing access keys are prohibited. Root is a monitored break-glass identity,
not an operating account. Define separate read-only operations, database
operator, and security administrator permission sets. Production write access
must be time-limited, approval-gated, and attributable.

Quarterly access review must reconcile identities, permission sets, MFA state,
last use, and business owner. Departed or inactive identities are removed
immediately. Workloads use service-specific IAM roles; they never borrow a
human identity or database administrator credential.

## 2. CloudWatch and CloudTrail logging

Send API access logs, structured Lambda logs, RDS PostgreSQL logs, and relevant
CloudTrail events to environment-separated encrypted destinations. Production
retention is proposed at 365 days and Preview at 30 days, pending legal and cost
approval. CloudTrail should be multi-Region, include management read/write
events, and use log-file validation and a dedicated security bucket.

Logs must exclude authorization headers, cookies, tokens, secrets, database
connection strings, request/response bodies, identity documents, W-9 data,
banking data, and notarial evidence. Test redaction with synthetic canaries
before enabling a source. Log access and configuration changes are themselves
auditable.

## 3. Successful database connection attribution

TLS and credential rejection do not establish who successfully connected.
Subject to a separate parameter-group approval, export PostgreSQL connection
and disconnection events to CloudWatch. The proposed configuration records UTC
time, process, database role, database, application name, remote host, and a
session identifier, while keeping `log_statement=none` to avoid SQL/data
disclosure. Every application and migration client must set an approved,
environment-specific `application_name`.

Correlate the database session with API correlation ID, Cognito subject, Lambda
request ID, and immutable application audit event. A source IP identifies a
network origin—not a human—and must never be presented as complete attribution.
Before Production use, test expected runtime, migration, and administrative
connections plus unexpected application names and roles.

## 4. Authentication-failure and control-plane alerts

Create metric filters for PostgreSQL authentication failures, using proposed
thresholds of five failures in five minutes and 20 in 15 minutes. Tune them
with synthetic Preview tests to avoid both noise and blind spots. Add anomaly
alerts for successful connections by unexpected role, database, application
name, source class, or administrative time window.

CloudTrail/EventBridge controls must alert on world-open database ingress,
RDS public-access changes, credential or secret operations, CloudTrail disable
or deletion, log/KMS changes, and backup-retention reductions. Notifications
contain redacted identifiers and links to controlled evidence, never secrets.

## 5. Append-only audit architecture

Every material Order, identity, role, approval, document, payment, notary, and
configuration action writes a normalized audit event in the same transaction
as its business mutation. Runtime audit writers receive INSERT only—never
UPDATE, DELETE, TRUNCATE, ALTER, or DROP. Events contain actor subject and role,
session, action, resource, Order identifier where applicable, correlation ID,
outcome, UTC timestamp, and before/after hashes rather than sensitive payloads.

Database append-only controls are necessary but not sufficient because a
database administrator can alter the database. Export audit events to a
separately controlled, versioned, encrypted S3 security bucket with Object Lock
mode chosen by the owner. Use chained or batched digests plus daily manifests.
Automated checks alert on sequence gaps, digest mismatch, export lag, and audit
DDL. Quarterly verification must prove both denied mutations and independent
integrity validation.

## 6. Backup and isolated restore

Production requires encrypted automated backups, point-in-time recovery,
deletion protection, and an approval-gated final snapshot before destructive
changes. Proposed retention is 35 days for Production and seven days for
Preview, subject to privacy, legal, and cost decisions.

A backup is not accepted as recoverable until restored. Quarterly and before
unrestricted launch, restore an approved recovery point into an isolated
non-production resource with no Production application attachment, no external
notifications, and no Production credential. Restrict any real restored data
to specifically approved personnel. Validate restore time, recovery-point age,
schema/migration journal, sampled integrity, safe readiness, and audit chain.
Retain redacted evidence, then destroy the drill resource only through a
separate approved cleanup action.

## 7. Proposed RTO and RPO

These are proposals, not commitments:

| Operating stage | Proposed RPO | Proposed RTO |
| --- | ---: | ---: |
| Protected Preview | 24 hours | 8 hours |
| Controlled pilot | 15 minutes | 4 hours |
| Unrestricted Production | 5 minutes | 2 hours |

The owner must approve objectives after reviewing operational staffing,
provider dependencies, data-loss tolerance, and cost. A measured restore must
meet the applicable objectives before progression to that stage.

## 8. Incident response

Use SEV-1 through SEV-4 classification and the phases detect, preserve,
contain, eradicate, recover, and review. Evidence timestamps use UTC. Incident
records contain redacted identifiers, never credentials or sensitive payloads.

For credential exposure, prohibit further secret retrieval, rotate through an
owner-controlled interface, repair environment scope, redeploy only the
approved artifact, and validate invalidation without intentionally preserving
or reusing the old credential. For database incidents, preserve CloudTrail,
RDS, network, and application evidence before containment; use an isolated
restore for investigation. Production writes, failover, log changes, and
evidence deletion remain separately owner-gated.

Conduct a quarterly tabletop and a technical prelaunch exercise. Record gaps,
owners, deadlines, communications, recovery evidence, and residual risk.

## Acceptance gates

Track F is operationally complete only when all of the following have evidence:

1. Named identities, MFA, permission sets, root controls, and access review.
2. Synthetic redaction tests for every enabled log source.
3. Successful and failed PostgreSQL session attribution.
4. Tested authentication and control-plane alert delivery.
5. Denial of audit mutation plus independent integrity verification.
6. An isolated restore that meets owner-approved RTO and RPO.
7. A completed incident tabletop and technical drill.

None of these gates is satisfied merely by merging this design.

## Separately approval-gated implementation decisions

- IAM Identity Center organization and permission-set ownership.
- CloudWatch retention, KMS keys, destinations, alarms, and notification route.
- RDS custom parameter group and PostgreSQL log export.
- Audit export pipeline, S3 Object Lock mode/retention, and cross-account model.
- Backup retention, recovery objectives, restore environment, and deletion.
- On-call ownership, escalation contacts, and external notification policy.

Production remains unchanged until each relevant change is reviewed and
explicitly authorized.
