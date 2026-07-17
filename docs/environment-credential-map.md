# Notarix Signings Environment Credential Map

This map defines the credential titles Notarix Signings expects before production
provider credentials are entered. It is safe to commit because it contains names
only, not secret values.

## First Principle

Do not paste production secrets into source files, documentation, tests, or chat.
Real values belong only in local `.env.local` during development and in the
deployment provider's encrypted environment-secret store for production.

## Current Local File Status

`.env.local` is intentionally ignored by Git. If it exists locally, it may be
empty until real values are entered.

## Canonical Notarix Names

Use Notarix-owned names when possible so the portal is not locked to one
provider's vocabulary.

| Purpose | Preferred Notarix name | Accepted provider-specific name | Notes |
| --- | --- | --- | --- |
| Application URL | `APP_URL` | none | Public portal URL used in generated links. |
| Maintenance lock | `SITE_LOCKED` | none | Optional. Set `true` only during controlled maintenance windows. |
| Auth/session signing secret | `AUTH_SECRET` | none | Must be a high-entropy secret. |
| Auth trusted host flag | `AUTH_TRUST_HOST` | none | Required only when the auth provider needs trusted host handling. |
| Local auth bypass | `DISABLE_AUTH` | none | Local preview only. Never enable in production. |
| Seed owner email | `SEED_OWNER_EMAIL` | none | Initial owner account for seed/reconciliation workflows. |
| Seed owner password | `SEED_OWNER_PASSWORD` | none | Local/bootstrap only; rotate before production. |
| Seed owner first name | `SEED_OWNER_FIRST_NAME` | none | Seed profile metadata. |
| Seed owner last name | `SEED_OWNER_LAST_NAME` | none | Seed profile metadata. |
| Database connection URL | `DATABASE_URL` | none | Production Postgres connection URL stored as a Vercel Environment Variable. |
| Email provider | `AWS_SES_REGION`, `AWS_SES_FROM_EMAIL` | none | AWS SES is the primary operational email provider. |
| Email webhook secret | `NOTARIX_EMAIL_WEBHOOK_SECRET` | none | Used to verify provider delivery callbacks when callback signing is configured. |
| Shared notification webhook secret | `NOTARIX_NOTIFICATION_WEBHOOK_SECRET` | none | May be used for both email and SMS callbacks when a shared HMAC secret is selected. |
| AWS SES region | `AWS_SES_REGION` | `AWS_REGION` | Region used for SES email delivery. |
| AWS SES from email | `AWS_SES_FROM_EMAIL` | none | Verified SES sender address. |
| AWS SES delivery copy | `AWS_SES_TO_EMAIL` | none | Optional test or administrative delivery address. |
| SMS provider | `AWS_SMS_REGION`, `AWS_PINPOINT_APPLICATION_ID`, `AWS_SNS_ORIGINATION_NUMBER` | none | AWS SNS or Pinpoint is the primary SMS and phone-message provider path. |
| SMS webhook secret | `NOTARIX_SMS_WEBHOOK_SECRET` | none | Used to verify provider callbacks when callback signing is configured. |
| AWS region | `AWS_REGION` | `AWS_SES_REGION`, `AWS_DEFAULT_REGION` | Use one region consistently unless a service requires separate regional config. |
| AWS access key | `AWS_ACCESS_KEY_ID` | none | Not the same thing as SendGrid or Twilio keys. |
| AWS secret key | `AWS_SECRET_ACCESS_KEY` | none | Pair with `AWS_ACCESS_KEY_ID`; never paste into source. |
| Evidence/document bucket | `NOTARIX_STORAGE_BUCKET` | `S3_BUCKET_NAME` | Bucket for encrypted evidence/order documents. |
| Storage region | `NOTARIX_STORAGE_REGION` | `AWS_REGION` | Region where the bucket is hosted. |
| Storage endpoint | `NOTARIX_STORAGE_ENDPOINT` | none | Needed for S3-compatible storage such as R2. |
| Shared evidence webhook secret | `NOTARIX_EVIDENCE_WEBHOOK_SECRET` | none | May be used for both upload-completion and malware-scan callbacks. |
| Storage webhook secret | `NOTARIX_STORAGE_WEBHOOK_SECRET` | none | Optional dedicated callback secret for storage upload completion events. |
| Malware webhook secret | `NOTARIX_MALWARE_WEBHOOK_SECRET` | none | Optional dedicated callback secret for malware scan provider events. |

## Important Non-Equivalencies

`SENDGRID_API_KEY` is not the same as `AWS_ACCESS_KEY_ID`. SendGrid is not
required for the AWS-primary setup.

`TWILIO_AUTH_TOKEN` is not the same as `AWS_SECRET_ACCESS_KEY`. Twilio is not
required for the AWS-primary setup.

`S3_BUCKET_NAME` is not a credential. It is the name of the storage bucket.

`DATABASE_URL` is the production Postgres connection string for the Vercel
runtime. It is not an AWS key, notification secret, or storage bucket name.

## Recommended First Conversion

Start with storage because the portal already needs secure evidence and order
document handling.

If your old file has:

```text
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
S3_BUCKET_NAME
```

Add these Notarix aliases alongside the old names:

```text
NOTARIX_STORAGE_REGION=<same value as AWS_REGION>
NOTARIX_STORAGE_BUCKET=<same value as S3_BUCKET_NAME>
```

Do not duplicate `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` into new names
unless we later choose a storage provider abstraction that requires it.

## AWS SES Email Conversion

If AWS SES is the selected email provider, the portal can treat email as
configured when these values exist:

```text
AWS_SES_REGION
AWS_SES_FROM_EMAIL
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

`AWS_SES_TO_EMAIL` may be kept for local testing or administrative delivery
verification, but production notification routing should use the recipient tied
to the workflow record.

## AWS SMS Conversion

If AWS SNS or Pinpoint is the selected SMS provider, the portal can treat SMS as
configured when these values exist:

```text
AWS_SMS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

Plus one origination/application value:

```text
AWS_PINPOINT_APPLICATION_ID
```

or:

```text
AWS_SNS_ORIGINATION_NUMBER
```

Twilio should be considered only if Notarix Signings later needs advanced
two-way texting, voice workflow tooling, or carrier-compliance dashboards that
AWS does not satisfy cleanly.
