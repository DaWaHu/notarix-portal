CREATE TABLE `notification_delivery_records` (
	`id` text PRIMARY KEY NOT NULL,
	`related_record` text NOT NULL,
	`recipient_name` text NOT NULL,
	`recipient` text NOT NULL,
	`channel` text NOT NULL,
	`purpose` text NOT NULL,
	`status` text NOT NULL,
	`consent` text NOT NULL,
	`trigger` text NOT NULL,
	`owner` text NOT NULL,
	`timestamp` text NOT NULL,
	`next_action` text NOT NULL,
	`provider` text NOT NULL,
	`provider_message_id` text NOT NULL,
	`provider_status` text NOT NULL,
	`delivery_attempt_count` integer NOT NULL,
	`callback_status` text NOT NULL,
	`last_callback_at_utc` integer,
	`updated_at_utc` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notification_delivery_records_related_idx` ON `notification_delivery_records` (`related_record`);--> statement-breakpoint
CREATE INDEX `notification_delivery_records_status_idx` ON `notification_delivery_records` (`status`);--> statement-breakpoint
CREATE INDEX `notification_delivery_records_provider_idx` ON `notification_delivery_records` (`provider_message_id`);--> statement-breakpoint
CREATE TABLE `notification_delivery_events` (
	`id` text PRIMARY KEY NOT NULL,
	`notification_id` text NOT NULL,
	`event_type` text NOT NULL,
	`actor` text NOT NULL,
	`actor_role` text NOT NULL,
	`provider` text NOT NULL,
	`provider_message_id` text NOT NULL,
	`previous_status` text NOT NULL,
	`next_status` text NOT NULL,
	`outcome` text NOT NULL,
	`detail` text NOT NULL,
	`created_at_utc` integer NOT NULL,
	FOREIGN KEY (`notification_id`) REFERENCES `notification_delivery_records`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `notification_delivery_events_notification_idx` ON `notification_delivery_events` (`notification_id`);--> statement-breakpoint
CREATE INDEX `notification_delivery_events_outcome_idx` ON `notification_delivery_events` (`outcome`);--> statement-breakpoint
CREATE TABLE `communication_consent_records` (
	`id` text PRIMARY KEY NOT NULL,
	`notification_id` text NOT NULL,
	`recipient` text NOT NULL,
	`channel` text NOT NULL,
	`consent_status` text NOT NULL,
	`purpose` text NOT NULL,
	`recorded_by` text NOT NULL,
	`recorded_at_utc` integer NOT NULL,
	FOREIGN KEY (`notification_id`) REFERENCES `notification_delivery_records`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `communication_consent_records_notification_idx` ON `communication_consent_records` (`notification_id`);--> statement-breakpoint
CREATE INDEX `communication_consent_records_recipient_idx` ON `communication_consent_records` (`recipient`);
