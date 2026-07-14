import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { requireChatGPTUser } from "../../../chatgpt-auth";
import { listPersistedCommandCenterReceipts } from "../store";

type ActivityArea = "Communications" | "Credentials" | "Financial" | "Audit";

function areaForHref(href: string): ActivityArea {
  if (href === "/notifications") return "Communications";
  if (href === "/credentials/expiration") return "Credentials";
  if (href === "/staff/financial-reports") return "Financial";
  return "Audit";
}

export default async function CommandCenterActivityPage() {
  await requireChatGPTUser("/staff/command-center/activity");

  const requestHeaders = await headers();
  const staffRole = requestHeaders.get("x-notarix-staff-role");
  if (staffRole !== "Admin" && staffRole !== "SuperAdmin") notFound();

  const receipts = await listPersistedCommandCenterReceipts();
  const completedCount = receipts.filter(
    (receipt) => receipt.outcome === "Completed",
  ).length;
  const blockedCount = receipts.filter(
    (receipt) => receipt.outcome === "Blocked",
  ).length;
  const superAdminCount = receipts.filter(
    (receipt) => receipt.authority === "Super Admin",
  ).length;
  const latestReceipt = receipts.at(-1);

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Command center activity navigation">
          <a href="/">Home</a>
          <a href="/staff">Staff Home</a>
          <a href="/notifications">Communications</a>
          <a href="/staff/financial-reports">Financial Reports</a>
          <a href="/staff/audit-reports">Audit Reports</a>
          <a className="nav-cta" href="/staff/command-center/activity">
            Command Activity
          </a>
          <a href="/signout-with-chatgpt?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Command Center Activity · Restricted Access</p>
          <h1>Command Center Activity Log</h1>
          <p>
            Review completed and blocked operational commands across
            communications, credential renewal, payment ledger, and restricted
            audit workflows with actor, role, authority, target, receipt, and
            status-transition attribution.
          </p>
        </div>
        <aside>
          <p>Activity register</p>
          <strong>{receipts.length} receipts retained</strong>
          <span>Blocked attempts remain visible for audit review.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Command activity summary">
        {[
          ["Completed commands", String(completedCount), "Accepted command-center actions with retained receipts."],
          ["Blocked attempts", String(blockedCount), "Denied actions retained with blocked reason and authority."],
          ["Super Admin controls", String(superAdminCount), "Commands requiring restricted executive authority."],
          ["Persistence posture", "D1 ready", "Targets, events, and receipts map to permanent schema tables."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Command activity workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Access level</p>
              <h2>{staffRole}</h2>
              <span>
                Command activity is restricted to Administrator and Super Admin
                review.
              </span>
            </section>
            <p className="request-label">Activity index</p>
            <nav>
              {[
                ["All command receipts", "#command-activity-matrix"],
                ["Blocked attempts", "#command-activity-matrix"],
                ["Communications", "/notifications"],
                ["Credential renewal", "/credentials/expiration"],
                ["Financial reports", "/staff/financial-reports"],
                ["Audit reports", "/staff/audit-reports"],
              ].map(([label, href]) => (
                <a href={href} key={label}>
                  <span>{label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main" id="command-activity-matrix">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Command receipt register</p>
                <h2>Operational command activity matrix</h2>
              </div>
              <strong>{receipts.length} records</strong>
            </header>

            {receipts.length > 0 ? (
              <div className="verification-table-wrap">
                <table className="verification-table">
                  <caption>Command-center activity records</caption>
                  <thead>
                    <tr>
                      <th scope="col">Receipt</th>
                      <th scope="col">Command</th>
                      <th scope="col">Target</th>
                      <th scope="col">Outcome</th>
                      <th scope="col">Actor</th>
                      <th scope="col">Authority</th>
                      <th scope="col">Next action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.map((receipt) => (
                      <tr key={receipt.id}>
                        <td>
                          <a href={`/staff/command-center/receipt/${receipt.id}`}>
                            {receipt.id}
                          </a>
                          <span className="evidence-packet-summary">
                            {receipt.timestamp}
                          </span>
                        </td>
                        <td>
                          <span>{areaForHref(receipt.consoleHref)}</span>
                          <strong>{receipt.action}</strong>
                          <span className="evidence-packet-summary">
                            {receipt.auditEvent}
                          </span>
                        </td>
                        <td>
                          {receipt.targetId}
                          <span className="evidence-packet-summary">
                            {receipt.targetType}
                          </span>
                        </td>
                        <td>
                          <mark>{receipt.outcome}</mark>
                          <span className="evidence-packet-summary">
                            {receipt.previousStatus} to {receipt.nextStatus}
                          </span>
                        </td>
                        <td>
                          {receipt.actor}
                          <span className="evidence-packet-summary">
                            {receipt.role}
                          </span>
                        </td>
                        <td>
                          {receipt.authority}
                          <span className="evidence-packet-summary">
                            {receipt.blockedReason ?? "Authority accepted"}
                          </span>
                        </td>
                        <td>{receipt.nextRequiredAction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <section className="review-panel">
                <p className="request-label">No command activity yet</p>
                <h2>Awaiting first retained receipt</h2>
                <p>
                  Command actions from communications, credential renewal,
                  financial reporting, and audit reporting will appear here
                  after staff submit a command-center action. This is a real
                  empty state, not a temporary placeholder.
                </p>
              </section>
            )}
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Activity controls</p>
            <h2>Audit visibility</h2>
            <p className="activation-summary">
              The command activity log shows whether restricted actions were
              completed or blocked and keeps the reason, target, role, and
              receipt connected for later review.
            </p>
            <dl>
              <div><dt>Latest receipt</dt><dd>{latestReceipt?.id ?? "None recorded"}</dd></div>
              <div><dt>Latest outcome</dt><dd>{latestReceipt?.outcome ?? "Awaiting command action"}</dd></div>
              <div><dt>Blocked attempts</dt><dd>{blockedCount}</dd></div>
              <div><dt>Receipt storage</dt><dd>Command event and receipt tables</dd></div>
              <div><dt>Review level</dt><dd>Administrator or Super Admin</dd></div>
            </dl>
            <div className="decision-actions">
              <a href="/notifications">Open Communications</a>
              <a href="/credentials/expiration">Open Credential Monitor</a>
              <a href="/staff/financial-reports">Open Financial Reports</a>
              <a href="/staff/audit-reports">Open Audit Reports</a>
            </div>
            <p className="decision-lock-note">
              Production command activity should be retained in append-only
              audit storage with immutable timestamps, staff identity, target
              record, and authority result.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
