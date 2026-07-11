export type AccessRequestStatus =
  | "Pending Review"
  | "Invitation Sent"
  | "Profile Completion Pending"
  | "Credential Verification"
  | "Active"
  | "Rejected"
  | "On Hold";

export type AccessRequest = {
  id: string;
  type: "Client" | "Notary";
  name: string;
  organization: string;
  email: string;
  phone: string;
  jurisdiction: string;
  service: string;
  status: AccessRequestStatus;
  received: string;
  nextAction: string;
  risk: "Standard" | "Elevated";
  reviewer: string;
  invitationTarget: string;
  invitationUrl: string;
  notes: string;
  eligibilityItems: string[];
  credentialItems: string[];
  activationItems: string[];
  auditEvents: string[];
};

export type VerificationDecision = "Verified" | "Pending" | "Deficient" | "Restricted";

export type ProfileVerificationItem = {
  section: string;
  requirement: string;
  evidence: string;
  status: VerificationDecision;
  reviewerNote: string;
};

export type ActivationDecisionSlug = "approve" | "corrections" | "inactive";

export type ActivationDecision = {
  slug: ActivationDecisionSlug;
  label: string;
  outcome: string;
  authority: string;
  staffAction: string;
  portalEffect: string;
  auditEntry: string;
  safeguards: string[];
};

export const activationDecisions: ActivationDecision[] = [
  {
    slug: "approve",
    label: "Approve Profile",
    outcome: "Activate verified portal profile",
    authority: "Administrator or Super Admin",
    staffAction:
      "Confirm every required profile item is verified, record the reviewer decision, and activate only the permissions approved for this profile.",
    portalEffect:
      "Client or notary portal access becomes active. RON and financial permissions remain separate controlled capabilities.",
    auditEntry:
      "Profile approved, portal status changed to Active, approving staff member recorded.",
    safeguards: [
      "RON access remains disabled unless remote authorization, RON training, and digital certificate records are verified.",
      "Payable changes require Administrator or Super Admin approval.",
      "Credential expiration monitoring begins immediately after activation.",
    ],
  },
  {
    slug: "corrections",
    label: "Request Corrections",
    outcome: "Return profile for correction",
    authority: "Authorized staff reviewer",
    staffAction:
      "Identify deficient items, send a correction notice, and keep portal access inactive until the corrected evidence is returned.",
    portalEffect:
      "Profile status remains Profile Completion Pending or Credential Verification. The user can update only the requested sections.",
    auditEntry:
      "Correction request issued with deficient sections, deadline, staff reviewer, and notification time.",
    safeguards: [
      "Do not expose internal notes that contain restricted credential or financial review details.",
      "Correction notices must use the formatted phone number and approved contact email.",
      "Expired or missing credentials cannot be overridden by a General Admin.",
    ],
  },
  {
    slug: "inactive",
    label: "Keep Inactive",
    outcome: "Maintain inactive access",
    authority: "Administrator or Super Admin for final denial or restriction",
    staffAction:
      "Document why activation is withheld, assign follow-up ownership, and prevent order, RON, document, and payable permissions from being enabled.",
    portalEffect:
      "The profile remains inactive. Staff may reopen review after missing eligibility or credential evidence is resolved.",
    auditEntry:
      "Profile kept inactive with reason, restricted permissions, reviewer, and next review date.",
    safeguards: [
      "No notary assignment eligibility is granted while inactive.",
      "No payable ledger adjustments are allowed without elevated approval.",
      "A future review date must use the Notarix date format, such as Dec 31 2026.",
    ],
  },
];

export const notaryProfileVerificationItems: ProfileVerificationItem[] = [
  {
    section: "Identity",
    requirement: "Government identification",
    evidence: "Driver's license verification record",
    status: "Pending",
    reviewerNote: "Confirm name, state, expiration date, and verification method.",
  },
  {
    section: "Commission",
    requirement: "Notary commission",
    evidence: "Commission certificate or state lookup",
    status: "Pending",
    reviewerNote: "Verify commission number, state, and expiration date before activation.",
  },
  {
    section: "Insurance",
    requirement: "E&O insurance",
    evidence: "Policy declaration page",
    status: "Pending",
    reviewerNote: "Confirm policy number, coverage amount, state requirement, and expiration.",
  },
  {
    section: "Background",
    requirement: "Background check",
    evidence: "National Notary Association report preferred",
    status: "Pending",
    reviewerNote: "Record provider and completion date. Escalate if report is missing.",
  },
  {
    section: "NNA",
    requirement: "NNA certification",
    evidence: "NNA profile certificate link or staff-view evidence",
    status: "Pending",
    reviewerNote: "Store profile hyperlink and staff verification result when certificate cannot be downloaded.",
  },
  {
    section: "RON",
    requirement: "Remote online notary authorization",
    evidence: "State authorization, RON training, and digital certificate",
    status: "Restricted",
    reviewerNote: "RON must remain disabled unless all remote authorization evidence is verified.",
  },
  {
    section: "Payables",
    requirement: "Payment setup",
    evidence: "Payable onboarding document",
    status: "Pending",
    reviewerNote: "Financial permissions remain disabled until Administrator or Super Admin approval.",
  },
];

export const clientProfileVerificationItems: ProfileVerificationItem[] = [
  {
    section: "Organization",
    requirement: "Business identity",
    evidence: "Organization name, authorized representative, and service jurisdiction",
    status: "Pending",
    reviewerNote: "Confirm the organization is eligible for currently offered Notarix services.",
  },
  {
    section: "Users",
    requirement: "Authorized users",
    evidence: "Named account administrator and permitted order submitters",
    status: "Pending",
    reviewerNote: "No shared accounts. Staff must confirm who can submit orders.",
  },
  {
    section: "Billing",
    requirement: "Billing contact",
    evidence: "Billing contact email and payment preference",
    status: "Pending",
    reviewerNote: "Order permissions remain limited until financial review is complete.",
  },
];

export const accessRequests: AccessRequest[] = [
  {
    id: "NSR-1001",
    type: "Notary",
    name: "Bernadette W Hudlin",
    organization: "DaWaHu Collective, LLC",
    email: "hudlinbe@example.com",
    phone: "555-123-4567",
    jurisdiction: "NC",
    service: "Mobile notarial services",
    status: "Pending Review",
    received: "Jul 10 2026",
    nextAction: "Review commission and identity credentials.",
    risk: "Standard",
    reviewer: "Unassigned",
    invitationTarget: "Notary profile completion",
    invitationUrl: "/profile/complete/NSR-1001",
    notes:
      "Confirm commission status, identity document readiness, service area, availability, and insurance documentation before issuing profile access.",
    eligibilityItems: [
      "Confirm legal name matches commission record.",
      "Verify primary operating jurisdiction.",
      "Confirm mobile notarial service eligibility.",
      "Confirm profile invitation recipient.",
    ],
    credentialItems: [
      "Commission certificate reviewed.",
      "Government identification reviewed.",
      "E&O insurance reviewed when applicable.",
      "RON authorization not required for this request.",
    ],
    activationItems: [
      "Issue notary profile completion invitation.",
      "Review completed profile for service area and availability.",
      "Activate only after credential verification is complete.",
    ],
    auditEvents: [
      "Jul 10 2026 at 9:12 AM ET - NSR received from access form.",
      "Jul 10 2026 at 9:18 AM ET - Staff queue record created.",
    ],
  },
  {
    id: "NSR-1002",
    type: "Client",
    name: "Avery Coleman",
    organization: "Coleman Title Group",
    email: "avery@example.com",
    phone: "555-234-6789",
    jurisdiction: "NC",
    service: "Multiple services",
    status: "Profile Completion Pending",
    received: "Jul 10 2026",
    nextAction: "Confirm authorized users and billing contact.",
    risk: "Standard",
    reviewer: "Operations",
    invitationTarget: "Client organization profile completion",
    invitationUrl: "/profile/complete/NSR-1002",
    notes:
      "Review organization type, billing contact, authorized users, service eligibility, and whether invoice terms should be withheld until financial review is complete.",
    eligibilityItems: [
      "Confirm organization category.",
      "Confirm authorized account administrator.",
      "Confirm billing contact and service jurisdiction.",
      "Confirm requested services are currently offered.",
    ],
    credentialItems: [
      "Business contact reviewed.",
      "Authorized representative reviewed.",
      "Billing profile pending.",
      "Portal invitation already sent.",
    ],
    activationItems: [
      "Review completed organization profile.",
      "Confirm billing status before order permissions.",
      "Activate client portal only after staff approval.",
    ],
    auditEvents: [
      "Jul 10 2026 at 11:30 AM ET - Client invitation sent.",
      "Jul 10 2026 at 11:45 AM ET - Profile completion pending.",
    ],
  },
  {
    id: "NSR-1003",
    type: "Notary",
    name: "Jordan Ellis",
    organization: "Independent Notary",
    email: "jordan@example.com",
    phone: "555-345-7890",
    jurisdiction: "SC",
    service: "Remote online notarial services",
    status: "Credential Verification",
    received: "Jul 09 2026",
    nextAction: "Verify RON authorization before activation.",
    risk: "Elevated",
    reviewer: "Credential Review",
    invitationTarget: "Remote notary credential verification",
    invitationUrl: "/profile/complete/NSR-1003",
    notes:
      "RON access must remain disabled until state authorization, electronic seal readiness, identity workflow, and approved remote-notary status are verified.",
    eligibilityItems: [
      "Confirm commission is active and in good standing.",
      "Confirm remote online notary authorization for stated jurisdiction.",
      "Confirm approved electronic notary capability.",
      "Confirm RON access should be limited to authorized sessions only.",
    ],
    credentialItems: [
      "Remote authorization reviewed.",
      "Electronic seal readiness reviewed.",
      "Digital certificate readiness reviewed.",
      "RON platform eligibility reviewed.",
    ],
    activationItems: [
      "Activate notary profile without RON if remote authorization is incomplete.",
      "Enable RON session access only after credential verification.",
      "Record final credential decision in audit history.",
    ],
    auditEvents: [
      "Jul 09 2026 at 4:20 PM ET - RON request received.",
      "Jul 10 2026 at 8:35 AM ET - Credential verification opened.",
    ],
  },
];

export const statusCounts = [
  ["Pending Review", "1", "New requests awaiting staff intake."],
  ["Profile Pending", "1", "Invitations sent, profile not complete."],
  ["Credential Review", "1", "Eligibility and commission review."],
  ["Active", "0", "Approved portal profiles."],
] as const;

export function findAccessRequest(id: string): AccessRequest | undefined {
  return accessRequests.find(
    (request) => request.id.toLowerCase() === id.toLowerCase(),
  );
}

export function getProfileVerificationItems(
  request: AccessRequest,
): ProfileVerificationItem[] {
  return request.type === "Notary"
    ? notaryProfileVerificationItems
    : clientProfileVerificationItems;
}
