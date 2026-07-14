import type { StoredCommandReceipt } from "./store";

type CommandStatusPanelProps = {
  receipt: StoredCommandReceipt | undefined;
  title: string;
};

export function CommandStatusPanel({
  receipt,
  title,
}: CommandStatusPanelProps) {
  return (
    <section className="review-panel" aria-label={`${title} latest command result`}>
      <p className="request-label">Latest command result</p>
      <h2>{receipt ? `${receipt.outcome} · ${receipt.id}` : "No command submitted"}</h2>
      {receipt ? (
        <>
          <p>
            {receipt.action} updated {receipt.targetId} from{" "}
            <strong>{receipt.previousStatus}</strong> to{" "}
            <strong>{receipt.nextStatus}</strong>.
          </p>
          <dl>
            <div><dt>Actor</dt><dd>{receipt.actor}</dd></div>
            <div><dt>Role</dt><dd>{receipt.role}</dd></div>
            <div><dt>Authority</dt><dd>{receipt.authority}</dd></div>
            <div><dt>Timestamp</dt><dd>{receipt.timestamp}</dd></div>
          </dl>
          {receipt.blockedReason ? (
            <p><strong>Blocked reason:</strong> {receipt.blockedReason}</p>
          ) : null}
          <div className="decision-actions">
            <a href={`/staff/command-center/receipt/${receipt.id}`}>Open Receipt</a>
            <a href="/staff/command-center/activity">View Activity Log</a>
          </div>
        </>
      ) : (
        <>
          <p>
            Submit a command-center action from this page to create a retained
            receipt and show the result here.
          </p>
          <div className="decision-actions">
            <a href="/staff/command-center/activity">View Activity Log</a>
          </div>
        </>
      )}
    </section>
  );
}
