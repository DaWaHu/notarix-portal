import { credentialMonitorRecords, orderRecords } from "../operations-data";

const assignedOrders = orderRecords.filter((order) => order.notary !== "Unassigned");

export default function NotaryPortalHomePage() {
  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Notary Portal</span>
        </a>
        <nav aria-label="Notary portal navigation">
          <a href="/">Home</a>
          <a className="nav-cta" href="/notary">Notary Home</a>
          <a href="/notary/dashboard">Dashboard</a>
          <a href="/notary/assignments">Assignments</a>
          <a href="/notary/assignments/ORD-2607-0001/completion">Completion Package</a>
          <a href="/credentials/expiration">Credentials</a>
          <a href="/notifications">Notifications</a>
          <a href="/support">Support</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Role-Based Portal Home · Notary Access</p>
          <h1>Notary Portal Home</h1>
          <p>
            Direct approved notaries into assignments, credential monitoring,
            evidence status, payable controls, support, and RON eligibility
            before any restricted service is available.
          </p>
        </div>
        <aside>
          <p>Approved notary</p>
          <strong>NSN-NC-2607-0001</strong>
          <span>Bernadette W Hudlin</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Notary portal home summary">
        {[
          ["Assignments", String(assignedOrders.length), "Assigned orders requiring review."],
          ["Credentials", String(credentialMonitorRecords.length), "Commission, insurance, RON, and billing-related controls."],
          ["Payables", "Restricted", "W-9 and payable activation require elevated approval."],
          ["RON eligibility", "Restricted", "RON service remains unavailable until verified."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Notary portal routes">
        <div className="verification-console">
          <aside className="console-rail">
            <p className="request-label">Notary sections</p>
            <nav>
              {[
                ["Dashboard", "/notary/dashboard"],
                ["Assignments", "/notary/assignments"],
                ["Completion Package", "/notary/assignments/ORD-2607-0001/completion"],
                ["Credentials", "/credentials/expiration"],
                ["Notifications", "/notifications"],
                ["Support", "/support"],
              ].map(([label, href]) => (
                <a href={href} key={label}><span>{label}</span></a>
              ))}
            </nav>
          </aside>
          <article className="console-main">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Notary workspace</p>
                <h2>Notary routing matrix</h2>
              </div>
              <strong>Approved profile</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Notary portal destinations</caption>
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
                    ["Assignments", "Review active notary work", "NSN-NC-2607-0001", "Enabled", "Credential posture monitored", "/notary/assignments"],
                    ["Completion Package", "Upload completion package and monitor payable status", "NSN-NC-2607-0001", "Controlled", "Staff validation required before client delivery and payable review", "/notary/assignments/ORD-2607-0001/completion"],
                    ["Credentials", "Track expiration and renewal controls", "NSN-NC-2607-0001", "Monitored", "Replacement evidence required before restrictions clear", "/credentials/expiration"],
                    ["Payables", "Review payable eligibility status", "NSN-NC-2607-0001", "Restricted", "Administrator or Super Admin approval required", "/staff/financial-controls"],
                    ["RON eligibility", "Review remote online notary authority", "NSN-NC-2607-0001", "Restricted", "RON authorization and digital certificate required", "/credentials/expiration"],
                  ].map(([area, purpose, profile, status, control, href]) => (
                    <tr key={area}>
                      <td><span>Notary</span><strong>{area}</strong></td>
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
            <p className="request-label">Notary access controls</p>
            <h2>Eligibility locks</h2>
            <dl>
              <div><dt>Assignments</dt><dd>Available only while credentials remain active</dd></div>
              <div><dt>Credential updates</dt><dd>Replacement evidence requires staff verification</dd></div>
              <div><dt>Payables</dt><dd>W-9 and payable setup require elevated approval</dd></div>
              <div><dt>RON</dt><dd>Restricted until jurisdiction and certificate evidence are verified</dd></div>
            </dl>
          </aside>
        </div>
      </section>
    </main>
  );
}
