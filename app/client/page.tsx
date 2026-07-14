import { authorizedUsers, documentRecords, orderRecords } from "../operations-data";

export default function ClientPortalHomePage() {
  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Client Portal</span>
        </a>
        <nav aria-label="Client portal navigation">
          <a href="/">Home</a>
          <a className="nav-cta" href="/client">Client Home</a>
          <a href="/client/dashboard">Dashboard</a>
          <a href="/client/orders">Orders</a>
          <a href="/orders/new">New Order</a>
          <a href="/documents">Documents</a>
          <a href="/account/users">Authorized Users</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Role-Based Portal Home · Client Access</p>
          <h1>Client Portal Home</h1>
          <p>
            Direct approved client users into order submission, document upload,
            authorized user management, notification review, and billing-status
            controls tied to the client profile.
          </p>
        </div>
        <aside>
          <p>Approved client</p>
          <strong>NSC-NC-2607-0001</strong>
          <span>Coleman Title Group</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Client portal home summary">
        {[
          ["Orders", String(orderRecords.length), "Create and monitor active notarial orders."],
          ["Documents", String(documentRecords.length), "Upload and review order document custody."],
          ["Authorized users", String(authorizedUsers.length), "Manage individual portal accounts."],
          ["Billing status", "Restricted", "Billing changes require staff approval."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Client portal routes">
        <div className="verification-console">
          <aside className="console-rail">
            <p className="request-label">Client sections</p>
            <nav>
              {[
                ["Dashboard", "/client/dashboard"],
                ["Order Management", "/client/orders"],
                ["Create Order", "/orders/new"],
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
                <p className="request-label">Client workspace</p>
                <h2>Client routing matrix</h2>
              </div>
              <strong>Approved profile</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Client portal destinations</caption>
                <thead>
                  <tr>
                    <th scope="col">Area</th>
                    <th scope="col">Purpose</th>
                    <th scope="col">Profile</th>
                    <th scope="col">Status</th>
                    <th scope="col">Control</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Orders", "Submit and track notarial orders", "NSC-NC-2607-0001", "Enabled", "Order submission authority approved", "/client/orders"],
                    ["Documents", "Upload and review order files", "NSC-NC-2607-0001", "Enabled", "Document access logged", "/documents"],
                    ["Authorized Users", "Manage named users and permissions", "NSC-NC-2607-0001", "Controlled", "No shared logins", "/account/users"],
                    ["Billing", "Review billing posture and restrictions", "NSC-NC-2607-0001", "Restricted", "Staff approval required", "/settings/organization"],
                  ].map(([area, purpose, profile, status, control, href]) => (
                    <tr key={area}>
                      <td><span>Client</span><strong>{area}</strong></td>
                      <td>{purpose}</td>
                      <td>{profile}</td>
                      <td><mark>{status}</mark></td>
                      <td>{control}</td>
                      <td><a href={href}>Open</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
          <aside className="activation-control-center">
            <p className="request-label">Client access controls</p>
            <h2>Approved permissions</h2>
            <dl>
              <div><dt>Order submission</dt><dd>Enabled for authorized users</dd></div>
              <div><dt>Document access</dt><dd>Limited to approved client users and assigned staff</dd></div>
              <div><dt>User management</dt><dd>Client Account Administrator controlled</dd></div>
              <div><dt>Billing changes</dt><dd>Administrator or Super Admin approval required</dd></div>
            </dl>
          </aside>
        </div>
      </section>
    </main>
  );
}
