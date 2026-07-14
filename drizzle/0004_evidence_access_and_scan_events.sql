CREATE TABLE `evidence_access_receipts` (
	`id` text PRIMARY KEY NOT NULL,
	`evidence_id` text NOT NULL,
	`actor` text NOT NULL,
	`actor_role` text NOT NULL,
	`reason` text NOT NULL,
	`outcome` text NOT NULL,
	`signed_url` text,
	`blocked_reason` text,
	`access_url_expires_at_utc` integer,
	`created_at_utc` integer NOT NULL,
	FOREIGN KEY (`evidence_id`) REFERENCES `evidence_storage_controls`(`evidence_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `evidence_access_receipts_evidence_idx` ON `evidence_access_receipts` (`evidence_id`);--> statement-breakpoint
CREATE INDEX `evidence_access_receipts_actor_idx` ON `evidence_access_receipts` (`actor`);--> statement-breakpoint
CREATE INDEX `evidence_access_receipts_outcome_idx` ON `evidence_access_receipts` (`outcome`);--> statement-breakpoint
CREATE TABLE `evidence_malware_scan_events` (
	`id` text PRIMARY KEY NOT NULL,
	`evidence_id` text NOT NULL,
	`provider` text NOT NULL,
	`provider_receipt` text NOT NULL,
	`malware_status` text NOT NULL,
	`validation_status` text NOT NULL,
	`release_eligibility` text NOT NULL,
	`callback_received_at_utc` integer NOT NULL,
	FOREIGN KEY (`evidence_id`) REFERENCES `evidence_storage_controls`(`evidence_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `evidence_malware_scan_events_evidence_idx` ON `evidence_malware_scan_events` (`evidence_id`);--> statement-breakpoint
CREATE INDEX `evidence_malware_scan_events_provider_idx` ON `evidence_malware_scan_events` (`provider`);
