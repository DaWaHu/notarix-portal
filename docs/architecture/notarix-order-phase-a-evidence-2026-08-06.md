# Notarix Signings Order API Phase A Evidence — Aug 6 2026

Status: **DESIGNED / REPOSITORY IMPLEMENTED / NOT DEPLOYED**

## Hard-coded actor and authorization inventory

Line numbers reflect the Phase A checkpoint and may move after later edits.

| File/lines | Finding | Classification and risk | Remediation phase |
| --- | --- | --- | --- |
| `app/client/order-actions/route.ts:27-31` | Actor `Avery Coleman` and role `Client` are hard-coded; browser supplies target ID | Production-capable mutation can misattribute identity and lacks normalized tenant check | Client Order API slice; require Cognito subject + active organization membership |
| `app/notary/assignment-actions/route.ts:28-32` | Actor `Bernadette W Hudlin` and role `Notary` are hard-coded | Production-capable mutation can impersonate notary and lacks active assignment check | Notary assignment API slice; require Cognito subject + active normalized assignment |
| `app/staff/command-center/route.ts:111-120` | Local Preview may accept role from `x-notarix-staff-role` or payload; Production uses claim role | Local-only test mechanism is safe only while host restriction remains proven; browser role must never reach Production authority | Retain only for local synthetic testing; CI and deployment denial tests |
| `app/client/orders/page.tsx:10-12` | Loads all Orders then filters by display name `Coleman Title Group` | Cross-client data exposure risk: authorization after broad read and name-based tenancy | First client list migration; server-side normalized organization filter |
| `app/notary/assignments/page.tsx:6-13,49-51,73-79` | Credential/assignment UI is tied to a named seed notary | Display name used as profile context, not reliable authorization | Notary assignment slice; normalized user/profile relationship |
| `app/order-repository.ts:89-95` | Notary assignments inferred by `notary !== "Unassigned"` | Display string is not proof of assignment or identity | Order/notary schema migration |
| `app/order-repository.ts:255-269` | Mutation merges a seed Order with database state | Production mutation could depend on synthetic identity/display fields | Order hold Lambda transaction; Phase A now blocks seed fallback in Production but removes merge later |
| `app/operations-data.ts` | Seed actors, clients, profile numbers, Order ownership, assignments, receipts | Valid synthetic local/Preview fixtures; unsafe as Production authority/data fallback | Keep fixtures explicitly synthetic; remove all Production-capable imports domain by domain |
| `app/postgres-seed.ts` | Persists seed display relationships | Synthetic/bootstrap tooling, not authoritative normalized tenancy | Replace with normalized synthetic Preview seeding after proposed migration approval |
| Order/client/notary pages with fixed `ORD-2607-*` links | Seed navigation/fixtures | UI demonstration values can select the wrong actor/Order if treated as authority | Replace with authenticated API results; identifiers alone never authorize |

No broad route refactor occurred in Phase A. These paths remain launch blockers.

## Verified database call-site inventory

The prior count is confirmed: **10** `getOptionalDb()` call sites in
`app/order-repository.ts` and **3** in
`app/staff/command-center/store.ts`. A call site can contain multiple SQL
statements.

| File/line/symbol | Type | Authorization/audit dependency | Slice disposition |
| --- | --- | --- | --- |
| `app/order-repository.ts:52 listOrderOperations` | Read all Orders | Authorization-critical; broad read must be scoped | Later list endpoint |
| `app/order-repository.ts:68 getOrderOperation` | Read one Order | Authorization-critical | **First GET slice candidate** |
| `app/order-repository.ts:103 listOrderLifecycle` | Read lifecycle | Authorization-critical; projection-sensitive | Later Order projection |
| `app/order-repository.ts:126 listOrderCloseoutControls` | Read closeout | Role/field-sensitive | Later closeout slice |
| `app/order-repository.ts:149 listOrderDeliveryReceipts` | Read receipt | Client tenancy/document-sensitive | Later client slice |
| `app/order-repository.ts:168 listNotaryCompletionReceipts` | Read receipt | Assigned-notary/staff-sensitive | Later notary slice |
| `app/order-repository.ts:187 listAppointmentConfirmations` | Read appointments | Tenant/notary/PII-sensitive | Later appointment slice |
| `app/order-repository.ts:203 listSignerReadiness` | Read all signer readiness | Highly authorization/PII-sensitive | Later restricted signer slice |
| `app/order-repository.ts:219 listOrderSigners` | Read Order signers | Highly authorization/PII-sensitive | Later restricted signer slice |
| `app/order-repository.ts:246 persistOrderCommandTransition` | Order upsert mutation | Authorization and audit critical; currently separate transaction | **First place-hold slice candidate** |
| `app/staff/command-center/store.ts:563 listPersistedCommandCenterReceipts` | Three-table read | Audit-sensitive | Later audit query endpoint |
| `app/staff/command-center/store.ts:616 getPersistedCommandCenterReceipt` | Three sequential reads | Audit-sensitive | Later audit receipt endpoint |
| `app/staff/command-center/store.ts:792 persistCommandCenterReceipt` | Three upsert mutations | Audit-critical; currently not atomic with Order update | **First place-hold slice candidate** |

## Seed fallback findings and safeguard

Phase A added `orderSeedFallbackAllowed()` and guarded database-backed Order and
command-center fallbacks. `VERCEL_ENV=production` or
`NOTARIX_DATABASE_ENVIRONMENT=production` now prohibits synthetic fallback;
build mode and non-production environments may continue using fixtures. Empty
Production query results are no longer replaced with seed Orders or receipts.

Remaining seed-only paths:

| Path | Environment capability | Status/removal phase |
| --- | --- | --- |
| `listOrderDocuments` | Production-capable synchronous fixture | No database call exists; remove in document/evidence API migration before real data |
| `listOrderCompletionControls` | Production-capable synchronous fixture | Remove in closeout API migration |
| `listOrderLifecycleIntakeRecords` | Production-capable synchronous fixture | Remove in Order intake migration |
| `listNotaryAssignments` empty-result fallback | Production-capable display fallback | Must use normalized assignment query; remove in notary slice |
| `operations-data.ts` and command in-memory store | Local/Preview fixture imported by Production-capable modules | Guarded for DB failure but still structural technical debt; remove domain by domain |

The new safeguard is intentionally narrow: it changes only failure/empty-result
fallback behavior and is not deployed. Production must show a sanitized service
failure rather than plausible synthetic business records.

## Phase A artifacts

- Provider-neutral contracts: `packages/order-contracts/index.ts`
- Pure rules: `packages/order-domain/index.ts`
- Tests: `tests/order-domain.test.ts`
- Proposed non-executable SQL:
  `docs/migrations/proposals/0002_normalized_order_authorization.sql`
- Migration design:
  `docs/architecture/notarix-order-authorization-migration-proposal-2026-08-06.md`
- Non-deployable resource manifest: `infrastructure/order-api/resource-manifest.yaml`
- IaC/secret decision specification: `infrastructure/order-api/README.md`

No AWS framework was installed. No migration was generated or journaled. No
resource, credential, connection, environment variable, or deployment changed.
