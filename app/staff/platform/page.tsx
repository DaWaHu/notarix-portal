import { requireChatGPTUser } from "../../chatgpt-auth";
import {
  platformConfigurationRecords,
  providerIntegrationRecords,
  systemHealthRecords,
} from "../../operations-data";
import { CommandStatusPanel } from "../command-center/CommandStatusPanel";
import { getLatestCommandCenterReceiptForHref } from "../command-center/store";

export default async function PlatformConfigurationCenterPage() {
  await requireChatGPTUser("/staff/platform");
  const latestIntegrationReceipt = getLatestCommandCenterReceiptForHref("/staff/integrations");
  const superAdminControls = platformConfigurationRecords.filter(
    (record) => record.authority === "Super Admin",
  ).length;
  const productionPending = [
    ...platformConfigurationRecords,
    ...providerIntegrationRecords,
    ...systemHealthRecords,
  ].filter((record) =>
    record.status.toLowerCase().includes("pending") ||
    record.status.toLowerCase().includes("required"),
  ).length;
  const modeledPolicies = platformConfigurationRecords.filter((record) =>
    record.status.toLowerCase().includes("modeled") ||
    record.status.toLowerCase().includes("configured"),
  ).length;
  const providerBindings = providerIntegrationRecords.filter((record) =>
    record.status.toLowerCase().includes("required") ||
    record.status.toLowerCase().includes("pending"),
  ).length;

  return (
    <main className="staff-page order-workspace-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Platform configuration navigation">
          <a href="/">Home</a>
          <a href="/staff">Staff Home</a>
          <a href="/staff/system-health">System Health</a>
          <a href="/staff/access-control">Access Control</a>
          <a href="/staff/integrations">Integrations</a>
          <a href="/staff/retention">Retention</a>
          <a className="nav-cta" href="/staff/platform">Platform Configuration</a>
          <a href="/signout-with-chatgpt?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Platform Configuration · Administrative Control</p>
          <h1>Admin Platform Configuration Center</h1>
          <p>
            Review the operating rules that govern service availability,
            jurisdiction behavior, credential timing, notification templates,
            document retention, financial controls, and production provider
            readiness.
          </p>
        </div>
        <aside>
          <p>Deployment posture</p>
          <strong>{productionPending} controls pending</strong>
          <span>Production launch requires provider binding and policy enforcement.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Platform configuration summary">
        {[
          ["Configuration rules", String(platformConfigurationRecords.length), "Administrative policies modeled for production enforcement."],
          ["Modeled policies", String(modeledPolicies), "Rules ready to bind to production services and database records."],
          ["Provider bindings", String(providerBindings), "External integrations requiring production credentials or callbacks."],
          ["Super Admin controls", String(superAdminControls), "Settings requiring executive or restricted authority."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Platform configuration workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Configuration file</p>
              <h2>Platform rules</h2>
              <span>
                This center should become the administrative source of truth for
                rules currently modeled across operations, compliance, and
                provider-readiness pages.
              </span>
            </section>
            <p className="request-label">Configuration index</p>
            <nav>
              {platformConfigurationRecords.map((record) => (
                <a href={`#${record.id.toLowerCase()}`} key={record.id}>
                  <span>{record.area}</span>
                  <small>{record.status}</small>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Administrative rules</p>
                <h2>Platform configuration control matrix</h2>
              </div>
              <strong>{platformConfigurationRecords.length} rules</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Platform configuration rules</caption>
                <thead>
                  <tr>
                    <th scope="col">Configuration</th>
                    <th scope="col">Setting</th>
                    <th scope="col">Status</th>
                    <th scope="col">Authority</th>
                    <th scope="col">Effective rule</th>
                    <th scope="col">Linked control</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {platformConfigurationRecords.map((record) => (
                    <tr id={record.id.toLowerCase()} key={record.id}>
                      <td>
                        <span>{record.id}</span>
                        <strong>{record.area}</strong>
                        <span className="evidence-packet-summary">{record.owner}</span>
                      </td>
                      <td>{record.setting}</td>
                      <td><mark>{record.status}</mark></td>
                      <td>{record.authority}</td>
                      <td>{record.effectiveRule}</td>
                      <td>
                        {record.linkedControl}
                        <span className="evidence-packet-summary">{record.nextAction}</span>
                      </td>
                      <td><a href="/staff/system-health">Review</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Configuration command center</p>
            <h2>Production readiness controls</h2>
            <p className="activation-summary">
              Platform settings become production-ready only when database,
              identity, provider, storage, notification, payment, retention, and
              audit services are bound to the modeled policies.
            </p>
            <dl>
              <div><dt>Identity</dt><dd>MFA, passkeys, RBAC claims, and session policy</dd></div>
              <div><dt>Storage</dt><dd>Encrypted object storage and signed evidence URLs</dd></div>
              <div><dt>Documents</dt><dd>Upload validation, malware scanning, quarantine, and release</dd></div>
              <div><dt>Notifications</dt><dd>Email, SMS, phone consent, callbacks, and retry policy</dd></div>
              <div><dt>Financials</dt><dd>Invoice, payable, W-9, and ledger correction authority</dd></div>
            </dl>
            <CommandStatusPanel
              receipt={latestIntegrationReceipt}
              title="Platform configuration"
            />
            <div className="decision-actions">
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="verify-provider-integration" />
                <input name="targetId" type="hidden" value="INT-2607-0001" />
                <button type="submit">Verify Identity Provider</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="verify-backup-recovery" />
                <input name="targetId" type="hidden" value="SYS-2607-0001" />
                <button type="submit">Verify Backup Readiness</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="require-mfa-passkey-reset" />
                <input name="targetId" type="hidden" value="IAM-2607-0002" />
                <button type="submit">Require MFA / Passkey Reset</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="place-record-retention-hold" />
                <input name="targetId" type="hidden" value="RET-2607-0002" />
                <button type="submit">Place Retention Hold</button>
              </form>
              <a href="/staff/system-health">Open System Health</a>
              <a href="/staff/integrations">Open Integrations</a>
              <a href="/staff/access-control">Open Access Control</a>
              <a href="/staff/retention">Open Retention</a>
            </div>
            <p className="decision-lock-note">
              Production configuration changes should require authenticated
              staff identity, role authority, change receipt, provider callback
              verification, and immutable audit retention.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
