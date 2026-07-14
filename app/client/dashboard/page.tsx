import { authorizedUsers, documentRecords, orderRecords } from "../../operations-data";

export default function ClientDashboardPage() {
  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Client Portal</span>
        </a>
        <nav aria-label="Client dashboard navigation">
          <a href="/">Home</a>
          <a href="/client">Client Home</a>
          <a href="/client/orders">Orders</a>
          <a href="/client/orders/ORD-2607-0001/completion">Delivery Receipt</a>
          <a href="/orders/new">New Order</a>
          <a href="/documents">Documents</a>
          <a className="nav-cta" href="/client/dashboard">Dashboard</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Approved Client Portal · Controlled Access</p>
          <h1>Client Operations Dashboard</h1>
          <p>
            Create orders, manage authorized users, upload documents, and monitor
            order status within the permissions approved for this client profile.
          </p>
        </div>
        <aside>
          <p>Client profile</p>
          <strong>NSC-NC-2607-0001</strong>
          <span>Coleman Title Group</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Client portal summary">
        {[
          ["Open orders", "2", "Orders requiring document or assignment action."],
          ["Authorized users", String(authorizedUsers.length), "Individual accounts only; no shared logins."],
          ["Documents", String(documentRecords.length), "Uploaded records with custody controls."],
          ["Billing", "Restricted", "Payment terms remain under elevated controls."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Client dashboard workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <p className="request-label">Client actions</p>
            <nav>
              {[
                ["Create Order", "/orders/new"],
                ["Order Management", "/client/orders"],
                ["Delivery Receipt", "/client/orders/ORD-2607-0001/completion"],
                ["Documents", "/documents"],
                ["Authorized Users", "/account/users"],
                ["Notifications", "/notifications"],
              ].map(([label, href]) => (
                <a href={href} key={label}><span>{label}</span></a>
              ))}
            </nav>
          </aside>
          <article className="console-main">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Orders</p>
                <h2>Active order workspace</h2>
              </div>
              <strong>{orderRecords.length} orders</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Client orders</caption>
                <thead>
                  <tr>
                    <th scope="col">Order</th>
                    <th scope="col">Service</th>
                    <th scope="col">Status</th>
                    <th scope="col">Notary</th>
                    <th scope="col">Appointment</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orderRecords.map((order) => (
                    <tr key={order.id}>
                      <td><span>{order.jurisdiction}</span><strong>{order.id}</strong></td>
                      <td>{order.service}<span className="evidence-packet-summary">{order.documents}</span></td>
                      <td><mark>{order.status}</mark></td>
                      <td>{order.notary}</td>
                      <td>{order.appointment}</td>
                      <td>
                        <a href={`/orders/${order.id}`}>Open</a>
                        <span className="evidence-packet-summary">
                          <a href={`/client/orders/${order.id}/completion`}>Delivery Receipt</a>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
          <aside className="activation-control-center">
            <p className="request-label">Account controls</p>
            <h2>Approved permissions</h2>
            <dl>
              <div><dt>Order submission</dt><dd>Enabled</dd></div>
              <div><dt>Document upload</dt><dd>Enabled with access logging</dd></div>
              <div><dt>User invitations</dt><dd>Client admin controlled</dd></div>
              <div><dt>Billing changes</dt><dd>Staff approval required</dd></div>
            </dl>
          </aside>
        </div>
      </section>
    </main>
  );
}
