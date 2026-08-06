# Notarix Signings Production Database Architecture Cost Review — Aug 6 2026

Status: read-only, design-only review; no configuration, purchase, source, database, or deployment change performed

## Executive recommendation

Do **not** approve the `$100/month` Vercel Static IP add-on yet. It is a valid,
low-engineering interim control, but it leaves RDS public, does not provide
same-project Preview network isolation, and costs about `$120/month` before
usage and tax when the required Pro plan is included.

The best pre-launch architecture for Notarix is a **Vercel Pro frontend plus a
narrow AWS HTTP API/Lambda database service**, with Lambda attached to private
application subnets and RDS moved to private database subnets. Vercel never
receives a PostgreSQL credential and cannot open a PostgreSQL socket. API
Gateway remains a public HTTPS entry point but rejects unauthenticated calls.
Use Cognito JWT authorization for user-context requests and Vercel OIDC to AWS
with short-lived, Production-bound credentials for server-to-server calls.

This design has Medium–Large one-time engineering cost because the current
repository makes direct Drizzle calls from seven persistence modules at roughly
thirty call sites. At low volume, however, the estimated recurring increment is
about **$21–$40/month including Vercel Pro**, rather than `$120+`. The range
depends mainly on logging, secret-access design, request volume, and whether
RDS Proxy is later justified. The API/Lambda design also permits RDS to become
non-public and gives stronger Preview/Production separation.

For substantial growth, keep the API boundary and add RDS Proxy, asynchronous
workflows, and purpose-specific AWS services as measured load requires. If the
entire product becomes AWS-centric, a controlled full migration to an AWS-hosted
frontend/backend can then be evaluated without changing the database contract
again.

## Current architecture and problem

Production Next.js Functions run in Vercel `iad1` and connect directly over TLS
to public RDS PostgreSQL `notary-portal-db`. Security group
`sg-02311929d683f8259` permits TCP 5432 from `0.0.0.0/0`; the RDS endpoint is
publicly accessible. The database still authenticates callers and enforces TLS,
but every IPv4 source can reach the authentication boundary.

Vercel Hobby Functions have dynamic public egress, so there is no safe exact
source allowlist. Dynamic-address allowlisting would be incomplete, unstable,
and operationally unsafe. RDS Proxy alone does not help because it is private to
the VPC and Vercel Hobby has no path to it.

The current Vercel Hobby plan also is not an acceptable long-term commercial
Production basis: Vercel describes Hobby as free, personal, and restricted to
non-commercial use. A supported Vercel Production choice therefore includes Pro
even if database access moves into AWS.

The existing `174.106.104.109/32` ingress rule remains **UNVERIFIED**. It has no
description, attributable recent CloudTrail creation event, or project record.
No read-only evidence proves an owner administrative purpose. Do not delete it
during this review; remove it later unless ownership and necessity are proven
and a safe administration design exists.

## Cost assumptions

These are planning estimates, not quotes. `us-east-1`, one Production
environment, existing RDS cost excluded, 730 hours/month, and small payloads are
assumed.

- **Very low traffic:** 100,000 dynamic/API requests per month, short 512 MB
  Lambda executions, under 5 GB outward transfer.
- **Moderate traffic:** 5 million requests per month, short 512 MB executions,
  about 50 GB outward transfer.
- Existing RDS instance, backups, and domain charges are common costs and are
  excluded unless an option changes them.
- CloudWatch estimates assume restrained structured logs without request bodies,
  credentials, customer documents, or SQL statement text.
- High availability means at least two private subnets/AZs where the service
  requires them. Cross-AZ and data-transfer charges remain usage-dependent.

Published price anchors:

- Vercel Pro is `$20/month` for the current single deploying seat, with a `$20`
  usage credit; Static IPs add `$100/project/month` plus transfer.
- API Gateway HTTP APIs begin at `$1.00/million` requests in the published US
  example; data transfer is additional.
- Lambda includes 1 million requests and 400,000 GB-seconds monthly, then charges
  for requests and duration.
- Secrets Manager is `$0.40/secret/month` plus `$0.05/10,000` API calls.
- PrivateLink interface endpoints are about `$0.01/endpoint-ENI/hour` in
  `us-east-1`, or approximately `$14.60/month` for one service in two AZs before
  data processing.
- App Runner idle memory is `$0.007/GB-hour`; active compute is
  `$0.064/vCPU-hour` plus memory. AWS's lightweight API example is `$25.50/month`.
- Fargate charges per requested vCPU and memory while tasks run; an always-on
  0.25-vCPU/0.5-GB x86 task is approximately `$9/month` compute before load
  balancing, public IP/NAT/endpoints, logs, and redundancy.
- RDS Proxy is priced per underlying database vCPU-hour. Its exact live regional
  price and the instance vCPU count must be confirmed in AWS Calculator before
  approval; it is optional here, not included in the low-volume minimum.

Official sources: [Vercel Hobby](https://vercel.com/docs/plans/hobby),
[Vercel Pro](https://vercel.com/docs/plans/pro-plan),
[Vercel OIDC](https://vercel.com/docs/oidc/reference),
[API Gateway pricing](https://aws.amazon.com/api-gateway/pricing/),
[Lambda pricing](https://aws.amazon.com/lambda/pricing/),
[Secrets Manager pricing](https://aws.amazon.com/secrets-manager/pricing/),
[PrivateLink pricing](https://aws.amazon.com/privatelink/pricing/),
[App Runner pricing](https://aws.amazon.com/apprunner/pricing/),
[Fargate pricing](https://aws.amazon.com/fargate/pricing/), and
[RDS Proxy pricing](https://aws.amazon.com/rds/proxy/pricing/).

## Monthly cost comparison

| Option | Fixed minimum | Very low traffic estimate | Moderate traffic estimate | Paid plans/resources | Cost character |
| --- | ---: | ---: | ---: | --- | --- |
| 1. Current Vercel Hobby/direct RDS | `$0` incremental | `$0` | `$0` | Existing RDS; Hobby | **Not viable**: cannot safely remove world ingress; Hobby is not a supported commercial Production plan |
| 2. Vercel Pro + Static IPs | `$120` | `$120–$125` | `$125–$145+` | Pro, Static IP add-on, transfer, existing RDS | Published fixed price plus usage/tax |
| 3. Vercel Pro + HTTP API/Lambda + private RDS | About `$20` plus logging/secret access | **`$21–$40`** | **`$30–$65`** | Pro, API Gateway, Lambda, CloudWatch, Secrets Manager; optional interface endpoint or Proxy | Estimate; serverless usage scales from near zero |
| 4A. Vercel Pro + AWS App Runner DB backend | About `$30–$46` | `$35–$60` | `$50–$100` | Pro, App Runner, API auth/front door as designed, logs, secret/network access | Estimate; warm baseline plus active compute |
| 4B. Vercel Pro + ECS/Fargate DB backend | About `$60–$100` for resilient service | `$65–$120` | `$90–$180` | Pro, ECS/Fargate, usually ALB, two tasks, logs, secret/network access | Estimate; always-on compute and load-balancer baseline |
| 5A. Full AWS serverless application | No Vercel fee; service usage only | `$5–$35` | `$25–$90` | CloudFront/hosting, API Gateway/Lambda, logs, secrets, deployment tooling | Estimate; lowest baseline but **Large** Next.js migration/compatibility work |
| 5B. Full AWS App Runner application | About `$10–$30` before network services | `$20–$55` | `$40–$110` | App Runner, build/ECR, logs, secret/network access, DNS/certificate | Estimate; simpler container migration, warm baseline |
| 6. Separate static web frontend + AWS API/Lambda | Near `$1–$20` | `$3–$30` | `$20–$70` | S3/CloudFront or Amplify static hosting, API/Lambda, logs/secrets | Viable only after converting all SSR/server routes; Large engineering effort |

The API/Lambda range is intentionally conservative. A VPC Lambda can connect
directly to private RDS without NAT. API Gateway can invoke it without Lambda
having Internet access. If the Lambda must retrieve Secrets Manager values from
inside isolated subnets, use an approved interface endpoint (about `$14.60/month`
for two endpoint ENIs) or an alternative reviewed secret-delivery design; do not
add a NAT Gateway merely for one secret. S3 gateway endpoints have no hourly
charge. RDS Proxy may later consolidate connections and enable stronger IAM-based
patterns, but it adds a vCPU-linked baseline and is unnecessary at very low,
controlled concurrency.

## Option analysis

### 1. Current Vercel Hobby

No supported safe design eliminates `0.0.0.0/0` while direct Hobby Functions
remain the database clients. Their egress addresses are dynamic; RDS requires a
stable network source, private path, or intermediary. DNS names cannot be SG
sources, and RDS Proxy has no public path. Keeping a rotating address list or
residential `/32` would be unsafe and is rejected.

Effort is Small only because it makes no change; security outcome fails. It
also retains a commercial-use plan mismatch. Expected downtime is none because
nothing improves.

### 2. Vercel Pro plus Static IPs

This is the least-code-change solution. Functions retain direct Drizzle access,
assigned `iad1` egress sources are allowlisted, and `0.0.0.0/0` can be removed
after live proof. RDS remains public. The same project-level facility may be
shared by Preview Functions, so missing Preview credentials and runtime target
contracts remain critical controls. Implementation is Small–Medium, operations
are Low–Medium, and staged cutover should have no application downtime.

It is justified as an emergency or short-duration bridge when launch timing is
more valuable than roughly `$100/month` savings. It is not the best value before
initial unrestricted production because the portal already requires substantial
identity and data-layer work.

### 3. API Gateway and Lambda database service

Architecture:

`Vercel Pro -> authenticated HTTPS API -> API Gateway -> VPC Lambda -> private RDS`

RDS moves to private subnets and becomes non-public. Its SG permits 5432 only
from the Lambda SG. API Gateway normally remains public HTTPS; authorization,
WAF/rate controls where justified, route-level policies, and request validation
become the public boundary. Do not place SQL or generic query execution behind
the API. Publish narrow business operations with explicit schemas and RBAC.

Authentication should use Cognito access tokens/JWT authorizers for signed-in
user-context operations. For trusted server-only calls, Vercel OIDC—available on
all plans—can exchange deployment identity for short-lived AWS credentials bound
to the exact team, project, environment, and branch; those credentials invoke
only approved API routes. Do not introduce a long-lived shared API key as the
primary control.

Direct Lambda-to-RDS connections are acceptable initially with strict reserved
concurrency, one connection per invocation/request unit, short timeouts, and
least-privilege runtime roles. Add RDS Proxy only after concurrency/load tests
show connection pressure or IAM database authentication/resilience benefits
justify its baseline. AWS documents both direct Lambda/RDS connectivity and the
optional Proxy path.

Application impact is Medium–Large:

- seven persistence modules currently open databases (`db/index.ts`, four root
  repositories, `app/staff/command-center/store.ts`, and
  `app/staff/requests/store.ts`), with roughly thirty call sites;
- those calls should move behind typed business-service clients, not one generic
  database endpoint;
- Next.js pages/routes remain on Vercel but call the AWS service;
- Drizzle schemas and queries move into a Lambda package and can largely be
  reused after separating transport/domain contracts;
- callback handlers require idempotency and signed-provider validation at the
  new boundary;
- Cognito becomes easier to enforce centrally at API Gateway/Lambda;
- S3, SES, SNS, audit logging, and RDS are easier to integrate through IAM;
- contract, authorization, denial, idempotency, integration, load, failure, and
  migration tests are required.

Migration should be vertical: implement one bounded repository domain, dual-run
read-only comparison where safe, then cut over domain by domain. Do not create a
distributed dual-write design. Expected planned downtime is none for parallel
reads and brief maintenance only for final RDS private-network transition.

### 4. AWS-hosted database-facing backend

Lambda is the best fit for bursty early-stage traffic. App Runner is reasonable
when a long-running Node service, stable low latency, or container portability is
more important than baseline cost. Its VPC connector can reach private RDS, but
outbound AWS/public service dependencies need explicit endpoints/NAT design.

ECS/Fargate provides the most control and predictable connection pooling, but a
production service normally needs at least two tasks and an ALB, creating more
baseline cost and patch/deployment operations than current traffic justifies.
It becomes attractive only when sustained workloads or background processing
outgrow Lambda.

All backend variants require approximately the same business-API refactor as
Option 3. App Runner/Fargate add container builds, image scanning, service/load
balancing, autoscaling, health checks, and capacity operations. Cognito/S3/SES
integration becomes easier through IAM, but engineering is Medium–Large and
current-stage benefit does not outweigh Lambda's lower idle cost.

### 5. Move the complete application to AWS

A complete move can eliminate Vercel-to-AWS trust and consolidate Cognito, S3,
SES, SNS, RDS, CloudWatch, IAM, and deployment evidence. It does not
automatically make operations simpler: current Next.js SSR, route handlers,
middleware, build behavior, image/static delivery, deployment protection,
domains, certificates, rollback, previews, and observability all need a new
supported runtime contract.

A containerized App Runner migration is technically more direct than decomposing
the full application into Lambda functions, but VPC egress and warm-capacity
costs remain. A fully serverless AWS deployment can be inexpensive at low volume
but depends on adapter/framework compatibility and has the largest test surface.
Estimate Large engineering effort and defer it unless the product deliberately
standardizes on AWS or Vercel Pro plus the API boundary becomes operationally
awkward.

### 6. Lower-cost static frontend plus AWS API

If all interactive server behavior is moved to the AWS API and the remaining
frontend can be statically generated, S3/CloudFront or another supported AWS
static-hosting service can replace Vercel at very low baseline cost. This gives
strong database isolation and avoids a Vercel fee, but the current application
contains many Next.js server pages and route handlers. Converting them is a
Large redesign, not a quick cost optimization. It is a future extension of
Option 3, not the immediate first step.

Unsupported tunnels, residential IPs, dynamic allowlists, and obscurity-based
controls are excluded.

## Security and operational scoring

Scores are 1 (poor) through 5 (best). For complexity and maintenance, 5 means
least burdensome; for cost efficiency, 5 means best value at current volume.

| Option | Network isolation | Credential isolation | Preview isolation | Attack surface | Auditability | Least privilege | Resilience | Low complexity | Low maintenance | Cost efficiency |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1. Hobby/direct RDS | 1 | 2 | 3 | 1 | 2 | 2 | 2 | 5 | 4 | 1 |
| 2. Pro + Static IPs | 3 | 3 | 2 | 3 | 3 | 3 | 4 | 5 | 4 | 2 |
| 3. Pro + API/Lambda | 5 | 5 | 5 | 4 | 5 | 5 | 4 | 3 | 3 | 5 |
| 4A. Pro + App Runner backend | 5 | 5 | 5 | 4 | 5 | 5 | 4 | 2 | 2 | 3 |
| 4B. Pro + Fargate backend | 5 | 5 | 5 | 4 | 5 | 5 | 5 | 1 | 1 | 2 |
| 5. Full AWS application | 5 | 5 | 5 | 4 | 5 | 5 | 4 | 1 | 2 | 4 |
| 6. Static AWS frontend + API | 5 | 5 | 5 | 4 | 5 | 5 | 4 | 1 | 3 | 5 |

Score rationale:

- **Option 1:** world-reachable PostgreSQL and plan mismatch dominate; absent
  Preview credentials help but do not create a network boundary.
- **Option 2:** exact sources reduce attack surface and preserve easy rollback,
  but RDS stays public and same-project Preview may share network egress.
- **Option 3:** only Lambda's SG reaches private RDS; Vercel has short-lived API
  authority rather than a DB password; API Gateway/Lambda/CloudWatch improve
  attribution. Public HTTPS is a deliberately smaller but real attack surface.
- **Option 4A:** security matches Lambda, but warm containers, VPC egress, builds,
  and scaling add cost and operating work without a current load requirement.
- **Option 4B:** multi-task services can be highly resilient and connection-aware,
  but ALB/container/capacity operations are disproportionate today.
- **Option 5:** AWS consolidation improves identity and service auditability, but
  migration/runtime risk and a larger AWS deployment surface reduce simplicity.
- **Option 6:** excellent steady-state isolation and cost after conversion, but
  current SSR/server behavior makes its one-time risk high.

## Production-readiness impact and shared controls

Regardless of architecture:

1. Implement the previously designed restricted database-backed readiness check.
   It must prove the expected environment, endpoint fingerprint, database, role,
   verified TLS, and a harmless metadata-only query without customer data.
2. Implement RDS connection/disconnection logging, numeric source, username and
   database attribution, PostgreSQL CloudWatch export, initial 30-day retention,
   and authentication-failure monitoring. Parameter-group work remains a
   separate approval gate.
3. Use a least-privilege Production application role; do not run the application
   as the master/administrative database role.
4. Keep Preview and Development free of Production database credentials. In the
   API design, use separate Cognito clients/claims and an AWS trust policy that
   denies Preview/Development deployment identities.
5. Preserve `verify-full` TLS, request/actor audit records, timeouts, rate limits,
   idempotency, and rollback evidence.
6. Build a private administrative and migration path before removing the
   unverified `/32` and making RDS non-public.

The API/Lambda rollback keeps the current direct path only during a controlled
parallel migration. Each domain cutover can route back to its last known-good
implementation while the old SG rule remains. RDS must not become non-public
until all Production domains, readiness, Preview denial, migrations,
administration, logging, and failover are proven. After private cutover, public
RDS restoration is an incident-only owner action, not routine rollback.

## Decision

### Best architecture now

Approve a design and proof-of-concept for **Vercel Pro plus API Gateway/Lambda
and private RDS**. This spends engineering effort at the correct time—before
unrestricted launch—and saves an estimated `$80–$100/month` versus Static IPs
while producing a materially stronger boundary. The application never exposes
PostgreSQL to Vercel, and Preview can be denied independently through AWS trust,
Cognito authorization, and absent database credentials.

Do not immediately move the whole application to AWS. Retain Vercel's frontend
workflow during the database-service refactor, then revisit hosting after actual
cost, latency, and operational data exist.

### Best architecture at substantial scale

Retain the AWS business API and private RDS boundary. Add RDS Proxy when measured
connection concurrency warrants it, adopt queues/workflows for long-running
operations, and move sustained services to ECS/Fargate only when utilization
justifies always-on compute. Evaluate full AWS hosting if consolidated identity,
compliance, support, or platform costs create a clear business case.

### Is the `$120/month` Static IP solution justified?

Not as the default pre-launch architecture. It is justified only if the owner
needs the fastest low-code risk reduction and accepts public RDS plus shared
project-network limitations while the API boundary is built. At Notarix's
current stage, the recurring premium is meaningful and buys less isolation than
the API/Lambda design. If launch must precede the API refactor, approve Static
IPs as a time-limited bridge with an exit date and budget cap.

## Owner decisions required

1. Approve or reject a design-only API/Lambda proof package; no AWS creation is
   authorized by this review.
2. Accept Vercel Pro's `$20/month` commercial Production baseline during the
   split architecture, or direct a full AWS-hosting proof instead.
3. Choose the authorization model: Cognito JWT for user-context operations and
   Vercel OIDC for Production server identity is recommended.
4. Approve the repository domains included in a first read-only vertical slice;
   `order-repository` is recommended because Order is the central record.
5. Approve cost ceilings for API Gateway, Lambda, CloudWatch, Secrets Manager,
   and any interface endpoint; RDS Proxy should remain deferred.
6. Decide whether Static IPs may be used only as a temporary launch bridge if the
   API migration cannot finish before the required launch date.
7. Identify or authorize eventual removal of `174.106.104.109/32` after a secure
   administrative path is designed.

## Exact next action

Authorize one **design-only implementation specification** for an Order-domain
vertical slice:

- typed HTTPS business operations and schemas;
- Cognito JWT and Vercel Production OIDC trust boundaries;
- Lambda VPC/private-RDS networking and security groups;
- least-privilege runtime role and secret delivery without NAT;
- API Gateway, Lambda, CloudWatch, and endpoint cost ceiling;
- repository file-by-file refactor map;
- integration, denial, latency, load, rollback, and database-readiness tests;
- staged path to make RDS non-public without Production downtime.

Do not create the API, Lambda, IAM roles, VPC resources, secrets, or code until
the owner approves that specification and its cost ceiling.

`GHSA-5p4m-2wfm-xmqj` remains a separate application-security work item. Preview
database work remains paused.
