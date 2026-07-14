import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const accessRequests = sqliteTable(
  "access_requests",
  {
    id: text("id").primaryKey(),
    type: text("type", { enum: ["Client", "Notary"] }).notNull(),
    approvedProfileNumber: text("approved_profile_number"),
    name: text("name").notNull(),
    organization: text("organization").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    jurisdiction: text("jurisdiction").notNull(),
    service: text("service").notNull(),
    status: text("status").notNull(),
    risk: text("risk", { enum: ["Standard", "Elevated"] }).notNull(),
    reviewer: text("reviewer").notNull(),
    receivedAtUtc: integer("received_at_utc", { mode: "timestamp" }).notNull(),
    updatedAtUtc: integer("updated_at_utc", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    uniqueIndex("access_requests_profile_number_idx").on(table.approvedProfileNumber),
    index("access_requests_status_idx").on(table.status),
    index("access_requests_type_idx").on(table.type),
  ],
);

export const profileVerificationItems = sqliteTable(
  "profile_verification_items",
  {
    id: text("id").primaryKey(),
    requestId: text("request_id")
      .notNull()
      .references(() => accessRequests.id),
    section: text("section").notNull(),
    requirement: text("requirement").notNull(),
    evidence: text("evidence").notNull(),
    status: text("status", {
      enum: ["Verified", "Pending", "Deficient", "Restricted"],
    }).notNull(),
    reviewerNote: text("reviewer_note").notNull(),
    updatedAtUtc: integer("updated_at_utc", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    uniqueIndex("profile_verification_items_request_section_idx").on(
      table.requestId,
      table.section,
    ),
    index("profile_verification_items_status_idx").on(table.status),
  ],
);

export const evidenceFiles = sqliteTable(
  "evidence_files",
  {
    id: text("id").primaryKey(),
    requestId: text("request_id")
      .notNull()
      .references(() => accessRequests.id),
    section: text("section").notNull(),
    fileName: text("file_name").notNull(),
    custody: text("custody").notNull(),
    scanStatus: text("scan_status").notNull(),
    storageKey: text("storage_key").notNull(),
    uploadedAtUtc: integer("uploaded_at_utc", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("evidence_files_request_idx").on(table.requestId),
    index("evidence_files_section_idx").on(table.section),
  ],
);

export const workflowAuditEvents = sqliteTable(
  "workflow_audit_events",
  {
    id: text("id").primaryKey(),
    requestId: text("request_id")
      .notNull()
      .references(() => accessRequests.id),
    actorEmail: text("actor_email").notNull(),
    actorRole: text("actor_role").notNull(),
    action: text("action").notNull(),
    previousStatus: text("previous_status").notNull(),
    nextStatus: text("next_status").notNull(),
    event: text("event").notNull(),
    createdAtUtc: integer("created_at_utc", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("workflow_audit_events_request_idx").on(table.requestId),
    index("workflow_audit_events_actor_idx").on(table.actorEmail),
  ],
);

export const workflowNotifications = sqliteTable(
  "workflow_notifications",
  {
    id: text("id").primaryKey(),
    requestId: text("request_id")
      .notNull()
      .references(() => accessRequests.id),
    channel: text("channel", { enum: ["Email", "Phone"] }).notNull(),
    recipient: text("recipient").notNull(),
    purpose: text("purpose").notNull(),
    status: text("status").notNull(),
    createdAtUtc: integer("created_at_utc", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("workflow_notifications_request_idx").on(table.requestId)],
);

export const commandCenterTargets = sqliteTable(
  "command_center_targets",
  {
    id: text("id").primaryKey(),
    targetType: text("target_type", {
      enum: [
        "Notification",
        "Credential",
        "Ledger",
        "Audit",
        "Evidence",
        "Retention",
        "System",
        "Access",
        "Integration",
        "Order",
      ],
    }).notNull(),
    status: text("status").notNull(),
    sourceHref: text("source_href").notNull(),
    updatedAtUtc: integer("updated_at_utc", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("command_center_targets_type_idx").on(table.targetType),
    index("command_center_targets_status_idx").on(table.status),
  ],
);

export const commandCenterEvents = sqliteTable(
  "command_center_events",
  {
    id: text("id").primaryKey(),
    receiptId: text("receipt_id").notNull(),
    action: text("action").notNull(),
    targetId: text("target_id")
      .notNull()
      .references(() => commandCenterTargets.id),
    targetType: text("target_type", {
      enum: [
        "Notification",
        "Credential",
        "Ledger",
        "Audit",
        "Evidence",
        "Retention",
        "System",
        "Access",
        "Integration",
        "Order",
      ],
    }).notNull(),
    actor: text("actor").notNull(),
    actorRole: text("actor_role").notNull(),
    authority: text("authority").notNull(),
    allowed: integer("allowed", { mode: "boolean" }).notNull(),
    outcome: text("outcome", { enum: ["Completed", "Blocked"] }).notNull(),
    previousStatus: text("previous_status").notNull(),
    nextStatus: text("next_status").notNull(),
    blockedReason: text("blocked_reason"),
    auditEvent: text("audit_event").notNull(),
    createdAtUtc: integer("created_at_utc", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    uniqueIndex("command_center_events_receipt_idx").on(table.receiptId),
    index("command_center_events_target_idx").on(table.targetId),
    index("command_center_events_actor_idx").on(table.actor),
    index("command_center_events_outcome_idx").on(table.outcome),
  ],
);

export const commandCenterReceipts = sqliteTable(
  "command_center_receipts",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => commandCenterEvents.id),
    targetId: text("target_id")
      .notNull()
      .references(() => commandCenterTargets.id),
    action: text("action").notNull(),
    outcome: text("outcome", { enum: ["Completed", "Blocked"] }).notNull(),
    authority: text("authority").notNull(),
    consoleHref: text("console_href").notNull(),
    nextRequiredAction: text("next_required_action").notNull(),
    retainedForAudit: integer("retained_for_audit", { mode: "boolean" }).notNull(),
    createdAtUtc: integer("created_at_utc", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("command_center_receipts_target_idx").on(table.targetId),
    index("command_center_receipts_outcome_idx").on(table.outcome),
  ],
);
