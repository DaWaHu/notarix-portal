# Notarix Signings Working-Tree Inventory — Aug 5 2026

No files were deleted or reset during inventory. Dispositions are proposed and
must be reviewed before uncertain material is removed.

Phase 1 result: all approved project changes were committed and pushed.
Generated caches and unrelated `.codex-work` material remain preserved and
ignored. No uncertain file was deleted.

Superseding disposition — Aug 5 2026: owner-authorized authentication
containment removed the legacy compatibility files listed below after evidence
showed they trusted unauthenticated provider headers and remained reachable.
They remain listed here as historical evidence; the active design uses
`app/portal-auth.ts`, Notarix sessions, Cognito, and server-side RBAC.

## Modified tracked files

| File | Classification | Proposed disposition |
| --- | --- | --- |
| `app/access-policy.ts` | Intentional identity/RBAC code | Preserve; review/test; commit in identity sequence |
| `app/chatgpt-auth.ts` | Superseded legacy auth compatibility code | Removed by the authorized authentication-containment checkpoint |
| `app/evidence-repository.ts` | Intentional Postgres/storage code | Preserve; test; commit with database recovery sequence |
| `app/notification-repository.ts` | Intentional Postgres/provider code | Preserve; remove unused import; test |
| `app/signout-with-chatgpt/route.ts` | Superseded legacy auth route | Removed by the authorized authentication-containment checkpoint |
| `app/staff/access-control/page.tsx` | Intentional identity UI | Preserve; commit with identity work |
| `app/staff/document-validation/page.tsx` | Intentional identity UI | Preserve; commit with identity work |
| `app/staff/elevated-approval/[requestId]/page.tsx` | Intentional identity UI | Preserve; commit with identity work |
| `app/staff/elevated-approval/page.tsx` | Intentional identity UI | Preserve; commit with identity work |
| `app/staff/financial-controls/page.tsx` | Intentional identity UI | Preserve; commit with identity work |
| `app/staff/financial-reports/page.tsx` | Intentional identity UI | Preserve; commit with identity work |
| `app/staff/integrations/page.tsx` | Intentional identity UI | Preserve; commit with identity work |
| `app/staff/platform/page.tsx` | Intentional identity/platform UI | Preserve; commit with identity work |
| `app/staff/retention/page.tsx` | Intentional identity UI | Preserve; commit with identity work |
| `app/staff/system-health/page.tsx` | Intentional identity UI | Preserve; commit with identity work |
| `db/index.ts` | Intentional database correction | Preserve; commit with database recovery sequence |
| `db/schema.ts` | Intentional identity schema | Preserve; review migration parity; commit with identity sequence |
| `deployment-runtime-secrets.json` | Configuration manifest; no value/secret fields detected | Preserve; commit with identity/runtime documentation |
| `docs/deployment-runtime-secret-setup.md` | Documentation | Preserve; reconcile with master plan |
| `docs/environment-credential-map.md` | Documentation | Preserve; reconcile with actual Vercel inventory |
| `drizzle.config.ts` | Intentional database configuration | Preserve; commit with database recovery sequence |
| `drizzle/meta/_journal.json` | Generated migration metadata | Preserve with reviewed migration only |
| `examples/notarix-env-template.txt` | Example configuration | Preserve; confirm placeholders only |
| `package-lock.json` | Generated dependency lock | Preserve; verify diff origin and audit |
| `package.json` | Intentional scripts/dependencies | Preserve; add Phase 1 gates |
| `scripts/audit-env-local.mjs` | Intentional readiness tooling | Preserve and test |
| `scripts/db-readiness.mjs` | Intentional readiness tooling | Preserve and test |
| `tests/source-contract.test.mjs` | Intentional tests | Preserve; extend Phase 1 contracts |

## Untracked project files

| File | Classification | Proposed disposition |
| --- | --- | --- |
| `app/auth-config.ts` | Intentional Cognito configuration code | Preserve; review/test; commit in identity sequence |
| `app/auth/callback/route.ts` | Intentional Cognito callback | Preserve; security test |
| `app/auth/login/route.ts` | Intentional Cognito login | Preserve; security test |
| `app/auth/logout/route.ts` | Intentional Cognito logout | Preserve; security test |
| `app/cognito-jwt.ts` | Intentional JWT verification | Preserve; adversarial tests |
| `app/cognito-session.ts` | Intentional session implementation | Preserve; rotation/revocation tests |
| `app/portal-user-repository.ts` | Intentional database role/user code | Preserve; authorization tests |
| `db/database-url.ts` | Intentional database URL sanitizer | Preserve; unit test; database sequence |
| `docs/cognito-google-workspace-identity-plan.md` | Documentation/approved direction | Preserve; owner approval gates remain |
| `docs/executive-handoff-2026-07-18.md` | Historical documentation | Preserve and commit as history; master plan supersedes status claims |
| `drizzle/0001_nebulous_slipstream.sql` | Generated identity migration | Preserve; review; preview-only migration after approval |
| `drizzle/meta/0001_snapshot.json` | Generated migration metadata | Preserve with migration |
| `scripts/apply-postgres-baseline.mjs` | Intentional guarded database tooling | Preserve; never use for repair |
| `scripts/inspect-production-db.mjs` | Intentional read-only inspection tooling | Preserve; extend identity-table checks |
| `scripts/seed-postgres-baseline.ts` | Intentional idempotent seed tooling | Preserve; review production guards |
| `scripts/validate-cognito-env.mjs` | Intentional identity readiness tooling | Preserve and test |
| `tsconfig.tsbuildinfo` | Generated TypeScript cache | Ignore; remove only after disposition approval or as routine regenerated output |

## Untracked unrelated workspace directory

`.codex-work/powerbi-patient-services/` is unrelated Power BI temporary/generated
work and should not be committed to Notarix. Preserve it pending owner disposition
and add `.codex-work/` to `.gitignore`. Inventory:

- `Encounters.png`
- `Patients-Unique.png`
- `Patients.png`
- `Program Type.png`
- `Services.png`
- `build.mjs`
- `details.json`
- `final-renders/00-Dashboard Preview.png`
- `final-renders/01-Fact Program Metrics.png`
- `final-renders/02-Dim Program.png`
- `final-renders/03-Dim RSC.png`
- `final-renders/04-Data Dictionary.png`
- `final-renders/05-Power BI Build Notes.png`
- `inspect.mjs`
- `summary.ndjson`
- `validate.mjs`

## Sensitive-material review

- `.env.local` is ignored and was inspected by variable name only. It contains
  credential-bearing names and must never be committed.
- `deployment-runtime-secrets.json` contains a manifest of names/homes; no
  `value` or `secret` fields were detected.
- No proposed documentation contains secret values.
- Vercel environment values were not retrieved or recorded.

## Proposed commit sequence

1. Production database recovery utilities and historical Jul 18 handoff.
2. Cognito/Google Workspace code, schema, migration, tests, and configuration docs.
3. Production-readiness governance documents and CI/quality gates.
4. Targeted lint/build corrections.

This sequence is a proposal only. Review diffs and test each commit independently
before staging. Production deployment is not authorized by this inventory.
