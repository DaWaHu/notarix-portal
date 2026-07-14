import { requireChatGPTUser } from "../../chatgpt-auth";
import { orderLifecycleIntakeRecords } from "../../operations-data";
import { CommandStatusPanel } from "../command-center/CommandStatusPanel";
import { getLatestCommandCenterReceiptForHref } from "../command-center/store";

export default async function OrderLifecycleIntakePage() {
  await requireChatGPTUser("/staff/order-intake");
  const latestOrderReceipt = getLatestCommandCenterReceiptForHref("/staff/orders");
  const validationRequired = orderLifecycleIntakeRecords.filter((record) =>
    record.status.toLowerCase().includes("validation"),
  ).length;
  const notaryPortalItems = orderLifecycleIntakeRecords.filter(
    (record) => record.source === "Notary portal",
  ).length;
  const lockedItems = orderLifecycleIntakeRecords.filter((record) =>
    record.status.toLowerCase().includes("locked"),
  ).length;

  return (
    <main className="staff-page order-workspace-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Order lifecycle intake navigation">
          <a href="/">Home</a>
          <a href="/staff">Staff Home</a>
          <a href="/staff/orders">Orders</a>
          <a href="/staff/appointments">Appointments</a>
          <a href="/staff/order-closeout">Order Closeout</a>
          <a href="/staff/document-validation">Document Validation</a>
          <a href="/staff/financial-reports">Financial Reports</a>
          <a className="nav-cta" href="/staff/order-intake">Order Intake</a>
          <a href="/signout-with-chatgpt?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Order Lifecycle Intake · Staff Review Queue</p>
          <h1>Order Lifecycle Intake Queue</h1>
          <p>
            Review client document submissions, replacement document responses,
            notary assignment decisions, arrival confirmations, completion
            packages, and closeout handoffs before order release or financial
            activity proceeds.
          </p>
        </div>
        <aside>
          <p>Lifecycle intake</p>
          <strong>{orderLifecycleIntakeRecords.length} active intake items</strong>
          <span>{validationRequired} item requires document validation.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Order lifecycle intake summary">
        {[
          ["Client submissions", String(orderLifecycleIntakeRecords.length - notaryPortalItems), "Document uploads and correction responses from client portal users."],
          ["Notary submissions", String(notaryPortalItems), "Assignment decisions, arrival confirmations, and completion packages."],
          ["Validation required", String(validationRequired), "Items that must pass validation before release."],
          ["Locked controls", String(lockedItems), "Completion or closeout items unavailable until prior lifecycle controls clear."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Order lifecycle intake workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Intake file</p>
              <h2>Lifecycle submissions</h2>
              <span>
                Intake items connect client and notary portal activity to staff
                validation, release, financial, and closeout controls.
              </span>
            </section>
            <p className="request-label">Queue index</p>
            <nav>
              {[
                "Client document upload",
                "Replacement response",
                "Assignment acceptance",
                "Arrival confirmation",
                "Completion package",
                "Closeout handoff",
              ].map((label) => (
                <a href="#order-lifecycle-intake-matrix" key={label}>
                  <span>{label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main" id="order-lifecycle-intake-matrix">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Lifecycle intake register</p>
                <h2>Portal submission and staff routing matrix</h2>
              </div>
              <strong>{orderLifecycleIntakeRecords.length} items</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Order lifecycle intake queue</caption>
                <thead>
                  <tr>
                    <th scope="col">Intake item</th>
                    <th scope="col">Order / source</th>
                    <th scope="col">Submitted by</th>
                    <th scope="col">Status</th>
                    <th scope="col">Evidence / authority</th>
                    <th scope="col">Owner / next action</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orderLifecycleIntakeRecords.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <span>{record.id}</span>
                        <strong>{record.intakeType}</strong>
                        <span className="evidence-packet-summary">{record.submittedAt}</span>
                      </td>
                      <td>
                        {record.orderId}
                        <span className="evidence-packet-summary">{record.source}</span>
                      </td>
                      <td>{record.submittedBy}</td>
                      <td><mark>{record.status}</mark></td>
                      <td>
                        {record.linkedEvidence}
                        <span className="evidence-packet-summary">{record.authority}</span>
                      </td>
                      <td>
                        {record.staffOwner}
                        <span className="evidence-packet-summary">{record.nextAction}</span>
                      </td>
                      <td>
                        <a className="table-action-link" href={`/orders/${record.orderId}`}>
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
            <p className="request-label">Intake command center</p>
            <h2>Staff routing controls</h2>
            <p className="activation-summary">
              Portal submissions remain intake events until staff validates
              document custody, access classification, assignment posture,
              completion package status, and financial release controls.
            </p>
            <dl>
              <div><dt>Client uploads</dt><dd>Route to evidence intake and malware validation</dd></div>
              <div><dt>Notary actions</dt><dd>Confirm assignment, arrival, and completion package status</dd></div>
              <div><dt>Release</dt><dd>Validated documents may be released only after staff review</dd></div>
              <div><dt>Financials</dt><dd>Invoice and payable activity remain restricted until closeout</dd></div>
              <div><dt>Audit</dt><dd>Role action receipts remain retained with the order file</dd></div>
            </dl>
            <CommandStatusPanel receipt={latestOrderReceipt} title="Order lifecycle intake" />
            <div className="decision-actions">
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="release-order-documents" />
                <input name="targetId" type="hidden" value="ORD-2607-0001" />
                <button type="submit">Release Validated Documents</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="confirm-notary-acceptance" />
                <input name="targetId" type="hidden" value="ORD-2607-0001" />
                <button type="submit">Confirm Notary Acceptance</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="record-completion-package" />
                <input name="targetId" type="hidden" value="ORD-2607-0001" />
                <button type="submit">Record Completion Package</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="route-order-financial-review" />
                <input name="targetId" type="hidden" value="ORD-2607-0001" />
                <button type="submit">Route Financial Review</button>
              </form>
              <a href="/staff/appointments">Open Appointments</a>
              <a href="/staff/order-closeout">Open Closeout Console</a>
              <a href="/staff/document-validation">Open Validation Queue</a>
              <a href="/staff/financial-reports">Open Financial Reports</a>
            </div>
            <p className="decision-lock-note">
              Production intake should bind role-submitted files to encrypted
              storage, malware scanning, signed access URLs, immutable receipts,
              and order closeout audit records.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
