# Notarix Signings Normalized Order Authorization Migration Proposal — Aug 6 2026

Status: **DESIGNED / NOT DEPLOYED / NOT EXECUTABLE AS COMMITTED**

Proposed migration name:
`0002_normalized_order_authorization.sql`. The exact proposal is stored outside
the Drizzle migration directory at
`docs/migrations/proposals/0002_normalized_order_authorization.sql` and ends in
`ROLLBACK`. It has not been generated, journaled, checksummed, connected, or run.

## Relationship to migration 0001

`0001_nebulous_slipstream` remains unchanged and is a strict prerequisite. It
creates `portal_users`, `portal_user_identities`, `portal_role_assignments`, and
`portal_auth_sessions`. Proposed 0002 references the first three tables and adds
nullable dual-control attribution columns to `portal_role_assignments`.

There is no material conflict with 0001. There is one intentional authority
clarification: active `portal_role_assignments` become authoritative, while the
denormalized `portal_users.role` column remains temporarily for compatibility
and must later be retired only through a separately reviewed migration. Existing
0001 rows require backfill before new approval columns can become `NOT NULL`.

## Table and change register

| Table/change | Purpose and key | Relationships and constraints | Indexes | Backfill/data dependency | Risk and rollback |
| --- | --- | --- | --- | --- | --- |
| `organizations` | Client/internal tenant; text PK; permanent profile number unique | Type/status checks; all fields non-null | Status | Map approved NSC client profiles; never names alone | Duplicate/ambiguous profiles stop migration; additive rollback possible before dependent writes |
| `organization_memberships` | User-to-tenant authority; text PK | RESTRICT FKs to organization/user/approvers; active membership partial unique; revocation pair | User/status, org/status | Map only verified active client users and attributable approvers | Incorrect mapping creates cross-client risk; rollback requires preserving audit/export |
| `notary_profiles` | Approved Notarix notary identity; text PK | Unique user and NSN; RESTRICT approver; status check | Jurisdiction/status | Map only approved permanent NSN profiles | Display-name matching prohibited; ambiguous users stop |
| `order_authorization_records` | Normalized Order owner, classification, optimistic version; Order ID PK | RESTRICT Order/client FKs; positive version | Client owner | Every existing Order needs verified organization owner | Missing/ambiguous owner blocks cutover; do not infer from display text |
| `order_notary_assignments` | Attributable Order/notary relationship | RESTRICT Order/notary/actor FKs; one active assignment per Order; ended pair | Notary/status, Order/status | Map accepted/active assignments from reviewed records | Current display strings are insufficient without profile proof |
| `order_audit_events` | Immutable actor/identity/role/decision attribution | RESTRICT Order/user/identity/role FKs; unique request ID | Order/time, actor/time, correlation | New events only; legacy command receipts remain historical | Never cascade/delete; rollback preserves/export audit |
| `order_idempotency_records` | Exactly-once response replay for hold action | RESTRICT Order/user; operation/expiry checks; scoped unique key hash | Expiry | None; new writes only | TTL cleanup must preserve linked audit; raw keys are never stored |
| `portal_role_assignments` additions | Dual-control attribution | Nullable approver FK first; approval audit reference staged | Active user/role partial index | Existing roles need verified approver/audit backfill | Cannot enforce NOT NULL until zero ambiguity; no self-approval |

All proposed primary/foreign keys, nullability, checks, unique constraints,
indexes, and RESTRICT behavior appear in the SQL proposal. Nothing uses cascade
deletion because identity, authorization, Order, and audit relationships require
retention and explicit lifecycle decisions.

## Authorization outcomes

- Client organization is resolved from active server-side memberships and the
  Order owner record; a request/client-supplied organization ID is ignored.
- Notary access requires an active normalized assignment and approved profile.
- Staff authority uses an active role assignment, not browser role or email.
- Admin and Super Admin remain distinct. Hold requires either; role approval
  records the separate approver and audit evidence.
- Self-approved privilege elevation is rejected in application policy and must
  receive a database constraint/trigger only after the immutable audit design is
  finalized; Phase A does not propose a trigger silently.
- Cognito subject resolves through `portal_user_identities`; sessions remain
  linked to `portal_users` through 0001.

## Execution gates

1. Apply and verify 0001 in isolated Preview first under its existing owner gate.
2. Generate Drizzle schema/migration metadata from the approved table design;
   compare generated SQL to this proposal.
3. Use synthetic Preview data only. Produce an explicit mapping report for every
   organization, membership, notary profile, Order owner, assignment, and role.
4. Stop on any ambiguity, duplicate permanent identifier, orphan, self-approval,
   or missing actor.
5. Rehearse rollback and restore. Record checksum and exact target identity.
6. Only then request execution approval. Production remains a separate gate.

Rollback after application is not a casual `DROP TABLE`: once authorization or
audit writes exist, evidence must be preserved and application compatibility
assessed. Prefer forward correction or isolated restore under an approved plan.
