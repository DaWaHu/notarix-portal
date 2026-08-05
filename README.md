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

## Identity And Authorization

Notarix Signings is hosted on Vercel. AWS Cognito is the approved application
identity provider, with Google Workspace SAML federation for staff. Notarix owns
its portal users, identity links, sessions, role assignments, and server-side
authorization policies in Postgres.

Application entry points are `/auth/login`, `/auth/logout`, and
`/auth/callback`. Non-local requests without a valid Notarix portal session fail
closed. Vercel Deployment Protection is an independent Preview perimeter and is
not an application identity provider.

Strictly local staff-preview behavior is limited to localhost, uses an
application-owned cookie, and must never be enabled on Vercel Preview or
Production. Runtime identity must not be inferred from externally supplied
request headers.

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the Next.js production build
- `npm run references:auth`: reject unauthorized provider-specific authentication references
- `npm test`: build and run production readiness checks
- `npm run db:generate`: generate Drizzle migrations after schema changes
- `npm run db:readiness`: verify Postgres migration readiness
- `npm run deploy:readiness`: verify Vercel/AWS/Postgres runtime readiness

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Drizzle Postgres Guide](https://orm.drizzle.team/docs/get-started/postgresql-new)
