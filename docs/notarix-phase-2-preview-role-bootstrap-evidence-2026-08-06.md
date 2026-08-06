# Notarix Signings Phase 2 Preview Role Bootstrap Evidence

Date and time: Aug 6 2026, 10:53 AM ET

## Target and result

| Control | Evidence |
| --- | --- |
| Project | `plain-shadow-93565861` (`notarix-portal-preview`) |
| Branch | `br-restless-pond-aucwu8b2` (`main`) |
| Endpoint | `ep-orange-fog-ausod744` |
| Database / executor | `neondb` / `neondb_owner` |
| PostgreSQL | 17.10 (`4f20678`) |
| Bootstrap SHA-256 | `a765ae7d2ba5804e7822877a7d5494b85fedc2552886cb004fb5a0d495a25333` |
| Rollback SHA-256 | `0819a9e1d6272c80c76a10b0d5f9a18a9e9494bc4df53206e0abfc039e8bb242` |
| Transaction | All 31 statements succeeded; `COMMIT` succeeded |

Preflight confirmed both roles absent, no application relations/routines or
migration journal, no conflicting Preview default ACL, and the exact approved
Neon control-plane identifiers. Production was not queried.

## Post-commit verification

- `notarix_preview_app`: LOGIN, NULL password, all elevated attributes false,
  NOINHERIT, connection limit 20, CONNECT on `neondb`, USAGE and no CREATE on
  `public`.
- `notarix_preview_migrator`: LOGIN, NULL password, all elevated attributes
  false, NOINHERIT, connection limit 2, CONNECT on `neondb`, USAGE and CREATE on
  `public`.
- Each role has exactly one membership path to `neondb_owner`, granted by
  `cloud_admin` OID 10 with ADMIN true, SET false, and INHERIT false. No temporary
  owner-granted membership remains and neither Preview role is a member of
  another role.
- Migrator-owned future tables grant the runtime role non-grantable SELECT,
  INSERT, UPDATE, and DELETE. Future sequences grant non-grantable USAGE and
  SELECT. The global future-function ACL has owner-only EXECUTE and no PUBLIC or
  runtime-role grant.
- Owned objects: 0. Application relations: 0. Application routines: 0.
  Migration journals: 0. Migration 0001 was not applied.

No credential, password, connection string, application data, Vercel variable,
integration, deployment, Cognito configuration, Google Workspace configuration,
or Production change occurred. The next approval gate is a secure credential-
generation and Vercel Preview-only environment-mapping plan.
