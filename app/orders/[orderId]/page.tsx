import { notFound } from "next/navigation";
import { documentsForOrder, findOrderRecord } from "../../operations-data";

type OrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  const order = findOrderRecord(orderId);
  if (!order) notFound();

  const documents = documentsForOrder(order.id);

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Order Case File</span>
        </a>
        <nav aria-label="Order navigation">
          <a href="/client/dashboard">Client Dashboard</a>
          <a href="/documents">Documents</a>
          <a className="nav-cta" href={`/orders/${order.id}`}>Order File</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Order Operations · Controlled Record</p>
          <h1>{order.id}</h1>
          <p>
            Manage the notarial service request, assignment status, document
            custody, appointment details, and staff-visible order controls from
            a single operational record.
          </p>
        </div>
        <aside>
          <p>Current status</p>
          <strong>{order.status}</strong>
          <span>{order.appointment}</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Order summary">
        {[
          ["Client", order.client, "Approved client profile associated with this order."],
          ["Notary", order.notary, "Assignment remains controlled by staff workflow."],
          ["Documents", order.documents, "Access is role-based and audit logged."],
          ["Jurisdiction", order.jurisdiction, "Service eligibility follows profile controls."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Order case workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <p className="request-label">Case file index</p>
            <nav>
              {["Overview", "Appointment", "Documents", "Assignment", "Billing", "Messages"].map((label) => (
                <a href={`#${label.toLowerCase()}`} key={label}><span>{label}</span></a>
              ))}
            </nav>
          </aside>

          <article className="console-main">
            <header className="console-panel-heading" id="overview">
              <div>
                <p className="request-label">Order dossier</p>
                <h2>Service, signer, document, and assignment record</h2>
              </div>
              <strong>{order.status}</strong>
            </header>
            <section className="profile-dossier-grid" id="appointment">
              <article><p>Service type</p><strong>{order.service}</strong><span>Requested service category.</span></article>
              <article><p>Appointment</p><strong>{order.appointment}</strong><span>Scheduled time displayed with time zone.</span></article>
              <article><p>Service location</p><strong>{order.location}</strong><span>Address or remote preparation context.</span></article>
              <article><p>Assignment</p><strong>{order.notary}</strong><span>Notary assignment requires verified profile eligibility.</span></article>
            </section>
            <div className="verification-table-wrap" id="documents">
              <table className="verification-table">
                <caption>Order documents</caption>
                <thead>
                  <tr>
                    <th scope="col">Document</th>
                    <th scope="col">Custody</th>
                    <th scope="col">Status</th>
                    <th scope="col">Access</th>
                    <th scope="col">Received</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((document) => (
                    <tr key={document.id}>
                      <td><span>{document.id}</span><strong>{document.fileName}</strong></td>
                      <td>{document.custody}</td>
                      <td><mark>{document.status}</mark></td>
                      <td>{document.access}</td>
                      <td>{document.received}</td>
                      <td><a href={`/evidence/${document.evidenceId}`}>Open</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Order controls</p>
            <h2>Controlled actions</h2>
            <dl>
              <div><dt>Document retrieval</dt><dd>Available to approved users only</dd></div>
              <div><dt>Assignment changes</dt><dd>Staff controlled</dd></div>
              <div><dt>Billing corrections</dt><dd>Administrator approval required</dd></div>
              <div><dt>Audit trail</dt><dd>Restricted report workspace</dd></div>
            </dl>
            <div className="decision-actions">
              <a href={`/staff/orders/${order.id}/assignment`}>Manage Assignment</a>
              <a href="/support">Open Message Thread</a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
