CREATE TABLE `command_center_events` (
	`id` text PRIMARY KEY NOT NULL,
	`receipt_id` text NOT NULL,
	`action` text NOT NULL,
	`target_id` text NOT NULL,
	`target_type` text NOT NULL,
	`actor` text NOT NULL,
	`actor_role` text NOT NULL,
	`authority` text NOT NULL,
	`allowed` integer NOT NULL,
	`outcome` text NOT NULL,
	`previous_status` text NOT NULL,
	`next_status` text NOT NULL,
	`blocked_reason` text,
	`audit_event` text NOT NULL,
	`created_at_utc` integer NOT NULL,
	FOREIGN KEY (`target_id`) REFERENCES `command_center_targets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `command_center_events_receipt_idx` ON `command_center_events` (`receipt_id`);--> statement-breakpoint
CREATE INDEX `command_center_events_target_idx` ON `command_center_events` (`target_id`);--> statement-breakpoint
CREATE INDEX `command_center_events_actor_idx` ON `command_center_events` (`actor`);--> statement-breakpoint
CREATE INDEX `command_center_events_outcome_idx` ON `command_center_events` (`outcome`);--> statement-breakpoint
CREATE TABLE `command_center_receipts` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`target_id` text NOT NULL,
	`action` text NOT NULL,
	`outcome` text NOT NULL,
	`authority` text NOT NULL,
	`console_href` text NOT NULL,
	`next_required_action` text NOT NULL,
	`retained_for_audit` integer NOT NULL,
	`created_at_utc` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `command_center_events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`target_id`) REFERENCES `command_center_targets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `command_center_receipts_target_idx` ON `command_center_receipts` (`target_id`);--> statement-breakpoint
CREATE INDEX `command_center_receipts_outcome_idx` ON `command_center_receipts` (`outcome`);--> statement-breakpoint
CREATE TABLE `command_center_targets` (
	`id` text PRIMARY KEY NOT NULL,
	`target_type` text NOT NULL,
	`status` text NOT NULL,
	`source_href` text NOT NULL,
	`updated_at_utc` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `command_center_targets_type_idx` ON `command_center_targets` (`target_type`);--> statement-breakpoint
CREATE INDEX `command_center_targets_status_idx` ON `command_center_targets` (`status`);