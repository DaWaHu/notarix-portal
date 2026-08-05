# Notarix Signings Executive Handoff

Date: Jul 18 2026

Workspace: `/Users/hudlinbe/Desktop/100 Notarix Signing`

Branch: `codex/notarix-portal-checkpoint`

Production URL: `https://notarix.live`

Local development URL: `http://localhost:3000`

Current architecture: Vercel hosting, AWS services, Postgres/RDS persistence

## Executive Summary

The Notarix Signings portal is at a strong stopping point. The product has moved
from page composition into production hardening. The portal now has a mature
staff operations console pattern, role-based portal landing pages, profile
verification workflows, order operations workflows, evidence controls,
notification controls, financial controls, audit/reporting surfaces, and a
database-backed production foundation.

The Order remains the central system record. Intake requests remain `NSR`
records before approval. Approved notary and client profile numbers remain
permanent database-generated records and must not be assigned before activation.

Tonight's major production milestone was reconnecting the restored AWS RDS
Postgres database, applying the Notarix Signings production baseline schema,
seeding deterministic baseline records, and proving that local repository
callback writes can update production Postgres. The Vercel runtime has now been
redeployed to `https://notarix.live`, and signed callback replay is writing to
production Postgres successfully.

## Current Progress Status

Estimated full production readiness: 86 percent to 90 percent.

The portal is functionally broad and the production database is now usable. The
remaining work is primarily deployment/runtime binding, final identity-provider
enforcement, provider callback validation in production, and operational
security hardening.

Completed maturity areas:

- Executive staff console composition
- Notary and client profile verification composition
- Client, notary, and staff portal routing
- Command center actions and visible status feedback
- Order operations, lifecycle, assignment, completion, and closeout views
- Evidence viewer, upload intake, storage controls, validation queue, and malware callback model
- Financial controls and reporting
- Notification delivery log and communications center
- Credential expiration and renewal monitoring
- Role-based access routing and maintenance lock
- Vercel + AWS + Postgres architecture correction
- Production RDS baseline migration and seed
- Production dependency audit cleanup
- Removal of unused `DISABLE_AUTH` production environment variable

Remaining maturity areas:

- Bind real production identity provider claims instead of relying on preview headers
- Complete provider-native email/SMS callback validation with AWS SES/SNS or selected providers
- Complete object storage callback validation with AWS S3 and malware scanning provider
- Add immutable audit storage, backup validation, retention enforcement, and monitoring runbooks

## Production Database Status

RDS was restored by the owner after being stopped due to inaccessible encryption
credentials. After restoration:

- Production database connection is reachable.
- No AWS security-group rules were changed.
- Public RDS schema was inspected successfully.
- Notarix production baseline migration was applied.
- Baseline data was seeded.

Verified production table status:

- Required Notarix tables present: `21/21`
- Missing required tables: none
- `evidence_storage_controls` columns: `25`
- `notification_delivery_records` columns: `19`
- `evidence_malware_scan_events` columns: `8`

Verified baseline row counts:

- `access_requests=4`
- `profile_verification_items=32`
- `evidence_storage_controls=10`
- `notification_delivery_records=6`
- `command_center_targets=52`
- `order_operational_records=3`
- `order_lifecycle_stages=11`
- `order_delivery_receipts=5`

Verified local repository writes against production Postgres:

- Notification provider callback write succeeded.
- Evidence upload completion write succeeded.
- Evidence malware clearance write succeeded.
- `DOC-2607-0001` became `Release Eligible` with malware status `Malware validation complete`.

## Current Deployment Status

Production callback replay now returns HTTP `200` from Vercel:

- `/notifications/provider-callback`
- `/staff/evidence-upload-callback`
- `/staff/evidence-malware-callback`

Signatures are accepted and the deployed runtime writes callback records to
production Postgres.

Root cause found:

- The existing RDS `DATABASE_URL` includes a legacy `schema=public` query parameter.
- The `postgres` driver treats that as a server setting and rejects it.
- Local code has now been fixed to sanitize that parameter.
- Vercel production has been redeployed with the local fix.

Vercel CLI status:

- Workspace linked to `owner-9915s-projects/notarix-portal`.
- Production deployment completed and was aliased to `https://notarix.live`.
- Latest successful deployment ID: `dpl_BDBVbCryzgjbXf8PiWFiwZ4zoUJ9`.

Callback replay result:

- Notification provider callback: `200`
- Evidence upload callback: `200`
- Evidence malware callback: `200`

Production readback:

- `notification_delivery_events=2`
- `evidence_malware_scan_events=2`
- `NTF-2607-0001` status: `Delivered`
- `DOC-2607-0001` release eligibility: `Release Eligible`

TLS cleanup completed:

- Added safe Vercel Production override `NODE_TLS_REJECT_UNAUTHORIZED=1`.
- Added Vercel Production `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt`.
- Redeployed production as `dpl_3bEgum1WWLXFenkrgR4N2P6dQJSt`.
- Build logs no longer show the missing `./us-east-1-bundle.pem` warning.
- Build logs no longer show `NODE_TLS_REJECT_UNAUTHORIZED=0`.
- Signed callback replay still returns `200` for all three callback routes.

Security cleanup completed:

- Removed unused `DISABLE_AUTH` from Vercel Production.
- Removed `DISABLE_AUTH` from the production runtime contract, local audit
  requirements, environment template, and environment documentation.
- Added npm overrides for `postcss@8.5.20` and `esbuild@0.28.1`.
- `npm audit` now reports `0 vulnerabilities`.
- `npm run env:audit` now reports no unsupported local environment keys.
- Redeployed production as `dpl_5wjupjmcHyzoL2ehXuPUmzkV3ymh`.
- Signed callback replay still returns `200` for all three callback routes.

## Code Changes From This Stop Point

Files changed or added during the production database recovery:

- `db/database-url.ts`
- `db/index.ts`
- `drizzle.config.ts`
- `scripts/inspect-production-db.mjs`
- `scripts/apply-postgres-baseline.mjs`
- `scripts/seed-postgres-baseline.ts`
- `package.json`

Purpose:

- Sanitize legacy Postgres URL parameters unsupported by the `postgres` driver.
- Prevent Drizzle from silently falling back to a fake local database URL.
- Provide repeatable production DB inspection.
- Provide guarded baseline migration application.
- Provide first-class npm commands for production database inspection, guarded
  baseline migration, and idempotent baseline seeding.

Important behavior:

- `scripts/apply-postgres-baseline.mjs` refuses to run if any required Notarix
  baseline tables already exist.
- It is intended for initial production baseline setup, not destructive repair.
- `npm run db:seed` reconciles deterministic baseline records and exits cleanly.

## Verification Completed

Commands successfully completed:

```bash
npm run test:contracts
node scripts/inspect-production-db.mjs
npm run build
npm test
npm audit
```

Production DB actions completed:

```bash
npm run db:baseline
npm run db:inspect
npm run db:seed
```

Baseline seed completed through:

```bash
npm run db:seed
```

Callback replay against Vercel now succeeds:

```bash
npm run callbacks:replay -- --base-url=https://notarix.live --send
```

## Environment Notes

Do not put secrets in source files.

Local `.env.local` should be used only for local development and reference.
Production values must live in Vercel Environment Variables.

Important URL rule:

- Local `.env.local` `APP_URL`: `http://localhost:3000`
- Vercel Production `APP_URL`: `https://notarix.live`

Important database rule:

- Production `DATABASE_URL` must point to AWS RDS Postgres.
- Remove legacy `schema=public` from the Vercel value unless the deployed code
  has the sanitizer fix.

Important deployment rule:

- Vercel hosts the portal.
- AWS provides infrastructure services.
- Postgres/RDS is the persistence layer.
- Cloudflare Sites/D1 is no longer the selected production path.

## Primary Page Hyperlinks

Use these links after `npm run dev` locally, or replace the base with
`https://notarix.live` after production redeploy.

### Public and Access

- [Landing page](http://localhost:3000/)
- [Request portal access](http://localhost:3000/portal)
- [Secure staff authentication](http://localhost:3000/signin-with-chatgpt)
- [Maintenance page](http://localhost:3000/maintenance)
- [Support](http://localhost:3000/support)

### Role-Based Portal Homes

- [Staff portal](http://localhost:3000/staff)
- [Client portal](http://localhost:3000/client)
- [Client dashboard](http://localhost:3000/client/dashboard)
- [Notary portal](http://localhost:3000/notary)
- [Notary dashboard](http://localhost:3000/notary/dashboard)

### Profile Intake and Completion

- [Notary profile completion NSR-1001](http://localhost:3000/profile/complete/NSR-1001)
- [Client profile completion NSR-1002](http://localhost:3000/profile/complete/NSR-1002)
- [Active profile NSR-1001](http://localhost:3000/profile/active/NSR-1001)
- [Profile corrections NSR-1001](http://localhost:3000/profile/corrections/NSR-1001)

### Staff Requests and Verification

- [Staff queue](http://localhost:3000/staff/requests)
- [Request file NSR-1001](http://localhost:3000/staff/requests/NSR-1001)
- [Notary profile verification NSR-1001](http://localhost:3000/staff/requests/NSR-1001/profile-verification)
- [Client profile verification NSR-1002](http://localhost:3000/staff/requests/NSR-1002/profile-verification)
- [Profile audit report NSR-1001](http://localhost:3000/staff/requests/NSR-1001/profile-verification/audit-report)
- [Request invitation NSR-1001](http://localhost:3000/staff/requests/NSR-1001/invitation)

### Elevated Approval and Governance

- [Elevated approval queue](http://localhost:3000/staff/elevated-approval)
- [Elevated approval NSR-1001](http://localhost:3000/staff/elevated-approval/NSR-1001)
- [Access control](http://localhost:3000/staff/access-control)
- [Audit reports](http://localhost:3000/staff/audit-reports)
- [Retention center](http://localhost:3000/staff/retention)
- [System health](http://localhost:3000/staff/system-health)
- [Platform center](http://localhost:3000/staff/platform)
- [Deployment readiness](http://localhost:3000/staff/deployment-readiness)
- [Provider environment](http://localhost:3000/staff/provider-environment)
- [Integrations](http://localhost:3000/staff/integrations)

### Command Center

- [Command center](http://localhost:3000/staff/command-center)
- [Command center activity](http://localhost:3000/staff/command-center/activity)

### Orders

- [New order](http://localhost:3000/orders/new)
- [Order case file ORD-2607-0001](http://localhost:3000/orders/ORD-2607-0001)
- [Staff order operations](http://localhost:3000/staff/orders)
- [Staff order intake](http://localhost:3000/staff/order-intake)
- [Order assignment ORD-2607-0001](http://localhost:3000/staff/orders/ORD-2607-0001/assignment)
- [Order closeout](http://localhost:3000/staff/order-closeout)
- [Appointments](http://localhost:3000/staff/appointments)
- [Signers](http://localhost:3000/staff/signers)

### Client and Notary Order Views

- [Client orders](http://localhost:3000/client/orders)
- [Client order completion ORD-2607-0001](http://localhost:3000/client/orders/ORD-2607-0001/completion)
- [Notary assignments](http://localhost:3000/notary/assignments)
- [Notary assignment completion ORD-2607-0001](http://localhost:3000/notary/assignments/ORD-2607-0001/completion)

### Evidence and Documents

- [Documents](http://localhost:3000/documents)
- [Evidence intake](http://localhost:3000/staff/evidence-intake)
- [Document validation queue](http://localhost:3000/staff/document-validation)
- [Evidence viewer DOC-2607-0001](http://localhost:3000/evidence/DOC-2607-0001)

### Financial, Communications, and Credentials

- [Financial controls](http://localhost:3000/staff/financial-controls)
- [Financial reports](http://localhost:3000/staff/financial-reports)
- [Notifications and communications](http://localhost:3000/notifications)
- [Credential expiration and renewal monitoring](http://localhost:3000/credentials/expiration)
- [Organization settings](http://localhost:3000/settings/organization)
- [Account users](http://localhost:3000/account/users)

## Product Process Captured

Current onboarding process:

1. Client, notary, or other participant completes the contact/access form.
2. Notarix Signings staff receives the intake request.
3. Staff initiates the profile from the intake record.
4. The profile completion link is sent to the client, notary, or participant.
5. The participant completes profile fields and uploads required credentials,
   forms, certificates, or evidence.
6. Participant submits the profile for staff review.
7. GenAdmin verifies each profile item for accuracy and validity.
8. Once every applicable item has a green check, GenAdmin submits the file for
   elevated approval.
9. Admin or SuperAdmin performs final approval.
10. Approved profile number is generated only after activation.
11. Client, notary, or participant receives email and phone/SMS notification of
   approval.

Important two-step approval rule:

- GenAdmin may verify profile data and submit for approval.
- Admin or SuperAdmin must provide final activation approval.
- Payable activation and financial changes require Admin or SuperAdmin authority.

## Design Composition Standard

Continue using the executive operations composition:

- Restrained top navigation
- Operational title and status chips
- Compact summary band
- Left case/control index
- Central matrix/table or case file content
- Right command/control panel
- Visible status feedback after actions
- Audit and sensitive reports separated into role-restricted report pages

Avoid returning to:

- Long stacked cards for operational review
- Generic dashboard blocks
- Oversized decorative elements
- Noisy security copy
- Temporary placeholders presented as production functions

## Tomorrow Morning Startup Plan

1. Open this document first.
2. Confirm Vercel TLS cleanup remains quiet in deployment/runtime logs.
3. Confirm `npm audit` and `npm run env:audit` remain clean after future package
   or environment changes.
4. Run:

```bash
npm run callbacks:replay -- --base-url=https://notarix.live --send
```

5. Confirm callback statuses remain `200`.
6. Open:

```text
https://notarix.live/staff/deployment-readiness
https://notarix.live/staff/provider-environment
https://notarix.live/staff/evidence-intake
https://notarix.live/notifications
```

7. Continue with production identity-provider claim binding and provider-native
   AWS callback validation.

## Open Risks

- `NODE_TLS_REJECT_UNAUTHORIZED` is explicitly set to `1` in Vercel Production
  as a safety override.
- `NODE_EXTRA_CA_CERTS` is explicitly set to
  `/etc/ssl/certs/ca-certificates.crt` in Vercel Production to avoid the prior
  missing local certificate bundle path.
- Production dependency audit is clean as of `dpl_5wjupjmcHyzoL2ehXuPUmzkV3ymh`.
- `DISABLE_AUTH` has been removed from Vercel Production and the Notarix
  Signings runtime contract.
- Production identity claims still need to be bound to a real identity provider.
- Email/SMS/provider callbacks still need final provider-native payload testing.
- Malware scanning provider and object storage callbacks need live provider validation.
- Immutable audit storage, backups, retention enforcement, and monitoring remain
  required before full production launch.
