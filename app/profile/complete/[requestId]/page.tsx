import { notFound } from "next/navigation";
import { type ReactNode } from "react";
import { findAccessRequest } from "../../../staff/requests/data";

type ProfileCompletionPageProps = {
  params: Promise<{
    requestId: string;
  }>;
};

const clientSections = [
  "Organization identity and primary service address",
  "Authorized account administrator",
  "Billing contact and payment preference",
  "Authorized users who may submit notarial orders",
  "Communication and document-delivery preferences",
];

const notarySections = [
  "Address and contact",
  "Phone verification",
  "Payable setup",
  "W-9 form",
  "Background check",
  "E&O insurance",
  "Identity verification",
  "NNA certification",
  "Notary commission",
  "RON credentials",
  "Expiration monitoring",
  "Payment ledger",
];

const notaryProfileLinks = [
  ["Overview", "#profile-overview"],
  ["Address and Contact", "#address-contact"],
  ["Phone Verification", "#phone-verification"],
  ["Payable Setup", "#payable-setup"],
  ["W-9 Form", "#w9-form"],
  ["Background Check", "#background-check"],
  ["E&O Insurance", "#eo-insurance"],
  ["Identity Verification", "#identity-verification"],
  ["NNA Certification", "#nna-certification"],
  ["Notary Commission", "#notary-commission"],
  ["RON Credentials", "#ron-credentials"],
  ["Expiration Monitoring", "#expiration-monitoring"],
  ["Payment Ledger", "#payment-ledger"],
] as const;

const clientProfileLinks = [
  ["Overview", "#profile-overview"],
  ["Client Type", "#client-type"],
  ["Organization", "#client-organization"],
  ["Addresses", "#client-addresses"],
  ["Billing", "#client-billing"],
  ["Authorized Users", "#authorized-users"],
  ["Document Rules", "#document-rules"],
  ["Service Access", "#service-access"],
  ["Submit", "#submit-profile"],
] as const;

const credentialOverviewItems = [
  "Background Check",
  "E&O Insurance",
  "Identity Verification",
  "NNA Certification",
  "Notary Commission",
  "RON Training",
  "RON Digital Certificate",
  "W-9 Form",
  "Payable Onboarding",
];

const notaryExpirationRules = [
  "First reminder at 90 days before expiration.",
  "Follow-up reminders every 15 days until 30 days remain.",
  "Weekly reminders beginning 30 days before expiration.",
  "Staff expiration audit report available by credential type and notary.",
];

export default async function ProfileCompletionPage({
  params,
}: ProfileCompletionPageProps) {
  const { requestId } = await params;
  const request = findAccessRequest(requestId);
  if (!request) notFound();

  const isNotary = request.type === "Notary";
  const sections = isNotary ? notarySections : clientSections;
  const profileTitle = isNotary
    ? "Complete your notary profile"
    : "Complete your client profile";

  return (
    <main className="staff-page profile-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Profile Completion</span>
        </a>
        <nav aria-label="Profile completion navigation">
          <a href="/">Home</a>
          <a className="nav-cta" href="#submit-profile">Submit Profile</a>
        </nav>
      </header>

      <section className="review-hero profile-hero">
        <div>
          <p className="kicker">Profile Invitation Sent · Secure Completion</p>
          <h1>{profileTitle}</h1>
          <div className="console-meta" aria-label="Profile completion metadata">
            <span>{request.id}</span>
            <span>{request.type} profile</span>
            <span>{request.status}</span>
          </div>
          <p>
            Complete the required profile sections for {request.organization}.
            Notarix staff will review the submission before any portal access,
            financial permissions, order access, or RON capabilities are activated.
          </p>
        </div>
        <aside>
          <p>Next status</p>
          <strong>Profile Submitted</strong>
          <span>Submission routes this file to GenAdmin Verification.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Profile completion process">
        {[
          ["Step 1", "Complete profile", "Provide required identity, authority, contact, credential, billing, or payable data."],
          ["Step 2", "Upload evidence", "Attach certificates, forms, rosters, authorizations, and supporting records."],
          ["Step 3", "Submit for review", "Submitted records lock for staff review unless corrections are requested."],
          ["Step 4", "Verification", "GenAdmin verifies before Administrator or Super Admin final approval."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="profile-layout" aria-label="Profile completion workspace">
        <ProfileNavigation
          links={isNotary ? notaryProfileLinks : clientProfileLinks}
          title={isNotary ? "Notary profile sections" : "Client profile sections"}
        />

        <form className="profile-form">
          <div className="form-heading" id="profile-overview">
            <p>{request.id}</p>
            <h2>{request.name}</h2>
          </div>

          <div className="field-row">
            <label>
              Legal or organization name
              <input defaultValue={request.organization} name="Organization name" />
            </label>
            <label>
              Primary contact
              <input defaultValue={request.name} name="Primary contact" />
            </label>
          </div>

          <div className="field-row">
            <label>
              Email address
              <input defaultValue={request.email} name="Email address" type="email" />
            </label>
            <label>
              Phone number
              <input
                defaultValue={request.phone}
                name="Phone number"
                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                title="Enter phone numbers as ###-###-####."
                type="tel"
              />
            </label>
          </div>

          <div className="field-row">
            <label>
              Primary jurisdiction
              <input defaultValue={request.jurisdiction} name="Primary jurisdiction" />
            </label>
            <label>
              Requested service access
              <input defaultValue={request.service} name="Requested service access" />
            </label>
          </div>

          {isNotary ? <NotaryProfileFields /> : <ClientProfileFields />}

          <label>
            Additional onboarding information
            <textarea
              name="Additional onboarding information"
              rows={5}
              placeholder="Provide profile details staff should review before activation."
            />
          </label>

          <section className="profile-note" aria-label="Submission and notification consent">
            <p>
              Selecting submit moves this profile to GenAdmin Verification. The
              submitted profile is locked for staff review, except for sections
              returned through a correction request.
            </p>
            <label className="check-row">
              <input name="Approval notification consent" type="checkbox" />
              I consent to receive profile approval notices by email and by phone
              message at the phone number provided. Message and data rates may
              apply.
            </label>
          </section>

          <div className="form-actions">
            <button type="button">Submit Profile for Staff Review</button>
            <p>
              Submission notifies Notarix staff and changes the record to Profile
              Submitted. Access remains inactive until GenAdmin verification and
              Administrator or Super Admin final approval are complete.
            </p>
          </div>
        </form>

        <aside className="profile-sidebar">
          <section>
            <p className="request-label">Completion status</p>
            <strong>Profile Completion Pending</strong>
            <span>Staff review required before activation.</span>
          </section>
          <section>
            <p className="request-label">Required sections</p>
            <ul>
              {sections.map((section) => (
                <li key={section}>{section}</li>
              ))}
            </ul>
          </section>
          <section>
            <p className="request-label">Security notice</p>
            <span>
              Do not upload banking credentials, passwords, private keys, or
              unrelated personal records through this secure profile workflow.
            </span>
          </section>
        </aside>
      </section>
    </main>
  );
}

function ClientProfileFields() {
  return (
    <>
      <div className="field-row" id="client-type">
        <label>
          Client type
          <select name="Client type" defaultValue="">
            <option value="">Select client type</option>
            <option>Law firm</option>
            <option>Title company</option>
            <option>Business client</option>
            <option>Individual client</option>
          </select>
        </label>
        <label>
          Client relationship
          <select name="Client relationship" defaultValue="">
            <option value="">Select relationship</option>
            <option>Closing client</option>
            <option>Recurring title partner</option>
            <option>Law firm account</option>
            <option>One-time customer</option>
            <option>Business account</option>
          </select>
        </label>
      </div>

      <ProfileSection
        id="client-organization"
        title="Organization authority"
        note="Staff must confirm who controls the client account before order, document, or billing access is enabled."
      >
        <div className="field-row">
          <label>
            Legal entity or customer name
            <input name="Legal entity or customer name" placeholder="Coleman Title Group" />
          </label>
          <label>
            DBA or office name
            <input name="DBA or office name" placeholder="Coleman Title - Raleigh Office" />
          </label>
        </div>
        <div className="field-row">
          <label>
            Authorized representative
            <input name="Authorized representative" placeholder="Avery Coleman" />
          </label>
          <label>
            Representative title
            <input name="Representative title" placeholder="Managing Attorney or Escrow Officer" />
          </label>
        </div>
        <DocumentAttachment
          label="Authority or business verification"
          note="Attach bar lookup, title company registration, business registration, or signed account authority."
        />
      </ProfileSection>

      <ProfileSection
        id="client-addresses"
        title="Client addresses and phone numbers"
        note="Business, mailing, and billing addresses may differ. Staff verifies which address controls notices and billing."
      >
        <label>
          Business Address
          <input name="Business Address" placeholder="210 Market Street, Raleigh, NC 27601" />
        </label>
        <label>
          Mailing Address
          <input name="Mailing Address" placeholder="PO Box 2110, Raleigh, NC 27602" />
        </label>
        <div className="field-row">
          <label>
            Office Phone
            <input name="Office Phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" placeholder="555-234-6789" />
          </label>
          <label>
            Billing Phone
            <input name="Billing Phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" placeholder="555-456-7890" />
          </label>
        </div>
      </ProfileSection>

      <ProfileSection
        id="client-billing"
        title="Billing and payment authorization"
        note="Invoice terms, payment methods, and billing changes require Administrator or Super Admin approval."
      >
        <div className="field-row">
          <label>
            Billing contact email
            <input name="Billing contact email" type="email" />
          </label>
          <label>
            Payment preference
            <select name="Payment preference" defaultValue="">
              <option value="">Select payment preference</option>
              <option>Invoice after service</option>
              <option>Card on file</option>
              <option>ACH authorization</option>
              <option>Payment before service</option>
            </select>
          </label>
        </div>
        <DocumentAttachment
          label="Billing authorization"
          note="Attach signed billing authorization, engagement agreement, or approved payment terms."
        />
      </ProfileSection>

      <ProfileSection
        id="authorized-users"
        title="Authorized portal users"
        note="Each user should receive an individual account. Shared accounts should not be approved."
      >
        <label>
          Authorized users
          <textarea
            name="Authorized users"
            rows={4}
            placeholder="List authorized users who may submit Notarix Signings orders."
          />
        </label>
        <label>
          Approved email domain
          <input name="Approved email domain" placeholder="coleman-title.example" />
        </label>
        <DocumentAttachment
          label="Authorized user roster"
          note="Attach a roster when multiple employees may submit orders or upload documents."
        />
      </ProfileSection>

      <ProfileSection
        id="document-rules"
        title="Document handling rules"
        note="Staff must know who may upload, replace, retrieve, or receive notarized documents."
      >
        <label>
          Document delivery instructions
          <textarea
            name="Document delivery instructions"
            rows={4}
            placeholder="Describe secure delivery, return documents, retention needs, and restricted recipients."
          />
        </label>
      </ProfileSection>

      <ProfileSection
        id="service-access"
        title="Requested service access"
        note="Order permissions remain disabled until the requested service types and jurisdiction are approved."
      >
        <div className="checklist-grid compact">
          {[
            "Mobile notarial services",
            "Electronic notarization",
            "Remote online notarization",
            "Loan signing appointments",
            "General notary appointments",
          ].map((service) => (
            <label className="check-row" key={service}>
              <input name="Requested service access" type="checkbox" />
              {service}
            </label>
          ))}
        </div>
      </ProfileSection>
    </>
  );
}

function NotaryProfileFields() {
  return (
    <>
      <ProfileSection
        id="address-contact"
        title="Address and company information"
        note="The payment address may match the primary profile address, but staff must be able to verify both records."
      >
        <div className="field-row">
          <label>
            Company name
            <input name="Company name" placeholder="DaWaHu Collective, LLC" />
          </label>
          <label>
            Website
            <input name="Website" placeholder="https://example.com" type="url" />
          </label>
        </div>
        <label>
          Address Line 1
          <input name="Address Line 1" />
        </label>
        <label>
          Address Line 2
          <input name="Address Line 2" />
        </label>
        <div className="field-row three-column">
          <label>
            City
            <input name="City" />
          </label>
          <label>
            State
            <input name="State" maxLength={2} placeholder="NC" />
          </label>
          <label>
            Zip Code
            <input name="Zip Code" inputMode="numeric" placeholder="27601" />
          </label>
        </div>
        <label className="check-row">
          <input name="Payment address same as primary" type="checkbox" />
          Payment Address is the same as primary address
        </label>
      </ProfileSection>

      <ProfileSection
        id="phone-verification"
        title="Phone numbers and emergency contact"
        note="Mobile verification should create a system verified indicator before activation."
      >
        <div className="field-row">
          <label>
            Home Phone
            <input name="Home Phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" placeholder="555-123-4567" />
          </label>
          <label>
            Mobile Phone
            <input name="Mobile Phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" placeholder="555-123-4567" />
          </label>
        </div>
        <div className="verification-row">
          <span className="verified-check" aria-label="Verified mobile number" />
          <strong>Mobile phone verified</strong>
          <p>Verification code confirmed before portal activation.</p>
        </div>
        <div className="field-row">
          <label>
            Work Phone
            <input name="Work Phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" placeholder="555-123-4567" />
          </label>
          <label>
            Fax
            <input name="Fax" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" placeholder="555-123-4567" />
          </label>
        </div>
        <div className="field-row">
          <label>
            Emergency Contact Name
            <input name="Emergency Contact Name" />
          </label>
          <label>
            Emergency Contact Phone
            <input name="Emergency Contact Phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" placeholder="555-123-4567" />
          </label>
        </div>
      </ProfileSection>

      <ProfileSection
        id="payable-setup"
        title="Payable setup"
        note="Notarix should initially support an external payable provider evaluation rather than building a full funds-movement system from scratch."
      >
        <div className="field-row">
          <label>
            Preferred payment method
            <select name="Preferred payment method" defaultValue="">
              <option value="">Select payment method</option>
              <option>ACH direct deposit</option>
              <option>VendorPay-style provider</option>
              <option>Check payment</option>
              <option>Manual payable review</option>
            </select>
          </label>
          <label>
            Payable provider status
            <select name="Payable provider status" defaultValue="">
              <option value="">Select status</option>
              <option>External provider pending</option>
              <option>Provider verified</option>
              <option>Manual review required</option>
            </select>
          </label>
        </div>
        <p className="profile-note">
          Recommended path: evaluate an established payable provider for ACH,
          tax-form handling, payment status, and audit reporting before Notarix
          builds an internal payment system.
        </p>
        <DocumentAttachment
          label="Payable onboarding document"
          note="Attach payment authorization or external provider confirmation. W-9 is collected separately."
        />
      </ProfileSection>

      <ProfileSection
        id="w9-form"
        title="W-9 form"
        note="A completed W-9 is required before payable activation. Financial review and tax record handling require elevated staff controls."
      >
        <div className="field-row">
          <label>
            W-9 Legal Name
            <input name="W-9 Legal Name" />
          </label>
          <label>
            W-9 Business Name
            <input name="W-9 Business Name" />
          </label>
        </div>
        <DocumentAttachment
          label="Completed W-9 Form"
          note="Attach the completed W-9. General Admin may view completion status but cannot approve payable activation."
        />
      </ProfileSection>

      <ProfileSection
        title="Credential completion overview"
        note="Each credential has its own detailed section below. The checklist summarizes upload status without bunching unrelated documents together."
      >
        <div className="credential-overview">
          {credentialOverviewItems.map((item) => (
            <div className="credential-row" key={item}>
              <span className="credential-dot" aria-label="Upload pending" />
              <strong>{item}</strong>
              <span>Awaiting document</span>
            </div>
          ))}
        </div>
      </ProfileSection>

      <ProfileSection
        id="background-check"
        title="Background check"
        note="National Notary Association background checks are preferred. Staff verifies the provider, completion date, and uploaded report."
      >
        <div className="field-row">
          <label>
            Background Check Provider
            <input name="Background Check Provider" placeholder="National Notary Association" />
          </label>
          <label>
            Background Check Report Date
            <input name="Background Check Report Date" placeholder="Dec 31 2026" />
          </label>
        </div>
        <DocumentAttachment
          label="Background Check Report"
          note="Attach a copy of the completed background check report."
        />
      </ProfileSection>

      <ProfileSection
        id="eo-insurance"
        title="E&O insurance"
        note="State rules vary; Notarix staff must verify the required E&O amount for each operating state."
      >
        <div className="field-row three-column">
          <label>
            E&O Policy Number
            <input name="E&O Policy Number" />
          </label>
          <label>
            E&O Coverage Amount
            <input name="E&O Coverage Amount" placeholder="$100,000" />
          </label>
          <label>
            E&O Expiration Date
            <input name="E&O Expiration Date" placeholder="Dec 31 2026" />
          </label>
        </div>
        <DocumentAttachment
          label="E&O Insurance Declaration Page"
          note="Attach policy declaration page or proof of active E&O coverage."
        />
      </ProfileSection>

      <ProfileSection
        id="identity-verification"
        title="Identity verification"
        note="Identity verification must use an approved provider capable of document analysis, camera-based selfie capture, and liveness checks from a phone or computer."
      >
        <div className="field-row three-column">
          <label>
            ID Name
            <input name="ID Name" />
          </label>
          <label>
            ID Number
            <input name="ID Number" />
          </label>
          <label>
            ID State
            <input name="ID State" maxLength={2} placeholder="NC" />
          </label>
        </div>
        <div className="field-row three-column">
          <label>
            Verified On Date
            <input name="Verified On Date" placeholder="Dec 31 2026" />
          </label>
          <label>
            Verification Type
            <select name="Verification Type" defaultValue="">
              <option value="">Select verification type</option>
              <option>Identity proofing provider with selfie and liveness check</option>
              <option>RON provider credential analysis</option>
              <option>Manual exception review with Administrator approval</option>
            </select>
          </label>
          <label>
            ID Expiration Date
            <input name="ID Expiration Date" placeholder="Dec 31 2026" />
          </label>
        </div>
        <div className="field-row">
          <label>
            Identity Proofing Provider
            <input name="Identity Proofing Provider" placeholder="Approved identity verification provider" />
          </label>
          <label>
            Liveness / Selfie Result
            <select name="Liveness / Selfie Result" defaultValue="">
              <option value="">Select result</option>
              <option>Passed</option>
              <option>Failed</option>
              <option>Manual escalation required</option>
            </select>
          </label>
        </div>
        <DocumentAttachment
          label="Identity Proofing Result"
          note="Attach provider result showing document analysis, selfie/liveness check, and staff verification outcome."
        />
      </ProfileSection>

      <ProfileSection
        id="nna-certification"
        title="NNA certification"
        note="Because NNA certificates may only be available inside the NNA profile, Notarix should store a profile hyperlink and staff verification record."
      >
        <div className="field-row">
          <label>
            NNA Profile Certificate Link
            <input name="NNA Profile Certificate Link" type="url" placeholder="https://www.nationalnotary.org/..." />
          </label>
          <label>
            NNA Exam Date
            <input name="NNA Exam Date" placeholder="Dec 31 2026" />
          </label>
        </div>
        <DocumentAttachment
          label="NNA Certification Profile View"
          note="Attach screenshot or link evidence if the certificate is viewable only inside the NNA profile."
        />
      </ProfileSection>

      <ProfileSection
        id="notary-commission"
        title="Notary commission"
        note="Commission status must be verified by state before the notary profile can be activated."
      >
        <div className="field-row three-column">
          <label>
            Commission Number
            <input name="Commission Number" />
          </label>
          <label>
            Commission State
            <input name="Commission State" maxLength={2} placeholder="NC" />
          </label>
          <label>
            Commission Expiration Date
            <input name="Commission Expiration Date" placeholder="Dec 31 2026" />
          </label>
        </div>
        <DocumentAttachment
          label="Notary Commission Certificate"
          note="Attach current commission certificate or state verification record."
        />
      </ProfileSection>

      <ProfileSection
        id="ron-credentials"
        title="RON authorization and digital certificate"
        note="RON access remains unavailable unless state authorization, training, digital certificate, and provider readiness are all verified."
      >
        <div className="field-row">
          <label>
            Electronic notary authorization
            <select name="Electronic notary authorization" defaultValue="">
              <option value="">Select status</option>
              <option>Approved by state</option>
              <option>Not approved</option>
              <option>Pending review</option>
            </select>
          </label>
          <label>
            Remote online notary authorization
            <select name="Remote online notary authorization" defaultValue="">
              <option value="">Select status</option>
              <option>Approved by state</option>
              <option>Not approved</option>
              <option>Pending review</option>
            </select>
          </label>
        </div>
        <div className="field-row">
          <label>
            Proof of RON Training Certificate Date
            <input name="Proof of RON Training Certificate Date" placeholder="Dec 31 2026" />
          </label>
          <label>
            RON Training Provider
            <input name="RON Training Provider" />
          </label>
        </div>
        <div className="field-row three-column">
          <label>
            RON Digital Certificate Provider
            <input name="RON Digital Certificate Provider" />
          </label>
          <label>
            RON Digital Certificate Expiration Date
            <input name="RON Digital Certificate Expiration Date" placeholder="Dec 31 2026" />
          </label>
          <label>
            RON Platform Eligibility
            <select name="RON Platform Eligibility" defaultValue="">
              <option value="">Select eligibility</option>
              <option>Disabled pending verification</option>
              <option>Approved for RON sessions</option>
              <option>Denied or not authorized</option>
            </select>
          </label>
        </div>
        <DocumentAttachment
          label="RON Training Certificate"
          note="Attach proof of completed RON training and any required state-approved course evidence."
        />
        <DocumentAttachment
          label="RON Digital Certificate"
          note="Attach digital certificate record, provider confirmation, or expiration evidence."
        />
      </ProfileSection>

      <ProfileSection
        id="expiration-monitoring"
        title="Expiration monitoring"
        note="This creates the rules for automatic reminder emails and staff audit reports."
      >
        <div className="rule-list">
          {notaryExpirationRules.map((rule) => (
            <p key={rule}>{rule}</p>
          ))}
        </div>
      </ProfileSection>

      <ProfileSection
        id="payment-ledger"
        title="Payment ledger"
        note="Assigned order payments, adjustments, release dates, and received acknowledgements must remain auditable."
      >
        <div className="payment-ledger">
          <div>
            <p className="request-label">Assigned orders</p>
            <strong>Visible inside notary profile</strong>
            <span>Tracks assigned orders, amount owed, adjustments, release date, expected receipt date, and payment received acknowledgement.</span>
          </div>
          <div>
            <p className="request-label">Adjustment permissions</p>
            <strong>Administrator or Super Admin only</strong>
            <span>General Admin users may review status but may not alter completed payment acknowledgements.</span>
          </div>
        </div>
      </ProfileSection>
    </>
  );
}

function ProfileSection({
  id,
  title,
  note,
  children,
}: {
  id?: string;
  title: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <section className="profile-section" id={id}>
      <div>
        <p className="request-label">{title}</p>
        <span>{note}</span>
      </div>
      {children}
    </section>
  );
}

function ProfileNavigation({
  links,
  title,
}: {
  links: readonly (readonly [string, string])[];
  title: string;
}) {
  return (
    <aside className="profile-nav" aria-label={title}>
      <p className="request-label">{title}</p>
      <nav>
        {links.map(([label, href]) => (
          <a href={href} key={href}>
            {label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

function DocumentAttachment({ label, note }: { label: string; note: string }) {
  return (
    <label className="document-attachment">
      <span className="credential-dot" aria-label="Document upload pending" />
      <span>
        <strong>{label}</strong>
        <small>{note}</small>
      </span>
      <span className="upload-action">Attach document</span>
      <input name={label} type="file" />
    </label>
  );
}
