# Cognito And Google Workspace Identity Plan

This document records the approved Notarix Signings identity direction. It is a
configuration guide only. Do not store passwords, private keys, client secrets,
recovery codes, security-key data, or session-cookie secrets in this repository.

## Approved Architecture

Notarix Signings will use Amazon Cognito as the central portal identity provider.

- One Cognito user pool will serve staff, clients, notaries, and authorized
  observers.
- Staff authentication will federate through the existing Google Workspace
  domain, `notarix.live`.
- Clients, notaries, and authorized observers will use Cognito-managed accounts.
- Application roles will remain server-controlled by Notarix Signings. Cognito
  establishes identity; the portal database decides portal authority.
- Vercel Authentication must not be used as the portal application-user identity
  system. Vercel deployment protection may continue protecting preview and
  development deployments.
- Existing authentication remains the rollback path until Cognito has been
  configured, tested, and explicitly approved for production cutover.

## Production Roles

Use these canonical role identifiers in new identity work:

```text
SUPER_ADMIN
ADMIN
GEN_ADMIN
NOTARY
CLIENT
OBSERVER
```

The initial `SUPER_ADMIN` is:

```text
owner@dawahucollective.com
```

This account is assigned exclusively to the owner and must never be shared.

## Required Assurance Rules

- Staff accounts require MFA.
- `ADMIN` and `SUPER_ADMIN` accounts require a passkey or FIDO2 hardware
  security key.
- Staff assurance is primarily enforced in Google Workspace because staff sign in
  through Google Workspace federation.
- The portal must still verify the Cognito session, load the server-controlled
  role from Postgres, and deny actions that do not meet the required authority.

## AWS Cognito Configuration

Create one Cognito user pool only after owner approval to perform the AWS setup.

Recommended user pool configuration:

- Region: `us-east-1`.
- Sign-in identifier: email.
- User pool domain: prefer `auth.notarix.live` if DNS and certificate setup are
  ready; otherwise use a Cognito prefix domain temporarily.
- App client flow: authorization code flow.
- OAuth scopes: `openid`, `email`, `profile`.
- Token revocation: enabled.
- Refresh token rotation: enabled.
- App client callback URLs:
  - `https://notarix.live/auth/callback`
  - `http://localhost:3000/auth/callback`
- App client logout URLs:
  - `https://notarix.live/`
  - `http://localhost:3000/`
- Assign the Google Workspace SAML identity provider to the app client.

Approved Cognito identifiers:

```text
User pool ID: us-east-1_HL3XdEIQ9
App client ID: 4hbsqt0rqt7onqp1nk8qcu7k3l
Issuer: https://cognito-idp.us-east-1.amazonaws.com/us-east-1_HL3XdEIQ9
JWKS URL: https://cognito-idp.us-east-1.amazonaws.com/us-east-1_HL3XdEIQ9/.well-known/jwks.json
Staff IdP name: GoogleWorkspace
Allowed staff domain: dawahucollective.com
Production callback: https://notarix.live/auth/callback
Local callback: http://localhost:3000/auth/callback
Production logout destination: https://notarix.live/
Local logout destination: http://localhost:3000/
```

For Google Workspace SAML federation, Cognito will provide these values:

```text
SP Entity ID: urn:amazon:cognito:sp:<user_pool_id>
ACS URL: https://<cognito-domain>/saml2/idpresponse
```

## Google Workspace Configuration

In Google Admin, create a custom SAML application for Notarix Signings.

Recommended Google Workspace configuration:

- App name: `Notarix Signings Portal`
- Service Provider ACS URL: Cognito `/saml2/idpresponse`
- Service Provider Entity ID: `urn:amazon:cognito:sp:<user_pool_id>`
- Name ID: a stable staff identifier. Primary email is acceptable only if
  Notarix accepts the operational impact of future email changes.
- Attribute mappings:
  - `email`
  - `given_name`
  - `family_name`
  - `name`
- App access: restricted to approved Notarix staff groups or organizational
  units under `dawahucollective.com`.
- MFA policy: enforced for all staff.
- Passkey/security-key policy: enforced for Admin and Super Admin staff groups.

Do not map Google group membership as the final application authority unless the
portal also reconciles it with the server-controlled role table. The database
must remain the authority for Notarix portal roles.

## Environment Variable Names

Add these names only after the Cognito and Google Workspace configuration
identifiers exist. Values belong in local `.env.local` for local development and
in Vercel Environment Variables for deployed environments.

```text
NOTARIX_AUTH_PROVIDER
NOTARIX_AUTH_MODE
NOTARIX_OWNER_SUPER_ADMIN_EMAIL
NOTARIX_COGNITO_REGION
NOTARIX_COGNITO_USER_POOL_ID
NOTARIX_COGNITO_USER_POOL_DOMAIN
NOTARIX_COGNITO_CLIENT_ID
NOTARIX_COGNITO_CLIENT_SECRET
NOTARIX_COGNITO_ISSUER
NOTARIX_COGNITO_JWKS_URL
NOTARIX_COGNITO_REDIRECT_URI
NOTARIX_COGNITO_LOGOUT_URI
NOTARIX_COGNITO_STAFF_IDP_NAME
NOTARIX_COGNITO_ALLOWED_STAFF_DOMAIN
NOTARIX_SESSION_COOKIE_SECRET
NOTARIX_SESSION_COOKIE_NAME
```

`NOTARIX_AUTH_MODE` should remain on the existing authentication path until the
Cognito callback, JWT verification, role lookup, and route protection have been
tested in preview and approved for production.

## Migration Guardrails

1. Keep current authentication active.
2. Create Cognito and Google Workspace resources manually.
3. Add Cognito identifiers to local development only.
4. Implement Cognito auth routes and JWT verification behind an auth-mode flag.
5. Add Postgres-backed user and role records.
6. Seed `owner@dawahucollective.com` as `SUPER_ADMIN`.
7. Test the full flow locally.
8. Add Cognito variables to Vercel Preview.
9. Test preview with Vercel deployment protection still enabled.
10. Convert staff pages from generic authentication to role-specific access.
11. Cut over production only after owner approval.

## Rollback

Rollback must be simple and immediate:

- Keep the existing authentication route available until Cognito has stabilized.
- Keep an auth-mode flag that can restore the existing authentication path.
- Keep Vercel deployment rollback available.
- Do not delete Cognito resources during a rollback.
- Do not remove the server-controlled `owner@dawahucollective.com` role
  assignment.

## Next Configuration Action

The next owner-approved manual action is to confirm the Cognito user pool domain
or custom domain value. Do not paste the app client secret or any private
material into chat or source.
