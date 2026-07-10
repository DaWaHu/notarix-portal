import { requireChatGPTUser } from "../../chatgpt-auth";

const accessRequests = [
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
  },
];

const statusCounts = [
  ["Pending Review", "1", "New requests awaiting staff intake."],
  ["Profile Pending", "1", "Invitations sent, profile not complete."],
  ["Credential Review", "1", "Eligibility and commission review."],
  ["Active", "0", "Approved portal profiles."],
];

export default async function StaffRequestsPage() {
  await requireChatGPTUser("/staff/requests");

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
        </a>
        <nav aria-label="Staff navigation">
          <a href="/">Home</a>
          <a href="/portal">Access Form</a>
          <a className="nav-cta" href="/staff/requests">
            Staff Queue
          </a>
        </nav>
      </header>

      <section className="staff-title">
        <div className="staff-heading">
          <p className="kicker">Staff review queue</p>
          <h1>Portal access requests</h1>
          <p>
            Review client and notary access requests, issue profile invitations,
            and activate approved portal accounts after verification.
          </p>
        </div>
        <aside className="workflow-card">
          <p>Internal workflow</p>
          <strong>Requests stay inactive until staff approval.</strong>
          <span>support@notarix.live</span>
        </aside>
      </section>

      <section className="status-strip" aria-label="Request status summary">
        {statusCounts.map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="request-table" aria-label="Portal access requests">
        {accessRequests.map((request) => (
          <article className="request-card" key={request.id}>
            <div className="request-card-top">
              <div>
                <p className="request-label">Notarix Signings Request</p>
                <h2>{request.id}</h2>
              </div>
              <mark>{request.status}</mark>
            </div>

            <div className="request-card-grid">
              <section>
                <p className="request-label">Request type</p>
                <strong>{request.type}</strong>
                <span>Received {request.received}</span>
              </section>
              <section>
                <p className="request-label">Primary contact</p>
                <strong>{request.name}</strong>
                <span>{request.organization}</span>
              </section>
              <section>
                <p className="request-label">Contact information</p>
                <strong>{request.email}</strong>
                <span>{request.phone}</span>
              </section>
              <section>
                <p className="request-label">Service and jurisdiction</p>
                <strong>{request.service}</strong>
                <span>{request.jurisdiction}</span>
              </section>
            </div>

            <div className="next-action">
              <p className="request-label">Next staff action</p>
              <p>{request.nextAction}</p>
              <div className="row-actions">
                <button type="button">Open Review</button>
                <button type="button">Send Invitation</button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <footer className="staff-footer">
        <div>
          <strong>Notarix Signings Staff Workspace</strong>
          <p>
            Portal requests, credential review, profile activation, and staff
            action records are handled through the internal review process.
          </p>
        </div>
        <nav aria-label="Staff footer navigation">
          <a href="/">Home</a>
          <a href="/portal">Access Form</a>
          <a href="mailto:support@notarix.live">support@notarix.live</a>
        </nav>
        <p>Authorized staff use only. Review activity should remain auditable.</p>
      </footer>
    </main>
  );
}
