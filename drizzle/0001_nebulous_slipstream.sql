CREATE TABLE "portal_auth_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"session_token_hash" text NOT NULL,
	"user_agent" text NOT NULL,
	"ip_address" text NOT NULL,
	"created_at_utc" timestamp with time zone NOT NULL,
	"rotated_at_utc" timestamp with time zone NOT NULL,
	"expires_at_utc" timestamp with time zone NOT NULL,
	"revoked_at_utc" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "portal_role_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"assigned_by" text NOT NULL,
	"assigned_at_utc" timestamp with time zone NOT NULL,
	"revoked_at_utc" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "portal_user_identities" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"provider_subject" text NOT NULL,
	"issuer" text NOT NULL,
	"email" text NOT NULL,
	"last_authenticated_at_utc" timestamp with time zone NOT NULL,
	"created_at_utc" timestamp with time zone NOT NULL,
	"updated_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portal_users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"role" text NOT NULL,
	"status" text NOT NULL,
	"owner_locked" boolean NOT NULL,
	"created_at_utc" timestamp with time zone NOT NULL,
	"updated_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "portal_auth_sessions" ADD CONSTRAINT "portal_auth_sessions_user_id_portal_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."portal_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portal_role_assignments" ADD CONSTRAINT "portal_role_assignments_user_id_portal_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."portal_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portal_user_identities" ADD CONSTRAINT "portal_user_identities_user_id_portal_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."portal_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "portal_auth_sessions_token_hash_idx" ON "portal_auth_sessions" USING btree ("session_token_hash");--> statement-breakpoint
CREATE INDEX "portal_auth_sessions_user_idx" ON "portal_auth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "portal_auth_sessions_expires_idx" ON "portal_auth_sessions" USING btree ("expires_at_utc");--> statement-breakpoint
CREATE INDEX "portal_role_assignments_user_idx" ON "portal_role_assignments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "portal_role_assignments_role_idx" ON "portal_role_assignments" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "portal_user_identities_provider_subject_idx" ON "portal_user_identities" USING btree ("provider","provider_subject");--> statement-breakpoint
CREATE INDEX "portal_user_identities_user_idx" ON "portal_user_identities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "portal_user_identities_email_idx" ON "portal_user_identities" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "portal_users_email_idx" ON "portal_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "portal_users_role_idx" ON "portal_users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "portal_users_status_idx" ON "portal_users" USING btree ("status");