# Notification Provider Deployment Contract

This document records the production environment contract for Notarix Signings
email, SMS, phone-message, and provider delivery callback handling.

Do not store provider credentials, API keys, webhook secrets, signing keys, or
tokens in source files. Configure all production values as Vercel Environment
Variables for the Notarix Signings project.

## Runtime Secrets

Email delivery:

- `AWS_SES_REGION`
- `AWS_SES_FROM_EMAIL`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `NOTARIX_EMAIL_WEBHOOK_SECRET` or `NOTARIX_NOTIFICATION_WEBHOOK_SECRET`

SMS and phone delivery:

- `AWS_SMS_REGION` or `AWS_REGION`
- `AWS_PINPOINT_APPLICATION_ID` or `AWS_SNS_ORIGINATION_NUMBER`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `NOTARIX_SMS_WEBHOOK_SECRET` or `NOTARIX_NOTIFICATION_WEBHOOK_SECRET`

Shared callback headers expected by the current application contract:

- `x-notarix-provider-timestamp`
- `x-notarix-provider-signature`

The signature is HMAC-SHA256 over:

```text
x-notarix-provider-timestamp + "." + raw request body
```

Production provider adapters may map the provider-native signature into this
contract before calling `/notifications/provider-callback`, or the route may be
extended to verify that provider's native signature scheme directly.

## Callback URL

Use this application endpoint for delivery callbacks:

```text
/notifications/provider-callback
```

## Supported Callback Payload Shapes

AWS provider-normalized JSON:

```json
{
  "notificationId": "NTF-2607-0001",
  "deliveryStatus": "Delivered",
  "provider": "AWS SES email provider",
  "providerMessageId": "EML-NTF-2607-0001"
}
```

AWS SES-style normalized event payload:

```json
{
  "notificationId": "NTF-2607-0001",
  "deliveryStatus": "Delivered",
  "provider": "AWS SES email provider",
  "providerMessageId": "ses-message-id"
}
```

AWS SMS-style normalized callback:

```json
{
  "notificationId": "NTF-2607-0002",
  "deliveryStatus": "Delivered",
  "provider": "AWS SNS or Pinpoint SMS provider",
  "providerMessageId": "aws-sms-message-id"
}
```

The callback route normalizes provider callback fields into the retained
notification delivery event before updating delivery status.

## Deployment Validation

Before launch:

1. Configure the production email and SMS secrets in Vercel Environment Variables.
2. Confirm `/staff/provider-environment` shows email and SMS provider credentials
   and webhook secrets as configured.
3. Send one signed email callback replay to `/notifications/provider-callback`.
4. Send one signed SMS or phone callback replay to `/notifications/provider-callback`.
5. Confirm `/notifications` shows the provider message ID, callback status, and
   updated delivery status.
6. Confirm phone/SMS delivery still blocks when consent is missing.

Use `npm run callbacks:replay -- --base-url=https://YOUR-PRODUCTION-URL --send`
to run signed callback validation for notification, evidence upload, and malware
callback endpoints after runtime secrets are configured.

Current production status at the time of this document: notification runtime
secrets must be configured in Vercel before production delivery can launch.
