import { notFound } from "next/navigation";
import {
  completionControlsForOrder,
  documentsForOrder,
  findOrderOperationRecord,
  lifecycleForOrder,
} from "../../operations-data";
import { CommandStatusPanel } from "../../staff/command-center/CommandStatusPanel";
import { getLatestCommandCenterReceiptForHref } from "../../staff/command-center/store";

type OrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  const order = findOrderOperationRecord(orderId);
  if (!order) notFound();

  const documents = documentsForOrder(order.id);
  const lifecycle = lifecycleForOrder(order.id);
  const closeoutControls = completionControlsForOrder(order.id);
  const latestOrderReceipt = getLatestCommandCenterReceiptForHref("/staff/orders");
  const openLifecycleCount = lifecycle.filter(
    (stage) =>
      !["complete", "ready"].includes(stage.status.toLowerCase()) &&
      !stage.status.toLowerCase().includes("confirmed"),
  ).length;

  return (
    <main className="staff-page order-workspace-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Order Case File</span>
        </a>
        <nav aria-label="Order navigation">
          <a href="/">Home</a>
          <a href="/client/orders">Client Orders</a>
          <a href="/notary/assignments">Notary Assignments</a>
          <a href="/staff/orders">Staff Orders</a>
          <a href="/staff/order-intake">Order Intake</a>
          <a href="/documents">Documents</a>
          <a className="nav-cta" href={`/orders/${order.id}`}>Order File</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Order Case File · Central System Record</p>
          <h1>{order.id}</h1>
          <p>
            Manage the notarial transaction from intake through closeout:
            parties, appointment, documents, assignment, communications,
            billing, payable, command receipts, and lifecycle controls.
          </p>
        </div>
        <aside>
          <p>Current lifecycle status</p>
          <strong>{order.orderStatus}</strong>
          <span>{openLifecycleCount} lifecycle controls require attention.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Order case summary">
        {[
          ["Client", order.client, `${order.clientProfile} · ${order.clientContact}`],
          ["Notary", order.notary, `${order.notaryProfile} · ${order.assignmentStatus}`],
          ["Appointment", order.appointment, `${order.service} · ${order.jurisdiction}`],
          ["Controls", order.risk, order.nextAction],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Order case workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Case file</p>
              <h2>{order.id}</h2>
              <span>
                The order is the controlling record for service delivery,
                evidence custody, assignment, financial release, notifications,
                retention, and audit.
              </span>
            </section>
            <p className="request-label">Case file index</p>
            <nav>
              {[
                ["Overview", "overview"],
                ["Parties", "parties"],
                ["Lifecycle", "lifecycle"],
                ["Documents", "documents"],
                ["Completion", "completion"],
                ["Financials", "financials"],
                ["Communications", "communications"],
                ["Staff Commands", "staff-commands"],
              ].map(([label, anchor]) => (
                <a href={`#${anchor}`} key={anchor}>
                  <span>{label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main">
            <header className="console-panel-heading" id="overview">
              <div>
                <p className="request-label">Order dossier</p>
                <h2>Service, parties, lifecycle, and closeout record</h2>
              </div>
              <strong>{order.orderStatus}</strong>
            </header>

            <section className="profile-dossier-grid" id="parties">
              <article>
                <p>Client profile</p>
                <strong>{order.client}</strong>
                <span>{order.clientProfile} · {order.clientContact} · {order.clientEmail}</span>
              </article>
              <article>
                <p>Assigned notary</p>
                <strong>{order.notary}</strong>
                <span>{order.notaryProfile} · {order.assignmentStatus}</span>
              </article>
              <article>
                <p>Appointment</p>
                <strong>{order.appointment}</strong>
                <span>{order.location}</span>
              </article>
              <article>
                <p>Service authority</p>
                <strong>{order.service}</strong>
                <span>{order.jurisdiction} · RON: {order.ronStatus}</span>
              </article>
              <article>
                <p>Document posture</p>
                <strong>{order.documentStatus}</strong>
                <span>{order.documentCount} · {order.validationStatus}</span>
              </article>
              <article>
                <p>Financial posture</p>
                <strong>{order.billingStatus}</strong>
                <span>{order.payableStatus}</span>
              </article>
            </section>

            <section className="case-file-section" id="lifecycle">
              <header className="console-panel-heading">
                <div>
                  <p className="request-label">Lifecycle spine</p>
                  <h2>Order lifecycle and authority matrix</h2>
                </div>
                <strong>{lifecycle.length} stages</strong>
              </header>
              <div className="verification-table-wrap">
                <table className="verification-table">
                  <caption>Order lifecycle stages</caption>
                  <thead>
                    <tr>
                      <th scope="col">Stage</th>
                      <th scope="col">Status</th>
                      <th scope="col">Evidence</th>
                      <th scope="col">Owner</th>
                      <th scope="col">Authority</th>
                      <th scope="col">Timestamp</th>
                      <th scope="col">Next action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lifecycle.map((stage) => (
                      <tr key={`${stage.orderId}-${stage.stage}`}>
                        <td><span>{order.id}</span><strong>{stage.stage}</strong></td>
                        <td><mark>{stage.status}</mark></td>
                        <td>{stage.evidence}</td>
                        <td>{stage.owner}</td>
                        <td>{stage.authority}</td>
                        <td>{stage.timestamp}</td>
                        <td>{stage.nextAction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="case-file-section" id="documents">
              <header className="console-panel-heading">
                <div>
                  <p className="request-label">Document custody</p>
                  <h2>Order documents and evidence access</h2>
                </div>
                <strong>{documents.length} documents</strong>
              </header>
              <div className="verification-table-wrap">
                <table className="verification-table">
                  <caption>Order documents</caption>
                  <thead>
                    <tr>
                      <th scope="col">Document</th>
                      <th scope="col">Custody</th>
                      <th scope="col">Status</th>
                      <th scope="col">Access</th>
                      <th scope="col">Received</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.length ? documents.map((document) => (
                      <tr key={document.id}>
                        <td><span>{document.id}</span><strong>{document.fileName}</strong></td>
                        <td>{document.custody}</td>
                        <td><mark>{document.status}</mark></td>
                        <td>{document.access}</td>
                        <td>{document.received}</td>
                        <td><a href={`/evidence/${document.evidenceId}`}>Open</a></td>
                      </tr>
                    )) : (
                      <tr>
                        <td><span>{order.id}</span><strong>No uploaded order documents</strong></td>
                        <td>Not required for this service type</td>
                        <td><mark>Identity check at appointment</mark></td>
                        <td>Assigned staff and notary</td>
                        <td>Pending appointment</td>
                        <td><a href="/documents">Documents</a></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="case-file-section" id="completion">
              <header className="console-panel-heading">
                <div>
                  <p className="request-label">Completion controls</p>
                  <h2>Closeout checklist and release controls</h2>
                </div>
                <strong>{closeoutControls.length || 6} controls</strong>
              </header>
              <div className="verification-table-wrap">
                <table className="verification-table">
                  <caption>Order closeout controls</caption>
                  <thead>
                    <tr>
                      <th scope="col">Requirement</th>
                      <th scope="col">Status</th>
                      <th scope="col">Evidence</th>
                      <th scope="col">Owner</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(closeoutControls.length ? closeoutControls : [
                      {
                        requirement: "Completion package",
                        status: "Pending",
                        evidence: "Order-specific completion evidence required",
                        owner: order.owner,
                      },
                    ]).map((control) => (
                      <tr key={control.requirement}>
                        <td><span>Closeout</span><strong>{control.requirement}</strong></td>
                        <td><mark>{control.status}</mark></td>
                        <td>{control.evidence}</td>
                        <td>{control.owner}</td>
                        <td><a href="#staff-commands">Review</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </article>

          <aside className="activation-control-center" id="staff-commands">
            <p className="request-label">Order lifecycle command center</p>
            <h2>Controlled actions</h2>
            <p className="activation-summary">
              Staff commands create retained receipts and update order target
              status. Client, notary, document, invoice, payable, and closeout
              actions remain locked until the required lifecycle controls clear.
            </p>
            <dl id="financials">
              <div><dt>Assignment</dt><dd>{order.assignmentStatus}</dd></div>
              <div><dt>Documents</dt><dd>{order.documentStatus} · {order.validationStatus}</dd></div>
              <div><dt>Billing</dt><dd>{order.billingStatus}</dd></div>
              <div><dt>Payables</dt><dd>{order.payableStatus}</dd></div>
              <div id="communications"><dt>Communications</dt><dd>{order.communicationStatus}</dd></div>
              <div><dt>Owner</dt><dd>{order.owner}</dd></div>
            </dl>
            <CommandStatusPanel receipt={latestOrderReceipt} title="Order case file" />
            <div className="decision-actions">
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="confirm-notary-acceptance" />
                <input name="targetId" type="hidden" value={order.id} />
                <button type="submit">Confirm Notary Acceptance</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="confirm-order-appointment" />
                <input name="targetId" type="hidden" value={order.id} />
                <button type="submit">Confirm Appointment</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="record-completion-package" />
                <input name="targetId" type="hidden" value={order.id} />
                <button type="submit">Record Completion Package</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="close-order" />
                <input name="targetId" type="hidden" value={order.id} />
                <button type="submit">Close Order</button>
              </form>
              <a href="/staff/order-intake">Open Intake Queue</a>
              <a href={`/staff/orders/${order.id}/assignment`}>Manage Assignment</a>
              <a href="/notifications">Open Communications</a>
            </div>
            <p className="decision-lock-note">
              Production closeout must bind to signed document access, delivery
              callbacks, invoice release, notary payable controls, immutable
              audit receipts, and retention policy.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
