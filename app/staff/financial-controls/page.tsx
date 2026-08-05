import { requireStaffRouteAccess } from "../../access-policy";
import { financialControlRecords } from "../../operations-data";

export default async function FinancialControlsPage() {
  await requireStaffRouteAccess("/staff/financial-controls", [
    "Admin",
    "SuperAdmin",
  ]);

  const restrictedCount = financialControlRecords.filter(
    (record) => record.status === "Restricted" || record.status === "Locked",
  ).length;

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Financial controls navigation">
          <a href="/">Home</a>
          <a href="/staff/requests">Staff Queue</a>
          <a href="/staff/elevated-approval">Elevated Approval</a>
          <a className="nav-cta" href="/staff/financial-controls">
            Financial Controls
          </a>
          <a href="/staff/financial-reports">Financial Reports</a>
          <a href="/staff/audit-reports">Audit Reports</a>
          <a href="/auth/logout?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Financial Controls · Restricted Authority</p>
          <h1>Payable And Billing Approval Console</h1>
          <p>
            Control notary W-9 and payable activation, client billing
            authorization, invoice terms, and payment-ledger corrections before
            any financial permission becomes active.
          </p>
        </div>
        <aside>
          <p>Operational hold</p>
          <strong>{restrictedCount} controls restricted</strong>
          <span>General Admin may review status but cannot approve financial activation.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Financial control summary">
        {[
          ["Payable activation", "Restricted", "W-9 and payable setup require elevated approval."],
          ["Client billing", "Restricted", "Invoice terms and billing permissions require elevated approval."],
          ["Ledger corrections", "Super Admin", "Payment-ledger corrections require restricted audit review."],
          ["Evidence access", "Logged", "Financial evidence viewing must be attributable and retained."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Financial controls workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Authority model</p>
              <h2>Admin / Super Admin</h2>
              <span>Financial activation is never a General Admin-only action.</span>
            </section>
            <p className="request-label">Financial index</p>
            <nav>
              {[
                ["Payables", "#financial-controls"],
                ["Billing", "#financial-controls"],
                ["Invoice Terms", "#financial-controls"],
                ["Ledger Corrections", "#financial-controls"],
                ["Restricted Evidence", "#financial-controls"],
              ].map(([label, href]) => (
                <a href={href} key={label}>
                  <span>{label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main" id="financial-controls">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Financial review queue</p>
                <h2>Financial activation control matrix</h2>
              </div>
              <strong>{financialControlRecords.length} controls</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Financial controls requiring review</caption>
                <thead>
                  <tr>
                    <th scope="col">Control</th>
                    <th scope="col">Evidence</th>
                    <th scope="col">Status</th>
                    <th scope="col">Authority</th>
                    <th scope="col">Last updated</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {financialControlRecords.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <span>{record.profileType}</span>
                        <strong>{record.control}</strong>
                        <span className="evidence-packet-summary">
                          {record.profile} · {record.organization}
                        </span>
                      </td>
                      <td>
                        {record.evidence}
                        <span className="evidence-packet-summary">
                          {record.decision}
                        </span>
                      </td>
                      <td>
                        <mark data-status={record.status}>{record.status}</mark>
                      </td>
                      <td>{record.authority}</td>
                      <td>{record.lastUpdated}</td>
                      <td>
                        <a href={`/evidence/${record.evidenceId}`}>Review</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Financial command</p>
            <h2>Approval locked</h2>
            <p className="activation-summary">
              Financial permissions remain disabled until elevated approval is
              recorded with staff identity, supporting evidence, and audit note.
            </p>
            <dl>
              <div>
                <dt>GenAdmin authority</dt>
                <dd>Review completion status only</dd>
              </div>
              <div>
                <dt>Admin authority</dt>
                <dd>Approve billing and payable activation</dd>
              </div>
              <div>
                <dt>Super Admin authority</dt>
                <dd>Approve ledger corrections and restricted overrides</dd>
              </div>
              <div>
                <dt>Evidence access</dt>
                <dd>Restricted financial records are logged</dd>
              </div>
            </dl>
            <div className="decision-actions">
              <button type="button" disabled>
                Financial Approval Locked
              </button>
              <button type="button">Request Correction</button>
              <button type="button">Escalate to Super Admin</button>
            </div>
            <p className="decision-lock-note">
              No payable, billing, invoice-term, or ledger correction action
              should bypass elevated approval and restricted audit review.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
