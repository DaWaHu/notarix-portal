import { requireChatGPTUser } from "../../chatgpt-auth";
import { listAppointmentConfirmations } from "../../order-repository";
import { CommandStatusPanel } from "../command-center/CommandStatusPanel";
import { getLatestCommandCenterReceiptForHref } from "../command-center/store";

export default async function AppointmentSchedulingConfirmationPage() {
  await requireChatGPTUser("/staff/appointments");
  const latestOrderReceipt = getLatestCommandCenterReceiptForHref("/staff/orders");
  const appointments = listAppointmentConfirmations();
  const confirmationReady = appointments.filter((record) =>
    record.status.toLowerCase().includes("ready"),
  ).length;
  const pendingConfirmation = appointments.filter((record) =>
    record.status.toLowerCase().includes("pending"),
  ).length;
  const assignmentHolds = appointments.filter((record) =>
    record.status.toLowerCase().includes("hold"),
  ).length;
  const noticeIssues = appointments.filter((record) =>
    record.notificationStatus.toLowerCase().includes("failed") ||
    record.notificationStatus.toLowerCase().includes("correction"),
  ).length;

  return (
    <main className="staff-page order-workspace-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Appointment scheduling navigation">
          <a href="/">Home</a>
          <a href="/staff">Staff Home</a>
          <a href="/staff/orders">Orders</a>
          <a href="/staff/order-intake">Order Intake</a>
          <a href="/staff/signers">Signer Readiness</a>
          <a className="nav-cta" href="/staff/appointments">Appointments</a>
          <a href="/staff/order-closeout">Order Closeout</a>
          <a href="/notifications">Communications</a>
          <a href="/signout-with-chatgpt?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Appointment Operations · Staff Confirmation</p>
          <h1>Appointment Scheduling And Confirmation Center</h1>
          <p>
            Confirm the appointment record only after client readiness, notary
            assignment, signer location, document availability, and delivery
            notices are aligned with the order file.
          </p>
        </div>
        <aside>
          <p>Confirmation queue</p>
          <strong>{appointments.length} appointments</strong>
          <span>{pendingConfirmation + assignmentHolds} appointment controls require review.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Appointment confirmation summary">
        {[
          ["Ready to confirm", String(confirmationReady), "Appointments where staff may confirm after final review."],
          ["Pending confirmation", String(pendingConfirmation), "Appointments requiring client, notary, location, or document checks."],
          ["Assignment holds", String(assignmentHolds), "Appointments blocked until assignment and eligibility controls clear."],
          ["Notice issues", String(noticeIssues), "Failed notices or correction workflows that must be resolved."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Appointment confirmation workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Appointment file</p>
              <h2>Confirmation queue</h2>
              <span>
                Appointment confirmation protects the order from proceeding
                before client, signer, notary, document, and notice controls are
                synchronized.
              </span>
            </section>
            <p className="request-label">Appointment index</p>
            <nav>
              {appointments.map((record) => (
                <a href={`#${record.id.toLowerCase()}`} key={record.id}>
                  <span>{record.orderId}</span>
                  <small>{record.status}</small>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Appointment register</p>
                <h2>Appointment readiness and confirmation matrix</h2>
              </div>
              <strong>{appointments.length} appointment records</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Appointment scheduling and confirmation matrix</caption>
                <thead>
                  <tr>
                    <th scope="col">Appointment</th>
                    <th scope="col">Client / notary</th>
                    <th scope="col">Location / service</th>
                    <th scope="col">Readiness</th>
                    <th scope="col">Notifications</th>
                    <th scope="col">Owner / authority</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((record) => (
                    <tr id={record.id.toLowerCase()} key={record.id}>
                      <td>
                        <span>{record.id} · {record.orderId}</span>
                        <strong>{record.appointment}</strong>
                        <span className="evidence-packet-summary">{record.status}</span>
                      </td>
                      <td>
                        {record.client}
                        <span className="evidence-packet-summary">{record.notary}</span>
                      </td>
                      <td>
                        {record.location}
                        <span className="evidence-packet-summary">{record.serviceType}</span>
                      </td>
                      <td>
                        {record.signerReadiness}
                        <span className="evidence-packet-summary">{record.documentReadiness}</span>
                      </td>
                      <td><mark>{record.notificationStatus}</mark></td>
                      <td>
                        {record.staffOwner}
                        <span className="evidence-packet-summary">{record.authority}</span>
                      </td>
                      <td>
                        <a className="table-action-link" href={`/orders/${record.orderId}`}>
                          Review
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Appointment command center</p>
            <h2>Confirmation controls</h2>
            <p className="activation-summary">
              Staff confirmation creates an order receipt and should be recorded
              only after assignment, signer, location, document, and
              communication posture are reviewed.
            </p>
            <dl>
              <div><dt>Client readiness</dt><dd>Authorized client and signer details confirmed</dd></div>
              <div><dt>Notary readiness</dt><dd>Acceptance, credentials, and availability reviewed</dd></div>
              <div><dt>Documents</dt><dd>Validation and release posture reviewed before signing</dd></div>
              <div><dt>Notifications</dt><dd>Client and notary notices delivery-logged</dd></div>
              <div><dt>Escalation</dt><dd>Failed notices or assignment gaps routed before confirmation</dd></div>
            </dl>
            <CommandStatusPanel receipt={latestOrderReceipt} title="Appointment confirmation" />
            <div className="decision-actions">
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="confirm-order-appointment" />
                <input name="targetId" type="hidden" value="ORD-2607-0001" />
                <button type="submit">Confirm Appointment</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="retry-failed-notification" />
                <input name="targetId" type="hidden" value="NTF-2607-0005" />
                <button type="submit">Retry Client Notice</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="request-missing-documents" />
                <input name="targetId" type="hidden" value="ORD-2607-0002" />
                <button type="submit">Request Missing Documents</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="escalate-order-issue" />
                <input name="targetId" type="hidden" value="ORD-2607-0002" />
                <button type="submit">Escalate Appointment Issue</button>
              </form>
              <a href="/staff/signers">Open Signer Readiness</a>
              <a href="/staff/orders">Open Order Operations</a>
              <a href="/notifications">Open Communications</a>
              <a href="/notary/assignments">Open Notary Assignments</a>
            </div>
            <p className="decision-lock-note">
              Production appointment confirmation should bind calendar delivery,
              client and notary notices, signer details, location readiness,
              document release posture, and retained command receipts.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
