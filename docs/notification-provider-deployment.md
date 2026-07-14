# Notification Provider Deployment Contract

This document records the production environment contract for Notarix Signings
email, SMS, phone-message, and provider delivery callback handling.

Do not store provider credentials, API keys, webhook secrets, signing keys, or
tokens in source files. Configure all production values as Sites runtime
environment secrets for project `appgprj_6a516eb2e3908191b8b57cedf686b8e4`.

## Runtime Secrets

Email delivery:

- `NOTARIX_EMAIL_API_KEY` or `SENDGRID_API_KEY`
- `NOTARIX_EMAIL_WEBHOOK_SECRET`, `SENDGRID_WEBHOOK_SECRET`, or
  `NOTARIX_NOTIFICATION_WEBHOOK_SECRET`

SMS and phone delivery:

- `NOTARIX_SMS_API_KEY` or `TWILIO_AUTH_TOKEN`
- `TWILIO_ACCOUNT_SID`
- `NOTARIX_SMS_WEBHOOK_SECRET`, `TWILIO_AUTH_TOKEN`, or
  `NOTARIX_NOTIFICATION_WEBHOOK_SECRET`

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

Internal provider-normalized JSON:

```json
{
  "notificationId": "NTF-2607-0001",
  "deliveryStatus": "Delivered",
  "provider": "Production email provider",
  "providerMessageId": "EML-NTF-2607-0001"
}
```

SendGrid-style event payload:

```json
[
  {
    "event": "delivered",
    "sg_message_id": "sendgrid-message-id",
    "custom_args": {
      "notificationId": "NTF-2607-0001"
    }
  }
]
```

Twilio-style form callback:

```text
notificationId=NTF-2607-0002&MessageSid=SM26070002&MessageStatus=delivered
```

The callback route normalizes these fields into the retained notification
delivery event before updating delivery status.

## Deployment Validation

Before launch:

1. Configure the production email and SMS secrets in Sites runtime environment.
2. Confirm `/staff/provider-environment` shows email and SMS provider credentials
   and webhook secrets as configured.
3. Send one signed email callback replay to `/notifications/provider-callback`.
4. Send one signed SMS or phone callback replay to `/notifications/provider-callback`.
5. Confirm `/notifications` shows the provider message ID, callback status, and
   updated delivery status.
6. Confirm phone/SMS delivery still blocks when consent is missing.

Current production status at the time of this document: no Sites notification
runtime secrets were configured, so production delivery credentials still need
to be added before launch.
