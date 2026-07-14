import { credentialMonitorRecords, notaryAssignmentRecords } from "../../operations-data";
import { CommandStatusPanel } from "../../staff/command-center/CommandStatusPanel";
import { getLatestCommandCenterReceiptForHref } from "../../staff/command-center/store";

const bernadetteCredentials = credentialMonitorRecords.filter(
  (credential) => credential.owner === "Bernadette W Hudlin",
);

export default function NotaryAssignmentConsolePage() {
  const latestOrderReceipt = getLatestCommandCenterReceiptForHref("/staff/orders");
  const restrictedCredentials = bernadetteCredentials.filter(
    (credential) =>
      credential.status.toLowerCase().includes("restricted") ||
      credential.status.toLowerCase().includes("renewal"),
  ).length;

  return (
    <main className="staff-page order-workspace-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Notary Portal</span>
        </a>
        <nav aria-label="Notary assignment navigation">
          <a href="/">Home</a>
          <a href="/notary">Notary Home</a>
          <a href="/notary/dashboard">Dashboard</a>
          <a className="nav-cta" href="/notary/assignments">Assignments</a>
          <a href="/credentials/expiration">Credentials</a>
          <a href="/notifications">Notifications</a>
          <a href="/support">Support</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Notary Assignments · Eligibility Controlled</p>
          <h1>Notary Assignment Console</h1>
          <p>
            Review assigned orders, appointment details, document availability,
            credential posture, payable restrictions, and completion controls
            before accepting or completing notarial work.
          </p>
        </div>
        <aside>
          <p>Approved notary</p>
          <strong>NSN-NC-2607-0001</strong>
          <span>Bernadette W Hudlin</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Notary assignment summary">
        {[
          ["Assigned orders", String(notaryAssignmentRecords.length), "Orders currently routed to the approved notary profile."],
          ["Credential controls", String(restrictedCredentials), "Renewal or restricted controls that can affect eligibility."],
          ["RON eligibility", "Restricted", "Remote online services remain locked until authorization and certificate evidence are verified."],
          ["Payable posture", "Restricted", "W-9 and payable activation require elevated approval before release."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Notary assignment workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Assignment file</p>
              <h2>Bernadette W Hudlin</h2>
              <span>
                Assignment visibility is tied to approved profile status,
                credential posture, jurisdiction, service type, and payable
                controls.
              </span>
            </section>
            <p className="request-label">Assignment index</p>
            <nav>
              {notaryAssignmentRecords.map((order) => (
                <a href={`#${order.id.toLowerCase()}`} key={order.id}>
                  <span>{order.id}</span>
                  <small>{order.assignmentStatus}</small>
                </a>
              ))}
              <a href="/credentials/expiration"><span>Credential Renewal</span></a>
              <a href="/notifications"><span>Assignment Notices</span></a>
            </nav>
          </aside>

          <article className="console-main">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Assigned work register</p>
                <h2>Assignment readiness matrix</h2>
              </div>
              <strong>{notaryAssignmentRecords.length} assignments</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Notary assignment console</caption>
                <thead>
                  <tr>
                    <th scope="col">Assignment</th>
                    <th scope="col">Client / service</th>
                    <th scope="col">Appointment</th>
                    <th scope="col">Documents</th>
                    <th scope="col">Eligibility</th>
                    <th scope="col">Notary next action</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {notaryAssignmentRecords.map((order) => (
                    <tr id={order.id.toLowerCase()} key={order.id}>
                      <td>
                        <span>{order.id}</span>
                        <strong>{order.assignmentStatus}</strong>
                        <span className="evidence-packet-summary">
                          {order.orderStatus}
                        </span>
                      </td>
                      <td>
                        {order.client}
                        <span className="evidence-packet-summary">
                          {order.service} · {order.jurisdiction}
                        </span>
                      </td>
                      <td>
                        {order.appointment}
                        <span className="evidence-packet-summary">{order.location}</span>
                      </td>
                      <td>
                        <mark>{order.documentStatus}</mark>
                        <span className="evidence-packet-summary">
                          {order.documentCount} · {order.validationStatus}
                        </span>
                      </td>
                      <td>
                        {order.ronStatus}
                        <span className="evidence-packet-summary">
                          {order.payableStatus}
                        </span>
                      </td>
                      <td>
                        Review and confirm
                        <span className="evidence-packet-summary">
                          Accept only after document availability, appointment
                          details, and credential posture are clear.
                        </span>
                      </td>
                      <td>
                        <a className="table-action-link" href={`/orders/${order.id}`}>
                          Open
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Assignment control center</p>
            <h2>Eligibility locks</h2>
            <p className="activation-summary">
              Notary assignments remain connected to credential expiration,
              E&O coverage, RON authority, document release, and payable
              restrictions. Restricted services stay locked until verified.
            </p>
            <dl>
              <div><dt>Commission</dt><dd>Active until Dec 31 2026; renewal reminders scheduled</dd></div>
              <div><dt>E&amp;O insurance</dt><dd>Renewal due before coverage expiration</dd></div>
              <div><dt>RON services</dt><dd>Restricted unless authorization and digital certificate are verified</dd></div>
              <div><dt>Documents</dt><dd>Released only after validation and access classification</dd></div>
              <div><dt>Payables</dt><dd>W-9 and payable controls require elevated approval</dd></div>
            </dl>
            <CommandStatusPanel
              receipt={latestOrderReceipt}
              showStaffLinks={false}
              title="Notary assignment"
            />
            <div className="decision-actions">
              <form action="/notary/assignment-actions" method="post">
                <input name="action" type="hidden" value="notary-accept-assignment" />
                <input name="targetId" type="hidden" value="ORD-2607-0001" />
                <button type="submit">Accept Assignment</button>
              </form>
              <form action="/notary/assignment-actions" method="post">
                <input name="action" type="hidden" value="notary-decline-assignment" />
                <input name="targetId" type="hidden" value="ORD-2607-0001" />
                <button type="submit">Decline Assignment</button>
              </form>
              <form action="/notary/assignment-actions" method="post">
                <input name="action" type="hidden" value="notary-confirm-arrival" />
                <input name="targetId" type="hidden" value="ORD-2607-0001" />
                <button type="submit">Confirm Arrival</button>
              </form>
              <form action="/notary/assignment-actions" method="post">
                <input name="action" type="hidden" value="notary-upload-completion-package" />
                <input name="targetId" type="hidden" value="ORD-2607-0001" />
                <button type="submit">Upload Completion Package</button>
              </form>
              <a href="/credentials/expiration">Review Credentials</a>
              <a href="/notifications">Review Notices</a>
              <a href="/support">Contact Support</a>
            </div>
            <p className="decision-lock-note">
              Production assignment acceptance should require current
              credentials, location and service eligibility, document release,
              and a retained acceptance receipt.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
