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

export const orderOperationalRecords = sqliteTable(
  "order_operational_records",
  {
    id: text("id").primaryKey(),
    client: text("client").notNull(),
    clientProfile: text("client_profile").notNull(),
    clientContact: text("client_contact").notNull(),
    clientEmail: text("client_email").notNull(),
    notary: text("notary").notNull(),
    notaryProfile: text("notary_profile").notNull(),
    service: text("service").notNull(),
    jurisdiction: text("jurisdiction").notNull(),
    appointment: text("appointment").notNull(),
    location: text("location").notNull(),
    orderStatus: text("order_status").notNull(),
    assignmentStatus: text("assignment_status").notNull(),
    documentStatus: text("document_status").notNull(),
    documentCount: text("document_count").notNull(),
    validationStatus: text("validation_status").notNull(),
    ronStatus: text("ron_status").notNull(),
    billingStatus: text("billing_status").notNull(),
    payableStatus: text("payable_status").notNull(),
    communicationStatus: text("communication_status").notNull(),
    owner: text("owner").notNull(),
    risk: text("risk").notNull(),
    nextAction: text("next_action").notNull(),
    createdAtUtc: integer("created_at_utc", { mode: "timestamp" }).notNull(),
    updatedAtUtc: integer("updated_at_utc", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("order_operational_records_client_idx").on(table.client),
    index("order_operational_records_notary_idx").on(table.notary),
    index("order_operational_records_status_idx").on(table.orderStatus),
    index("order_operational_records_owner_idx").on(table.owner),
  ],
);

export const orderLifecycleStages = sqliteTable(
  "order_lifecycle_stages",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orderOperationalRecords.id),
    stage: text("stage").notNull(),
    status: text("status").notNull(),
    owner: text("owner").notNull(),
    authority: text("authority").notNull(),
    timestamp: text("timestamp").notNull(),
    evidence: text("evidence").notNull(),
    nextAction: text("next_action").notNull(),
    updatedAtUtc: integer("updated_at_utc", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    uniqueIndex("order_lifecycle_stages_order_stage_idx").on(table.orderId, table.stage),
    index("order_lifecycle_stages_status_idx").on(table.status),
  ],
);

export const orderSignerReadiness = sqliteTable(
  "order_signer_readiness",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orderOperationalRecords.id),
    signerName: text("signer_name").notNull(),
    signerRole: text("signer_role").notNull(),
    identityMethod: text("identity_method").notNull(),
    identityStatus: text("identity_status").notNull(),
    locationReadiness: text("location_readiness").notNull(),
    witnessRequirement: text("witness_requirement").notNull(),
    specialInstructions: text("special_instructions").notNull(),
    risk: text("risk").notNull(),
    staffOwner: text("staff_owner").notNull(),
    nextAction: text("next_action").notNull(),
    updatedAtUtc: integer("updated_at_utc", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("order_signer_readiness_order_idx").on(table.orderId),
    index("order_signer_readiness_identity_status_idx").on(table.identityStatus),
    index("order_signer_readiness_owner_idx").on(table.staffOwner),
  ],
);

export const orderAppointments = sqliteTable(
  "order_appointments",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orderOperationalRecords.id),
    client: text("client").notNull(),
    notary: text("notary").notNull(),
    appointment: text("appointment").notNull(),
    location: text("location").notNull(),
    serviceType: text("service_type").notNull(),
    status: text("status").notNull(),
    signerReadiness: text("signer_readiness").notNull(),
    documentReadiness: text("document_readiness").notNull(),
    notificationStatus: text("notification_status").notNull(),
    staffOwner: text("staff_owner").notNull(),
    authority: text("authority").notNull(),
    nextAction: text("next_action").notNull(),
    updatedAtUtc: integer("updated_at_utc", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("order_appointments_order_idx").on(table.orderId),
    index("order_appointments_status_idx").on(table.status),
    index("order_appointments_owner_idx").on(table.staffOwner),
  ],
);

export const orderCloseoutControls = sqliteTable(
  "order_closeout_controls",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orderOperationalRecords.id),
    control: text("control").notNull(),
    status: text("status").notNull(),
    evidence: text("evidence").notNull(),
    owner: text("owner").notNull(),
    authority: text("authority").notNull(),
    lastUpdated: text("last_updated").notNull(),
    nextAction: text("next_action").notNull(),
    updatedAtUtc: integer("updated_at_utc", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("order_closeout_controls_order_idx").on(table.orderId),
    index("order_closeout_controls_status_idx").on(table.status),
    index("order_closeout_controls_owner_idx").on(table.owner),
  ],
);

export const orderDeliveryReceipts = sqliteTable(
  "order_delivery_receipts",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orderOperationalRecords.id),
    receiptArea: text("receipt_area").notNull(),
    clientStatus: text("client_status").notNull(),
    clientVisibleEvidence: text("client_visible_evidence").notNull(),
    deliveryChannel: text("delivery_channel").notNull(),
    deliveredTo: text("delivered_to").notNull(),
    deliveredAt: text("delivered_at").notNull(),
    accessControl: text("access_control").notNull(),
    clientNextAction: text("client_next_action").notNull(),
    updatedAtUtc: integer("updated_at_utc", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("order_delivery_receipts_order_idx").on(table.orderId),
    index("order_delivery_receipts_status_idx").on(table.clientStatus),
  ],
);

export const notaryCompletionReceipts = sqliteTable(
  "notary_completion_receipts",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orderOperationalRecords.id),
    receiptArea: text("receipt_area").notNull(),
    status: text("status").notNull(),
    evidence: text("evidence").notNull(),
    notaryAction: text("notary_action").notNull(),
    staffReview: text("staff_review").notNull(),
    payableImpact: text("payable_impact").notNull(),
    updatedAtUtc: integer("updated_at_utc", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("notary_completion_receipts_order_idx").on(table.orderId),
    index("notary_completion_receipts_status_idx").on(table.status),
  ],
);
