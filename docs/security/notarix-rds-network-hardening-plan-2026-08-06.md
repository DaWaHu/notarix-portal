# Notarix Signings RDS Network Hardening Plan — Aug 6 2026

Status: design-only Static IP approval package complete; no configuration change authorized or performed

## Executive conclusion

Production PostgreSQL is directly reachable from the Internet. Amazon RDS
instance `notary-portal-db` is `PubliclyAccessible=true`, uses port 5432, and is
attached to the default VPC's public subnet group. Its only security group,
`sg-02311929d683f8259`, permits TCP 5432 from `0.0.0.0/0`. PostgreSQL requires
TLS and authentication, but the network boundary currently admits every IPv4
source. RDS logs have already recorded unsolicited Internet probes.

The Vercel project is on the Hobby plan, runs Production Functions in `iad1`,
and has neither Static IPs nor Secure Compute configured. Standard Vercel
outbound addresses are dynamic. The application therefore reaches the public
RDS endpoint over the public network. Removing `0.0.0.0/0` now, without first
establishing and proving a replacement path, would interrupt database-backed
Production requests. The public home page alone is not an adequate cutover test
because it does not require a database query.

Owner-selected interim direction: upgrade the existing project to Vercel Pro,
enable Static IPs for Production Functions in `iad1`, prove the live egress
assignment, and replace world-open PostgreSQL ingress with the exact assigned
sources. This is the lowest-change near-term control. It does not make RDS
private and does not create environment-specific network isolation inside the
same Vercel project. Preview and Development must therefore remain fail-closed
through absent Production credentials and the database target contract.

Vercel Enterprise Secure Compute with private AWS connectivity remains the
future option if regulatory, compliance, volume, or private-RDS requirements
justify it. An AWS API-layer redesign is not part of this interim plan.

No security group, database, VPC, Vercel, logging, credential, DNS, application,
deployment, Preview, or Production-data change occurred during this assessment.

## Verified current architecture

### RDS and VPC

| Attribute | Verified value |
| --- | --- |
| AWS account | DaWaHu Collective, L.L.C. (`987081394982`) |
| Region / AZ | `us-east-1` / `us-east-1a` |
| RDS resource | Single-AZ instance `notary-portal-db`; no cluster |
| Engine | PostgreSQL 17.9 |
| Endpoint service | PostgreSQL TCP 5432; exact credential and connection value not inspected |
| Publicly accessible | **True** |
| VPC | `vpc-00eacc8d1059aa515`, CIDR `172.31.0.0/16` |
| DB subnet group | `default-vpc-00eacc8d1059aa515` |
| Network type | IPv4 only |
| Subnets | Six default subnets across `us-east-1a`–`us-east-1f`, each with public-IP mapping enabled |
| Route table | Main `rtb-0491490321504e4da`; `172.31.0.0/16 -> local`; `0.0.0.0/0 -> igw-0948ee585bce10031` |
| RDS interface | One RDS-managed ENI; private IPv4 plus RDS-managed public IPv4 |
| Security groups | Only `sg-02311929d683f8259` (`notary-portal-db-sg`) |
| RDS Proxy | None |
| IAM DB authentication | Disabled |
| TLS enforcement | `rds.force_ssl=1` |
| RDS parameter group | AWS default `default.postgres17` |
| CloudWatch log exports | None |
| Database Insights | Standard; seven-day performance retention |

All six DB-subnet-group subnets inherit the main route table's Internet gateway
route and have `MapPublicIpOnLaunch=true`; they are public subnets. The DB subnet
group is therefore unsuitable as the final private database subnet group.

### Exact security-group rules

Inbound rules on `sg-02311929d683f8259`:

| Protocol | Port | Source | Effect |
| --- | --- | --- | --- |
| TCP | 5432 | `0.0.0.0/0` | Allows any IPv4 host to reach PostgreSQL authentication |
| TCP | 5432 | `174.106.104.109/32` | Single-address rule; currently redundant because world ingress already includes it; owner/purpose not proven |

Outbound rules:

| Protocol | Ports | Destination | Effect |
| --- | --- | --- | --- |
| All | All | `0.0.0.0/0` | Default unrestricted stateful egress |

There is no IPv6 ingress or egress rule, no `::/0`, no security-group source
grant, no prefix-list grant, and no additional security group attached to RDS.
No non-PostgreSQL inbound port is open on this group.

### Network ACL

Default ACL `acl-03b997f46b21740f7` is associated with all six RDS subnets. Rule
100 allows all IPv4 ingress and egress; the terminal default rules deny only
traffic not already allowed. The ACL does not materially reduce database
exposure. It has no IPv6 rule because the VPC/subnet group is IPv4-only.

### Existing private-access inventory

Read-only inventory found:

- zero RDS proxies;
- zero EC2 instances, including bastions or SSM tunnel hosts;
- zero NAT gateways;
- zero VPC endpoints;
- zero Site-to-Site VPN connections;
- zero Client VPN endpoints;
- zero VPC peering connections;
- no connected RDS compute resource; and
- only the RDS-managed network interface in the VPC.

No verified tunnel, PrivateLink/resource endpoint, proxy, AWS application tier,
or private administration path currently exists. Backup and RDS platform
monitoring are AWS-managed operations and do not require PostgreSQL ingress.

## Current Vercel access path

| Attribute | Verified value |
| --- | --- |
| Team plan | Hobby |
| Project | `notarix-portal` (`prj_CsXZ0PzV6Ekdv2AjzniVcIxdnbt2`) |
| Production Function region | `iad1` / AWS `us-east-1` geography |
| Static IPs | Not enabled; dashboard offers `$100 / project / month + data transfer` |
| Secure Compute | Not configured; dashboard identifies it as Enterprise-only |
| VPC/private networking | None configured |
| Production database variable | Sensitive `DATABASE_URL`, Production only |
| Preview/Development database variable | Absent |

Vercel documents that standard Functions use dynamic outbound IP ranges. With
no static or private feature enabled, the Production runtime resolves and opens
a TLS Postgres connection to the RDS public endpoint through ordinary dynamic
serverless egress. There is no stable current Vercel source address that can be
safely allowlisted.

Consequently, `0.0.0.0/0` cannot safely be removed today. Removing it would
leave only an unverified `/32` and would deny new Vercel database connections.
Existing pooled sessions, if any, are not a safe basis for a change because they
can recycle at any time.

## Legitimate Production database consumers

| Consumer | Current requirement | Network requirement after hardening |
| --- | --- | --- |
| Vercel Production runtime | Active and required for database-backed routes | Approved Production-only private or fixed-egress path |
| Database administration | Occasional; current `/32` purpose is unverified | Named AWS identity through SSM Session Manager port forwarding or another attributable managed tunnel; no direct public DB access |
| Migration tooling | Not active in Vercel; `DATABASE_MIGRATION_URL` is absent; Production migration remains owner-gated | Run only from an approved AWS-private runner or named administrator session |
| Backup/recovery | RDS-managed automated backup | No inbound PostgreSQL rule required |
| Monitoring | RDS/Database Insights platform telemetry | No inbound PostgreSQL rule required; application synthetic checks should use the approved app path |
| Preview | Not legitimate | No credential and, in the target state, no Production network path |
| Development | Not legitimate | No credential and no Production network path |

The `/32` rule must be treated as unverified until the owner identifies its
system and business need. Removing it alone provides no risk reduction while
`0.0.0.0/0` exists.

## Architecture options

| Option | Security / public status | Fixed source | Plan/resources | Complexity and cost | Downtime/application/DNS | Rollback |
| --- | --- | --- | --- | --- | --- | --- |
| A. Vercel Pro Static IPs, RDS public but allowlisted | Removes world ingress; RDS remains `PubliclyAccessible=true`; restrict SG to the two documented regional Vercel addresses plus a separately approved admin path | Yes, two shared IPs per region | Upgrade Hobby to Pro; Static IPs currently shown as $100/project/month plus transfer; Pro seat charges also apply | Low–medium; recurring Vercel cost | No source or DNS change expected; staged SG cutover can be no-downtime | Re-add old SG rule only during a time-limited emergency; disable Static IPs after verified recovery |
| B. Vercel Enterprise Secure Compute + AWS VPC peering | **Target option**: environment-specific private Vercel network; RDS can be non-public in private subnets; SG permits only peered Production CIDR/path | Dedicated egress/private CIDR | Enterprise contract, Secure Compute network, peering, private subnets/route tables/DB subnet group | Medium–high; Enterprise pricing plus AWS networking; support coordination | Minimal app change; controlled network cutover; possible brief risk during RDS public-access/subnet transition; no public DNS change expected, but private DNS and routing require validation | Keep current public path during parallel test; revert endpoint/network mapping and SG in a documented maintenance window if validation fails |
| C. Private RDS behind AWS API Gateway/Lambda or controlled service | RDS non-public; Vercel can reach only authenticated HTTPS application API; no direct PostgreSQL exposure | API endpoint is stable service boundary; DB source is AWS security group | Lambda in private subnets or ECS/Fargate, API Gateway/ALB, IAM/service auth, Secrets Manager, private DB subnets, observability | High implementation complexity; low-to-medium usage-based AWS cost at low volume | Material application/repository changes and new API contract; staged dual-run needed; DNS may use a new API hostname | Route application back to the old database adapter while public path remains temporarily available; remove new resources only after data/behavior verification |
| D. RDS Proxy alone | Improves pooling and credential handling but proxy is not public and must be reached from the VPC; **does not solve Vercel Hobby connectivity by itself** | No external fixed source | RDS Proxy, Secrets Manager, proxy SG/subnets; plus Option B or C network path | Medium; RDS Proxy is billed per vCPU-hour (two-vCPU instance basis) and may add PrivateLink endpoint costs | Database URL/driver behavior must be tested; no benefit until private access exists | Revert runtime endpoint to direct RDS after draining proxy connections |
| E. AWS PrivateLink/VPC Lattice resource endpoint | Can privately expose RDS to a consumer VPC; RDS may be private | Private endpoint addresses | Consumer VPC, resource gateway/configuration, endpoint, RAM/Lattice/PrivateLink; Vercel Hobby supplies no customer VPC | High; hourly resource/endpoint plus data processing | Not independently compatible with current Vercel Hobby; useful only with a supported VPC/private-network design | Remove endpoint association and restore prior private path |
| F. Separate Production Vercel project with Static IPs | Improves Production/Preview network separation while retaining public allowlisted RDS | Yes | Pro plus Static IPs; second project; Production domain/environment migration | Medium; Vercel recurring charges and duplicated project governance | Controlled Production project/domain cutover; source unchanged but deployment configuration changes materially | Reassign domain to current project and restore old SG path |

Official capability basis:

- [Vercel allowlisting and Static IP guidance](https://vercel.com/kb/guide/how-to-allowlist-deployment-ip-address)
- [Vercel Secure Compute environment isolation](https://vercel.com/changelog/vercel-secure-compute-now-supports-multiple-environments)
- [Vercel Secure Compute VPC peering](https://vercel.com/changelog/vpc-peering-now-available-as-self-service-for-vercel-secure-compute)
- [AWS guidance for private RDS instances](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_VPC.WorkingWithRDSInstanceinaVPC.html)
- [RDS Proxy network requirements](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html)
- [AWS PrivateLink resource access](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)

## Recommended architecture and sequence

### Preferred target: Secure Compute Production network + private RDS

Use a distinct Vercel Secure Compute network for Production only, peered to an
AWS VPC containing dedicated private database subnets. Preview should either use
a different network or no Production peering. Keep TLS `verify-full`, database
authentication, the Production-only secret, and least-privilege runtime role.

Proposed approval-gated sequence:

1. Obtain Vercel Enterprise/Secure Compute technical design and pricing without
   purchasing; confirm `iad1`, Production-only environment association, CIDRs,
   failover regions, route propagation, DNS, and peering limits.
2. Design dedicated private subnets in at least two AZs, route tables without an
   Internet-gateway route for database ENIs, a private DB subnet group, and a
   narrowly scoped RDS security group.
3. Establish peering and routes in parallel. Do not remove the current path.
4. Validate from a non-production rehearsal resource, then test the Production
   path using safe health and database-identity checks during an approved window.
5. Associate the Production environment only, verify Preview denial, then remove
   `0.0.0.0/0`.
6. After stable observation, set RDS non-public and complete subnet/security-group
   transition under an approved rollback window.
7. Move administration and migration execution to named AWS identities using an
   SSM-managed private tunnel/runner; remove the unverified `/32`.

### Cost-sensitive alternative: AWS application/API boundary

If Enterprise is not approved, design a narrow AWS service layer that owns all
database operations. Vercel would authenticate to HTTPS; Lambda/ECS in the VPC
would connect to private RDS using security-group references. This is the only
evaluated option that can keep Vercel Hobby while eliminating direct Internet
PostgreSQL, but it is a material architecture and application change and must be
reviewed as a separate project phase.

### Interim option: Static IP allowlisting

If rapid reduction is required before either target is ready, owner may approve
Pro + Static IPs. Enable it first, redeploy the unchanged Production source,
prove the exact outbound pair, add those addresses before removing world ingress,
and test database-backed routes. Do not infer or guess Vercel ranges.

Because Static IPs are a project networking feature and Preview deployments are
in the same project, this interim does not by itself establish Production-only
network reachability. Preview remains blocked by absent credentials, but the
owner must either accept that residual network reachability, separate the
Production project, or choose environment-specific Secure Compute.

## Immediate safe risk-reduction opportunities — not implemented

1. **Logging design and preparation:** create a reviewed custom parameter-group
   change plan and CloudWatch retention/alert design. No restart or parameter
   change is needed during planning.
2. **Identify the `/32`:** determine whether `174.106.104.109/32` is current,
   attributable, and required. It is redundant today; removal can be included in
   the later atomic SG change.
3. **Preserve IPv4-only posture:** there is currently no IPv6 ingress. Add a CI or
   infrastructure-policy prohibition against `::/0` before dual-stack work.
4. **Named AWS administration:** stop routine root use. Design IAM Identity Center
   or named federated administrator roles with MFA, CloudTrail attribution, short
   sessions, and a separately controlled root break-glass procedure.
5. **Cutover runbook and synthetic check:** prepare a safe database-backed
   readiness endpoint or operational query that verifies expected RDS identity
   without exposing data or credentials.

There is no safe current IP-only SG improvement for Vercel because current egress
is dynamic. Removing non-PostgreSQL ports, duplicate groups, or IPv6 rules is not
applicable: none exist. NACL tightening is not recommended as the first control;
security groups and private routing provide the stateful, attributable boundary.

## Logging hardening plan

Current verified state:

- `log_connections`, `log_disconnections`, and `log_hostname` use engine defaults
  and are effectively off;
- `log_line_prefix=%t:%r:%u@%d:[%p]:`, which already includes timestamp, remote
  address, username, database, and process ID when an event is logged;
- `rds.log_retention_period=4320` minutes (three days);
- PostgreSQL/upgrade CloudWatch exports are disabled; and
- the instance uses an immutable AWS default parameter group, so logging changes
  require a custom group.

Smallest proposed change set, separately approval-gated:

1. Create a custom PostgreSQL 17 parameter group based on the current defaults.
2. Set dynamic `log_connections=1` and `log_disconnections=1` after load/noise
   review. Keep `log_hostname=0` to avoid reverse-DNS latency; the numeric remote
   address is already captured.
3. Retain the existing prefix or add session ID and SQLSTATE only after format
   compatibility review. Do not enable broad statement logging because it can
   capture sensitive data.
4. Export `postgresql` logs to CloudWatch Logs. AWS states this export begins
   prospectively and is applied immediately.
5. Use 30 days as an initial CloudWatch retention proposal, subject to legal,
   privacy, cost, and incident-response approval. Keep the short local RDS
   retention for operational access unless storage analysis justifies seven days.
6. Create metric filters/alarms for repeated `password authentication failed`,
   `no pg_hba.conf entry`, malformed startup packets, unexpected usernames,
   connection bursts, and authentication activity outside approved source paths.
7. Route alerts to an accountable security/operations destination and test with
   synthetic failures from an authorized source.

AWS documents PostgreSQL log export and connection metadata behavior in
[RDS PostgreSQL log files](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_LogAccess.Concepts.PostgreSQL.html)
and [RDS PostgreSQL logging parameters](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_LogAccess.Concepts.PostgreSQL.overview.parameter-groups.html).

Parameter-group association must be rehearsed. AWS notes that associating a new
group can leave static values pending reboot even when the desired logging values
are dynamic. Schedule a maintenance/rollback window and do not assume zero
restart risk until the exact pending-reboot diff is proven.

## Rollback design

### Static-IP interim rollback

1. Before change, record SG rule IDs, Vercel network metadata, current deployment,
   and a short-lived emergency rule procedure.
2. Add and validate fixed Vercel sources before deleting `0.0.0.0/0`.
3. If new database connections fail, restore the prior world rule only as a
   time-boxed emergency action with incident logging, then diagnose; never expose
   or restore an old credential.
4. Remove the emergency rule immediately after the corrected allowlist works.

### Private-network rollback

1. Build the private route in parallel while the old route remains available.
2. Preserve the last known-good Production deployment and variable metadata.
3. If private validation fails, route the unchanged deployment back to the old
   endpoint/path during the approved window; do not change schema or data.
4. Do not set RDS non-public or remove public ingress until new connections,
   deployment recycling, failover, Preview denial, administration, and monitoring
   are proven.
5. After public removal, reintroducing public access is a separate emergency
   owner action, not the normal rollback target.

## Owner decisions required

1. Choose the target path:
   - Enterprise Secure Compute + peering (recommended), or
   - AWS application/API layer while retaining Hobby.
2. Decide whether to fund Pro + Static IPs as an interim control and whether its
   same-project Preview reachability is acceptable temporarily.
3. Authorize pricing/design discussions only; purchasing remains a later gate.
4. Identify or retire the `174.106.104.109/32` administrative rule.
5. Approve named AWS administrative identity design and SSM-based private access.
6. Approve the logging objectives, retention, alert destination, privacy review,
   and maintenance-window requirements.

`GHSA-5p4m-2wfm-xmqj` for `js-yaml` remains the next separate
application-security task after the RDS network architecture decision. It was
not modified during this assessment.

## Exact next action

Owner reviews this plan and authorizes **one design-only proof package**:

- preferred: obtain a non-binding Vercel Enterprise Secure Compute architecture
  and price proposal covering Production-only `iad1` networking and AWS peering;
  or
- alternative: authorize an AWS API-layer technical design and repository impact
  assessment.

No SG rule should change until the selected design supplies a verified parallel
Production path, database-backed health test, Preview-denial evidence, exact
rollback procedure, cost approval, and a separately authorized maintenance
window.

## Read-only evidence commands

Commands used through the authenticated AWS console, with no credential values:

- `aws rds describe-db-instances --db-instance-identifier notary-portal-db`
- `aws ec2 describe-security-groups --group-ids sg-02311929d683f8259`
- `aws ec2 describe-subnets --filters Name=vpc-id,Values=vpc-00eacc8d1059aa515`
- `aws ec2 describe-route-tables --filters Name=vpc-id,Values=vpc-00eacc8d1059aa515`
- `aws ec2 describe-network-acls --filters Name=vpc-id,Values=vpc-00eacc8d1059aa515`
- read-only inventory for instances, ENIs, NAT gateways, VPC endpoints, VPNs,
  Client VPN, peering, RDS proxies, subnet groups, and DB parameters.

No secret retrieval, SQL, connection attempt, write API, configuration editor,
or Production database query was used.

## Approved design package: Vercel Pro plus Static IPs

This section supersedes the earlier option-ranking and next-action language for
the approved interim design. It is an implementation proposal only. No plan,
add-on, IP assignment, security-group rule, parameter group, source file,
environment variable, database, deployment, or billing setting was changed.

### Plan, capability, and cost

| Item | Current / proposed state | Current published price |
| --- | --- | --- |
| Vercel team plan | Hobby today; Pro required | `$20/month`, including one deploying seat and `$20` usage credit |
| Additional paid seats | None assumed; current owner/deployer remains the included seat | `$20/month` each if later added |
| Static IPs | Not enabled; add to the existing `notarix-portal` project | `$100/project/month` plus data transfer |
| Static-IP data transfer | Functions only; builds remain excluded | Starts at `$0.15/GB` |
| Region | One region, `iad1` | No second region assumed |

The exact expected fixed incremental minimum is **$120 per month**: `$20` Pro
platform fee plus the `$100` Static IP add-on. Taxes, additional seats, usage
above included credits, and Static IP/private data transfer are variable and
excluded. The owner must review the live checkout quote before purchase.

Vercel documents Static IPs as a Pro/Enterprise project capability. The current
project dashboard states that each configured region supplies either two shared
IP addresses or one CIDR range. Vercel's public allowlisting guidance describes
two shared regional egress IPs. The implementation must record the assignment
actually issued by Vercel. If the dashboard issues a CIDR rather than two
individual IPs, stop for owner review; do not independently widen the RDS rule.

Build traffic must remain outside Static IP routing. Notarix builds deliberately
set `NOTARIX_BUILD_MODE=1` and must not connect to Production. Routing builds
would expand both the network surface and metered transfer without supporting
the cutover proof. Only Production Functions in `iad1` need the facility.

Sources:

- [Vercel Pro plan](https://vercel.com/docs/plans/pro-plan)
- [Vercel pricing](https://vercel.com/pricing)
- [Vercel database allowlisting and Static IP guidance](https://vercel.com/kb/guide/how-to-allowlist-deployment-ip-address)
- [Vercel build routing through Static IPs](https://vercel.com/changelog/route-build-traffic-through-static-ips)

### Interim architecture

The unchanged Next.js Production deployment runs server-side Functions in
`iad1`. Function database traffic leaves through the assigned Vercel Static IP
facility, negotiates verified TLS with the public AWS RDS PostgreSQL endpoint,
and authenticates with the Production-only runtime credential. RDS remains
`PubliclyAccessible=true`, but its security group accepts PostgreSQL only from
the exact assigned Vercel sources. TLS, database authentication, runtime target
validation, and Vercel environment scoping remain independent controls.

Static IPs are configured at project/region scope, not as a documented
Production-only environment network. It is therefore reasonable to infer that
same-project Preview Functions in `iad1` may traverse the same facility. Vercel
environment scope distinguishes deployments and credentials, not the assigned
network sources. The protected Preview currently has no Production
`DATABASE_URL`; Development also has none. That fail-closed state is mandatory.
The owner must explicitly accept this residual same-project network reachability
for the interim period or approve a separate Production project before cutover.

### Target RDS security-group state

Proposed inbound rules for `sg-02311929d683f8259` after proof:

| Protocol | Port | Source | Description |
| --- | --- | --- | --- |
| TCP | 5432 | `<VERCEL_IAD1_STATIC_IP_A>/32` | `Vercel Static IP iad1 A - Production interim - <change-id>` |
| TCP | 5432 | `<VERCEL_IAD1_STATIC_IP_B>/32` | `Vercel Static IP iad1 B - Production interim - <change-id>` |

If Vercel provides a reviewed CIDR instead, the approved target must use that
exact CIDR and record why individual `/32` rules were unavailable. The final
state has no `0.0.0.0/0`, no `::/0`, and no Preview-specific Production rule.
The stateful outbound `All -> 0.0.0.0/0` rule remains unchanged in this interim
change because narrowing it does not reduce inbound reachability and requires a
separate dependency review.

The existing `174.106.104.109/32` rule is **UNVERIFIED**. Its AWS rule has no
description. Available 90-day CloudTrail history contains no ingress-creation
event, and repository/setup records contain no attribution. There is no evidence
that it is an owner address or approved administrative path. It must not survive
the final cutover unless the owner supplies attributable ownership, current
business need, and a time-bounded retention decision. Otherwise remove it in
the separately authorized security-group change after an approved admin-access
alternative is established.

### Database-backed readiness design

The existing `/staff/deployment-readiness` page in
`app/staff/deployment-readiness/page.tsx` checks only whether configuration is
present; `scripts/db-readiness.mjs` validates repository and environment
contracts without opening a database connection. Neither proves live RDS
connectivity.

The smallest safe source change is a dedicated server-only readiness action or
route beneath the existing deployment-readiness feature with all of these
controls:

1. Require the existing `Admin` or `SuperAdmin` route policy and Production
   identity assurance. Reject local, Preview, and Development execution.
2. Validate `VERCEL_ENV=production`, the Production database target contract,
   the approved deployment/source revision, and an expected non-secret endpoint
   fingerprint before opening a connection.
3. Set a short connection timeout and statement timeout, open a fresh connection,
   start a read-only transaction, and execute only metadata:

   ```sql
   SELECT
     current_database() AS database_name,
     current_user AS role_name,
     inet_server_addr()::text AS server_address,
     inet_server_port() AS server_port,
     COALESCE(
       (SELECT ssl FROM pg_stat_ssl WHERE pid = pg_backend_pid()),
       false
     ) AS tls_enabled;
   ```

4. Read no application table and display no customer data, server address,
   connection string, or credential. Return only timestamp, deployment ID,
   `databaseMatch`, `roleMatch`, `endpointFingerprintMatch`, `tlsEnabled`, and a
   redacted database/role fingerprint. Close the connection immediately.
5. Treat any mismatch as failure. Keep the current Production role expectation
   documented; separately replace any administrative/master runtime role with a
   least-privilege application role before full production readiness.
6. Correlate the exact test timestamp, database, and username with RDS connection
   logs. The numeric remote address in the RDS log—not an external IP echo—is
   the authoritative proof that database traffic arrived from one of the
   assigned Vercel sources.

Proposed source impact, not implemented:

- add `app/staff/deployment-readiness/database/route.ts`;
- add a server-only helper such as `db/production-readiness.ts`;
- update `app/staff/deployment-readiness/page.tsx` to invoke and render the
  restricted check without exposing identifiers;
- add source-contract tests in `tests/source-contract.test.mjs` or a focused
  database-readiness test; and
- update readiness/operations documentation. No migration or schema change is
  required.

The endpoint must not be deployed before approved Production identity controls
actually protect it. If that prerequisite is not met at implementation time,
use an owner-operated, one-time Vercel Production Function invocation with the
same server-only code and no public response, then remove/disable the invocation
surface after evidence capture.

### Staged implementation and evidence sequence

Each numbered stage is a separate approval-gated change record. There must never
be a point where the existing path is removed before the replacement is proven.

1. Record current SG rule IDs, RDS state, active Production deployment/commit,
   Vercel environment scopes, Function region, DNS mapping, and health baseline.
2. Implement, test, review, and deploy the restricted metadata-only readiness
   mechanism without changing the database schema. Prove it on the existing path.
3. Before network cutover, implement the approved logging configuration: custom
   PostgreSQL 17 parameter group, connection/disconnection logging, PostgreSQL
   CloudWatch export, 30-day retention, and authentication alarms. Resolve any
   required reboot in a separate maintenance window.
4. Owner reviews the live quote, upgrades the existing team/project to Pro, and
   purchases Static IPs. Record invoice/plan metadata without payment details.
5. Enable one Static IP region, `iad1`, for Functions only. Leave build routing
   off. Record the actual assigned sources and Vercel activity event.
6. Add exact assigned `/32` rules to `sg-02311929d683f8259` with descriptions and
   the change ID while retaining `0.0.0.0/0`. Do not guess Vercel ranges.
7. Redeploy the currently approved Production source if Vercel requires a new
   deployment for routing. Do not merge or introduce unrelated source.
8. Force a fresh database connection through the readiness mechanism. Verify
   correct endpoint/database/role fingerprints, TLS, and successful metadata
   query. Confirm the RDS log source equals an assigned Vercel source. Repeat as
   needed to observe both addresses or obtain Vercel's documented failover proof.
9. Verify Preview and Development still have no Production `DATABASE_URL`, no
   `DATABASE_MIGRATION_URL`, and no Production target metadata. Invoke the
   Preview denial contract; any authentication success is a critical stop.
10. Only after steps 1–9 pass, revoke the `0.0.0.0/0` ingress rule. Remove the
    unverified `/32` in the same approved window unless its owner and need were
    proven. Record exact AWS API events and resulting rules.
11. Open a new Production connection and repeat the database-backed readiness
    test. Verify `notarix.live`, current safe database-backed read flows, TLS,
    security headers, and logs. Do not conduct customer, document, payment,
    banking, identity, W-9, or notarial transactions.
12. Reconfirm Preview/Development denial and monitor connection/authentication
    failures through the agreed observation period before closing the change.

Expected application downtime is **none** when the staged path works: new rules
are added and proven before the old rule is removed. A short maintenance window
is still required because a custom RDS parameter-group association may require
a reboot and because an emergency rollback may briefly affect new connections.
Do not promise zero downtime until the live parameter diff and Vercel routing
behavior are confirmed.

### Logging and monitoring prerequisites

Before the source-IP proof, associate a reviewed custom PostgreSQL 17 parameter
group and enable `log_connections=1` and `log_disconnections=1`. Keep
`log_hostname=0`; the existing `%t:%r:%u@%d:[%p]:` prefix already captures
timestamp, numeric remote address, username, database, and process. Do not enable
statement logging. Export `postgresql` logs to CloudWatch Logs prospectively,
set an initial 30-day retention period, and monitor repeated authentication
failures, `no pg_hba.conf entry`, unexpected users/sources, and connection bursts.

Record log-group ARN/name, parameter-group identifier, retention, alarm routes,
test timestamps, and matched source addresses. Logs may contain operational
identifiers and must be access-controlled and excluded from repository evidence.

### Rollback and stop rules

- **Before world-rule removal:** any wrong source, region mismatch, TLS/identity
  failure, deployment failure, or missing log evidence is a stop. Retain the
  current SG rule and revert the Vercel deployment/configuration under its own
  approval; no Production outage should result.
- **Static-IP or RDS failure after removal:** first verify/re-add only the exact
  assigned Vercel rules, region, and routing setting; then redeploy the last
  known-good Static-IP-enabled Production revision. Do not disable Static IPs or
  restore an old credential.
- **Unexpected Preview access:** disable the Preview path while preserving
  evidence. If Preview authenticates to Production, classify it as critical,
  stop, and rotate the affected credential under the incident procedure.
- **Emergency broader access:** never restore `0.0.0.0/0` automatically. With
  owner approval, first allow only exact, attributable Production egress `/32`
  addresses observed in current logs, with a short expiry, monitoring, and
  change record. If no attributable narrow source can restore service,
  time-boxed world ingress is a last-resort incident decision requiring explicit
  owner authorization, maintenance lock, active monitoring, and immediate
  removal—not a normal rollback step.
- **Function-region mismatch:** do not expand the allowlist. Return Functions to
  approved `iad1` or stop for a reviewed multi-region design.

The pre-change SG export, last known-good deployment ID, Vercel assignment,
CloudWatch query, owner escalation path, and exact AWS add/revoke commands must
be placed in the change ticket before execution.

### Owner decisions and exact next action

Owner approval is still required for:

1. The exact `$120/month` minimum plus variable transfer/tax charge shown by the
   live Vercel quote; no purchase is authorized by this document.
2. The residual risk that same-project Preview Functions may share the Static IP
   network facility while remaining credential-denied, or a separate Production
   project as an alternative.
3. Source implementation and deployment of the restricted database readiness
   mechanism.
4. Custom RDS parameter group, CloudWatch export/retention/alarms, and any reboot
   window.
5. The cutover maintenance window and the exact assigned IP rules after Vercel
   issues them.
6. Removal or documented retention of `174.106.104.109/32`; current status is
   **UNVERIFIED**.
7. The emergency escalation policy and accountable responders.

**Exact next action:** owner reviews this design and, if acceptable, separately
authorizes only the repository implementation and test of the restricted
database-backed readiness mechanism. Billing, Static IP enablement, AWS logging,
security-group changes, deployment, and cutover remain later, distinct approval
gates.

`GHSA-5p4m-2wfm-xmqj` remains a separate application-security task and is not
modified here. Vercel Enterprise Secure Compute/private connectivity remains
the future architecture when private-RDS or formal compliance requirements
outgrow this interim public-endpoint allowlist.
