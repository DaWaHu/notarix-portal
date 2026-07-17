import {
  type AccessRequest,
  type AccessRequestStatus,
  activationAuditRequirements,
  finalActivationControls,
  getProfileVerificationItems,
  type ProfileVerificationItem,
  profileNumberFormatExample,
  profileNumberPrefix,
  type VerificationDecision,
} from "./data";
import type { StoredAccessRequest } from "./store";

export type WorkflowAction =
  | "create-nsr"
  | "send-profile-invitation"
  | "submit-profile"
  | "mark-section-verified"
  | "request-section-correction"
  | "escalate-section"
  | "complete-genadmin-verification"
  | "request-corrections"
  | "grant-final-approval"
  | "keep-inactive";

export type WorkflowActorRole = "GenAdmin" | "Admin" | "SuperAdmin";

export type WorkflowTransition = {
  action: WorkflowAction;
  allowed: boolean;
  auditEvent: string;
  currentStatus: AccessRequestStatus;
  nextStatus: AccessRequestStatus;
  authority: string;
  blockedReason?: string;
  generatedProfileNumber?: string;
  notifications: WorkflowNotification[];
  requiredAuditFields: readonly string[];
  resultingControls: readonly string[];
};

export type WorkflowNotification = {
  channel: "Email" | "Phone";
  recipient: string;
  purpose: string;
  status: "Queued" | "Requires Consent" | "Not Queued";
};

export type WorkflowSectionTransition = {
  action: Extract<
    WorkflowAction,
    "mark-section-verified" | "request-section-correction" | "escalate-section"
  >;
  allowed: boolean;
  section: string;
  currentStatus: VerificationDecision | "Missing";
  nextStatus: VerificationDecision | "Missing";
  reviewer: string;
  auditEvent: string;
  blockedReason?: string;
};

const transitionAuthority: Record<WorkflowAction, string> = {
  "complete-genadmin-verification": "General Admin",
  "create-nsr": "Notarix staff intake",
  "escalate-section": "General Admin",
  "grant-final-approval": "Administrator or Super Admin",
  "keep-inactive": "Administrator or Super Admin",
  "mark-section-verified": "General Admin",
  "request-corrections": "Authorized staff reviewer",
  "request-section-correction": "General Admin",
  "send-profile-invitation": "Notarix staff",
  "submit-profile": "Profile owner",
};

export function resolveWorkflowTransition(
  request: AccessRequest | StoredAccessRequest,
  action: WorkflowAction,
  actorRole: WorkflowActorRole = "GenAdmin",
): WorkflowTransition {
  const currentStatus = request.status;
  const canUseElevatedAuthority = actorRole === "Admin" || actorRole === "SuperAdmin";

  if (action === "grant-final-approval") {
    const allowed =
      canUseElevatedAuthority && currentStatus === "Ready for Elevated Approval";
    return {
      action,
      allowed,
      auditEvent: allowed
        ? `${timestamp()} - ${actorRole} granted final approval for ${request.id}. ${profileNumberPrefix(
            request.type,
          )} generated at activation.`
        : `${timestamp()} - Final approval attempted for ${request.id} but workflow controls blocked activation.`,
      authority: transitionAuthority[action],
      blockedReason: allowed
        ? undefined
        : "Final approval requires Administrator or Super Admin authority and Ready for Elevated Approval status.",
      currentStatus,
      generatedProfileNumber: allowed
        ? request.approvedProfileNumber ?? profileNumberFormatExample(request.type)
        : undefined,
      nextStatus: allowed ? "Active" : currentStatus,
      notifications: allowed ? approvalNotifications(request) : [],
      requiredAuditFields: activationAuditRequirements,
      resultingControls: finalActivationControls,
    };
  }

  if (action === "complete-genadmin-verification") {
    const allowed =
      actorRole === "GenAdmin" && allStoredItemsVerified(request);
    return {
      action,
      allowed,
      auditEvent: allowed
        ? `${timestamp()} - General Admin verification completed for ${request.id}; elevated approvers notified.`
        : `${timestamp()} - General Admin verification completion blocked for ${request.id}.`,
      authority: transitionAuthority[action],
      blockedReason: allowed
        ? undefined
        : "Every required verification item must be verified before routing to elevated approval.",
      currentStatus,
      nextStatus: allowed ? "Ready for Elevated Approval" : currentStatus,
      notifications: allowed ? elevatedApprovalNotifications() : [],
      requiredAuditFields: [
        "General Admin reviewer identifier",
        "Verified item count",
        "Open item count",
        "Notification recipients",
      ],
      resultingControls: [
        "Profile remains inactive",
        "Admin/Super Admin approval required",
        "Restricted audit report required",
      ],
    };
  }

  if (action === "send-profile-invitation") {
    const allowed =
      currentStatus === "Pending Review" ||
      currentStatus === "NSR Created" ||
      currentStatus === "Contact Received";
    return basicTransition(
      request,
      action,
      allowed,
      allowed ? "Profile Completion Pending" : currentStatus,
      allowed
        ? invitationNotifications(request)
        : [],
      allowed
        ? undefined
        : "Profile invitations are available only during intake review statuses.",
    );
  }

  if (action === "submit-profile") {
    const allowed = currentStatus === "Profile Completion Pending";
    return basicTransition(
      request,
      action,
      allowed,
      allowed ? "GenAdmin Verification" : currentStatus,
      allowed ? staffSubmissionNotifications(request) : [],
      allowed
        ? undefined
        : "Profile submission requires an issued profile invitation and completion-pending status.",
    );
  }

  if (action === "request-corrections") {
    return basicTransition(
      request,
      action,
      true,
      "Corrections Requested",
      correctionNotifications(request),
    );
  }

  if (action === "keep-inactive") {
    return basicTransition(
      request,
      action,
      canUseElevatedAuthority,
      canUseElevatedAuthority ? "On Hold" : currentStatus,
      [],
      canUseElevatedAuthority
        ? undefined
        : "Keeping a final approval file inactive requires Administrator or Super Admin authority.",
    );
  }

  return basicTransition(
    request,
    action,
    false,
    currentStatus,
    [],
    "This action is handled by the section verification workflow.",
  );
}

export function resolveSectionTransition(
  request: AccessRequest | StoredAccessRequest,
  section: string,
  action: WorkflowSectionTransition["action"],
  reviewer = "GenAdmin001",
): WorkflowSectionTransition {
  const item = getWorkflowVerificationItems(request).find(
    (verificationItem) =>
      verificationItem.section.toLowerCase() === section.toLowerCase(),
  );
  if (!item) {
    return {
      action,
      allowed: false,
      auditEvent: `${timestamp()} - ${reviewer} attempted ${action} for missing section ${section}.`,
      blockedReason: "The requested verification section does not exist for this profile type.",
      currentStatus: "Missing",
      nextStatus: "Missing",
      reviewer,
      section,
    };
  }

  const nextStatus = sectionActionStatus(action);
  return {
    action,
    allowed: true,
    auditEvent: `${timestamp()} - ${reviewer} changed ${request.id} ${item.section} from ${item.status} to ${nextStatus}.`,
    currentStatus: item.status,
    nextStatus,
    reviewer,
    section: item.section,
  };
}

export function findWorkflowRequest(requestId: string): AccessRequest {
  throw new Error(
    `findWorkflowRequest(${requestId}) has been replaced by the stored request repository.`,
  );
}

function basicTransition(
  request: AccessRequest,
  action: WorkflowAction,
  allowed: boolean,
  nextStatus: AccessRequestStatus,
  notifications: WorkflowNotification[],
  blockedReason?: string,
): WorkflowTransition {
  return {
    action,
    allowed,
    auditEvent: allowed
      ? `${timestamp()} - ${transitionAuthority[action]} completed ${action} for ${request.id}.`
      : `${timestamp()} - ${action} blocked for ${request.id}.`,
    authority: transitionAuthority[action],
    blockedReason,
    currentStatus: request.status,
    nextStatus,
    notifications,
    requiredAuditFields: ["Actor identity", "Previous status", "New status", "Action timestamp"],
    resultingControls: ["Portal access remains controlled until final approval"],
  };
}

function allStoredItemsVerified(request: AccessRequest): boolean {
  if (
    request.status === "Ready for Elevated Approval" ||
    request.status === "Admin/Super Admin Review" ||
    request.status === "Approved" ||
    request.status === "Active"
  ) {
    return true;
  }

  return getWorkflowVerificationItems(request).every(
    (item) => item.status === "Verified",
  );
}

function getWorkflowVerificationItems(
  request: AccessRequest | StoredAccessRequest,
): ProfileVerificationItem[] {
  if ("verificationItems" in request) return request.verificationItems;
  return getProfileVerificationItems(request);
}

function sectionActionStatus(
  action: WorkflowSectionTransition["action"],
): VerificationDecision {
  if (action === "mark-section-verified") return "Verified";
  if (action === "request-section-correction") return "Deficient";
  return "Restricted";
}

function approvalNotifications(request: AccessRequest): WorkflowNotification[] {
  return [
    {
      channel: "Email",
      purpose: "Profile approval notice",
      recipient: request.email,
      status: "Queued",
    },
    {
      channel: "Phone",
      purpose: "Profile approval phone message",
      recipient: request.phone,
      status: "Requires Consent",
    },
  ];
}

function correctionNotifications(request: AccessRequest): WorkflowNotification[] {
  return [
    {
      channel: "Email",
      purpose: "Profile correction notice",
      recipient: request.email,
      status: "Queued",
    },
  ];
}

function elevatedApprovalNotifications(): WorkflowNotification[] {
  return [
    {
      channel: "Email",
      purpose: "Elevated approval ready",
      recipient: "superadmin@notarix.live",
      status: "Queued",
    },
    {
      channel: "Email",
      purpose: "Elevated approval ready",
      recipient: "administrator@notarix.live",
      status: "Queued",
    },
  ];
}

function invitationNotifications(request: AccessRequest): WorkflowNotification[] {
  return [
    {
      channel: "Email",
      purpose: request.invitationTarget,
      recipient: request.email,
      status: "Queued",
    },
  ];
}

function staffSubmissionNotifications(request: AccessRequest): WorkflowNotification[] {
  return [
    {
      channel: "Email",
      purpose: "Submitted profile ready for GenAdmin Verification",
      recipient: "genadmin-review@notarix.live",
      status: "Queued",
    },
    {
      channel: "Email",
      purpose: "Profile submission received",
      recipient: request.email,
      status: "Queued",
    },
  ];
}

function timestamp(): string {
  return "Jul 18 2026 at 5:00 PM ET";
}
