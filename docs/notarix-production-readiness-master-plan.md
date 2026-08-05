# Notarix Signings Production Readiness Master Plan

Document owner: Executive Director and Technical Program Lead

Final approval authority: Project Owner

Effective date: Aug 5 2026
System of record: this document supersedes readiness percentages and roadmap
claims in older handoffs. Historical reports remain evidence, not current truth.

## A. Executive status

### Determination: Conditional Go for Phase 2 protected-preview work

Notarix Signings remains **No-Go for real customer data and unrestricted
production use**, but Phase 1 evidence supports a **Conditional Go for Phase 2
work limited to protected preview environments**. The production site responds successfully and major workflows are
implemented, but critical identity, document-security, traceability, quality,
provider-certification, and operational-resilience controls are incomplete or
unverified.

Readiness is reported by phase and control area, not as a single percentage:

| Area | State | Verified evidence |
| --- | --- | --- |
| Phase 0: current-state verification | Complete for Phase 1 | Repository, Vercel deployment, environment names, Postgres connectivity, migrations, auth mode, lint, TypeScript, and contract tests inspected Aug 5 2026 |
| Phase 1: release baseline and quality | Complete | Commits pushed; GitHub Actions passed; protected preview maps to exact SHA; zero lint errors/vulnerabilities; TypeScript, 7 tests, and build pass |
| Phase 2: identity and authorization | In progress; blocked at database isolation gate | Preview/Production variables are identical; an owned unattached Neon Free candidate exists but its provider metadata, contents, privileges, and bidirectional isolation remain unverified; Cognito preview configuration is absent |
| Phase 3: evidence and documents | Partial/unverified | S3 signing code and callback models exist; production scanner, quarantine, IAM, versioning, and recovery not certified |
| Phase 4: external providers | Partial/unverified | SES dispatch code and shared callbacks exist; SMS, identity proofing, and financial providers are not certified |
| Phase 5: security and resilience | Not ready | Immutable audit, restore drill, monitoring, alerting, incident response, IAM review, RTO/RPO, and penetration testing lack closure evidence |
| Phase 6: acceptance and launch | Not started | No approved role-by-role UAT, pilot, rollback exercise, or launch authorization |

### Working

- `https://notarix.live` resolves to a Vercel production deployment and returned
  HTTP 200 on Jul 30 2026; Vercel reported deployment
  `dpl_5wjupjmcHyzoL2ehXuPUmzkV3ymh` READY on Aug 5 2026.
- Vercel production and preview contain the 13 baseline required variable names.
- Production Postgres is reachable. Read-only inspection found 30 public tables
  and all 21 original baseline tables.
- The repository has two internally consistent Postgres migration files and 25
  schema tables.
- Seven source-contract tests pass and standalone TypeScript validation passes.
- Major staff, client, notary, order, profile, evidence, notification, financial,
  retention, and command-center application surfaces exist.
- Baseline security headers are configured and observed in production.

### Partially implemented

- Cognito authorization-code flow, JWT validation, session persistence, and
  server-controlled role tables are present only in uncommitted source.
- RBAC helpers protect staff routes, but the Cognito runtime is disabled and the
  legacy identity path remains active.
- S3 presigned URL behavior, evidence status records, and signed callback routes
  exist, but end-to-end provider and denial-path certification is incomplete.
- SES email dispatch exists; bounce, complaint, delivery, and consent evidence
  is not fully certified.
- Audit, retention, backup, health, and financial screens model intended controls;
  several controls are not enforced by independent production services.

### Unverified

- Source commit corresponding to the production deployment. Vercel inspection
  exposed a deployment ID but no Git SHA.
- Application of `0001_nebulous_slipstream.sql` to production. The inspection
  script verifies the 21 baseline tables, not the four identity tables.
- Production `SITE_LOCKED` value and effective access policy.
- S3 encryption, block-public-access, versioning, lifecycle, IAM scope, and
  recovery configuration.
- Malware provider identity, callback authenticity beyond shared HMAC, and
  quarantine isolation.
- SES domain/account production status and native event destinations.
- Database automated backup retention and successful point-in-time restoration.
- Monitoring, alerts, on-call ownership, incident response, and recovery timing.

### Blocked

- Cognito/Google Workspace cutover requires configuration credentials, preview
  testing, and owner approval.
- Production migration, IAM, secrets, DNS, provider commitments, and production
  deployment changes require owner approval.
- SMS, identity-proofing, and payable-provider certification require provider
  selection/accounts and may require commercial approval.

### Unsafe with real customer data

Do not use the current system for real identity documents, notarized documents,
W-9 or banking data, funds movement, unrestricted staff access, or production RON
sessions. The local-preview function is present in the deployed artifact; its
route code appears host-restricted, but production blocking has not received an
adversarial test. Identity assurance and document-provider controls are not yet
certified.

## B. Current system inventory

| System | Verified current architecture | Current state |
| --- | --- | --- |
| Application | Next.js 16.3.0 locally, React 19.2.6, TypeScript 5.9.3, Node >=22.13 | Vercel production remains on an untraceable earlier artifact; repository build uses Turbopack |
| Authentication | Application-owned portal session and RBAC; Cognito code behind `NOTARIX_AUTH_MODE`/`NOTARIX_AUTH_PROVIDER`; legacy provider-header trust removed on remediation branch | Cognito disabled; production variables absent; Production still runs the pre-remediation artifact |
| Authorization | Server-side `requireStaffRouteAccess`; roles `SUPER_ADMIN`, `ADMIN`, `GEN_ADMIN`, `NOTARY`, `CLIENT`, `OBSERVER`; Postgres is intended role authority | Staff RBAC implemented; production assurance unverified |
| Database | AWS RDS Postgres, Drizzle ORM 0.45.2 | Reachable; 21 baseline tables verified; identity migration unverified |
| Documents | AWS S3-compatible presigned GET/PUT implementation; Postgres evidence metadata | Provider variables present; security configuration and end-to-end controls unverified |
| Email | AWS SES v2 dispatch plus callback normalization/HMAC routes | Baseline variables present; native callback certification unverified |
| SMS | AWS SNS/Pinpoint configuration placeholders | Variables absent; not certified |
| Identity proofing | Required business workflow only | No approved provider integration verified |
| Financial/payable | Modeled controls and ledger surfaces | No funds-movement/payable provider certified |
| Deployment | Vercel project `notarix-portal`; GitHub Actions quality workflow | Production source SHA remains untraceable; protected preview SHA is verified |
| Environments | Local, Vercel Preview, Vercel Production | Preview and production share multiple credentials/scopes; separation review required |
| Monitoring | Staff health/readiness UI and Vercel platform visibility | No centralized application monitoring/alerting evidence |
| Audit | Postgres workflow events and command receipts | Immutability and loss-resistant export/storage unverified |

### Domains and deployment relationships

- Primary production: `https://notarix.live`
- Current project domains: `www.notarix.live`, `notarix.live`, and
  `notarix-portal.vercel.app`. Historical deployment metadata still names
  `dawahucollective.com`, but current DNS routes it to Squarespace.
- Active branch: `codex/notarix-portal-checkpoint`.
- Phase 1 application preview SHA:
  `6b098ea5eb8b83afa0443060cc3b4d512e8e99d7`.
- Production deployment: `dpl_5wjupjmcHyzoL2ehXuPUmzkV3ymh`.
- Deployment-to-commit relationship: unverified.
- A legacy `sites` Git remote and generated deployment output exist, but the
  selected production architecture is Vercel + AWS + Postgres.

### Environment-variable inventory

Required baseline names present in both Vercel Preview and Production:
`APP_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, `DATABASE_URL`, `AWS_REGION`,
`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SES_REGION`,
`AWS_SES_FROM_EMAIL`, `NOTARIX_STORAGE_REGION`, `NOTARIX_STORAGE_BUCKET`,
`NOTARIX_EVIDENCE_WEBHOOK_SECRET`, and
`NOTARIX_NOTIFICATION_WEBHOOK_SECRET`.

Also present: `SITE_LOCKED`, `NOTARIX_STORAGE_WEBHOOK_SECRET`,
`NOTARIX_MALWARE_WEBHOOK_SECRET`, `NODE_EXTRA_CA_CERTS`, and
`NODE_TLS_REJECT_UNAUTHORIZED`. Values were not retrieved or recorded.

Cognito, session-cookie, SMS/Pinpoint, and dedicated email-webhook variable
names are absent from Vercel inventory. Preview/production use overlapping AWS,
database, and webhook variable entries; actual value separation is unverified.

## C. Production blockers

| Severity | Problem and risk | System | Corrective action / dependencies | Acceptance evidence | Owner approval |
| --- | --- | --- | --- | --- | --- |
| Critical | Cognito is disabled; legacy identity cannot establish required MFA/passkey/device assurance | Identity/RBAC | Configure Cognito + Google Workspace in preview; validate sessions and database roles | Positive/negative auth matrix, MFA/passkey evidence, signed test report | Required for cloud configuration and cutover |
| Critical | Deployed artifact includes local staff preview route | Identity | Retain fail-closed host guard and test on every current production domain | Route returns 404 on current production domains; repeat after auth cutover | Required before production cutover |
| Critical | Production deployment has no verifiable source SHA | Release | Use the traceable Phase 1 preview as the source for any separately approved promotion | Approved SHA equals future production metadata and artifact | Required before promotion |
| Medium | Lint has 199 non-blocking navigation/image warnings | Quality/performance | Complete reviewed Link/Image migration | Zero warnings or documented, time-bound waivers | No |
| Critical | Document quarantine/scanner/storage configuration not certified | Documents | Validate IAM, encryption, upload checks, quarantine, scanner, denial paths | End-to-end clean/infected/invalid/oversize tests and AWS configuration record | Required for IAM/provider changes |
| High | Identity migration is committed but absent from production; no isolated preview database is proven | Database/identity | Provision/verify isolated preview DB, backup, then apply only after approval | Migration journal, four tables, constraints/indexes, integration tests | Required before shared-preview or production migration |
| High | SES native bounce/complaint/delivery behavior unverified | Notifications | Configure and test SES event destinations and idempotent callbacks | Provider event receipts and database readback | Required for provider configuration |
| High | SMS, identity proofing, and payable integrations absent | Providers | Select/configure providers and implement consent/approval gates | Sandbox certification and business acceptance | Required; possible commercial decision |
| High | Audit immutability and backup restore are unproven | Resilience | Append-only/WORM design; automated backups; restore drill | Tamper test, exported evidence, timed restore report | Required for architecture/infrastructure |
| High | Monitoring, alerts, incident response, RTO/RPO absent | Operations | Select monitoring, define alerts/on-call, run exercises | Alert delivery and tabletop reports; approved RTO/RPO | Owner approval for targets/providers |
| Medium | Preview and production separation is unverified | Environment | Compare accounts/resources without exposing values; isolate data and credentials | Environment matrix and isolation tests | Required for cloud changes |
| Medium | CSP permits inline scripts/styles | Web security | Evaluate nonce/hash CSP after application stabilization | Security test with reduced CSP exceptions | Security tradeoff approval if deferred |
| Low | Legacy hosting artifacts and remote create architecture ambiguity | Repository | Document and later remove/archive after disposition approval | Clean repository and architecture note | Required before uncertain deletion |

## D. Phased roadmap

### Phase 0 — Current-state verification

| Tasks | Owner | Dependencies | Risk | Effort | Testing | Exit criteria | Approval point |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Verify Git, Vercel, env names, DB, auth, providers, operations; record evidence | Technical Program Lead | Read access | High | 2–4 days | Read-only inspections and configuration comparisons | Every inventory field verified or explicitly marked unverified | Owner accepts baseline |

### Phase 1 — Release baseline and code quality

| Tasks | Owner | Dependencies | Risk | Effort | Testing | Exit criteria | Approval point |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Classify working tree, sensitive-file review, `.gitignore`, lint, typecheck, tests, repeatable build, CI, controlled private preview, SHA verification | Engineering Lead | Phase 0, preview access | Critical | 4–7 days | Lint, typecheck, contract/integration tests, two builds, preview smoke test | Clean reviewed tree; all gates green; preview maps to approved SHA | Owner approves commit sequence and preview promotion candidate |

### Phase 2 — Production identity and authorization

| Tasks | Owner | Dependencies | Risk | Effort | Testing | Exit criteria | Approval point |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Cognito, Google Workspace, MFA/passkeys, server roles, sessions/devices, domain restriction, break-glass, preview-route blocking, RBAC matrix | Security/Identity Lead | Identity migration, AWS/Google admin access | Critical | 2–4 weeks | Role/assurance positive and negative tests; session/revocation tests | All protected routes fail closed; role and assurance matrix approved | Owner approves production identity cutover |

### Phase 3 — Secure evidence and document handling

| Tasks | Owner | Dependencies | Risk | Effort | Testing | Exit criteria | Approval point |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Encrypted S3, least privilege, short URLs, validation, quarantine, malware, retention, holds, versioning, backup/recovery | Security/Platform Lead | AWS IAM, scanner selection | Critical | 3–5 weeks | Clean/infected/polyglot/oversize, unauthorized access, expiry, recovery tests | No unscanned access; complete custody/audit chain; recovery proven | Owner approves IAM/provider and real-document pilot |

### Phase 4 — External provider certification

| Tasks | Owner | Dependencies | Risk | Effort | Testing | Exit criteria | Approval point |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SES events, consent SMS, identity document/selfie/liveness, payable provider, W-9/tax gates | Integration + Compliance Leads | Provider accounts/contracts | High | 4–8 weeks | Provider sandbox and failure/retry/idempotency tests | Each provider has signed certification evidence and fallback procedure | Owner selects paid providers and approves financial processing |

### Phase 5 — Operational security and resilience

| Tasks | Owner | Dependencies | Risk | Effort | Testing | Exit criteria | Approval point |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Immutable audit, DB/S3 recovery, monitoring/alerts, incident response, rotations, IAM review, scanning, environment isolation, RTO/RPO/DR, penetration test | Security + Operations Leads | Phases 2–4 substantially complete | High | 3–6 weeks | Restore drill, alert drill, tabletop, vulnerability and penetration tests | No unresolved critical/high findings; approved operational runbooks | Owner approves residual risk and resilience targets |

### Phase 6 — Acceptance testing and launch

| Tasks | Owner | Dependencies | Risk | Effort | Testing | Exit criteria | Approval point |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GenAdmin/Admin/SuperAdmin/client/notary UAT; isolation; authority; W-9/payable; jurisdiction; identifiers; financial audit; maintenance; rollback; pilot | Product, Compliance, Operations | Phases 1–5 complete | Critical | 2–4 weeks plus pilot | Approved end-to-end UAT and controlled pilot | Pilot review complete; no open P0/P1/P2; support ready | Owner alone authorizes unrestricted production |

## E. Prioritized backlog

| ID | Priority | Description | Dependencies | Acceptance criteria and test evidence | Status | Files/systems |
| --- | --- | --- | --- | --- | --- | --- |
| NS-001 | P0 | Establish reviewed release baseline | Working-tree inventory | Every item dispositioned; no secret/generated debris committed | In progress | Git, inventory document |
| NS-002 | P0 | Eliminate lint errors | NS-001 | `npm run lint` has zero errors | Complete locally; 199 tracked warnings remain | `app/**`, ESLint |
| NS-003 | P0 | Make build repeatable without runtime database connections | NS-002 | Two clean builds plus CI build pass | Complete locally; CI execution pending | Next.js, package scripts, `db/index.ts` |
| NS-004 | P0 | Add CI quality gates | NS-002/003 | Pull requests require lint, typecheck, tests, build | Workflow prepared; enforcement/execution pending | `.github/workflows/**` |
| NS-005 | P0 | Prove preview/source SHA traceability | NS-004 | Private preview records exact approved SHA | Not started | GitHub/Vercel |
| NS-006 | P0 | Block local preview in deployed environments | NS-004 | Production/preview aliases deny route and cookie bypass tests | Not started | auth/proxy routes |
| NS-007 | P0 | Enable Cognito/Google Workspace in private preview | Identity resources, migration | MFA/passkey/session/RBAC matrix passes | Blocked | Cognito, Google, Vercel, Postgres |
| NS-008 | P0 | Certify S3 quarantine and malware controls | AWS/scanner access | Infected/unscanned files cannot be accessed | Blocked | S3, callbacks, evidence repository |
| NS-009 | P0 | Prevent sensitive-data ingestion until controls pass | NS-006–008 | UI/API deny and operational banner evidence | Not started | portal, upload, operations |
| NS-010 | P1 | Apply and verify identity schema in preview | NS-001, owner approval | Four identity tables plus constraints/indexes verified | Not started | migration 0001, preview Postgres |
| NS-011 | P1 | Certify SES callbacks | SES access | Bounce/complaint/delivery events reconcile idempotently | Not started | SES, notification routes |
| NS-012 | P1 | Define immutable audit architecture | Owner architecture approval | Tamper-resistant audit evidence survives app compromise test | Not started | Postgres/external audit storage |
| NS-013 | P1 | Complete database and S3 restore drill | Backup configuration | Timed restore meets provisional targets | Not started | RDS, S3 |
| NS-014 | P1 | Implement monitoring and incident alerting | Provider/ownership decision | Synthetic failure reaches accountable responder | Not started | Vercel/AWS/monitoring |
| NS-015 | P1 | Complete role and cross-tenant security tests | NS-007 | All negative tests fail closed | Not started | application, DB |
| NS-016 | P2 | Certify consent-controlled SMS | Provider selection | Consent, STOP, callback, retry tests pass | Blocked | SNS/Pinpoint or approved provider |
| NS-017 | P2 | Certify identity proofing | Provider selection | Document/selfie/liveness results stored and reviewed securely | Blocked | approved identity provider |
| NS-018 | P2 | Certify payable and tax onboarding | Provider selection | W-9 and elevated approval gates pass; no GenAdmin release | Blocked | finance/provider |
| NS-019 | P2 | Complete penetration test and remediate findings | Stable release candidate | No open critical/high findings | Not started | full platform |
| NS-020 | P2 | Run controlled pilot and rollback exercise | Phases 1–5 | Pilot acceptance and rollback evidence signed | Not started | full platform |
| NS-021 | P3 | Tighten CSP and optimize images/navigation | Stable UI | Security/performance baseline improves without regression | Planned | Next config and pages |
| NS-022 | P3 | Remove/archive legacy architecture artifacts | Disposition approval | No active dependency; history retained | Planned | Legacy hosting remote, generated artifacts/docs |

## F. Risk register

| Risk | Probability | Impact | Mitigation | Contingency | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Unauthorized access | High | Critical | Cognito, MFA/passkeys, fail-closed sessions | Maintenance lock, suspend accounts, revoke sessions | Identity Lead | Open |
| Improper role elevation | Medium | Critical | Server roles, dual-control changes, audit | Revoke assignment, incident review | Security Lead | Open |
| Cross-client data exposure | Medium | Critical | Tenant-scoped repository tests and authorization | Disable affected routes, notify response team | Engineering Lead | Open |
| Unscanned document access | High | Critical | Quarantine bucket/state and deny-by-default access | Lock evidence access and isolate objects | Platform Lead | Open |
| Sensitive-data leakage | Medium | Critical | Encryption, redaction, least privilege, DLP review | Incident/breach SOP | Security Lead | Open |
| Provider failure | High | High | Timeouts, retries, idempotency, health alerts | Manual queue/fallback provider procedure | Integration Lead | Open |
| Database corruption | Medium | Critical | Backups, PITR, migration controls | Restore to isolated recovery environment | Database Lead | Open |
| Failed deployment | Medium | High | CI, preview, SHA traceability, rollback | Roll back to last approved SHA | Release Lead | Open |
| Lost audit evidence | Medium | Critical | Append-only external audit retention | Freeze changes and reconstruct from providers/backups | Compliance Lead | Open |
| Backup failure | Medium | Critical | Scheduled verification and restore drills | Alternate snapshot/export recovery | Operations Lead | Open |
| Authentication lockout | Medium | High | Tested break-glass and recovery | Owner-controlled emergency access | Identity Lead | Open |
| Financial-processing errors | Medium | Critical | Dual approval, idempotency, reconciliation | Freeze payouts and execute correction SOP | Finance Lead | Open |
| Notary-jurisdiction errors | Medium | Critical | Jurisdiction/credential rules and expiry gates | Cancel/reassign; compliance escalation | Compliance Lead | Open |
| Retention/legal-hold failure | Medium | Critical | Enforced policies and immutable holds | Suspend deletion and preserve affected stores | Compliance Lead | Open |

## G. Decision log

Material decisions are recorded in `docs/notarix-decision-log.md`. No item in
this plan authorizes a production change. Decisions affecting architecture,
security posture, providers, production infrastructure, or residual risk require
the project owner's final approval.

## H. Standard operating procedures

The controlled SOP inventory is `docs/notarix-sop-index.md`. No modeled UI text
or historical handoff counts as a completed SOP. A procedure becomes complete
only after it names roles, prerequisites, step-by-step controls, rollback or
escalation, required records, test cadence, and owner approval.

## Evidence ledger

| Date | Evidence | Result |
| --- | --- | --- |
| Aug 5 2026 | Git status/log/remotes | Branch and HEAD verified; 28 modified and 17 untracked entries |
| Aug 5 2026 | Vercel inspect | Production READY; deployment ID verified; Git SHA unavailable |
| Aug 5 2026 | Vercel environment listing | Baseline variables present; Cognito/SMS variables absent |
| Aug 5 2026 | `npm run test:contracts` | 6 passed, 0 failed |
| Aug 5 2026 | `npx tsc --noEmit` | Passed |
| Aug 5 2026 | ESLint JSON report | 149 errors, 56 warnings |
| Aug 5 2026 | `npm run db:readiness` | Two local migrations consistent; 25 schema tables |
| Aug 5 2026 | `npm run db:inspect` | Connection OK; 30 public tables; 21/21 baseline present |
| Aug 5 2026 | `npm run auth:cognito:check` | Cognito disabled; legacy rollback mode |
| Aug 5 2026 | Build isolation test | Build with runtime credentials opened stalled; build with credentials blanked passed in 6.6 seconds, identifying build-time optional DB initialization as the cause |
| Aug 5 2026 | Corrected quality gate | Zero lint errors; TypeScript passed; 7/7 tests passed; two consecutive builds passed |
| Aug 5 2026 | Patched dependency audit | Next.js 16.3.0 and patched transitive dependencies; zero known vulnerabilities |
| Aug 5 2026 | Production preview-route denial | `notarix.live` and redirected `www.notarix.live` returned 404; unrelated alias had TLS hostname mismatch |
| Aug 5 2026 | Phase 2 environment isolation comparison | Preview and Production share database, AWS, storage, callback, URL, and lock values; isolation failed; temporary secret files removed |
| Aug 5 2026 | Phase 2 database inventory | No preview database exists on the configured server; production-instance logical DB option rejected |
| Aug 5 2026 | Phase 2 protected-preview TLS verification | Deployment `dpl_5Qn9b37WnTXAAMLQWBo7CNRyF1Pk` READY from `321f87c`; missing certificate warning absent; anonymous request redirected to Vercel SSO; `public: false` |
| Aug 5 2026 | Phase 2 checkpoint CI | GitHub Actions run `31056174674` passed for full SHA `321f87c55e3c89d09c01aaceda3f11c2a86ada5b` |
| Aug 5 2026 | Neon resource reconciliation | Vercel team owns available `notarix-portal-preview` on Free plan; no projects attached; no Neon variables; no connection, secret access, or configuration change performed |
| Aug 5 2026 | Legacy authentication containment | Source checkpoint removes unverified identity-header trust and provider-specific routes, fails closed without a Notarix/Cognito session, and moves 16 staff pages to explicit RBAC; Production remains unremediated because no Production deployment is authorized |

## Phase 1 session result — Aug 5 2026

Completed: complete working-tree classification, sensitive-pattern scan,
`.gitignore` repair, lint error remediation, explicit typecheck, seven contract
tests, repeatable build correction, CI workflow preparation, dependency
remediation, production local-preview denial checks, traceable commits, passing
GitHub Actions, and protected-preview deployment. Production was not changed.

Phase 1 preview `dpl_UL2qt8F2E19GGbAqD79rCicBCBbm` maps to exact application
SHA `6b098ea5`. Phase 2 may begin only in protected preview. Production identity
cutover remains a separate owner approval gate.

## Change control and closure rules

- A task is complete only when its acceptance criteria and evidence are linked.
- Production data, migrations, DNS, IAM, secrets, unrestricted access, and
  material production deployments require explicit owner approval.
- Uncertain files are preserved until disposition approval.
- Real customer data remains prohibited under the Conditional Go determination.
- The owner alone changes the determination to Conditional Go or Go.
