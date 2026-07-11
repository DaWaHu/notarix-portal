import { notFound } from "next/navigation";
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
  "Commission identity and primary operating jurisdiction",
  "Government identification and contact verification",
  "Credential uploads with expiration dates",
  "Service area, appointment availability, and travel preferences",
  "Electronic or RON authorization only when approved by the applicable state",
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
      <div className="field-row">
        <label>
          Commission expiration date
          <input name="Commission expiration date" placeholder="Dec 31 2026" />
        </label>
        <label>
          E&O insurance expiration date
          <input name="E&O insurance expiration date" placeholder="Dec 31 2026" />
        </label>
      </div>
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
    </>
  );
}
