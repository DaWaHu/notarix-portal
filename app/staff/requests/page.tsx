import { requireChatGPTUser } from "../../chatgpt-auth";
import { accessRequests, statusCounts } from "./data";

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
                <a href={`/staff/requests/${request.id}`}>Open Review</a>
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
