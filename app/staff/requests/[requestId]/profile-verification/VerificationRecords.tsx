"use client";

import { useMemo, useState } from "react";
import {
  type AccessRequest,
  finalActivationControls,
  type ProfileVerificationItem,
  profileLifecycleStages,
  profileNumberAssignmentRule,
  profileNumberFormatExample,
  type VerificationDecision,
} from "../../data";
import { evidenceIdFromFileName } from "../../../../evidence-data";

type ProfileVerificationWorkspaceProps = {
  items: ProfileVerificationItem[];
  request: Pick<
    AccessRequest,
    | "approvedProfileNumber"
    | "auditEvents"
    | "email"
    | "id"
    | "jurisdiction"
    | "name"
    | "nextAction"
    | "organization"
    | "phone"
    | "reviewer"
    | "risk"
    | "service"
    | "status"
    | "type"
  >;
};

type VerificationRecordState = ProfileVerificationItem & {
  assignedReviewer: string;
  attachments: EvidenceAttachment[];
  lastUpdated: string;
  verifiedBy?: string;
  verifiedOn?: string;
};

type EvidenceAttachment = {
  category: string;
  custody: string;
  fileName: string;
  label: string;
  received: string;
  status: "Received" | "Provider Result" | "Pending Upload" | "Restricted";
};

const staffDisplayName = "Local Notarix Staff";

type SectionMenuItem = {
  label: string;
  state: "none" | "open" | "restricted" | "verified";
  status: string;
};

const notarySectionMenu = [
  { label: "Overview", status: "Console summary", state: "none" },
  { label: "Contact & Addresses", status: "Needs review", state: "open" },
  { label: "Identity", status: "Needs review", state: "open" },
  { label: "Commission", status: "Needs review", state: "open" },
  { label: "E&O Insurance", status: "Needs review", state: "open" },
  { label: "Background Check", status: "Needs review", state: "open" },
  { label: "NNA Certification", status: "Needs review", state: "open" },
  { label: "RON Authorization", status: "Restricted", state: "restricted" },
  { label: "W-9 / Payables", status: "Needs review", state: "open" },
  { label: "Staff Decision", status: "Elevated approval", state: "none" },
] as const satisfies readonly SectionMenuItem[];

const clientSectionMenu = [
  { label: "Overview", status: "Console summary", state: "none" },
  { label: "Client Profile", status: "Needs review", state: "open" },
  { label: "Organization", status: "Needs review", state: "open" },
  { label: "Authority", status: "Needs review", state: "open" },
  { label: "Contact", status: "Needs review", state: "open" },
  { label: "Billing", status: "Restricted", state: "restricted" },
  { label: "Users", status: "Needs review", state: "open" },
  { label: "Documents", status: "Needs review", state: "open" },
  { label: "Orders", status: "Needs review", state: "open" },
  { label: "Compliance", status: "Needs review", state: "open" },
  { label: "Staff Decision", status: "Elevated approval", state: "none" },
] as const satisfies readonly SectionMenuItem[];

const commonSecuritySignals = [
  "MFA/passkey required",
  "Staff role level: General Admin",
  "Audit tracking enabled",
  "Financial changes restricted",
  "Evidence access logged",
  "Audit report restricted to Super Admin",
] as const;

const notarySecuritySignals = [
  ...commonSecuritySignals,
  "RON restricted until verified",
] as const;

const clientSecuritySignals = [
  ...commonSecuritySignals,
  "Order permissions restricted until approved",
  "Document access limited to authorized users",
] as const;

const notaryProfileDossier = [
  {
    detail: "Bernadette W Hudlin",
    label: "Legal name",
    note: "Submitted profile name for identity proofing and commission comparison.",
  },
  {
    detail: "DaWaHu Collective, LLC",
    label: "Company / DBA",
    note: "Business affiliation shown on payable, service, and assignment records.",
  },
  {
    detail: "1428 Glenwood Avenue, Raleigh, NC 27605",
    label: "Residence address",
    note: "Primary address for identity and commission comparison.",
  },
  {
    detail: "PO Box 1842, Raleigh, NC 27602",
    label: "Mailing address",
    note: "Official notices, credential reminders, and tax correspondence.",
  },
  {
    detail: "555-123-4567 mobile · 555-234-7890 work",
    label: "Phone numbers",
    note: "Mobile phone requires verification before active assignment eligibility.",
  },
  {
    detail: "Wake, Durham, Orange, and Johnston counties",
    label: "Service area",
    note: "Mobile notarial services, 6:00 AM ET through 9:00 PM ET.",
  },
  {
    detail: "Morgan Ellis · 555-345-6789",
    label: "Emergency contact",
    note: "Used only for active order disruption or staff safety escalation.",
  },
  {
    detail: "Primary address differs from payable mailing address",
    label: "Address control",
    note: "Payable activation requires W-9 and elevated financial approval.",
  },
] as const;

const clientProfileDossier = [
  {
    detail: "Coleman Title Group",
    label: "Legal entity",
    note: "Client organization record for account authority and service eligibility.",
  },
  {
    detail: "Title company",
    label: "Client type",
    note: "Determines ordering permissions, billing review, and document handling controls.",
  },
  {
    detail: "Avery Coleman",
    label: "Authorized representative",
    note: "Primary account administrator requesting access for the organization.",
  },
  {
    detail: "210 Market Street, Raleigh, NC 27601",
    label: "Business address",
    note: "Operating address for entity and jurisdiction review.",
  },
  {
    detail: "PO Box 2110, Raleigh, NC 27602",
    label: "Billing mailing address",
    note: "Invoice notices, payment terms, and billing correspondence.",
  },
  {
    detail: "555-234-6789 office · 555-456-7890 billing",
    label: "Phone numbers",
    note: "Staff verifies operational and billing phone numbers before activation.",
  },
  {
    detail: "closings@coleman-title.example",
    label: "Authorized email domain",
    note: "Used to control user invitations and order-submitter eligibility.",
  },
  {
    detail: "Loan signing, mobile notary, electronic notarization",
    label: "Requested services",
    note: "Order permissions remain disabled until elevated approval.",
  },
] as const;

const reviewerBySection: Record<string, string> = {
  Authority: "GenAdmin002",
  Background: "GenAdmin003",
  Billing: "Admin approval",
  Commission: "GenAdmin002",
  Compliance: "GenAdmin005",
  Contact: "GenAdmin001",
  Documents: "GenAdmin003",
  Identity: "GenAdmin001",
  Insurance: "GenAdmin003",
  NNA: "GenAdmin002",
  Orders: "GenAdmin004",
  Organization: "GenAdmin001",
  Payables: "Admin approval",
  RON: "Super Admin",
  Tax: "GenAdmin004",
  Users: "GenAdmin002",
};

const lastUpdatedBySection: Record<string, string> = {
  Authority: "Jul 10 2026 at 12:18 PM ET",
  Background: "Jul 10 2026 at 11:20 AM ET",
  Billing: "Jul 10 2026 at 12:35 PM ET",
  Commission: "Jul 10 2026 at 10:50 AM ET",
  Compliance: "Jul 10 2026 at 12:48 PM ET",
  Contact: "Jul 10 2026 at 12:24 PM ET",
  Documents: "Jul 10 2026 at 12:41 PM ET",
  Identity: "Jul 10 2026 at 10:32 AM ET",
  Insurance: "Jul 10 2026 at 11:04 AM ET",
  NNA: "Jul 10 2026 at 11:36 AM ET",
  Orders: "Jul 10 2026 at 12:44 PM ET",
  Organization: "Jul 10 2026 at 12:12 PM ET",
  Payables: "Jul 10 2026 at 12:02 PM ET",
  RON: "Jul 10 2026 at 11:48 AM ET",
  Tax: "Jul 10 2026 at 11:55 AM ET",
  Users: "Jul 10 2026 at 12:30 PM ET",
};

const evidenceBySection: Record<string, EvidenceAttachment[]> = {
  Authority: [
    {
      category: "Representative authority",
      custody: "Staff verification copy",
      fileName: "authorized-representative-attestation.pdf",
      label: "Authorized representative attestation",
      received: "Jul 10 2026 at 12:18 PM ET",
      status: "Received",
    },
    {
      category: "Business authority",
      custody: "External lookup recorded",
      fileName: "title-company-officer-lookup.html",
      label: "Officer or account administrator lookup",
      received: "Jul 10 2026 at 12:19 PM ET",
      status: "Provider Result",
    },
  ],
  Background: [
    {
      category: "Background screening",
      custody: "Evidence access logged",
      fileName: "NNA-background-screening-report.pdf",
      label: "Background check report",
      received: "Jul 10 2026 at 11:20 AM ET",
      status: "Received",
    },
  ],
  Billing: [
    {
      category: "Billing authorization",
      custody: "Restricted financial record",
      fileName: "client-billing-authorization.pdf",
      label: "Billing authorization",
      received: "Jul 10 2026 at 12:35 PM ET",
      status: "Restricted",
    },
  ],
  Compliance: [
    {
      category: "Compliance review",
      custody: "Evidence access logged",
      fileName: "client-risk-screening-summary.pdf",
      label: "Client risk screening summary",
      received: "Jul 10 2026 at 12:48 PM ET",
      status: "Received",
    },
  ],
  Contact: [
    {
      category: "Contact verification",
      custody: "Staff verification copy",
      fileName: "client-contact-and-address-record.pdf",
      label: "Contact and address record",
      received: "Jul 10 2026 at 12:24 PM ET",
      status: "Received",
    },
  ],
  Documents: [
    {
      category: "Document handling",
      custody: "Evidence access logged",
      fileName: "client-document-handling-rules.pdf",
      label: "Document handling instructions",
      received: "Jul 10 2026 at 12:41 PM ET",
      status: "Received",
    },
  ],
  Commission: [
    {
      category: "Commission credential",
      custody: "Staff verification copy",
      fileName: "NC-notary-commission-certificate.pdf",
      label: "Commission certificate",
      received: "Jul 10 2026 at 10:50 AM ET",
      status: "Received",
    },
    {
      category: "State lookup",
      custody: "External lookup recorded",
      fileName: "NC-secretary-of-state-lookup.html",
      label: "State commission lookup",
      received: "Jul 10 2026 at 10:51 AM ET",
      status: "Provider Result",
    },
  ],
  Identity: [
    {
      category: "Identity proofing",
      custody: "Provider result stored",
      fileName: "identity-document-analysis-report.pdf",
      label: "Document analysis report",
      received: "Jul 10 2026 at 10:32 AM ET",
      status: "Provider Result",
    },
    {
      category: "Liveness capture",
      custody: "Restricted staff view",
      fileName: "camera-based-liveness-result.json",
      label: "Selfie and liveness result",
      received: "Jul 10 2026 at 10:33 AM ET",
      status: "Restricted",
    },
  ],
  Insurance: [
    {
      category: "Insurance",
      custody: "Evidence access logged",
      fileName: "eo-insurance-declaration-page.pdf",
      label: "E&O declaration page",
      received: "Jul 10 2026 at 11:04 AM ET",
      status: "Received",
    },
  ],
  NNA: [
    {
      category: "NNA certification",
      custody: "Staff-view evidence",
      fileName: "nna-signing-agent-certificate.pdf",
      label: "NNA certification",
      received: "Jul 10 2026 at 11:36 AM ET",
      status: "Received",
    },
    {
      category: "NNA profile",
      custody: "External profile link logged",
      fileName: "nna-profile-verification-link.url",
      label: "NNA profile verification link",
      received: "Jul 10 2026 at 11:37 AM ET",
      status: "Provider Result",
    },
  ],
  Orders: [
    {
      category: "Order authority",
      custody: "Staff verification copy",
      fileName: "client-order-permission-request.pdf",
      label: "Order permission request",
      received: "Jul 10 2026 at 12:44 PM ET",
      status: "Received",
    },
  ],
  Organization: [
    {
      category: "Business identity",
      custody: "External lookup recorded",
      fileName: "coleman-title-business-registration.pdf",
      label: "Business registration",
      received: "Jul 10 2026 at 12:12 PM ET",
      status: "Provider Result",
    },
    {
      category: "Client profile",
      custody: "Staff verification copy",
      fileName: "client-entity-profile.pdf",
      label: "Client entity profile",
      received: "Jul 10 2026 at 12:13 PM ET",
      status: "Received",
    },
  ],
  Payables: [
    {
      category: "Payable onboarding",
      custody: "Restricted financial record",
      fileName: "payable-onboarding-authorization.pdf",
      label: "Payable onboarding authorization",
      received: "Jul 10 2026 at 12:02 PM ET",
      status: "Restricted",
    },
  ],
  RON: [
    {
      category: "RON authorization",
      custody: "Jurisdictional verification required",
      fileName: "state-ron-authorization.pdf",
      label: "State RON authorization",
      received: "Jul 10 2026 at 11:48 AM ET",
      status: "Restricted",
    },
    {
      category: "RON training",
      custody: "Credential review queue",
      fileName: "ron-training-certificate.pdf",
      label: "RON training certificate",
      received: "Jul 10 2026 at 11:49 AM ET",
      status: "Received",
    },
    {
      category: "Digital certificate",
      custody: "Certificate authority verification required",
      fileName: "digital-certificate-provider-record.pdf",
      label: "Digital certificate provider record",
      received: "Jul 10 2026 at 11:50 AM ET",
      status: "Restricted",
    },
  ],
  Tax: [
    {
      category: "Tax onboarding",
      custody: "Restricted tax record",
      fileName: "completed-w-9-form.pdf",
      label: "Completed W-9 form",
      received: "Jul 10 2026 at 11:55 AM ET",
      status: "Received",
    },
  ],
  Users: [
    {
      category: "User access",
      custody: "Evidence access logged",
      fileName: "authorized-user-roster.csv",
      label: "Authorized user roster",
      received: "Jul 10 2026 at 12:30 PM ET",
      status: "Received",
    },
  ],
};

export function ProfileVerificationWorkspace({
  items,
  request,
}: ProfileVerificationWorkspaceProps) {
  const [records, setRecords] = useState<VerificationRecordState[]>(
    items.map((item) => ({
      ...item,
      assignedReviewer: reviewerBySection[item.section] ?? "GenAdmin005",
      attachments: evidenceBySection[item.section] ?? [],
      lastUpdated: lastUpdatedBySection[item.section] ?? "Jul 10 2026 at 10:00 AM ET",
    })),
  );
  const [selectedRecordKey, setSelectedRecordKey] = useState(
    `${records[0]?.section}-${records[0]?.requirement}`,
  );

  const openItems = records.filter((item) => item.status !== "Verified");
  const allItemsVerified = openItems.length === 0;
  const selectedRecord =
    records.find((item) => recordKey(item) === selectedRecordKey) ?? records[0];
  const isNotary = request.type === "Notary";
  const ronRecord = records.find((item) => item.section === "RON");
  const taxRecord = records.find((item) => item.section === "Tax");
  const payableRecord = records.find((item) => item.section === "Payables");
  const billingRecord = records.find((item) => item.section === "Billing");
  const ordersRecord = records.find((item) => item.section === "Orders");
  const payableReady =
    isNotary
      ? taxRecord?.status === "Verified" && payableRecord?.status === "Verified"
      : billingRecord?.status === "Verified";
  const profileDossier = isNotary ? notaryProfileDossier : clientProfileDossier;
  const sectionMenu = isNotary ? notarySectionMenu : clientSectionMenu;
  const securitySignals = isNotary ? notarySecuritySignals : clientSecuritySignals;
  const matrixTitle = isNotary
    ? "Executive verification matrix"
    : "Client authority and activation matrix";
  const dossierTitle = isNotary
    ? "Identity, contact, address, and service record"
    : "Client identity, authority, billing, and order record";
  const verificationScope = isNotary
    ? "identity, credential, RON, tax, and payable"
    : "organization, authority, billing, user access, document, order, and compliance";
  const activationSummary = isNotary
    ? "Portal, RON, assignment, and payable permissions remain disabled until General Admin verification is complete and Administrator or Super Admin approval is recorded."
    : "Client portal, order submission, document access, billing permissions, and user invitations remain disabled until General Admin verification is complete and Administrator or Super Admin approval is recorded.";

  function updateRecord(
    target: VerificationRecordState,
    status: VerificationDecision,
  ) {
    setRecords((currentRecords) =>
      currentRecords.map((record) => {
        if (recordKey(record) !== recordKey(target)) {
          return record;
        }

        if (status === "Verified") {
          return {
            ...record,
            status,
            lastUpdated: formatNotarixDateTime(new Date()),
            verifiedBy: staffDisplayName,
            verifiedOn: formatNotarixDate(new Date()),
          };
        }

        return {
          ...record,
          status,
          lastUpdated: formatNotarixDateTime(new Date()),
          verifiedBy: undefined,
          verifiedOn: undefined,
        };
      }),
    );
  }

  const completionLabel = useMemo(
    () => `${records.length - openItems.length} of ${records.length} verified`,
    [openItems.length, records.length],
  );

  return (
    <div className="verification-console">
      <aside className="console-rail" aria-label={`${request.type} profile sections`}>
        <section className="console-subject-card" aria-label="Case file summary">
          <p className="request-label">Case file</p>
          <h2>{request.id}</h2>
          <span>{request.status}</span>
          <dl>
            <div>
              <dt>Profile type</dt>
              <dd>{request.type}</dd>
            </div>
            <div>
              <dt>Jurisdiction</dt>
              <dd>{request.jurisdiction}</dd>
            </div>
            <div>
              <dt>Profile number</dt>
              <dd>{request.approvedProfileNumber ?? "Pending approval"}</dd>
            </div>
          </dl>
          <p>{profileNumberFormatExample(request.type)}</p>
        </section>

        <p className="request-label">Case file index</p>
        <nav>
          {sectionMenu.map((section) => (
            <a
              aria-label={`${section.label}: ${section.status}`}
              href={`#${sectionId(section.label)}`}
              key={section.label}
            >
              <span>{section.label}</span>
              {section.state === "none" ? null : (
                <mark data-state={section.state}>
                  {section.state === "verified" ? "✓" : "X"}
                </mark>
              )}
            </a>
          ))}
        </nav>

        <section className="console-security-card" aria-label="Security controls">
          <p className="request-label">Access controls</p>
          <p>
            Platform safeguards applied to this staff review. These controls do
            not replace profile verification.
          </p>
          <ul>
            {securitySignals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </section>
      </aside>

      <article className="console-main" id="overview">
        <header className="console-panel-heading">
          <div>
            <p className="request-label">Verification queue</p>
            <h2>{matrixTitle}</h2>
          </div>
          <strong>{completionLabel}</strong>
        </header>

        <section
          className="profile-dossier"
          id="contact-and-addresses"
          aria-label="Profile contact and address dossier"
        >
          <div className="profile-dossier-heading">
            <p className="request-label">Submitted profile dossier</p>
            <h2>{dossierTitle}</h2>
          </div>
          <div className="profile-dossier-grid">
            {profileDossier.map((item) => (
              <article key={item.label}>
                <span>{item.label}</span>
                <strong>{item.detail}</strong>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="verification-table-wrap">
          <table className="verification-table">
            <caption>Profile verification requirements</caption>
            <thead>
              <tr>
                <th scope="col">Requirement</th>
                <th scope="col">Evidence</th>
                <th scope="col">Status</th>
                <th scope="col">Assigned reviewer</th>
                <th scope="col">Last updated</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((item) => (
                <tr
                  data-status={item.status}
                  id={sectionId(item.section)}
                  key={recordKey(item)}
                >
                  <td>
                    <span>{item.section}</span>
                    <strong>{item.requirement}</strong>
                  </td>
                  <td>
                    {item.evidence}
                    <span
                      aria-label={`Evidence attachments: ${item.attachments
                        .map((attachment) => attachment.fileName)
                        .join(", ")}`}
                      className="evidence-packet-summary"
                    >
                      {item.attachments.length} evidence{" "}
                      {item.attachments.length === 1 ? "file" : "files"}
                    </span>
                  </td>
                  <td>
                    <mark data-status={item.status}>{item.status}</mark>
                  </td>
                  <td>{item.assignedReviewer}</td>
                  <td>{item.lastUpdated}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => setSelectedRecordKey(recordKey(item))}
                    >
                      Review
                    </button>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
      </article>

      <aside className="activation-control-center" id="staff-decision">
        <p className="request-label">Activation control center</p>
        <h2>{allItemsVerified ? "Ready for elevated approval" : "Approval locked"}</h2>
        <p className="activation-summary">{activationSummary}</p>
        <section className="review-drawer" aria-label="Selected requirement review">
          <p className="request-label">Evidence review command</p>
          <h3>{selectedRecord.requirement}</h3>
          <span>{selectedRecord.section} · {selectedRecord.assignedReviewer}</span>
          <section className="evidence-packet" aria-label="Evidence packet">
            <p className="request-label">Evidence packet</p>
            <div className="evidence-packet-list">
              {selectedRecord.attachments.map((attachment) => (
                <article key={attachment.fileName}>
                  <div>
                    <span>{attachment.category}</span>
                    <strong>{attachment.label}</strong>
                    <p>{attachment.fileName}</p>
                  </div>
                  <dl>
                    <div>
                      <dt>Status</dt>
                      <dd>{attachment.status}</dd>
                    </div>
                    <div>
                      <dt>Received</dt>
                      <dd>{attachment.received}</dd>
                    </div>
                    <div>
                      <dt>Custody</dt>
                      <dd>{attachment.custody}</dd>
                    </div>
                  </dl>
                  <a href={`/evidence/${evidenceIdFromFileName(attachment.fileName)}`}>
                    Open Evidence
                  </a>
                </article>
              ))}
            </div>
          </section>
          <p>{selectedRecord.reviewerNote}</p>
          {selectedRecord.verifiedBy ? (
            <p className="verification-confirmation">
              Verified by {selectedRecord.verifiedBy} on {selectedRecord.verifiedOn}.
              Reopening this record should create an audit entry.
            </p>
          ) : null}
          <label>
            Staff identity and audit note
            <textarea
              name="Staff identity and audit note"
              placeholder="Record staff identity, evidence reviewed, and rationale before changing status."
              rows={4}
            />
          </label>
          <div className="drawer-actions">
            {selectedRecord.status === "Verified" ? (
              <button
                type="button"
                onClick={() => updateRecord(selectedRecord, "Pending")}
              >
                Reopen Review
              </button>
            ) : (
              <button
                data-workflow-action="mark-section-verified"
                data-workflow-endpoint={`/staff/workflow/${request.id}/section/${encodeURIComponent(selectedRecord.section)}`}
                type="button"
                onClick={() => updateRecord(selectedRecord, "Verified")}
              >
                Mark Verified
              </button>
            )}
            <button
              data-workflow-action="request-section-correction"
              data-workflow-endpoint={`/staff/workflow/${request.id}/section/${encodeURIComponent(selectedRecord.section)}`}
              type="button"
              onClick={() => updateRecord(selectedRecord, "Deficient")}
            >
              Request Correction
            </button>
            <button
              data-workflow-action="escalate-section"
              data-workflow-endpoint={`/staff/workflow/${request.id}/section/${encodeURIComponent(selectedRecord.section)}`}
              type="button"
              onClick={() => updateRecord(selectedRecord, "Restricted")}
            >
              Escalate
            </button>
          </div>
        </section>

        <section className="approval-routing" aria-label="Two step approval routing">
          <p className="request-label">Two-step approval</p>
          <ol>
            <li data-state={allItemsVerified ? "complete" : "active"}>
              <strong>Step 1 · General Admin verification</strong>
              <span>
                Validate every {verificationScope} control before routing the
                case forward.
              </span>
            </li>
            <li data-state={allItemsVerified ? "active" : "locked"}>
              <strong>Step 2 · Administrator or Super Admin approval</strong>
              <span>
                Elevated approver reviews the restricted audit report and records
                final activation authorization.
              </span>
            </li>
          </ol>
          <dl>
            <div>
              <dt>Notification recipients</dt>
              <dd>Super Admin and Administrator</dd>
            </div>
            <div>
              <dt>Audit report access</dt>
              <dd>Restricted to Super Admin report workspace</dd>
            </div>
          </dl>
          {allItemsVerified ? (
            <form action={`/staff/workflow/${request.id}`} method="post">
              <input name="action" type="hidden" value="complete-genadmin-verification" />
              <input name="role" type="hidden" value="GenAdmin" />
              <button type="submit">Mark Verification Complete and Notify Approvers</button>
            </form>
          ) : (
            <button aria-disabled="true" disabled type="button">
              GenAdmin Verification Incomplete
            </button>
          )}
        </section>

        <details className="approval-routing disclosure-panel">
          <summary>Workflow status path</summary>
          <ol>
            {profileLifecycleStages.map((stage) => (
              <li
                data-state={stage === "GenAdmin Verification" ? "active" : "locked"}
                key={stage}
              >
                <strong>{stage}</strong>
              </li>
            ))}
          </ol>
        </details>

        <details className="approval-routing disclosure-panel">
          <summary>Final activation checklist</summary>
          <ol>
            {finalActivationControls.map((control) => (
              <li data-state="locked" key={control}>
                <strong>{control}</strong>
              </li>
            ))}
          </ol>
        </details>

        <dl>
          <div>
            <dt>Required items remaining</dt>
            <dd>{openItems.length}</dd>
          </div>
          <div>
            <dt>{isNotary ? "RON eligibility status" : "Order eligibility status"}</dt>
            <dd>
              {isNotary
                ? ronRecord?.status === "Verified"
                  ? "Eligible for review"
                  : "Restricted until verified"
                : ordersRecord?.status === "Verified"
                  ? "Order permissions ready for approval"
                  : "Restricted until client authority is verified"}
            </dd>
          </div>
          <div>
            <dt>{isNotary ? "Payable eligibility status" : "Billing eligibility status"}</dt>
            <dd>
              {payableReady
                ? "Ready for admin approval"
                : isNotary
                  ? "Restricted pending W-9 and payables"
                  : "Restricted pending billing approval"}
            </dd>
          </div>
          <div>
            <dt>Assigned {isNotary ? "NSN" : "NSC"}</dt>
            <dd>{request.approvedProfileNumber ?? "Only after approval"}</dd>
          </div>
          <div>
            <dt>Approving authority</dt>
            <dd>Administrator or Super Admin required</dd>
          </div>
          <div>
            <dt>Audit report</dt>
            <dd>Separate Super Admin report required before final approval</dd>
          </div>
        </dl>

        <p className="decision-context-note">
          {profileNumberAssignmentRule(request.type)}
        </p>
        <div className="decision-actions">
          {allItemsVerified ? (
            <form action={`/staff/workflow/${request.id}`} method="post">
              <input name="action" type="hidden" value="complete-genadmin-verification" />
              <input name="role" type="hidden" value="GenAdmin" />
              <button type="submit">Submit for Elevated Approval</button>
            </form>
          ) : (
            <button aria-disabled="true" disabled type="button">
              Approval Locked
            </button>
          )}
          <a href={`/staff/requests/${request.id}/profile-verification/decision/corrections`}>
            Request Corrections
          </a>
          <a href={`/staff/requests/${request.id}/profile-verification/decision/inactive`}>
            Keep Inactive
          </a>
        </div>
        {!allItemsVerified ? (
          <p className="decision-lock-note">
            {openItems.length} verification items remain unresolved. Approval should not be
            available until the profile has no pending, deficient, or restricted records.
          </p>
        ) : null}
      </aside>
    </div>
  );
}

function recordKey(item: Pick<ProfileVerificationItem, "requirement" | "section">) {
  return `${item.section}-${item.requirement}`;
}

function sectionId(section: string): string {
  const sectionIds: Record<string, string> = {
    Background: "background-check",
    "Client Profile": "contact-and-addresses",
    Compliance: "compliance",
    Commission: "commission",
    "Contact & Addresses": "contact-and-addresses",
    Contact: "contact",
    Documents: "documents",
    "E&O Insurance": "eo-insurance",
    Identity: "identity",
    Insurance: "eo-insurance",
    "NNA Certification": "nna-certification",
    NNA: "nna-certification",
    Orders: "orders",
    Organization: "organization",
    RON: "ron-authorization",
    "RON Authorization": "ron-authorization",
    Payables: "payable-setup",
    Tax: "w-9-payables",
    "W-9 / Payables": "w-9-payables",
  };

  return (
    sectionIds[section] ??
    section
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/\//g, "")
      .replace(/\s+/g, "-")
  );
}

function formatNotarixDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatNotarixDateTime(date: Date): string {
  const datePart = formatNotarixDate(date);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  }).format(date);

  return `${datePart} at ${timePart}`;
}
