import { requireChatGPTUser } from "../chatgpt-auth";
import { listNotificationDeliveryRecords } from "../notification-repository";
import { CommandStatusPanel } from "../staff/command-center/CommandStatusPanel";
import { getLatestCommandCenterReceiptForHref } from "../staff/command-center/store";

export default async function NotificationsPage() {
  await requireChatGPTUser("/notifications");
  const latestCommandReceipt = getLatestCommandCenterReceiptForHref("/notifications");
  const notificationRecords = await listNotificationDeliveryRecords();

  const failedCount = notificationRecords.filter(
    (notice) => notice.status === "Failed",
  ).length;
  const consentCount = notificationRecords.filter((notice) =>
    notice.consent.toLowerCase().includes("required"),
  ).length;

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Communications navigation">
          <a href="/">Home</a>
          <a href="/staff/requests">Staff Queue</a>
          <a href="/staff/elevated-approval">Elevated Approval</a>
          <a href="/staff/financial-controls">Financial Controls</a>
          <a href="/staff/financial-reports">Financial Reports</a>
          <a className="nav-cta" href="/notifications">Communications</a>
          <a href="/signout-with-chatgpt?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Communications Center · Delivery Control</p>
          <h1>Notification Delivery Log</h1>
          <p>
            Monitor profile invitations, correction notices, approval messages,
            phone consent, credential reminders, order notices, delivery failure,
            and staff-triggered communication records.
          </p>
        </div>
        <aside>
          <p>Communication hold</p>
          <strong>{failedCount + consentCount} controls need review</strong>
          <span>Phone and SMS notices require recorded consent before delivery.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Notification delivery summary">
        {[
          ["Delivery failures", String(failedCount), "Failed messages require retry or escalation."],
          ["Consent holds", String(consentCount), "Phone and SMS delivery require recorded consent."],
          ["Approval notices", "Controlled", "Profile approval notices are queued only after final approval."],
          ["Audit retention", "Enabled", "Delivery records remain tied to profile and order history."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Notification workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Delivery control</p>
              <h2>Logged notices</h2>
              <span>Email, phone message, SMS-ready, and internal staff alerts.</span>
            </section>
            <p className="request-label">Notice types</p>
            <nav>
              {[
                "Approvals",
                "Corrections",
                "Invitations",
                "Orders",
                "Credential Reminders",
                "Failed Delivery",
              ].map((label) => (
                <a href="#delivery-log" key={label}>
                  <span>{label}</span>
                </a>
              ))}
            </nav>
          </aside>
          <article className="console-main" id="delivery-log">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Delivery register</p>
                <h2>Email, phone, and staff alert controls</h2>
              </div>
              <strong>{notificationRecords.length} notices</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Notification register</caption>
                <thead>
                  <tr>
                    <th scope="col">Notice</th>
                    <th scope="col">Recipient</th>
                    <th scope="col">Status</th>
                    <th scope="col">Consent / trigger</th>
                    <th scope="col">Provider receipt</th>
                    <th scope="col">Owner / next action</th>
                    <th scope="col">Timestamp</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {notificationRecords.map((notice) => (
                    <tr key={notice.id}>
                      <td>
                        <span>{notice.channel}</span>
                        <strong>{notice.purpose}</strong>
                        <span className="evidence-packet-summary">
                          {notice.id} · {notice.relatedRecord}
                        </span>
                      </td>
                      <td>
                        {notice.recipientName}
                        <span className="evidence-packet-summary">
                          {notice.recipient}
                        </span>
                      </td>
                      <td><mark>{notice.status}</mark></td>
                      <td>
                        {notice.consent}
                        <span className="evidence-packet-summary">
                          {notice.trigger}
                        </span>
                      </td>
                      <td>
                        {notice.providerStatus}
                        <span className="evidence-packet-summary">
                          {notice.providerMessageId} · {notice.callbackStatus}
                        </span>
                        <span className="evidence-packet-summary">
                          {notice.provider}
                        </span>
                      </td>
                      <td>
                        {notice.owner}
                        <span className="evidence-packet-summary">
                          {notice.nextAction}
                        </span>
                      </td>
                      <td>{notice.timestamp}</td>
                      <td>
                        <form action={`/notifications/${notice.id}/dispatch`} method="post">
                          <button type="submit">Dispatch</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
          <aside className="activation-control-center">
            <p className="request-label">Notification rules</p>
            <h2>Delivery command center</h2>
            <p className="activation-summary">
              Delivery actions should remain attributable, consent-aware, and
              tied to the triggering profile, order, credential, or staff workflow.
            </p>
            <dl>
              <div><dt>Email notice</dt><dd>Queued after final approval or correction request</dd></div>
              <div><dt>Phone / SMS</dt><dd>Recorded consent required before delivery</dd></div>
              <div><dt>Failed delivery</dt><dd>Retry, suppress, or escalate with audit note</dd></div>
              <div><dt>Audit log</dt><dd>Delivery record retained with source workflow</dd></div>
            </dl>
            <CommandStatusPanel
              receipt={latestCommandReceipt}
              title="Communications"
            />
            <div className="decision-actions">
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="retry-failed-notification" />
                <input name="targetId" type="hidden" value="NTF-2607-0005" />
                <button type="submit">Retry Failed Delivery</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="record-phone-consent" />
                <input name="targetId" type="hidden" value="NTF-2607-0002" />
                <button type="submit">Record Consent</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="suppress-notice" />
                <input name="targetId" type="hidden" value="NTF-2607-0005" />
                <button type="submit">Suppress Notice</button>
              </form>
            </div>
            <p className="decision-lock-note">
              Approval messages, correction notices, and phone messages should
              not be sent outside this delivery log once production providers
              are connected.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
