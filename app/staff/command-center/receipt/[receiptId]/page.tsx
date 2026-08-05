import { notFound } from "next/navigation";
import { requireStaffRouteAccess } from "../../../../access-policy";
import { getPersistedCommandCenterReceipt } from "../../store";

type CommandReceiptPageProps = {
  params: Promise<{
    receiptId: string;
  }>;
};

export default async function CommandCenterReceiptPage({
  params,
}: CommandReceiptPageProps) {
  const { receiptId } = await params;
  await requireStaffRouteAccess(`/staff/command-center/receipt/${receiptId}`, ["GenAdmin", "Admin", "SuperAdmin"]);

  const receipt = await getPersistedCommandCenterReceipt(receiptId);
  if (!receipt) notFound();

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Command receipt navigation">
          <a href="/">Home</a>
          <a href="/staff">Staff Home</a>
          <a href={receipt.consoleHref}>Return To Console</a>
          <a className="nav-cta" href={`/staff/command-center/receipt/${receipt.id}`}>
            Command Receipt
          </a>
          <a href="/auth/logout?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Command Center Receipt · {receipt.outcome}</p>
          <h1>Operational Action Receipt</h1>
          <p>
            This receipt records the command-center result, target record,
            authority, status transition, staff actor, timestamp, and next
            required action for audit-aware review.
          </p>
        </div>
        <aside>
          <p>Receipt</p>
          <strong>{receipt.id}</strong>
          <span>{receipt.targetType} · {receipt.targetId}</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Command receipt summary">
        {[
          ["Outcome", receipt.outcome, receipt.allowed ? "The action was accepted and persisted." : "The action was blocked by workflow controls."],
          ["Previous status", receipt.previousStatus, "State recorded before this command was evaluated."],
          ["New status", receipt.nextStatus, "State recorded after this command was evaluated."],
          ["Authority", receipt.authority, "Minimum authority required for this command action."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Command receipt workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Command result</p>
              <h2>{receipt.outcome}</h2>
              <span>
                {receipt.allowed
                  ? "The action created a stored command event."
                  : "The action was recorded as a blocked command attempt."}
              </span>
            </section>
            <p className="request-label">Receipt index</p>
            <nav>
              {[
                ["Return To Console", receipt.consoleHref],
                ["Command Activity", "/staff/command-center/activity"],
                ["Staff Home", "/staff"],
                ["Communications", "/notifications"],
                ["Credential Monitor", "/credentials/expiration"],
                ["Financial Reports", "/staff/financial-reports"],
              ].map(([label, href]) => (
                <a href={href} key={label}>
                  <span>{label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Command audit record</p>
                <h2>Status transition receipt</h2>
              </div>
              <strong>{receipt.id}</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Command-center receipt details</caption>
                <thead>
                  <tr>
                    <th scope="col">Action</th>
                    <th scope="col">Target</th>
                    <th scope="col">Actor</th>
                    <th scope="col">Role</th>
                    <th scope="col">Timestamp</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span>Command</span>
                      <strong>{receipt.action}</strong>
                      <span className="evidence-packet-summary">
                        {receipt.outcome}
                      </span>
                    </td>
                    <td>
                      {receipt.targetId}
                      <span className="evidence-packet-summary">
                        {receipt.targetType}
                      </span>
                    </td>
                    <td>{receipt.actor}</td>
                    <td>{receipt.role}</td>
                    <td>{receipt.timestamp}</td>
                    <td>
                      <mark>{receipt.nextStatus}</mark>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <section className="review-panel">
              <p className="request-label">Audit event</p>
              <h2>{receipt.allowed ? "Persisted command event" : "Blocked command attempt"}</h2>
              <p>{receipt.auditEvent}</p>
              {receipt.blockedReason ? (
                <p><strong>Blocked reason:</strong> {receipt.blockedReason}</p>
              ) : null}
            </section>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Next action</p>
            <h2>Operational follow-through</h2>
            <p className="activation-summary">{receipt.nextRequiredAction}</p>
            <dl>
              <div><dt>Receipt ID</dt><dd>{receipt.id}</dd></div>
              <div><dt>Target record</dt><dd>{receipt.targetId}</dd></div>
              <div><dt>Actor</dt><dd>{receipt.actor}</dd></div>
              <div><dt>Role</dt><dd>{receipt.role}</dd></div>
              <div><dt>Timestamp</dt><dd>{receipt.timestamp}</dd></div>
            </dl>
            <div className="decision-actions">
              <a href={receipt.consoleHref}>Return To Console</a>
              <a href="/staff/command-center/activity">View Command Log</a>
              <a href="/staff">Open Staff Home</a>
            </div>
            <p className="decision-lock-note">
              Production command receipts should be immutable and retained with
              the workflow, delivery, credential, ledger, or audit record that
              triggered the command.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
