# Vercel Runtime Secret Setup

This document records the production runtime secret setup for Notarix Signings
under the Vercel + AWS services + Postgres architecture. It contains secret
names and deployment homes only. Do not store real secret values in this
repository.

## Source Of Truth

Runtime secret names and production homes are recorded in:

```text
deployment-runtime-secrets.json
```

Check deployment readiness locally:

```bash
npm run deploy:readiness
```

Check database and migration readiness:

```bash
npm run db:readiness
```

Check readiness with a known deployed URL:

```bash
npm run deploy:readiness -- --production-url=https://YOUR-PRODUCTION-URL
```

Staff-facing readiness is available to Admin and Super Admin users at:

```text
/staff/deployment-readiness
```

That page displays Vercel environment-variable presence and provider readiness
status only. It does not display secret values.

## Required Production Homes

Required production values must be configured in Vercel Environment Variables.

Core application:

- `APP_URL`
- `AUTH_SECRET`
- `AUTH_TRUST_HOST`
- `DISABLE_AUTH` set to `false`

Database:

- `DATABASE_URL`

AWS and storage:

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `NOTARIX_STORAGE_REGION`
- `NOTARIX_STORAGE_BUCKET`

Evidence callback verification:

- `NOTARIX_EVIDENCE_WEBHOOK_SECRET`

Email and notification callback verification:

- `AWS_SES_REGION`
- `AWS_SES_FROM_EMAIL`
- `NOTARIX_NOTIFICATION_WEBHOOK_SECRET`

Optional specialized secrets may be added when Notarix separates providers:

- `NOTARIX_STORAGE_WEBHOOK_SECRET`
- `NOTARIX_MALWARE_WEBHOOK_SECRET`
- `NOTARIX_EMAIL_WEBHOOK_SECRET`
- `NOTARIX_SMS_WEBHOOK_SECRET`
- `AWS_SMS_REGION`
- `AWS_PINPOINT_APPLICATION_ID`
- `AWS_SNS_ORIGINATION_NUMBER`

## Deploy-Readiness Sequence

1. Configure all required runtime values in Vercel Environment Variables.
2. Confirm `npm run db:readiness` reports `ready_for_postgres`.
3. Apply the Postgres migration SQL to the production database.
4. Build and deploy the validated source to Vercel.
5. Confirm `/staff/deployment-readiness` shows no unresolved launch blockers.
6. Confirm `/staff/provider-environment` reports provider readiness without
   exposing secret values.
7. Run:

```bash
npm run callbacks:replay -- --base-url=https://YOUR-PRODUCTION-URL --send
```

8. Confirm `/notifications` shows callback delivery status.
9. Confirm `/staff/evidence-intake` and `/evidence/DOC-2607-0001` show the
   signed evidence callback status transitions.

Production launch should not proceed until the deployed callback replay accepts
valid signed callbacks and rejects unsigned or invalid callbacks.
