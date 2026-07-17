import { requireChatGPTUser } from "../../chatgpt-auth";
import { providerIntegrationRecords } from "../../operations-data";
import { CommandStatusPanel } from "../command-center/CommandStatusPanel";
import { getLatestCommandCenterReceiptForHref } from "../command-center/store";

export default async function ProviderIntegrationsPage() {
  await requireChatGPTUser("/staff/integrations");
  const latestCommandReceipt = getLatestCommandCenterReceiptForHref(
    "/staff/integrations",
  );

  const pendingCount = providerIntegrationRecords.filter((record) =>
    record.status.toLowerCase().includes("pending") ||
    record.status.toLowerCase().includes("required"),
  ).length;
  const superAdminCount = providerIntegrationRecords.filter(
    (record) => record.owner === "Super Admin",
  ).length;
  const callbackCount = providerIntegrationRecords.filter((record) =>
    record.complianceControl.toLowerCase().includes("callback") ||
    record.nextAction.toLowerCase().includes("callback"),
  ).length;

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Provider integration navigation">
          <a href="/">Home</a>
          <a href="/staff">Staff Home</a>
          <a href="/staff/system-health">System Health</a>
          <a href="/staff/access-control">Access Control</a>
          <a href="/staff/platform">Platform Configuration</a>
          <a href="/staff/document-validation">Document Validation</a>
          <a href="/staff/deployment-readiness">Deployment Readiness</a>
          <a className="nav-cta" href="/staff/integrations">Integrations</a>
          <a href="/signout-with-chatgpt?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Provider Integrations · Production Readiness</p>
          <h1>Provider Integration Status Center</h1>
          <p>
            Review identity provider, notification delivery, encrypted storage,
            malware scanning, payment/accounting, callback handling, data
            access, and compliance controls before production workflows depend
            on external services.
          </p>
        </div>
        <aside>
          <p>Integration posture</p>
          <strong>{pendingCount} providers pending</strong>
          <span>Provider bindings must be verified before workflow release.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Provider integration summary">
        {[
          ["Pending providers", String(pendingCount), "Integrations requiring production binding, selection, or callback setup."],
          ["Super Admin owned", String(superAdminCount), "Providers controlling restricted data or executive operations."],
          ["Callback controls", String(callbackCount), "Integrations requiring callbacks, replay, retry, or status synchronization."],
          ["Data access", "Restricted", "Each provider must be scoped to the least data required."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Provider integration workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Integration file</p>
              <h2>Provider readiness</h2>
              <span>
                External providers must be scoped, monitored, callback-aware,
                and tied to retained command receipts.
              </span>
            </section>
            <p className="request-label">Provider index</p>
            <nav>
              {[
                "Identity provider",
                "Email and SMS",
                "Encrypted storage",
                "Malware scanning",
                "Payment provider",
                "Callbacks",
              ].map((label) => (
                <a href="#provider-integration-matrix" key={label}>
                  <span>{label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main" id="provider-integration-matrix">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Provider register</p>
                <h2>Integration status and compliance matrix</h2>
              </div>
              <strong>{providerIntegrationRecords.length} providers</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Provider integration status records</caption>
                <thead>
                  <tr>
                    <th scope="col">Provider</th>
                    <th scope="col">Service area</th>
                    <th scope="col">Status</th>
                    <th scope="col">Environment</th>
                    <th scope="col">Data access</th>
                    <th scope="col">Compliance control</th>
                    <th scope="col">Next action</th>
                  </tr>
                </thead>
                <tbody>
                  {providerIntegrationRecords.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <span>{record.id}</span>
                        <strong>{record.provider}</strong>
                        <span className="evidence-packet-summary">
                          Owner: {record.owner}
                        </span>
                      </td>
                      <td>{record.serviceArea}</td>
                      <td><mark>{record.status}</mark></td>
                      <td>
                        {record.environment}
                        <span className="evidence-packet-summary">
                          Last checked {record.lastChecked}
                        </span>
                      </td>
                      <td>{record.dataAccess}</td>
                      <td>{record.complianceControl}</td>
                      <td>{record.nextAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Integration command center</p>
            <h2>Provider controls</h2>
            <p className="activation-summary">
              Provider actions should verify readiness, mark degraded service,
              open callback review, or escalate provider risk before dependent
              portal workflows rely on external systems.
            </p>
            <dl>
              <div><dt>Identity provider</dt><dd>MFA, passkeys, device posture, and role claims</dd></div>
              <div><dt>Communications</dt><dd>Email, SMS, phone, callbacks, consent, and suppression</dd></div>
              <div><dt>Storage</dt><dd>Encrypted object storage, signed URLs, and retention metadata</dd></div>
              <div><dt>Scanning</dt><dd>Upload validation, malware results, quarantine, and release</dd></div>
              <div><dt>Payments</dt><dd>Billing, payables, tax onboarding, and ledger corrections</dd></div>
            </dl>
            <CommandStatusPanel
              receipt={latestCommandReceipt}
              title="Provider integrations"
            />
            <div className="decision-actions">
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="verify-provider-integration" />
                <input name="targetId" type="hidden" value="INT-2607-0001" />
                <button type="submit">Verify Provider Integration</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="mark-integration-degraded" />
                <input name="targetId" type="hidden" value="INT-2607-0003" />
                <button type="submit">Mark Integration Degraded</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="open-provider-callback-review" />
                <input name="targetId" type="hidden" value="INT-2607-0002" />
                <button type="submit">Open Callback Review</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="escalate-provider-risk" />
                <input name="targetId" type="hidden" value="INT-2607-0004" />
                <button type="submit">Escalate Provider Risk</button>
              </form>
              <a href="/staff/deployment-readiness">Open Deployment Readiness</a>
            </div>
            <p className="decision-lock-note">
              Production provider integrations require secrets management,
              environment separation, least-privilege data scopes, monitoring,
              callback replay, and retained operational receipts.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
