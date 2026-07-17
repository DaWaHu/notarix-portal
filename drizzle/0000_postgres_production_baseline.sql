CREATE TABLE "access_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"approved_profile_number" text,
	"name" text NOT NULL,
	"organization" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"jurisdiction" text NOT NULL,
	"service" text NOT NULL,
	"status" text NOT NULL,
	"risk" text NOT NULL,
	"reviewer" text NOT NULL,
	"received_at_utc" timestamp with time zone NOT NULL,
	"updated_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "command_center_events" (
	"id" text PRIMARY KEY NOT NULL,
	"receipt_id" text NOT NULL,
	"action" text NOT NULL,
	"target_id" text NOT NULL,
	"target_type" text NOT NULL,
	"actor" text NOT NULL,
	"actor_role" text NOT NULL,
	"authority" text NOT NULL,
	"allowed" boolean NOT NULL,
	"outcome" text NOT NULL,
	"previous_status" text NOT NULL,
	"next_status" text NOT NULL,
	"blocked_reason" text,
	"audit_event" text NOT NULL,
	"created_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "command_center_receipts" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"target_id" text NOT NULL,
	"action" text NOT NULL,
	"outcome" text NOT NULL,
	"authority" text NOT NULL,
	"console_href" text NOT NULL,
	"next_required_action" text NOT NULL,
	"retained_for_audit" boolean NOT NULL,
	"created_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "command_center_targets" (
	"id" text PRIMARY KEY NOT NULL,
	"target_type" text NOT NULL,
	"status" text NOT NULL,
	"source_href" text NOT NULL,
	"updated_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication_consent_records" (
	"id" text PRIMARY KEY NOT NULL,
	"notification_id" text NOT NULL,
	"recipient" text NOT NULL,
	"channel" text NOT NULL,
	"consent_status" text NOT NULL,
	"purpose" text NOT NULL,
	"recorded_by" text NOT NULL,
	"recorded_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_access_receipts" (
	"id" text PRIMARY KEY NOT NULL,
	"evidence_id" text NOT NULL,
	"actor" text NOT NULL,
	"actor_role" text NOT NULL,
	"reason" text NOT NULL,
	"outcome" text NOT NULL,
	"signed_url" text,
	"blocked_reason" text,
	"access_url_expires_at_utc" timestamp with time zone,
	"created_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_files" (
	"id" text PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"section" text NOT NULL,
	"file_name" text NOT NULL,
	"custody" text NOT NULL,
	"scan_status" text NOT NULL,
	"storage_key" text NOT NULL,
	"uploaded_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_malware_scan_events" (
	"id" text PRIMARY KEY NOT NULL,
	"evidence_id" text NOT NULL,
	"provider" text NOT NULL,
	"provider_receipt" text NOT NULL,
	"malware_status" text NOT NULL,
	"validation_status" text NOT NULL,
	"release_eligibility" text NOT NULL,
	"callback_received_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_storage_controls" (
	"evidence_id" text PRIMARY KEY NOT NULL,
	"request_id" text,
	"order_id" text,
	"source" text NOT NULL,
	"section" text NOT NULL,
	"category" text NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" text NOT NULL,
	"sha256" text NOT NULL,
	"storage_provider" text NOT NULL,
	"bucket_name" text NOT NULL,
	"object_key" text NOT NULL,
	"encryption_status" text NOT NULL,
	"validation_status" text NOT NULL,
	"malware_status" text NOT NULL,
	"malware_provider" text NOT NULL,
	"provider_receipt" text NOT NULL,
	"custody" text NOT NULL,
	"access_level" text NOT NULL,
	"release_eligibility" text NOT NULL,
	"release_blocked_reason" text NOT NULL,
	"retention_rule" text NOT NULL,
	"last_accessed" text NOT NULL,
	"updated_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notary_completion_receipts" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"receipt_area" text NOT NULL,
	"status" text NOT NULL,
	"evidence" text NOT NULL,
	"notary_action" text NOT NULL,
	"staff_review" text NOT NULL,
	"payable_impact" text NOT NULL,
	"updated_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_delivery_events" (
	"id" text PRIMARY KEY NOT NULL,
	"notification_id" text NOT NULL,
	"event_type" text NOT NULL,
	"actor" text NOT NULL,
	"actor_role" text NOT NULL,
	"provider" text NOT NULL,
	"provider_message_id" text NOT NULL,
	"previous_status" text NOT NULL,
	"next_status" text NOT NULL,
	"outcome" text NOT NULL,
	"detail" text NOT NULL,
	"created_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_delivery_records" (
	"id" text PRIMARY KEY NOT NULL,
	"related_record" text NOT NULL,
	"recipient_name" text NOT NULL,
	"recipient" text NOT NULL,
	"channel" text NOT NULL,
	"purpose" text NOT NULL,
	"status" text NOT NULL,
	"consent" text NOT NULL,
	"trigger" text NOT NULL,
	"owner" text NOT NULL,
	"timestamp" text NOT NULL,
	"next_action" text NOT NULL,
	"provider" text NOT NULL,
	"provider_message_id" text NOT NULL,
	"provider_status" text NOT NULL,
	"delivery_attempt_count" integer NOT NULL,
	"callback_status" text NOT NULL,
	"last_callback_at_utc" timestamp with time zone,
	"updated_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_appointments" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"client" text NOT NULL,
	"notary" text NOT NULL,
	"appointment" text NOT NULL,
	"location" text NOT NULL,
	"service_type" text NOT NULL,
	"status" text NOT NULL,
	"signer_readiness" text NOT NULL,
	"document_readiness" text NOT NULL,
	"notification_status" text NOT NULL,
	"staff_owner" text NOT NULL,
	"authority" text NOT NULL,
	"next_action" text NOT NULL,
	"updated_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_closeout_controls" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"control" text NOT NULL,
	"status" text NOT NULL,
	"evidence" text NOT NULL,
	"owner" text NOT NULL,
	"authority" text NOT NULL,
	"last_updated" text NOT NULL,
	"next_action" text NOT NULL,
	"updated_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_delivery_receipts" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"receipt_area" text NOT NULL,
	"client_status" text NOT NULL,
	"client_visible_evidence" text NOT NULL,
	"delivery_channel" text NOT NULL,
	"delivered_to" text NOT NULL,
	"delivered_at" text NOT NULL,
	"access_control" text NOT NULL,
	"client_next_action" text NOT NULL,
	"updated_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_lifecycle_stages" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"stage" text NOT NULL,
	"status" text NOT NULL,
	"owner" text NOT NULL,
	"authority" text NOT NULL,
	"timestamp" text NOT NULL,
	"evidence" text NOT NULL,
	"next_action" text NOT NULL,
	"updated_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_operational_records" (
	"id" text PRIMARY KEY NOT NULL,
	"client" text NOT NULL,
	"client_profile" text NOT NULL,
	"client_contact" text NOT NULL,
	"client_email" text NOT NULL,
	"notary" text NOT NULL,
	"notary_profile" text NOT NULL,
	"service" text NOT NULL,
	"jurisdiction" text NOT NULL,
	"appointment" text NOT NULL,
	"location" text NOT NULL,
	"order_status" text NOT NULL,
	"assignment_status" text NOT NULL,
	"document_status" text NOT NULL,
	"document_count" text NOT NULL,
	"validation_status" text NOT NULL,
	"ron_status" text NOT NULL,
	"billing_status" text NOT NULL,
	"payable_status" text NOT NULL,
	"communication_status" text NOT NULL,
	"owner" text NOT NULL,
	"risk" text NOT NULL,
	"next_action" text NOT NULL,
	"created_at_utc" timestamp with time zone NOT NULL,
	"updated_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_signer_readiness" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"signer_name" text NOT NULL,
	"signer_role" text NOT NULL,
	"identity_method" text NOT NULL,
	"identity_status" text NOT NULL,
	"location_readiness" text NOT NULL,
	"witness_requirement" text NOT NULL,
	"special_instructions" text NOT NULL,
	"risk" text NOT NULL,
	"staff_owner" text NOT NULL,
	"next_action" text NOT NULL,
	"updated_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_verification_items" (
	"id" text PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"section" text NOT NULL,
	"requirement" text NOT NULL,
	"evidence" text NOT NULL,
	"status" text NOT NULL,
	"reviewer_note" text NOT NULL,
	"updated_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"actor_email" text NOT NULL,
	"actor_role" text NOT NULL,
	"action" text NOT NULL,
	"previous_status" text NOT NULL,
	"next_status" text NOT NULL,
	"event" text NOT NULL,
	"created_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"channel" text NOT NULL,
	"recipient" text NOT NULL,
	"purpose" text NOT NULL,
	"status" text NOT NULL,
	"created_at_utc" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "command_center_events" ADD CONSTRAINT "command_center_events_target_id_command_center_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."command_center_targets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_center_receipts" ADD CONSTRAINT "command_center_receipts_event_id_command_center_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."command_center_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_center_receipts" ADD CONSTRAINT "command_center_receipts_target_id_command_center_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."command_center_targets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_consent_records" ADD CONSTRAINT "communication_consent_records_notification_id_notification_delivery_records_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notification_delivery_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_access_receipts" ADD CONSTRAINT "evidence_access_receipts_evidence_id_evidence_storage_controls_evidence_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence_storage_controls"("evidence_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_files" ADD CONSTRAINT "evidence_files_request_id_access_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."access_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_malware_scan_events" ADD CONSTRAINT "evidence_malware_scan_events_evidence_id_evidence_storage_controls_evidence_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence_storage_controls"("evidence_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notary_completion_receipts" ADD CONSTRAINT "notary_completion_receipts_order_id_order_operational_records_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order_operational_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_delivery_events" ADD CONSTRAINT "notification_delivery_events_notification_id_notification_delivery_records_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notification_delivery_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_appointments" ADD CONSTRAINT "order_appointments_order_id_order_operational_records_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order_operational_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_closeout_controls" ADD CONSTRAINT "order_closeout_controls_order_id_order_operational_records_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order_operational_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_delivery_receipts" ADD CONSTRAINT "order_delivery_receipts_order_id_order_operational_records_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order_operational_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_lifecycle_stages" ADD CONSTRAINT "order_lifecycle_stages_order_id_order_operational_records_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order_operational_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_signer_readiness" ADD CONSTRAINT "order_signer_readiness_order_id_order_operational_records_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order_operational_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_verification_items" ADD CONSTRAINT "profile_verification_items_request_id_access_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."access_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_audit_events" ADD CONSTRAINT "workflow_audit_events_request_id_access_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."access_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_notifications" ADD CONSTRAINT "workflow_notifications_request_id_access_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."access_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "access_requests_profile_number_idx" ON "access_requests" USING btree ("approved_profile_number");--> statement-breakpoint
CREATE INDEX "access_requests_status_idx" ON "access_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "access_requests_type_idx" ON "access_requests" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "command_center_events_receipt_idx" ON "command_center_events" USING btree ("receipt_id");--> statement-breakpoint
CREATE INDEX "command_center_events_target_idx" ON "command_center_events" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "command_center_events_actor_idx" ON "command_center_events" USING btree ("actor");--> statement-breakpoint
CREATE INDEX "command_center_events_outcome_idx" ON "command_center_events" USING btree ("outcome");--> statement-breakpoint
CREATE INDEX "command_center_receipts_target_idx" ON "command_center_receipts" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "command_center_receipts_outcome_idx" ON "command_center_receipts" USING btree ("outcome");--> statement-breakpoint
CREATE INDEX "command_center_targets_type_idx" ON "command_center_targets" USING btree ("target_type");--> statement-breakpoint
CREATE INDEX "command_center_targets_status_idx" ON "command_center_targets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "communication_consent_records_notification_idx" ON "communication_consent_records" USING btree ("notification_id");--> statement-breakpoint
CREATE INDEX "communication_consent_records_recipient_idx" ON "communication_consent_records" USING btree ("recipient");--> statement-breakpoint
CREATE INDEX "evidence_access_receipts_evidence_idx" ON "evidence_access_receipts" USING btree ("evidence_id");--> statement-breakpoint
CREATE INDEX "evidence_access_receipts_actor_idx" ON "evidence_access_receipts" USING btree ("actor");--> statement-breakpoint
CREATE INDEX "evidence_access_receipts_outcome_idx" ON "evidence_access_receipts" USING btree ("outcome");--> statement-breakpoint
CREATE INDEX "evidence_files_request_idx" ON "evidence_files" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "evidence_files_section_idx" ON "evidence_files" USING btree ("section");--> statement-breakpoint
CREATE INDEX "evidence_malware_scan_events_evidence_idx" ON "evidence_malware_scan_events" USING btree ("evidence_id");--> statement-breakpoint
CREATE INDEX "evidence_malware_scan_events_provider_idx" ON "evidence_malware_scan_events" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "evidence_storage_controls_request_idx" ON "evidence_storage_controls" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "evidence_storage_controls_order_idx" ON "evidence_storage_controls" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "evidence_storage_controls_release_idx" ON "evidence_storage_controls" USING btree ("release_eligibility");--> statement-breakpoint
CREATE INDEX "evidence_storage_controls_malware_idx" ON "evidence_storage_controls" USING btree ("malware_status");--> statement-breakpoint
CREATE INDEX "notary_completion_receipts_order_idx" ON "notary_completion_receipts" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "notary_completion_receipts_status_idx" ON "notary_completion_receipts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notification_delivery_events_notification_idx" ON "notification_delivery_events" USING btree ("notification_id");--> statement-breakpoint
CREATE INDEX "notification_delivery_events_outcome_idx" ON "notification_delivery_events" USING btree ("outcome");--> statement-breakpoint
CREATE INDEX "notification_delivery_records_related_idx" ON "notification_delivery_records" USING btree ("related_record");--> statement-breakpoint
CREATE INDEX "notification_delivery_records_status_idx" ON "notification_delivery_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notification_delivery_records_provider_idx" ON "notification_delivery_records" USING btree ("provider_message_id");--> statement-breakpoint
CREATE INDEX "order_appointments_order_idx" ON "order_appointments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_appointments_status_idx" ON "order_appointments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_appointments_owner_idx" ON "order_appointments" USING btree ("staff_owner");--> statement-breakpoint
CREATE INDEX "order_closeout_controls_order_idx" ON "order_closeout_controls" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_closeout_controls_status_idx" ON "order_closeout_controls" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_closeout_controls_owner_idx" ON "order_closeout_controls" USING btree ("owner");--> statement-breakpoint
CREATE INDEX "order_delivery_receipts_order_idx" ON "order_delivery_receipts" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_delivery_receipts_status_idx" ON "order_delivery_receipts" USING btree ("client_status");--> statement-breakpoint
CREATE UNIQUE INDEX "order_lifecycle_stages_order_stage_idx" ON "order_lifecycle_stages" USING btree ("order_id","stage");--> statement-breakpoint
CREATE INDEX "order_lifecycle_stages_status_idx" ON "order_lifecycle_stages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_operational_records_client_idx" ON "order_operational_records" USING btree ("client");--> statement-breakpoint
CREATE INDEX "order_operational_records_notary_idx" ON "order_operational_records" USING btree ("notary");--> statement-breakpoint
CREATE INDEX "order_operational_records_status_idx" ON "order_operational_records" USING btree ("order_status");--> statement-breakpoint
CREATE INDEX "order_operational_records_owner_idx" ON "order_operational_records" USING btree ("owner");--> statement-breakpoint
CREATE INDEX "order_signer_readiness_order_idx" ON "order_signer_readiness" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_signer_readiness_identity_status_idx" ON "order_signer_readiness" USING btree ("identity_status");--> statement-breakpoint
CREATE INDEX "order_signer_readiness_owner_idx" ON "order_signer_readiness" USING btree ("staff_owner");--> statement-breakpoint
CREATE UNIQUE INDEX "profile_verification_items_request_section_idx" ON "profile_verification_items" USING btree ("request_id","section");--> statement-breakpoint
CREATE INDEX "profile_verification_items_status_idx" ON "profile_verification_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "workflow_audit_events_request_idx" ON "workflow_audit_events" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "workflow_audit_events_actor_idx" ON "workflow_audit_events" USING btree ("actor_email");--> statement-breakpoint
CREATE INDEX "workflow_notifications_request_idx" ON "workflow_notifications" USING btree ("request_id");