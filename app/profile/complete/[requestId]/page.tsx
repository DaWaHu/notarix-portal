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
  "Address, company, phone, and emergency contact verification",
  "Payable setup and notary compensation controls",
  "Credential uploads, identity verification, and expiration monitoring",
  "NNA, commission, E&O, background check, and RON authorization records",
  "Assigned order payment ledger with administrator-controlled adjustments",
];

const notaryUploadItems = [
  "Background Check Report - National Notary Association preferred",
  "E&O Insurance Declaration Page",
  "Government ID or Driver's License Verification",
  "NNA Certification Profile Link",
  "Notary Commission Certificate",
  "RON Training Certificate",
  "RON Digital Certificate",
  "W-9 or payable onboarding record",
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
    <main className="profile-page">
      <header className="portal-header compact">
        <div className="brand" aria-label="Notarix Signings">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
        </div>
        <nav aria-label="Profile completion navigation">
          <span>Secure Profile Completion</span>
        </nav>
      </header>

      <section className="profile-hero">
        <p className="kicker">Notarix Signings onboarding</p>
        <h1>{profileTitle}</h1>
        <p>
          Complete the required profile sections for {request.organization}.
          Notarix staff will review the submission before any portal access,
          financial permissions, or RON capabilities are activated.
        </p>
      </section>

      <section className="profile-layout" aria-label="Profile completion workspace">
        <form className="profile-form">
          <div className="form-heading">
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

          <div className="form-actions">
            <button type="button">Submit Profile for Staff Review</button>
            <p>
              Submission notifies Notarix staff. Access remains inactive until
              verification is complete.
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
              unrelated personal records through this prototype screen.
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
      <div className="field-row">
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
          Billing contact email
          <input name="Billing contact email" type="email" />
        </label>
      </div>
      <label>
        Authorized users
        <textarea
          name="Authorized users"
          rows={4}
          placeholder="List authorized users who may submit Notarix Signings orders."
        />
      </label>
    </>
  );
}

function NotaryProfileFields() {
  return (
    <>
      <ProfileSection
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
      </ProfileSection>

      <ProfileSection
        title="Credential upload center"
        note="A completion checkmark appears when each required document has been uploaded; staff verification is still required before activation."
      >
        <div className="upload-grid">
          {notaryUploadItems.map((item) => (
            <label className="upload-card" key={item}>
              <span className="verified-check pending" aria-label="Upload pending" />
              <strong>{item}</strong>
              <input name={item} type="file" />
            </label>
          ))}
        </div>
      </ProfileSection>

      <ProfileSection
        title="Background check and E&O insurance"
        note="State rules vary; Notarix staff must verify the required E&O amount for each operating state."
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
      </ProfileSection>

      <ProfileSection
        title="Identity verification"
        note="Driver's license or government ID verification must be recorded without exposing unnecessary ID data to general staff."
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
              <option>Manual staff review</option>
              <option>Credential analysis provider</option>
              <option>RON provider verification</option>
            </select>
          </label>
          <label>
            ID Expiration Date
            <input name="ID Expiration Date" placeholder="Dec 31 2026" />
          </label>
        </div>
      </ProfileSection>

      <ProfileSection
        title="NNA certification and notary commission"
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
      </ProfileSection>

      <ProfileSection
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
      </ProfileSection>

      <ProfileSection
        title="Expiration monitoring and payment ledger"
        note="This creates the rules for automatic reminder emails and staff audit reports."
      >
        <div className="rule-list">
          {notaryExpirationRules.map((rule) => (
            <p key={rule}>{rule}</p>
          ))}
        </div>
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
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <section className="profile-section">
      <div>
        <p className="request-label">{title}</p>
        <span>{note}</span>
      </div>
      {children}
    </section>
  );
}
