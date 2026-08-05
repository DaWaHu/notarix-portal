import { requireStaffRouteAccess } from "../../access-policy";
import { paymentLedgerRecords } from "../../operations-data";
import { CommandStatusPanel } from "../command-center/CommandStatusPanel";
import { getLatestCommandCenterReceiptForHref } from "../command-center/store";

export default async function FinancialReportingPage() {
  await requireStaffRouteAccess("/staff/financial-reports", [
    "Admin",
    "SuperAdmin",
  ]);
  const latestCommandReceipt = getLatestCommandCenterReceiptForHref(
    "/staff/financial-reports",
  );

  const lockedCount = paymentLedgerRecords.filter((record) =>
    ["Payable Restricted", "Billing Locked", "Correction Locked"].includes(
      record.status,
    ),
  ).length;
  const superAdminCount = paymentLedgerRecords.filter(
    (record) => record.authority === "Super Admin",
  ).length;

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Financial reporting navigation">
          <a href="/">Home</a>
          <a href="/staff/requests">Staff Queue</a>
          <a href="/staff/financial-controls">Financial Controls</a>
          <a className="nav-cta" href="/staff/financial-reports">Financial Reports</a>
          <a href="/staff/audit-reports">Audit Reports</a>
          <a href="/signout-with-chatgpt?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Financial Reporting · Payment Ledger Controls</p>
          <h1>Financial Reporting And Payment Ledger Center</h1>
          <p>
            Review client invoice posture, notary payable restrictions, billing
            authorization, order-level ledger entries, and payment corrections
            before funds, terms, or ledger adjustments are released.
          </p>
        </div>
        <aside>
          <p>Financial hold</p>
          <strong>{lockedCount} ledger controls locked</strong>
          <span>Payment release and ledger corrections require elevated authority.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Financial reporting summary">
        {[
          ["Ledger locks", String(lockedCount), "Payable, billing, and correction records currently restricted."],
          ["Super Admin items", String(superAdminCount), "Ledger corrections require Super Admin review."],
          ["Invoice posture", "Controlled", "Client invoices depend on order and billing authorization state."],
          ["Evidence linkage", "Required", "Ledger entries must retain supporting evidence and audit context."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Financial reporting workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Ledger file</p>
              <h2>Payment controls</h2>
              <span>Financial reports connect orders, profiles, evidence, and authority.</span>
            </section>
            <p className="request-label">Ledger index</p>
            <nav>
              {[
                "Client invoices",
                "Notary payables",
                "Billing authorization",
                "Ledger corrections",
                "Restricted evidence",
              ].map((label) => (
                <a href="#payment-ledger-matrix" key={label}>
                  <span>{label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main" id="payment-ledger-matrix">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Payment ledger register</p>
                <h2>Financial ledger reporting matrix</h2>
              </div>
              <strong>{paymentLedgerRecords.length} ledger entries</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Financial reporting and payment ledger records</caption>
                <thead>
                  <tr>
                    <th scope="col">Ledger entry</th>
                    <th scope="col">Party</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Status</th>
                    <th scope="col">Authority</th>
                    <th scope="col">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentLedgerRecords.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <span>{record.id} · {record.ledgerType}</span>
                        <strong>{record.relatedRecord}</strong>
                        <span className="evidence-packet-summary">
                          {record.control}
                        </span>
                      </td>
                      <td>
                        {record.party}
                        <span className="evidence-packet-summary">
                          {record.profile}
                        </span>
                      </td>
                      <td>{record.amount}</td>
                      <td><mark>{record.status}</mark></td>
                      <td>
                        {record.authority}
                        <span className="evidence-packet-summary">
                          {record.posted}
                        </span>
                      </td>
                      <td>
                        <a href={`/evidence/${record.evidenceId}`}>Open Evidence</a>
                        <span className="evidence-packet-summary">
                          {record.nextAction}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Ledger command center</p>
            <h2>Release controls</h2>
            <p className="activation-summary">
              Payment reporting should prevent premature payable release,
              unapproved billing terms, and unaudited ledger corrections.
            </p>
            <dl>
              <div><dt>Payable release</dt><dd>Requires approved profile number and active W-9 control</dd></div>
              <div><dt>Client invoice</dt><dd>Requires billing authorization and order state review</dd></div>
              <div><dt>Ledger correction</dt><dd>Super Admin restricted audit review required</dd></div>
              <div><dt>Evidence custody</dt><dd>Supporting documents remain linked to every ledger entry</dd></div>
              <div><dt>Export</dt><dd>Reports should include timestamp, actor, and purpose</dd></div>
            </dl>
            <CommandStatusPanel
              receipt={latestCommandReceipt}
              title="Financial reports"
            />
            <div className="decision-actions">
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="export-ledger-report" />
                <input name="targetId" type="hidden" value="LED-2607-0001" />
                <button type="submit">Export Ledger Report</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="hold-payment-release" />
                <input name="targetId" type="hidden" value="LED-2607-0002" />
                <button type="submit">Hold Payment Release</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="escalate-ledger-correction" />
                <input name="targetId" type="hidden" value="LED-2607-0004" />
                <button type="submit">Escalate Ledger Correction</button>
              </form>
            </div>
            <p className="decision-lock-note">
              No invoice, payable, billing-term, or ledger-correction report
              should override profile verification, financial controls, or audit
              restrictions.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
