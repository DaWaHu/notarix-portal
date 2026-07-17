# Notarix Signings Portal

Security-first portal foundation for Notarix Signings, a professional notarial
transaction platform for traditional notarization, electronic notarization, and
remote online notarization.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
```

The production target is Vercel hosting with AWS services and Postgres.

## Product Rules

- Use the brand name `Notarix Signings`.
- Treat the Order as the central system record.
- Display dates like `Dec 31 2026`.
- Display times in 12-hour format with a time zone, such as `6:00 PM ET`.
- Notarix available hours are `6:00 AM ET` through `9:00 PM ET`.
- Restrict RON access to notaries validated as authorized for the applicable
  jurisdiction and service type.
- Build every feature around MFA, RBAC, least privilege, audit logging, signed
  document access, upload validation, environment separation, secret management,
  and data retention.

## Included Shape

- application routes live under `app/`
- `db/schema.ts` defines the Postgres workflow schema
- `drizzle.config.ts` generates Postgres migrations
- AWS S3 stores evidence and order-document bytes
- Vercel Environment Variables provide runtime secrets

## Workspace Auth Headers

OpenAI workspace sites can read the current user's email from
`oai-authenticated-user-email`.

SIWC-authenticated workspace sites may also receive
`oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty
`name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by
`oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs
optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send
  anonymous visitors through Sign in with ChatGPT.
- Use `chatGPTSignInPath(returnTo)` and `chatGPTSignOutPath(returnTo)` for
  browser links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in
  or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because
  they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the
OAuth cookies, and identity header injection. Do not implement app routes for
those reserved paths. Routes that do not import and call the helper remain
anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the
the hosting platform's access policy controls for workspace-wide restrictions,
or enforce explicit server-side membership, RBAC claims, or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write
actions tied to the current ChatGPT user. Leave public content anonymous.

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the Next.js production build
- `npm test`: build and run production readiness checks
- `npm run db:generate`: generate Drizzle migrations after schema changes
- `npm run db:readiness`: verify Postgres migration readiness
- `npm run deploy:readiness`: verify Vercel/AWS/Postgres runtime readiness

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Drizzle Postgres Guide](https://orm.drizzle.team/docs/get-started/postgresql-new)
