import { requireChatGPTUser } from "../../chatgpt-auth";
import { listOrderOperations } from "../../order-repository";
import { CommandStatusPanel } from "../command-center/CommandStatusPanel";
import { getLatestCommandCenterReceiptForHref } from "../command-center/store";

export default async function OrderOperationsCommandCenterPage() {
  await requireChatGPTUser("/staff/orders");
  const latestCommandReceipt = getLatestCommandCenterReceiptForHref("/staff/orders");
  const orders = await listOrderOperations();
  const unassignedCount = orders.filter(
    (order) => order.notary === "Unassigned",
  ).length;
  const documentControlCount = orders.filter(
    (order) =>
      order.validationStatus.toLowerCase().includes("restricted") ||
      order.validationStatus.toLowerCase().includes("pending"),
  ).length;
  const financialHoldCount = orders.filter(
    (order) =>
      order.billingStatus.toLowerCase().includes("locked") ||
      order.payableStatus.toLowerCase().includes("restricted"),
  ).length;

  return (
    <main className="staff-page order-workspace-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Order operations navigation">
          <a href="/">Home</a>
          <a href="/staff">Staff Home</a>
          <a href="/staff/requests">Staff Queue</a>
          <a href="/staff/order-intake">Order Intake</a>
          <a href="/staff/signers">Signer Readiness</a>
          <a href="/staff/appointments">Appointments</a>
          <a href="/staff/order-closeout">Order Closeout</a>
          <a href="/staff/document-validation">Document Validation</a>
          <a href="/staff/financial-reports">Financial Reports</a>
          <a href="/notifications">Communications</a>
          <a className="nav-cta" href="/staff/orders">Orders</a>
          <a href="/signout-with-chatgpt?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Order Operations · Central System Record</p>
          <h1>Order Operations Command Center</h1>
          <p>
            Control assignment, document release, client communication, billing,
            payable, and escalation posture from the order record before any
            party receives production access or completion authority.
          </p>
        </div>
        <aside>
          <p>Operational queue</p>
          <strong>{orders.length} active orders</strong>
          <span>{unassignedCount} order requires assignment review.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Order operations summary">
        {[
          ["Active orders", String(orders.length), "Orders requiring assignment, document, billing, or communication review."],
          ["Unassigned", String(unassignedCount), "Orders that cannot proceed until notary eligibility and availability are confirmed."],
          ["Document controls", String(documentControlCount), "Orders with validation, release, or replacement document actions open."],
          ["Financial holds", String(financialHoldCount), "Orders with invoice, billing, payable, or ledger controls restricted."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Order operations workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Order command file</p>
              <h2>Operations index</h2>
              <span>
                Each order remains the controlling record for assignment,
                evidence, billing, communications, completion, and audit status.
              </span>
            </section>
            <p className="request-label">Order index</p>
            <nav>
              {orders.map((order) => (
                <a href={`#${order.id.toLowerCase()}`} key={order.id}>
                  <span>{order.id}</span>
                  <small>{order.orderStatus}</small>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Order register</p>
                <h2>Operational control matrix</h2>
              </div>
              <strong>{orders.length} orders</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Order operations command matrix</caption>
                <thead>
                  <tr>
                    <th scope="col">Order</th>
                    <th scope="col">Client / service</th>
                    <th scope="col">Assignment</th>
                    <th scope="col">Documents</th>
                    <th scope="col">Financials</th>
                    <th scope="col">Owner / next action</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr id={order.id.toLowerCase()} key={order.id}>
                      <td>
                        <span>{order.id} · {order.jurisdiction}</span>
                        <strong>{order.orderStatus}</strong>
                        <span className="evidence-packet-summary">
                          {order.appointment}
                        </span>
                      </td>
                      <td>
                        <strong>{order.client}</strong>
                        <span className="evidence-packet-summary">
                          {order.service} · {order.location}
                        </span>
                      </td>
                      <td>
                        {order.notary}
                        <span className="evidence-packet-summary">
                          {order.assignmentStatus} · {order.ronStatus}
                        </span>
                      </td>
                      <td>
                        <mark>{order.documentStatus}</mark>
                        <span className="evidence-packet-summary">
                          {order.documentCount} · {order.validationStatus}
                        </span>
                      </td>
                      <td>
                        {order.billingStatus}
                        <span className="evidence-packet-summary">
                          {order.payableStatus}
                        </span>
                      </td>
                      <td>
                        {order.owner}
                        <span className="evidence-packet-summary">
                          {order.nextAction}
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
            <p className="request-label">Order command center</p>
            <h2>Lifecycle controls</h2>
            <p className="activation-summary">
              Order actions create command receipts and visible status feedback.
              Assignment, document release, and financial routing remain
              attributable to the staff account and required authority level.
            </p>
            <dl>
              <div><dt>Assignment</dt><dd>Notary eligibility, availability, and RON posture required</dd></div>
              <div><dt>Documents</dt><dd>Malware validation and access classification required</dd></div>
              <div><dt>Communications</dt><dd>Client and notary notices are delivery logged</dd></div>
              <div><dt>Financials</dt><dd>Invoice and payable controls remain restricted until cleared</dd></div>
              <div><dt>Audit</dt><dd>Every command produces a retained receipt</dd></div>
            </dl>
            <CommandStatusPanel receipt={latestCommandReceipt} title="Order operations" />
            <div className="decision-actions">
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="assign-notary" />
                <input name="targetId" type="hidden" value="ORD-2607-0002" />
                <button type="submit">Queue Notary Assignment</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="release-order-documents" />
                <input name="targetId" type="hidden" value="ORD-2607-0001" />
                <button type="submit">Release Validated Documents</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="request-missing-documents" />
                <input name="targetId" type="hidden" value="ORD-2607-0002" />
                <button type="submit">Request Missing Documents</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="route-order-financial-review" />
                <input name="targetId" type="hidden" value="ORD-2607-0001" />
                <button type="submit">Route Financial Review</button>
              </form>
              <a href="/staff/signers">Open Signer Readiness</a>
              <a href="/staff/appointments">Open Appointments</a>
              <a href="/staff/order-closeout">Open Closeout Console</a>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="hold-order" />
                <input name="targetId" type="hidden" value="ORD-2607-0002" />
                <button type="submit">Place Order Hold</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="escalate-order-issue" />
                <input name="targetId" type="hidden" value="ORD-2607-0002" />
                <button type="submit">Escalate Order Issue</button>
              </form>
            </div>
            <p className="decision-lock-note">
              Production order commands should bind to immutable audit records,
              signed document access, delivery callbacks, financial ledgers, and
              assignment notifications.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
