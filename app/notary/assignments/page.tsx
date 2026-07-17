import { credentialMonitorRecords } from "../../operations-data";
import { listNotaryAssignments } from "../../order-repository";
import { CommandStatusPanel } from "../../staff/command-center/CommandStatusPanel";
import { getLatestCommandCenterReceiptForHref } from "../../staff/command-center/store";

const bernadetteCredentials = credentialMonitorRecords.filter(
  (credential) => credential.owner === "Bernadette W Hudlin",
);

export default async function NotaryAssignmentConsolePage() {
  const latestOrderReceipt = getLatestCommandCenterReceiptForHref("/staff/orders");
  const assignments = await listNotaryAssignments();
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
          <a href="/notary/assignments/ORD-2607-0001/completion">Completion Package</a>
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
          ["Assigned orders", String(assignments.length), "Orders currently routed to the approved notary profile."],
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
              {assignments.map((order) => (
                <a href={`#${order.id.toLowerCase()}`} key={order.id}>
                  <span>{order.id}</span>
                  <small>{order.assignmentStatus}</small>
                </a>
              ))}
              <a href="/credentials/expiration"><span>Credential Renewal</span></a>
              <a href="/notary/assignments/ORD-2607-0001/completion"><span>Completion Package</span></a>
              <a href="/notifications"><span>Assignment Notices</span></a>
            </nav>
          </aside>

          <article className="console-main">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Assigned work register</p>
                <h2>Assignment readiness matrix</h2>
              </div>
              <strong>{assignments.length} assignments</strong>
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
                  {assignments.map((order) => (
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
                        <span className="evidence-packet-summary">
                          <a href={`/notary/assignments/${order.id}/completion`}>Completion Package</a>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <section className="record-grid" aria-label="Mobile offer response process">
              <article>
                <p className="request-label">Before acceptance</p>
                <h3>Mobile assignment offer</h3>
                <dl>
                  <div><dt>Client company</dt><dd>Coleman Title Group</dd></div>
                  <div><dt>Date and time</dt><dd>Jul 17 2026 at 4:00 PM ET</dd></div>
                  <div><dt>Area</dt><dd>Elizabethtown, NC 28337</dd></div>
                  <div><dt>Signing type</dt><dd>Debt settlement with scanbacks</dd></div>
                  <div><dt>Page count</dt><dd>Approximately 200 pages</dd></div>
                  <div><dt>Scanbacks</dt><dd>Required; return ASAP by 10:00 PM ET</dd></div>
                  <div><dt>Fee</dt><dd>$100</dd></div>
                  <div><dt>Required credentials</dt><dd>Active commission, E&amp;O, background, W-9, and client-specific instructions acknowledged</dd></div>
                </dl>
                <div className="decision-actions">
                  <form action="/notary/assignment-actions" method="post">
                    <input name="action" type="hidden" value="notary-accept-assignment" />
                    <input name="targetId" type="hidden" value="ORD-2607-0001" />
                    <button type="submit">I'm Interested</button>
                  </form>
                  <form action="/notary/assignment-actions" method="post">
                    <input name="action" type="hidden" value="notary-decline-assignment" />
                    <input name="targetId" type="hidden" value="ORD-2607-0001" />
                    <button type="submit">Not Available</button>
                  </form>
                </div>
              </article>
              <article>
                <p className="request-label">Not available reasons</p>
                <h3>Structured response options</h3>
                <ul className="security-list">
                  <li>I am not available at that time.</li>
                  <li>Location is too far away.</li>
                  <li>Fee is too low.</li>
                  <li>I no longer do mobile signings.</li>
                  <li>I do not want to work with this client.</li>
                  <li>Other.</li>
                </ul>
                <dl>
                  <div><dt>Fee adjustment</dt><dd>Fee I can accept: $____</dd></div>
                  <div><dt>Staff treatment</dt><dd>Creates an assignment exception for review, not a confirmed assignment.</dd></div>
                </dl>
              </article>
              <article>
                <p className="request-label">After assignment confirmation</p>
                <h3>Expanded order access</h3>
                <ul className="security-list">
                  <li>Full signing address.</li>
                  <li>Borrower or signer details as permitted.</li>
                  <li>Secure document download link.</li>
                  <li>Order instructions.</li>
                  <li>Upload scanbacks.</li>
                  <li>Mark appointment complete.</li>
                </ul>
                <p>
                  Full document access remains controlled by order status,
                  document validation, credential eligibility, assignment
                  status, and audit logging.
                </p>
              </article>
            </section>
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
                <button type="submit">I'm Interested</button>
              </form>
              <form action="/notary/assignment-actions" method="post">
                <input name="action" type="hidden" value="notary-decline-assignment" />
                <input name="targetId" type="hidden" value="ORD-2607-0001" />
                <button type="submit">Not Available</button>
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
              <a href="/notary/assignments/ORD-2607-0001/completion">Open Completion Package</a>
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
