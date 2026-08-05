import { requireStaffRouteAccess } from "../../access-policy";
import { auditReportRecords } from "../../operations-data";
import { CommandStatusPanel } from "../command-center/CommandStatusPanel";
import { getLatestCommandCenterReceiptForHref } from "../command-center/store";

export default async function SuperAdminAuditReportingPage() {
  await requireStaffRouteAccess("/staff/audit-reports", ["SuperAdmin"]);
  const latestCommandReceipt = getLatestCommandCenterReceiptForHref(
    "/staff/audit-reports",
  );

  const restrictedCount = auditReportRecords.filter((record) =>
    ["Restricted", "High", "Elevated"].includes(record.risk),
  ).length;
  const evidenceEvents = auditReportRecords.filter(
    (record) => record.area === "Evidence access",
  ).length;
  const financialEvents = auditReportRecords.filter(
    (record) => record.area === "Financial control",
  ).length;

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Super Admin audit reporting navigation">
          <a href="/">Home</a>
          <a href="/staff/requests">Staff Queue</a>
          <a href="/staff/elevated-approval">Elevated Approval</a>
          <a href="/staff/financial-controls">Financial Controls</a>
          <a className="nav-cta" href="/staff/audit-reports">Audit Reports</a>
          <a href="/auth/logout?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Super Admin Audit Reporting · Restricted Access</p>
          <h1>Super Admin Audit Reporting Center</h1>
          <p>
            Review GenAdmin verification activity, elevated approvals, evidence
            access, financial controls, notification delivery, credential
            renewal, RON restrictions, and profile number assignment history.
          </p>
        </div>
        <aside>
          <p>Immutable audit hold</p>
          <strong>{restrictedCount} restricted events</strong>
          <span>General Admin users cannot access this report workspace.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Audit report summary">
        {[
          ["High-risk events", String(restrictedCount), "Restricted, elevated, and high-risk events awaiting executive review."],
          ["Evidence access", String(evidenceEvents), "Restricted evidence views remain attributable and retained."],
          ["Financial controls", String(financialEvents), "Ledger and payable events require elevated audit review."],
          ["Retention posture", "Append-only", "Production audit records should be immutable or append-only."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Super Admin audit workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Report access</p>
              <h2>Super Admin only</h2>
              <span>Audit reporting is separated from routine GenAdmin review.</span>
            </section>
            <p className="request-label">Report index</p>
            <nav>
              {[
                "Profile verification",
                "Final approval",
                "Evidence access",
                "Financial control",
                "Notification delivery",
                "RON restriction",
              ].map((label) => (
                <a href="#audit-event-matrix" key={label}>
                  <span>{label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main" id="audit-event-matrix">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Restricted audit register</p>
                <h2>Audit event matrix</h2>
              </div>
              <strong>{auditReportRecords.length} events</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Super Admin audit events</caption>
                <thead>
                  <tr>
                    <th scope="col">Event</th>
                    <th scope="col">Actor</th>
                    <th scope="col">Risk</th>
                    <th scope="col">Authority</th>
                    <th scope="col">Timestamp</th>
                    <th scope="col">Next action</th>
                  </tr>
                </thead>
                <tbody>
                  {auditReportRecords.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <span>{record.id} · {record.area}</span>
                        <strong>{record.event}</strong>
                        <span className="evidence-packet-summary">
                          Related record: {record.relatedRecord}
                        </span>
                      </td>
                      <td>
                        {record.actor}
                        <span className="evidence-packet-summary">{record.role}</span>
                      </td>
                      <td><mark>{record.risk}</mark></td>
                      <td>
                        {record.authority}
                        <span className="evidence-packet-summary">
                          {record.retention}
                        </span>
                      </td>
                      <td>{record.timestamp}</td>
                      <td>{record.nextAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Audit command center</p>
            <h2>Immutable controls</h2>
            <p className="activation-summary">
              Production audit reporting should use append-only records,
              retained exports, role-restricted views, and executive escalation.
            </p>
            <dl>
              <div><dt>Export controls</dt><dd>Super Admin export with timestamp and purpose</dd></div>
              <div><dt>Retention hold</dt><dd>Preserve restricted records during disputes or reviews</dd></div>
              <div><dt>Evidence access</dt><dd>Every restricted view remains attributable</dd></div>
              <div><dt>Profile numbers</dt><dd>NSN and NSC assignment history remains permanent</dd></div>
              <div><dt>Failed actions</dt><dd>Blocked workflow attempts remain reportable</dd></div>
            </dl>
            <CommandStatusPanel
              receipt={latestCommandReceipt}
              title="Audit reports"
            />
            <div className="decision-actions">
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="export-audit-report" />
                <input name="targetId" type="hidden" value="AUD-2607-0001" />
                <button type="submit">Export Audit Report</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="place-retention-hold" />
                <input name="targetId" type="hidden" value="AUD-2607-0006" />
                <button type="submit">Place Retention Hold</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="escalate-exception" />
                <input name="targetId" type="hidden" value="AUD-2607-0006" />
                <button type="submit">Escalate Exception</button>
              </form>
            </div>
            <p className="decision-lock-note">
              Audit report records should never be edited in place. Corrections
              should be appended as new attributable events.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
