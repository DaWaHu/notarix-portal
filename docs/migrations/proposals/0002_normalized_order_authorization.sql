-- DESIGN PROPOSAL ONLY — NOT A DRIZZLE/JOURNALED MIGRATION.
-- Proposed future name: 0002_normalized_order_authorization.sql
-- Prerequisite: 0001_nebulous_slipstream committed successfully and verified.
-- Do not execute without separate owner approval, backup/restore evidence,
-- synthetic Preview rehearsal, generated Drizzle metadata, and exact checksum.

BEGIN;

CREATE TABLE "organizations" (
  "id" text PRIMARY KEY NOT NULL,
  "profile_number" text NOT NULL,
  "organization_type" text NOT NULL,
  "legal_name" text NOT NULL,
  "status" text NOT NULL,
  "created_at_utc" timestamp with time zone NOT NULL,
  "updated_at_utc" timestamp with time zone NOT NULL,
  CONSTRAINT "organizations_profile_number_unique" UNIQUE("profile_number"),
  CONSTRAINT "organizations_type_check"
    CHECK ("organization_type" IN ('CLIENT', 'INTERNAL')),
  CONSTRAINT "organizations_status_check"
    CHECK ("status" IN ('ACTIVE', 'SUSPENDED', 'DISABLED'))
);

CREATE INDEX "organizations_status_idx" ON "organizations" ("status");

CREATE TABLE "organization_memberships" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL,
  "user_id" text NOT NULL,
  "membership_role" text NOT NULL,
  "status" text NOT NULL,
  "approved_by_user_id" text NOT NULL,
  "approved_at_utc" timestamp with time zone NOT NULL,
  "revoked_by_user_id" text,
  "revoked_at_utc" timestamp with time zone,
  "created_at_utc" timestamp with time zone NOT NULL,
  "updated_at_utc" timestamp with time zone NOT NULL,
  CONSTRAINT "organization_memberships_organization_fk"
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "organization_memberships_user_fk"
    FOREIGN KEY ("user_id") REFERENCES "portal_users"("id")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "organization_memberships_approved_by_fk"
    FOREIGN KEY ("approved_by_user_id") REFERENCES "portal_users"("id")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "organization_memberships_revoked_by_fk"
    FOREIGN KEY ("revoked_by_user_id") REFERENCES "portal_users"("id")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "organization_memberships_role_check"
    CHECK ("membership_role" IN ('OWNER', 'ADMIN', 'MEMBER', 'OBSERVER')),
  CONSTRAINT "organization_memberships_status_check"
    CHECK ("status" IN ('ACTIVE', 'SUSPENDED', 'REVOKED')),
  CONSTRAINT "organization_memberships_revoke_pair_check"
    CHECK (("revoked_by_user_id" IS NULL) = ("revoked_at_utc" IS NULL))
);

CREATE UNIQUE INDEX "organization_memberships_active_unique"
  ON "organization_memberships" ("organization_id", "user_id")
  WHERE "revoked_at_utc" IS NULL;
CREATE INDEX "organization_memberships_user_status_idx"
  ON "organization_memberships" ("user_id", "status");
CREATE INDEX "organization_memberships_org_status_idx"
  ON "organization_memberships" ("organization_id", "status");

CREATE TABLE "notary_profiles" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "profile_number" text NOT NULL,
  "jurisdiction" text NOT NULL,
  "status" text NOT NULL,
  "ron_authorized" boolean NOT NULL DEFAULT false,
  "approved_by_user_id" text NOT NULL,
  "approved_at_utc" timestamp with time zone NOT NULL,
  "created_at_utc" timestamp with time zone NOT NULL,
  "updated_at_utc" timestamp with time zone NOT NULL,
  CONSTRAINT "notary_profiles_user_fk"
    FOREIGN KEY ("user_id") REFERENCES "portal_users"("id")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "notary_profiles_approved_by_fk"
    FOREIGN KEY ("approved_by_user_id") REFERENCES "portal_users"("id")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "notary_profiles_user_unique" UNIQUE("user_id"),
  CONSTRAINT "notary_profiles_number_unique" UNIQUE("profile_number"),
  CONSTRAINT "notary_profiles_status_check"
    CHECK ("status" IN ('APPROVED', 'ACTIVE', 'SUSPENDED', 'DISABLED'))
);

CREATE INDEX "notary_profiles_jurisdiction_status_idx"
  ON "notary_profiles" ("jurisdiction", "status");

CREATE TABLE "order_authorization_records" (
  "order_id" text PRIMARY KEY NOT NULL,
  "client_organization_id" text NOT NULL,
  "access_classification" text NOT NULL,
  "version" integer NOT NULL DEFAULT 1,
  "created_at_utc" timestamp with time zone NOT NULL,
  "updated_at_utc" timestamp with time zone NOT NULL,
  CONSTRAINT "order_authorization_records_order_fk"
    FOREIGN KEY ("order_id") REFERENCES "order_operational_records"("id")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "order_authorization_records_client_fk"
    FOREIGN KEY ("client_organization_id") REFERENCES "organizations"("id")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "order_authorization_records_classification_check"
    CHECK ("access_classification" IN ('STANDARD', 'RESTRICTED', 'ELEVATED')),
  CONSTRAINT "order_authorization_records_version_check" CHECK ("version" > 0)
);

CREATE INDEX "order_authorization_records_client_idx"
  ON "order_authorization_records" ("client_organization_id");

CREATE TABLE "order_notary_assignments" (
  "id" text PRIMARY KEY NOT NULL,
  "order_id" text NOT NULL,
  "notary_profile_id" text NOT NULL,
  "status" text NOT NULL,
  "assigned_by_user_id" text NOT NULL,
  "assigned_at_utc" timestamp with time zone NOT NULL,
  "ended_by_user_id" text,
  "ended_at_utc" timestamp with time zone,
  "created_at_utc" timestamp with time zone NOT NULL,
  "updated_at_utc" timestamp with time zone NOT NULL,
  CONSTRAINT "order_notary_assignments_order_fk"
    FOREIGN KEY ("order_id") REFERENCES "order_operational_records"("id")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "order_notary_assignments_notary_fk"
    FOREIGN KEY ("notary_profile_id") REFERENCES "notary_profiles"("id")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "order_notary_assignments_assigned_by_fk"
    FOREIGN KEY ("assigned_by_user_id") REFERENCES "portal_users"("id")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "order_notary_assignments_ended_by_fk"
    FOREIGN KEY ("ended_by_user_id") REFERENCES "portal_users"("id")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "order_notary_assignments_status_check"
    CHECK ("status" IN ('OFFERED', 'ACCEPTED', 'ACTIVE', 'DECLINED', 'ENDED')),
  CONSTRAINT "order_notary_assignments_end_pair_check"
    CHECK (("ended_by_user_id" IS NULL) = ("ended_at_utc" IS NULL))
);

CREATE UNIQUE INDEX "order_notary_assignments_active_unique"
  ON "order_notary_assignments" ("order_id")
  WHERE "status" IN ('ACCEPTED', 'ACTIVE') AND "ended_at_utc" IS NULL;
CREATE INDEX "order_notary_assignments_notary_status_idx"
  ON "order_notary_assignments" ("notary_profile_id", "status");
CREATE INDEX "order_notary_assignments_order_status_idx"
  ON "order_notary_assignments" ("order_id", "status");

CREATE TABLE "order_audit_events" (
  "id" text PRIMARY KEY NOT NULL,
  "order_id" text NOT NULL,
  "actor_user_id" text NOT NULL,
  "actor_identity_id" text NOT NULL,
  "effective_role_assignment_id" text NOT NULL,
  "action" text NOT NULL,
  "authorization_decision" text NOT NULL,
  "previous_status" text,
  "next_status" text,
  "reason_code" text,
  "correlation_id" text NOT NULL,
  "request_id" text NOT NULL,
  "idempotency_key_fingerprint" text,
  "occurred_at_utc" timestamp with time zone NOT NULL,
  CONSTRAINT "order_audit_events_order_fk"
    FOREIGN KEY ("order_id") REFERENCES "order_operational_records"("id")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "order_audit_events_actor_fk"
    FOREIGN KEY ("actor_user_id") REFERENCES "portal_users"("id")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "order_audit_events_identity_fk"
    FOREIGN KEY ("actor_identity_id") REFERENCES "portal_user_identities"("id")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "order_audit_events_role_fk"
    FOREIGN KEY ("effective_role_assignment_id") REFERENCES "portal_role_assignments"("id")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "order_audit_events_decision_check"
    CHECK ("authorization_decision" IN ('ALLOWED', 'DENIED'))
);

CREATE UNIQUE INDEX "order_audit_events_request_unique"
  ON "order_audit_events" ("request_id");
CREATE INDEX "order_audit_events_order_time_idx"
  ON "order_audit_events" ("order_id", "occurred_at_utc");
CREATE INDEX "order_audit_events_actor_time_idx"
  ON "order_audit_events" ("actor_user_id", "occurred_at_utc");
CREATE INDEX "order_audit_events_correlation_idx"
  ON "order_audit_events" ("correlation_id");

CREATE TABLE "order_idempotency_records" (
  "id" text PRIMARY KEY NOT NULL,
  "order_id" text NOT NULL,
  "actor_user_id" text NOT NULL,
  "operation" text NOT NULL,
  "idempotency_key_hash" text NOT NULL,
  "payload_hash" text NOT NULL,
  "response_status" integer NOT NULL,
  "response_body" text NOT NULL,
  "created_at_utc" timestamp with time zone NOT NULL,
  "expires_at_utc" timestamp with time zone NOT NULL,
  CONSTRAINT "order_idempotency_records_order_fk"
    FOREIGN KEY ("order_id") REFERENCES "order_operational_records"("id")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "order_idempotency_records_actor_fk"
    FOREIGN KEY ("actor_user_id") REFERENCES "portal_users"("id")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "order_idempotency_records_operation_check"
    CHECK ("operation" IN ('ORDER_PLACE_HOLD')),
  CONSTRAINT "order_idempotency_records_expiry_check"
    CHECK ("expires_at_utc" > "created_at_utc")
);

CREATE UNIQUE INDEX "order_idempotency_records_scope_unique"
  ON "order_idempotency_records"
  ("actor_user_id", "order_id", "operation", "idempotency_key_hash");
CREATE INDEX "order_idempotency_records_expiry_idx"
  ON "order_idempotency_records" ("expires_at_utc");

-- Role assignments from 0001 remain application authority. Add attributable
-- dual-control columns as nullable first; backfill and NOT NULL enforcement are
-- a later separately reviewed step because existing rows need verified actors.
ALTER TABLE "portal_role_assignments"
  ADD COLUMN "approved_by_user_id" text,
  ADD COLUMN "approval_audit_event_id" text;

ALTER TABLE "portal_role_assignments"
  ADD CONSTRAINT "portal_role_assignments_approved_by_fk"
  FOREIGN KEY ("approved_by_user_id") REFERENCES "portal_users"("id")
  ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE INDEX "portal_role_assignments_active_user_role_idx"
  ON "portal_role_assignments" ("user_id", "role")
  WHERE "revoked_at_utc" IS NULL;

-- No data backfill is included in this proposal. Execution must stop before
-- COMMIT unless every organization, membership, notary profile, Order owner,
-- active assignment, and privileged role approval is mapped from reviewed
-- synthetic Preview data with zero ambiguity.

ROLLBACK;
-- ROLLBACK is intentional in the proposal artifact. A generated executable
-- migration must replace it with COMMIT only after separate approval.
