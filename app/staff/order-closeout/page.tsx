import { requireStaffRouteAccess } from "../../access-policy";
import {
  listOrderCloseoutControls,
  listOrderOperations,
} from "../../order-repository";
import { CommandStatusPanel } from "../command-center/CommandStatusPanel";
import { getLatestCommandCenterReceiptForHref } from "../command-center/store";

export default async function OrderCloseoutAndDeliveryConsolePage() {
  await requireStaffRouteAccess("/staff/order-closeout", ["Admin", "SuperAdmin"]);
  const latestOrderReceipt = getLatestCommandCenterReceiptForHref("/staff/orders");
  const orders = await listOrderOperations();
  const closeoutControls = await listOrderCloseoutControls();
  const pendingControls = closeoutControls.filter(
    (record) => !["complete", "released", "closed"].includes(record.status.toLowerCase()),
  ).length;
  const deliveryHolds = closeoutControls.filter((record) =>
    record.status.toLowerCase().includes("failed") ||
    record.status.toLowerCase().includes("pending"),
  ).length;
  const financialControls = closeoutControls.filter((record) =>
    record.control.toLowerCase().includes("invoice") ||
    record.control.toLowerCase().includes("payable"),
  ).length;
  const retentionLocks = closeoutControls.filter((record) =>
    record.control.toLowerCase().includes("retention") ||
    record.status.toLowerCase().includes("locked"),
  ).length;

  return (
    <main className="staff-page order-workspace-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Order closeout navigation">
          <a href="/">Home</a>
          <a href="/staff">Staff Home</a>
          <a href="/staff/orders">Orders</a>
          <a href="/staff/order-intake">Order Intake</a>
          <a href="/staff/appointments">Appointments</a>
          <a href="/staff/document-validation">Document Validation</a>
          <a href="/staff/financial-reports">Financial Reports</a>
          <a href="/notifications">Communications</a>
          <a className="nav-cta" href="/staff/order-closeout">Order Closeout</a>
          <a href="/auth/logout?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Order Closeout · Delivery And Release Control</p>
          <h1>Order Closeout And Delivery Console</h1>
          <p>
            Complete the final operating gate for order delivery, invoice
            release, notary payable routing, notification confirmation,
            retention policy, and final closeout authority.
          </p>
        </div>
        <aside>
          <p>Closeout posture</p>
          <strong>{pendingControls} controls open</strong>
          <span>Final closure remains unavailable until every release control is resolved.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Order closeout summary">
        {[
          ["Orders in closeout", String(orders.length), "Order records with delivery, financial, retention, or final status controls."],
          ["Delivery holds", String(deliveryHolds), "Document release or communication delivery issues requiring staff attention."],
          ["Financial release controls", String(financialControls), "Invoice and notary payable steps requiring elevated authority."],
          ["Retention locks", String(retentionLocks), "Records that cannot close until audit and retention posture is complete."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Order closeout workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Closeout file</p>
              <h2>ORD-2607-0001</h2>
              <span>
                Closeout consolidates completion evidence, document delivery,
                billing, payable routing, communications, retention, and final
                order status.
              </span>
            </section>
            <p className="request-label">Closeout index</p>
            <nav>
              {[
                ["Completion package", "completion-package-validation"],
                ["Document delivery", "client-document-delivery"],
                ["Invoice release", "client-invoice-release"],
                ["Notary payable", "notary-payable-routing"],
                ["Notifications", "communication-confirmation"],
                ["Retention", "retention-and-audit-closeout"],
                ["Final closeout", "closeout-command-center"],
              ].map(([label, anchor]) => (
                <a href={`#${anchor}`} key={anchor}>
                  <span>{label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Closeout register</p>
                <h2>Order closeout control matrix</h2>
              </div>
              <strong>{pendingControls} open controls</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Order closeout delivery and release controls</caption>
                <thead>
                  <tr>
                    <th scope="col">Control</th>
                    <th scope="col">Evidence</th>
                    <th scope="col">Status</th>
                    <th scope="col">Owner</th>
                    <th scope="col">Authority</th>
                    <th scope="col">Last updated</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {closeoutControls.map((record) => (
                    <tr id={record.control.toLowerCase().replaceAll(" ", "-")} key={record.id}>
                      <td>
                        <span>{record.id} · {record.orderId}</span>
                        <strong>{record.control}</strong>
                        <span className="evidence-packet-summary">{record.nextAction}</span>
                      </td>
                      <td>{record.evidence}</td>
                      <td><mark>{record.status}</mark></td>
                      <td>{record.owner}</td>
                      <td>{record.authority}</td>
                      <td>{record.lastUpdated}</td>
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

          <aside className="activation-control-center" id="closeout-command-center">
            <p className="request-label">Closeout command center</p>
            <h2>Final release controls</h2>
            <p className="activation-summary">
              Closeout commands must prove the completion package was received,
              validated documents were released to the authorized client,
              financial review was routed, and the final order status was
              recorded by authorized staff.
            </p>
            <dl>
              <div><dt>Completion package</dt><dd>Notary upload and staff custody review required</dd></div>
              <div><dt>Document delivery</dt><dd>Signed access and delivery confirmation required</dd></div>
              <div><dt>Invoice release</dt><dd>Financial review required before billing release</dd></div>
              <div><dt>Notary payable</dt><dd>W-9, assignment, and completion controls required</dd></div>
              <div><dt>Retention</dt><dd>Audit receipts and policy lock must be retained</dd></div>
            </dl>
            <CommandStatusPanel receipt={latestOrderReceipt} title="Order closeout" />
            <div className="decision-actions">
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="record-completion-package" />
                <input name="targetId" type="hidden" value="ORD-2607-0001" />
                <button type="submit">Record Completion Package</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="release-order-documents" />
                <input name="targetId" type="hidden" value="ORD-2607-0001" />
                <button type="submit">Release Validated Documents</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="route-order-financial-review" />
                <input name="targetId" type="hidden" value="ORD-2607-0001" />
                <button type="submit">Route Financial Review</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="close-order" />
                <input name="targetId" type="hidden" value="ORD-2607-0001" />
                <button type="submit">Close Order</button>
              </form>
              <a href="/staff/financial-reports">Open Financial Reports</a>
              <a href="/notifications">Open Communications</a>
              <a href="/staff/appointments">Open Appointments</a>
              <a href="/staff/retention">Open Retention Controls</a>
              <a href="/orders/ORD-2607-0001">Open Order Case File</a>
            </div>
            <p className="decision-lock-note">
              Production closeout should bind delivery callbacks, signed access
              receipts, invoice status, payable routing, immutable audit events,
              retention policy, and backup coverage before an order is closed.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
