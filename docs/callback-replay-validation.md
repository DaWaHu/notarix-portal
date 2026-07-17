# Callback Replay Validation

This document records the Notarix Signings signed-callback replay process for
local preview and deployed production validation.

Do not paste webhook secrets, access keys, API keys, or callback signatures into
source files, tickets, screenshots, or user-facing documentation.

## Replay Tool

Run a dry-run plan without sending callbacks:

```bash
npm run callbacks:replay -- --base-url=http://localhost:3000
```

Send signed callback replays to a running local or deployed application:

```bash
npm run callbacks:replay -- --base-url=http://localhost:3000 --send
```

For a deployed site:

```bash
npm run callbacks:replay -- --base-url=https://YOUR-PRODUCTION-URL --send
```

Optional identifiers:

```bash
npm run callbacks:replay -- --base-url=http://localhost:3000 --send --notification-id=NTF-2607-0001 --evidence-id=DOC-2607-0001
```

## Callback Coverage

The replay tool signs and posts:

- Email delivery callback to `/notifications/provider-callback`
- Evidence upload completion callback to `/staff/evidence-upload-callback`
- Evidence malware clearance callback to `/staff/evidence-malware-callback`

## Secret Selection

Notification callbacks use:

- `NOTARIX_EMAIL_WEBHOOK_SECRET` or `NOTARIX_NOTIFICATION_WEBHOOK_SECRET`
- `NOTARIX_SMS_WEBHOOK_SECRET` or `NOTARIX_NOTIFICATION_WEBHOOK_SECRET`

Evidence callbacks use:

- `NOTARIX_STORAGE_WEBHOOK_SECRET` or `NOTARIX_EVIDENCE_WEBHOOK_SECRET`
- `NOTARIX_MALWARE_WEBHOOK_SECRET` or `NOTARIX_EVIDENCE_WEBHOOK_SECRET`

Local preview falls back to deterministic local-preview secrets so the test
suite can verify signing behavior without exposing production values.

## Expected Result

Signed callback replays should not return `401`. A `404` can still be acceptable
when the callback signature is valid but the target record does not exist in the
current local or deployed database.

Production launch should not proceed until callback replay succeeds against the
deployed URL with real runtime secrets configured.
