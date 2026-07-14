import { requireChatGPTUser } from "../../chatgpt-auth";
import { systemHealthRecords } from "../../operations-data";
import { CommandStatusPanel } from "../command-center/CommandStatusPanel";
import { getLatestCommandCenterReceiptForHref } from "../command-center/store";

export default async function SystemHealthPage() {
  await requireChatGPTUser("/staff/system-health");
  const latestCommandReceipt = getLatestCommandCenterReceiptForHref(
    "/staff/system-health",
  );

  const pendingCount = systemHealthRecords.filter((record) =>
    record.status.toLowerCase().includes("pending") ||
    record.status.toLowerCase().includes("required"),
  ).length;
  const superAdminCount = systemHealthRecords.filter(
    (record) => record.authority === "Super Admin",
  ).length;
  const backupReadyCount = systemHealthRecords.filter((record) =>
    record.category.toLowerCase().includes("backup"),
  ).length;

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="System health navigation">
          <a href="/">Home</a>
          <a href="/staff">Staff Home</a>
          <a href="/staff/document-validation">Document Validation</a>
          <a href="/staff/retention">Retention</a>
          <a href="/staff/access-control">Access Control</a>
          <a href="/staff/integrations">Integrations</a>
          <a href="/staff/platform">Platform Configuration</a>
          <a href="/staff/audit-reports">Audit Reports</a>
          <a className="nav-cta" href="/staff/system-health">System Health</a>
          <a href="/signout-with-chatgpt?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">System Health · Backup And Recovery Controls</p>
          <h1>System Health And Recovery Center</h1>
          <p>
            Review database backup posture, encrypted evidence storage,
            notification callbacks, identity-provider MFA/passkeys, malware
            scanning, recovery drills, provider degradation, and production
            readiness before critical portal workflows are activated.
          </p>
        </div>
        <aside>
          <p>Production readiness</p>
          <strong>{pendingCount} integrations pending</strong>
          <span>Provider and recovery controls must be verified before launch.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="System health summary">
        {[
          ["Pending integrations", String(pendingCount), "Provider bindings, callbacks, or production controls not yet complete."],
          ["Super Admin controls", String(superAdminCount), "System-level controls requiring executive authority."],
          ["Backup domains", String(backupReadyCount), "Backup and recovery records requiring restore validation."],
          ["Recovery posture", "Controlled", "Recovery drills and provider degradation must create retained receipts."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="System health workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Operations file</p>
              <h2>Health controls</h2>
              <span>
                Backup, recovery, provider health, identity, malware scanning,
                and storage readiness are tracked from one restricted page.
              </span>
            </section>
            <p className="request-label">Health index</p>
            <nav>
              {[
                "Database backup",
                "Evidence storage",
                "Notification callbacks",
                "Identity provider",
                "Malware scanning",
                "Recovery drill",
              ].map((label) => (
                <a href="#system-health-matrix" key={label}>
                  <span>{label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main" id="system-health-matrix">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Operational readiness register</p>
                <h2>Backup, recovery, and provider health matrix</h2>
              </div>
              <strong>{systemHealthRecords.length} controls</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>System health and recovery controls</caption>
                <thead>
                  <tr>
                    <th scope="col">Service</th>
                    <th scope="col">Category</th>
                    <th scope="col">Status</th>
                    <th scope="col">Environment</th>
                    <th scope="col">Recovery point</th>
                    <th scope="col">Authority</th>
                    <th scope="col">Next action</th>
                  </tr>
                </thead>
                <tbody>
                  {systemHealthRecords.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <span>{record.id}</span>
                        <strong>{record.service}</strong>
                        <span className="evidence-packet-summary">
                          Last checked {record.lastChecked}
                        </span>
                      </td>
                      <td>{record.category}</td>
                      <td><mark>{record.status}</mark></td>
                      <td>{record.environment}</td>
                      <td>{record.recoveryPoint}</td>
                      <td>{record.authority}</td>
                      <td>{record.nextAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Recovery command center</p>
            <h2>Operational readiness</h2>
            <p className="activation-summary">
              System health actions should create retained receipts before
              provider degradation, backup verification, recovery drills, or
              incident escalation affects portal workflow availability.
            </p>
            <dl>
              <div><dt>Backups</dt><dd>Restore path and recovery point must be tested</dd></div>
              <div><dt>Provider health</dt><dd>Degraded providers must trigger workflow restrictions</dd></div>
              <div><dt>Identity</dt><dd>Production MFA/passkeys and RBAC claims required</dd></div>
              <div><dt>Storage</dt><dd>Encrypted object storage and signed URLs required</dd></div>
              <div><dt>Incident response</dt><dd>Escalations must retain actor, target, and authority</dd></div>
            </dl>
            <CommandStatusPanel
              receipt={latestCommandReceipt}
              title="System health"
            />
            <div className="decision-actions">
              <a href="/staff/access-control">Open Access Control</a>
              <a href="/staff/integrations">Open Integrations</a>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="verify-backup-recovery" />
                <input name="targetId" type="hidden" value="SYS-2607-0001" />
                <button type="submit">Verify Backup Recovery</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="open-recovery-drill" />
                <input name="targetId" type="hidden" value="SYS-2607-0001" />
                <button type="submit">Open Recovery Drill</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="escalate-system-incident" />
                <input name="targetId" type="hidden" value="SYS-2607-0003" />
                <button type="submit">Escalate System Incident</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="mark-provider-degraded" />
                <input name="targetId" type="hidden" value="SYS-2607-0002" />
                <button type="submit">Mark Provider Degraded</button>
              </form>
            </div>
            <p className="decision-lock-note">
              Production readiness requires real provider monitoring, backup
              restore evidence, recovery drills, incident routing, environment
              separation, and secrets management.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
