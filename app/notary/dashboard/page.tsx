import { credentialMonitorRecords, orderRecords } from "../../operations-data";

const notaryOrders = orderRecords.filter((order) => order.notary !== "Unassigned");

export default function NotaryDashboardPage() {
  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Notary Portal</span>
        </a>
        <nav aria-label="Notary dashboard navigation">
          <a href="/">Home</a>
          <a href="/credentials/expiration">Credentials</a>
          <a href="/notifications">Notifications</a>
          <a className="nav-cta" href="/notary/dashboard">Dashboard</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Approved Notary Portal · Controlled Access</p>
          <h1>Notary Operations Dashboard</h1>
          <p>
            Review assignments, credential status, availability, document access,
            payable status, and RON eligibility within approved permissions.
          </p>
        </div>
        <aside>
          <p>Notary profile</p>
          <strong>NSN-NC-2607-0001</strong>
          <span>Bernadette W Hudlin</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Notary portal summary">
        {[
          ["Assignments", String(notaryOrders.length), "Assigned orders requiring review."],
          ["Credentials", "Monitored", "Expiration reminders are active."],
          ["RON", "Restricted", "Remote access requires verified authorization."],
          ["Payables", "Restricted", "Financial changes require elevated approval."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Notary dashboard workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <p className="request-label">Notary actions</p>
            <nav>
              {["Assignments", "Credentials", "Availability", "Payables", "Support"].map((label) => (
                <a href={label === "Support" ? "/support" : "#assignments"} key={label}><span>{label}</span></a>
              ))}
            </nav>
          </aside>
          <article className="console-main" id="assignments">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Assignments</p>
                <h2>Active notary work</h2>
              </div>
              <strong>{notaryOrders.length} active</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Notary assignments</caption>
                <thead>
                  <tr>
                    <th scope="col">Order</th>
                    <th scope="col">Client</th>
                    <th scope="col">Status</th>
                    <th scope="col">Service</th>
                    <th scope="col">Appointment</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {notaryOrders.map((order) => (
                    <tr key={order.id}>
                      <td><span>{order.jurisdiction}</span><strong>{order.id}</strong></td>
                      <td>{order.client}</td>
                      <td><mark>{order.status}</mark></td>
                      <td>{order.service}</td>
                      <td>{order.appointment}</td>
                      <td><a href={`/orders/${order.id}`}>Open</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
          <aside className="activation-control-center">
            <p className="request-label">Credential monitor</p>
            <h2>Expiration controls</h2>
            <dl>
              {credentialMonitorRecords.slice(0, 3).map((record) => (
                <div key={record.credential}>
                  <dt>{record.credential}</dt>
                  <dd>{record.expiration} · {record.status}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>
    </main>
  );
}
