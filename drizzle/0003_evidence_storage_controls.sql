CREATE TABLE `evidence_storage_controls` (
	`evidence_id` text PRIMARY KEY NOT NULL,
	`request_id` text,
	`order_id` text,
	`source` text NOT NULL,
	`section` text NOT NULL,
	`category` text NOT NULL,
	`file_name` text NOT NULL,
	`file_type` text NOT NULL,
	`file_size` text NOT NULL,
	`sha256` text NOT NULL,
	`storage_provider` text NOT NULL,
	`bucket_name` text NOT NULL,
	`object_key` text NOT NULL,
	`encryption_status` text NOT NULL,
	`validation_status` text NOT NULL,
	`malware_status` text NOT NULL,
	`malware_provider` text NOT NULL,
	`provider_receipt` text NOT NULL,
	`custody` text NOT NULL,
	`access_level` text NOT NULL,
	`release_eligibility` text NOT NULL,
	`release_blocked_reason` text NOT NULL,
	`retention_rule` text NOT NULL,
	`last_accessed` text NOT NULL,
	`updated_at_utc` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `evidence_storage_controls_request_idx` ON `evidence_storage_controls` (`request_id`);--> statement-breakpoint
CREATE INDEX `evidence_storage_controls_order_idx` ON `evidence_storage_controls` (`order_id`);--> statement-breakpoint
CREATE INDEX `evidence_storage_controls_release_idx` ON `evidence_storage_controls` (`release_eligibility`);--> statement-breakpoint
CREATE INDEX `evidence_storage_controls_malware_idx` ON `evidence_storage_controls` (`malware_status`);
