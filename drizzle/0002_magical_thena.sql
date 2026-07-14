CREATE TABLE `notary_completion_receipts` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`receipt_area` text NOT NULL,
	`status` text NOT NULL,
	`evidence` text NOT NULL,
	`notary_action` text NOT NULL,
	`staff_review` text NOT NULL,
	`payable_impact` text NOT NULL,
	`updated_at_utc` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `order_operational_records`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `notary_completion_receipts_order_idx` ON `notary_completion_receipts` (`order_id`);--> statement-breakpoint
CREATE INDEX `notary_completion_receipts_status_idx` ON `notary_completion_receipts` (`status`);--> statement-breakpoint
CREATE TABLE `order_appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`client` text NOT NULL,
	`notary` text NOT NULL,
	`appointment` text NOT NULL,
	`location` text NOT NULL,
	`service_type` text NOT NULL,
	`status` text NOT NULL,
	`signer_readiness` text NOT NULL,
	`document_readiness` text NOT NULL,
	`notification_status` text NOT NULL,
	`staff_owner` text NOT NULL,
	`authority` text NOT NULL,
	`next_action` text NOT NULL,
	`updated_at_utc` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `order_operational_records`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `order_appointments_order_idx` ON `order_appointments` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_appointments_status_idx` ON `order_appointments` (`status`);--> statement-breakpoint
CREATE INDEX `order_appointments_owner_idx` ON `order_appointments` (`staff_owner`);--> statement-breakpoint
CREATE TABLE `order_closeout_controls` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`control` text NOT NULL,
	`status` text NOT NULL,
	`evidence` text NOT NULL,
	`owner` text NOT NULL,
	`authority` text NOT NULL,
	`last_updated` text NOT NULL,
	`next_action` text NOT NULL,
	`updated_at_utc` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `order_operational_records`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `order_closeout_controls_order_idx` ON `order_closeout_controls` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_closeout_controls_status_idx` ON `order_closeout_controls` (`status`);--> statement-breakpoint
CREATE INDEX `order_closeout_controls_owner_idx` ON `order_closeout_controls` (`owner`);--> statement-breakpoint
CREATE TABLE `order_delivery_receipts` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`receipt_area` text NOT NULL,
	`client_status` text NOT NULL,
	`client_visible_evidence` text NOT NULL,
	`delivery_channel` text NOT NULL,
	`delivered_to` text NOT NULL,
	`delivered_at` text NOT NULL,
	`access_control` text NOT NULL,
	`client_next_action` text NOT NULL,
	`updated_at_utc` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `order_operational_records`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `order_delivery_receipts_order_idx` ON `order_delivery_receipts` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_delivery_receipts_status_idx` ON `order_delivery_receipts` (`client_status`);--> statement-breakpoint
CREATE TABLE `order_lifecycle_stages` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`stage` text NOT NULL,
	`status` text NOT NULL,
	`owner` text NOT NULL,
	`authority` text NOT NULL,
	`timestamp` text NOT NULL,
	`evidence` text NOT NULL,
	`next_action` text NOT NULL,
	`updated_at_utc` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `order_operational_records`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_lifecycle_stages_order_stage_idx` ON `order_lifecycle_stages` (`order_id`,`stage`);--> statement-breakpoint
CREATE INDEX `order_lifecycle_stages_status_idx` ON `order_lifecycle_stages` (`status`);--> statement-breakpoint
CREATE TABLE `order_operational_records` (
	`id` text PRIMARY KEY NOT NULL,
	`client` text NOT NULL,
	`client_profile` text NOT NULL,
	`client_contact` text NOT NULL,
	`client_email` text NOT NULL,
	`notary` text NOT NULL,
	`notary_profile` text NOT NULL,
	`service` text NOT NULL,
	`jurisdiction` text NOT NULL,
	`appointment` text NOT NULL,
	`location` text NOT NULL,
	`order_status` text NOT NULL,
	`assignment_status` text NOT NULL,
	`document_status` text NOT NULL,
	`document_count` text NOT NULL,
	`validation_status` text NOT NULL,
	`ron_status` text NOT NULL,
	`billing_status` text NOT NULL,
	`payable_status` text NOT NULL,
	`communication_status` text NOT NULL,
	`owner` text NOT NULL,
	`risk` text NOT NULL,
	`next_action` text NOT NULL,
	`created_at_utc` integer NOT NULL,
	`updated_at_utc` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `order_operational_records_client_idx` ON `order_operational_records` (`client`);--> statement-breakpoint
CREATE INDEX `order_operational_records_notary_idx` ON `order_operational_records` (`notary`);--> statement-breakpoint
CREATE INDEX `order_operational_records_status_idx` ON `order_operational_records` (`order_status`);--> statement-breakpoint
CREATE INDEX `order_operational_records_owner_idx` ON `order_operational_records` (`owner`);--> statement-breakpoint
CREATE TABLE `order_signer_readiness` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`signer_name` text NOT NULL,
	`signer_role` text NOT NULL,
	`identity_method` text NOT NULL,
	`identity_status` text NOT NULL,
	`location_readiness` text NOT NULL,
	`witness_requirement` text NOT NULL,
	`special_instructions` text NOT NULL,
	`risk` text NOT NULL,
	`staff_owner` text NOT NULL,
	`next_action` text NOT NULL,
	`updated_at_utc` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `order_operational_records`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `order_signer_readiness_order_idx` ON `order_signer_readiness` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_signer_readiness_identity_status_idx` ON `order_signer_readiness` (`identity_status`);--> statement-breakpoint
CREATE INDEX `order_signer_readiness_owner_idx` ON `order_signer_readiness` (`staff_owner`);