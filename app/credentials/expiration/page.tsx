import { requireStaffRouteAccess } from "../../access-policy";
import { credentialMonitorRecords } from "../../operations-data";
import { CommandStatusPanel } from "../../staff/command-center/CommandStatusPanel";
import { getLatestCommandCenterReceiptForHref } from "../../staff/command-center/store";

function credentialAnchor(label: string) {
  return label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function CredentialExpirationPage() {
  await requireStaffRouteAccess("/credentials/expiration", ["GenAdmin", "Admin", "SuperAdmin"]);
  const latestCommandReceipt = getLatestCommandCenterReceiptForHref(
    "/credentials/expiration",
  );

  const renewalDueCount = credentialMonitorRecords.filter((record) =>
    ["Renewal due", "Elevated review", "Restricted"].includes(record.status),
  ).length;
  const elevatedCount = credentialMonitorRecords.filter(
    (record) => record.authority === "Administrator or Super Admin",
  ).length;
  const notaryCount = credentialMonitorRecords.filter(
    (record) => record.ownerType === "Notary",
  ).length;
  const clientCount = credentialMonitorRecords.length - notaryCount;

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Credential navigation">
          <a href="/">Home</a>
          <a href="/staff/requests">Staff Queue</a>
          <a href="/staff/elevated-approval">Elevated Approval</a>
          <a href="/staff/financial-controls">Financial Controls</a>
          <a href="/staff/financial-reports">Financial Reports</a>
          <a href="/notifications">Communications</a>
          <a className="nav-cta" href="/credentials/expiration">Credentials</a>
          <a href="/auth/logout?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Credential Monitoring Center · Renewal Controls</p>
          <h1>Credential Expiration Register</h1>
          <p>
            Monitor notary commissions, E&O insurance, RON digital certificates,
            NNA records, background checks, W-9 dependencies, and client
            authority documents before eligibility, assignment, billing, or RON
            access is affected.
          </p>
        </div>
        <aside>
          <p>Assignment guardrail</p>
          <strong>{renewalDueCount} records need control review</strong>
          <span>Expired credentials must block affected services.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Credential renewal summary">
        {[
          [
            "Renewal review",
            String(renewalDueCount),
            "Records requiring renewal, elevated review, or restricted status handling.",
          ],
          [
            "Elevated authority",
            String(elevatedCount),
            "Administrator or Super Admin approval required for restricted credentials.",
          ],
          [
            "Notary credentials",
            String(notaryCount),
            "Commission, insurance, RON, NNA, and background controls.",
          ],
          [
            "Client authority",
            String(clientCount),
            "Client billing and account authority documents under renewal review.",
          ],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Credential expiration workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Renewal file</p>
              <h2>Credential controls</h2>
              <span>
                Eligibility, reminders, replacement evidence, and elevated
                authority are tracked from one staff workspace.
              </span>
            </section>
            <p className="request-label">Credential views</p>
            <nav>
              {credentialMonitorRecords.map((record) => (
                <a href={`#${credentialAnchor(record.credential)}`} key={record.id}>
                  <span>{record.credential}</span>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main" id="credential-renewal-register">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Renewal queue</p>
                <h2>Credential renewal monitoring matrix</h2>
              </div>
              <strong>{credentialMonitorRecords.length} records</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Credential expiration and renewal register</caption>
                <thead>
                  <tr>
                    <th scope="col">Credential</th>
                    <th scope="col">Expiration / window</th>
                    <th scope="col">Status</th>
                    <th scope="col">Reminder control</th>
                    <th scope="col">Eligibility impact</th>
                    <th scope="col">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {credentialMonitorRecords.map((record) => (
                    <tr key={record.id} id={credentialAnchor(record.credential)}>
                      <td>
                        <span>{record.id} · {record.ownerType}</span>
                        <strong>{record.credential}</strong>
                        <span className="evidence-packet-summary">
                          {record.owner} · {record.profile}
                        </span>
                      </td>
                      <td>
                        {record.expiration}
                        <span className="evidence-packet-summary">
                          {record.renewalWindow}
                        </span>
                      </td>
                      <td><mark>{record.status}</mark></td>
                      <td>
                        {record.reminder}
                        <span className="evidence-packet-summary">
                          Notification: {record.notificationId}
                        </span>
                      </td>
                      <td>
                        {record.eligibilityImpact}
                        <span className="evidence-packet-summary">
                          Authority: {record.authority}
                        </span>
                      </td>
                      <td>
                        <a className="table-action-link" href={`/evidence/${record.evidenceId}`}>
                          Open Evidence
                        </a>
                        <span className="evidence-packet-summary">
                          {record.evidence}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Renewal command center</p>
            <h2>Service restrictions</h2>
            <p className="activation-summary">
              Renewal actions should preserve assignment safety, RON authority,
              billing controls, notification delivery, and evidence custody.
            </p>
            <dl>
              <div><dt>90-day reminder</dt><dd>Initial notice before standard credential expiration</dd></div>
              <div><dt>30-day RON reminder</dt><dd>Weekly follow-up for RON and digital certificate controls</dd></div>
              <div><dt>Expired record</dt><dd>Blocks affected assignment, RON, billing, or document access eligibility</dd></div>
              <div><dt>Replacement evidence</dt><dd>New files must pass upload validation, malware scan, and staff review</dd></div>
              <div><dt>Override</dt><dd>Administrator or Super Admin only, with audit attribution</dd></div>
            </dl>
            <CommandStatusPanel
              receipt={latestCommandReceipt}
              title="Credential renewal"
            />
            <div className="decision-actions">
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="send-renewal-reminder" />
                <input name="targetId" type="hidden" value="CRD-2607-0002" />
                <button type="submit">Send Renewal Reminder</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="request-replacement-evidence" />
                <input name="targetId" type="hidden" value="CRD-2607-0002" />
                <button type="submit">Request Replacement Evidence</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="escalate-restriction" />
                <input name="targetId" type="hidden" value="CRD-2607-0003" />
                <button type="submit">Escalate Restriction</button>
              </form>
            </div>
            <p className="decision-lock-note">
              Renewal approval should not reactivate restricted services until
              replacement evidence is verified and the delivery log records any
              required reminder, correction, or approval notification.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
