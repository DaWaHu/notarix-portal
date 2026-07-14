import { documentRecords, orderOperationRecords } from "../../operations-data";

const clientOrders = orderOperationRecords.filter(
  (order) => order.client === "Coleman Title Group",
);

export default function ClientOrderManagementConsolePage() {
  const documentCount = documentRecords.filter((document) =>
    clientOrders.some((order) => order.id === document.order),
  ).length;

  return (
    <main className="staff-page order-workspace-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Client Portal</span>
        </a>
        <nav aria-label="Client order navigation">
          <a href="/">Home</a>
          <a href="/client">Client Home</a>
          <a href="/client/dashboard">Dashboard</a>
          <a className="nav-cta" href="/client/orders">Orders</a>
          <a href="/orders/new">New Order</a>
          <a href="/documents">Documents</a>
          <a href="/account/users">Authorized Users</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Client Orders · Controlled Client Access</p>
          <h1>Client Order Management Console</h1>
          <p>
            Track active notarial orders, document custody, assigned notary
            status, appointment posture, communications, and billing controls
            from the approved client profile.
          </p>
        </div>
        <aside>
          <p>Approved client</p>
          <strong>NSC-NC-2607-0001</strong>
          <span>Coleman Title Group</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Client order summary">
        {[
          ["Client orders", String(clientOrders.length), "Orders associated with the approved client profile."],
          ["Order documents", String(documentCount), "Uploaded documents tied to client order custody."],
          ["Billing posture", "Invoice Pending", "Billing changes remain staff controlled."],
          ["Communications", "Attention", "One document notice requires staff delivery retry."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Client order workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Client file</p>
              <h2>Coleman Title Group</h2>
              <span>
                Authorized client users may submit orders, upload documents, and
                monitor status. Staff controls assignment, validation, billing,
                and restricted release decisions.
              </span>
            </section>
            <p className="request-label">Client order index</p>
            <nav>
              {clientOrders.map((order) => (
                <a href={`#${order.id.toLowerCase()}`} key={order.id}>
                  <span>{order.id}</span>
                  <small>{order.orderStatus}</small>
                </a>
              ))}
              <a href="/orders/new"><span>Create New Order</span></a>
              <a href="/documents"><span>Document Center</span></a>
            </nav>
          </aside>

          <article className="console-main">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Client order register</p>
                <h2>Order progress and document matrix</h2>
              </div>
              <strong>{clientOrders.length} active order</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Client order management console</caption>
                <thead>
                  <tr>
                    <th scope="col">Order</th>
                    <th scope="col">Service / appointment</th>
                    <th scope="col">Assigned notary</th>
                    <th scope="col">Documents</th>
                    <th scope="col">Billing / communication</th>
                    <th scope="col">Client next action</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {clientOrders.map((order) => (
                    <tr id={order.id.toLowerCase()} key={order.id}>
                      <td>
                        <span>{order.id}</span>
                        <strong>{order.orderStatus}</strong>
                        <span className="evidence-packet-summary">{order.clientProfile}</span>
                      </td>
                      <td>
                        {order.service}
                        <span className="evidence-packet-summary">
                          {order.appointment} · {order.location}
                        </span>
                      </td>
                      <td>
                        {order.notary}
                        <span className="evidence-packet-summary">
                          {order.assignmentStatus}
                        </span>
                      </td>
                      <td>
                        <mark>{order.documentStatus}</mark>
                        <span className="evidence-packet-summary">
                          {order.documentCount} · {order.validationStatus}
                        </span>
                      </td>
                      <td>
                        {order.billingStatus}
                        <span className="evidence-packet-summary">
                          {order.communicationStatus}
                        </span>
                      </td>
                      <td>
                        Monitor staff release
                        <span className="evidence-packet-summary">
                          Respond to any missing-document or correction notice.
                        </span>
                      </td>
                      <td>
                        <a className="table-action-link" href={`/orders/${order.id}`}>
                          Open
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Client control center</p>
            <h2>Order authority</h2>
            <p className="activation-summary">
              Client users can submit requests and documents, but staff must
              validate files, assign the notary, release restricted documents,
              and control billing or ledger changes.
            </p>
            <dl>
              <div><dt>Order submission</dt><dd>Enabled for approved client users</dd></div>
              <div><dt>Document upload</dt><dd>Validation and malware review required before release</dd></div>
              <div><dt>Assignment</dt><dd>Staff controlled after notary eligibility review</dd></div>
              <div><dt>Billing</dt><dd>Invoice terms remain staff and financial-control governed</dd></div>
              <div><dt>Notifications</dt><dd>Email and phone delivery require delivery logs and consent posture</dd></div>
            </dl>
            <div className="decision-actions">
              <a href="/orders/new">Create Order</a>
              <a href="/documents">Upload Documents</a>
              <a href="/notifications">Review Notices</a>
              <a href="/account/users">Manage Authorized Users</a>
            </div>
            <p className="decision-lock-note">
              Order details visible here are client-safe. Restricted identity,
              tax, malware, audit, and staff command receipts remain available
              only through authorized staff workflows.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
