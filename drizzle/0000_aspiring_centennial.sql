CREATE TABLE `access_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`approved_profile_number` text,
	`name` text NOT NULL,
	`organization` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`jurisdiction` text NOT NULL,
	`service` text NOT NULL,
	`status` text NOT NULL,
	`risk` text NOT NULL,
	`reviewer` text NOT NULL,
	`received_at_utc` integer NOT NULL,
	`updated_at_utc` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `access_requests_profile_number_idx` ON `access_requests` (`approved_profile_number`);--> statement-breakpoint
CREATE INDEX `access_requests_status_idx` ON `access_requests` (`status`);--> statement-breakpoint
CREATE INDEX `access_requests_type_idx` ON `access_requests` (`type`);--> statement-breakpoint
CREATE TABLE `evidence_files` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`section` text NOT NULL,
	`file_name` text NOT NULL,
	`custody` text NOT NULL,
	`scan_status` text NOT NULL,
	`storage_key` text NOT NULL,
	`uploaded_at_utc` integer NOT NULL,
	FOREIGN KEY (`request_id`) REFERENCES `access_requests`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `evidence_files_request_idx` ON `evidence_files` (`request_id`);--> statement-breakpoint
CREATE INDEX `evidence_files_section_idx` ON `evidence_files` (`section`);--> statement-breakpoint
CREATE TABLE `profile_verification_items` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`section` text NOT NULL,
	`requirement` text NOT NULL,
	`evidence` text NOT NULL,
	`status` text NOT NULL,
	`reviewer_note` text NOT NULL,
	`updated_at_utc` integer NOT NULL,
	FOREIGN KEY (`request_id`) REFERENCES `access_requests`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_verification_items_request_section_idx` ON `profile_verification_items` (`request_id`,`section`);--> statement-breakpoint
CREATE INDEX `profile_verification_items_status_idx` ON `profile_verification_items` (`status`);--> statement-breakpoint
CREATE TABLE `workflow_audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`actor_email` text NOT NULL,
	`actor_role` text NOT NULL,
	`action` text NOT NULL,
	`previous_status` text NOT NULL,
	`next_status` text NOT NULL,
	`event` text NOT NULL,
	`created_at_utc` integer NOT NULL,
	FOREIGN KEY (`request_id`) REFERENCES `access_requests`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `workflow_audit_events_request_idx` ON `workflow_audit_events` (`request_id`);--> statement-breakpoint
CREATE INDEX `workflow_audit_events_actor_idx` ON `workflow_audit_events` (`actor_email`);--> statement-breakpoint
CREATE TABLE `workflow_notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`channel` text NOT NULL,
	`recipient` text NOT NULL,
	`purpose` text NOT NULL,
	`status` text NOT NULL,
	`created_at_utc` integer NOT NULL,
	FOREIGN KEY (`request_id`) REFERENCES `access_requests`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `workflow_notifications_request_idx` ON `workflow_notifications` (`request_id`);