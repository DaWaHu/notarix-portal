import { requireChatGPTUser } from "../../chatgpt-auth";
import { retentionPolicyRecords } from "../../operations-data";
import { CommandStatusPanel } from "../command-center/CommandStatusPanel";
import { getLatestCommandCenterReceiptForHref } from "../command-center/store";

export default async function RetentionPolicyPage() {
  await requireChatGPTUser("/staff/retention");
  const latestCommandReceipt = getLatestCommandCenterReceiptForHref("/staff/retention");

  const holdCount = retentionPolicyRecords.filter((record) =>
    record.holdStatus.toLowerCase().includes("hold"),
  ).length;
  const superAdminCount = retentionPolicyRecords.filter(
    (record) => record.authority === "Super Admin",
  ).length;
  const notEligibleCount = retentionPolicyRecords.filter((record) =>
    record.deletionEligibility.toLowerCase().includes("not eligible") ||
    record.deletionEligibility.toLowerCase().includes("never"),
  ).length;

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Retention navigation">
          <a href="/">Home</a>
          <a href="/staff">Staff Home</a>
          <a href="/staff/evidence-intake">Evidence Intake</a>
          <a href="/staff/document-validation">Document Validation</a>
          <a href="/staff/platform">Platform Configuration</a>
          <a href="/staff/audit-reports">Audit Reports</a>
          <a className="nav-cta" href="/staff/retention">Retention</a>
          <a href="/signout-with-chatgpt?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Retention And Records Policy · Controlled Access</p>
          <h1>Retention And Records Policy Center</h1>
          <p>
            Review how profile records, identity evidence, RON files, W-9 and
            payable records, client billing records, order documents, audit
            events, notification logs, command receipts, and financial ledger
            records are retained, held, reviewed, or escalated.
          </p>
        </div>
        <aside>
          <p>Records hold posture</p>
          <strong>{holdCount} retention holds active</strong>
          <span>Deletion cannot proceed while audit, financial, or legal holds exist.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Retention summary">
        {[
          ["Retention holds", String(holdCount), "Records under audit, financial, legal, or permanent command retention."],
          ["Super Admin authority", String(superAdminCount), "Restricted categories requiring executive retention control."],
          ["Deletion blocked", String(notEligibleCount), "Records not eligible for destructive deletion."],
          ["Append-only records", "Required", "Command receipts and audit events should remain immutable."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Retention workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Policy register</p>
              <h2>Records retention</h2>
              <span>Retention decisions protect evidence, audit trails, profile numbers, and legal review history.</span>
            </section>
            <p className="request-label">Policy index</p>
            <nav>
              {[
                "Profile records",
                "Identity proofing",
                "Order documents",
                "W-9 and payables",
                "Command receipts",
                "Audit events",
              ].map((label) => (
                <a href="#retention-policy-matrix" key={label}>
                  <span>{label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main" id="retention-policy-matrix">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Retention register</p>
                <h2>Records policy and hold matrix</h2>
              </div>
              <strong>{retentionPolicyRecords.length} policies</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Retention and records policy controls</caption>
                <thead>
                  <tr>
                    <th scope="col">Record category</th>
                    <th scope="col">Workflow</th>
                    <th scope="col">Retention period</th>
                    <th scope="col">Status / hold</th>
                    <th scope="col">Deletion eligibility</th>
                    <th scope="col">Authority</th>
                    <th scope="col">Next action</th>
                  </tr>
                </thead>
                <tbody>
                  {retentionPolicyRecords.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <span>{record.id}</span>
                        <strong>{record.category}</strong>
                        <span className="evidence-packet-summary">
                          Related: {record.relatedRecord}
                        </span>
                      </td>
                      <td>{record.relatedWorkflow}</td>
                      <td>{record.retentionPeriod}</td>
                      <td>
                        <mark>{record.status}</mark>
                        <span className="evidence-packet-summary">
                          {record.holdStatus}
                        </span>
                      </td>
                      <td>{record.deletionEligibility}</td>
                      <td>
                        {record.authority}
                        <span className="evidence-packet-summary">
                          Last reviewed {record.lastReviewed}
                        </span>
                      </td>
                      <td>{record.nextAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Retention command center</p>
            <h2>Hold and deletion controls</h2>
            <p className="activation-summary">
              Retention decisions must prevent premature deletion, preserve
              restricted evidence, and keep profile numbers, command receipts,
              ledger records, and audit history available for review.
            </p>
            <dl>
              <div><dt>Retention hold</dt><dd>Super Admin restricted action</dd></div>
              <div><dt>Hold release</dt><dd>Requires retained reason and receipt</dd></div>
              <div><dt>Deletion review</dt><dd>No destructive deletion without eligibility review</dd></div>
              <div><dt>Exceptions</dt><dd>Escalate conflicts between retention, privacy, and audit rules</dd></div>
            </dl>
            <CommandStatusPanel
              receipt={latestCommandReceipt}
              title="Retention"
            />
            <div className="decision-actions">
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="place-record-retention-hold" />
                <input name="targetId" type="hidden" value="RET-2607-0002" />
                <button type="submit">Place Retention Hold</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="release-retention-hold" />
                <input name="targetId" type="hidden" value="RET-2607-0003" />
                <button type="submit">Release Retention Hold</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="mark-deletion-review-needed" />
                <input name="targetId" type="hidden" value="RET-2607-0003" />
                <button type="submit">Mark Deletion Review Needed</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="escalate-retention-exception" />
                <input name="targetId" type="hidden" value="RET-2607-0004" />
                <button type="submit">Escalate Retention Exception</button>
              </form>
            </div>
            <p className="decision-lock-note">
              Production retention enforcement should use immutable audit
              records, object-storage lifecycle rules, legal hold controls, and
              administrative approval before deletion eligibility changes.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
