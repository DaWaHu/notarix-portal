import { notFound } from "next/navigation";
import {
  deliveryReceiptsForOrder,
  documentsForOrder,
  findOrderOperationRecord,
} from "../../../../operations-data";
import { CommandStatusPanel } from "../../../../staff/command-center/CommandStatusPanel";
import { getLatestCommandCenterReceiptForHref } from "../../../../staff/command-center/store";

type ClientOrderCompletionPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function ClientOrderCompletionReceiptPage({
  params,
}: ClientOrderCompletionPageProps) {
  const { orderId } = await params;
  const order = findOrderOperationRecord(orderId);
  if (!order) notFound();

  const receipts = deliveryReceiptsForOrder(order.id);
  const documents = documentsForOrder(order.id).filter(
    (document) =>
      document.access.toLowerCase().includes("client") &&
      !document.status.toLowerCase().includes("restricted"),
  );
  const latestOrderReceipt = getLatestCommandCenterReceiptForHref("/staff/orders");
  const releasePending = receipts.filter((receipt) =>
    receipt.clientStatus.toLowerCase().includes("pending") ||
    receipt.clientStatus.toLowerCase().includes("retry") ||
    receipt.clientStatus.toLowerCase().includes("not closed"),
  ).length;

  return (
    <main className="staff-page order-workspace-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Client Portal</span>
        </a>
        <nav aria-label="Client completion receipt navigation">
          <a href="/">Home</a>
          <a href="/client">Client Home</a>
          <a href="/client/dashboard">Dashboard</a>
          <a href="/client/orders">Orders</a>
          <a className="nav-cta" href={`/client/orders/${order.id}/completion`}>
            Delivery Receipt
          </a>
          <a href="/documents">Documents</a>
          <a href="/notifications">Notices</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Client Completion · Delivery Receipt</p>
          <h1>Order Delivery Receipt</h1>
          <p>
            Review the client-visible completion record for delivered
            documents, completion package posture, invoice status,
            communication receipts, and final order closeout availability.
          </p>
        </div>
        <aside>
          <p>Order receipt</p>
          <strong>{order.id}</strong>
          <span>{releasePending} receipt controls remain open.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Client order completion summary">
        {[
          ["Client", order.client, `${order.clientProfile} · ${order.clientContact}`],
          ["Service", order.service, `${order.appointment} · ${order.jurisdiction}`],
          ["Documents", order.documentCount, `${documents.length} client-visible document records`],
          ["Closeout", order.orderStatus, "Final receipt is issued after staff delivery and financial controls clear."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Client completion receipt workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Receipt file</p>
              <h2>{order.id}</h2>
              <span>
                This receipt is client-facing. Restricted staff audit records,
                malware details, identity evidence, tax records, and internal
                command notes are withheld from this view.
              </span>
            </section>
            <p className="request-label">Receipt index</p>
            <nav>
              {[
                ["Completion package", "receipt-completion-package"],
                ["Delivered documents", "delivered-documents"],
                ["Invoice posture", "receipt-invoice-posture"],
                ["Communication receipt", "receipt-communication-receipt"],
                ["Final order receipt", "receipt-final-order-receipt"],
              ].map(([label, anchor]) => (
                <a href={`#${anchor}`} key={anchor}>
                  <span>{label}</span>
                </a>
              ))}
              <a href={`/orders/${order.id}`}><span>Order Case File</span></a>
            </nav>
          </aside>

          <article className="console-main">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Client delivery register</p>
                <h2>Delivery receipt and completion matrix</h2>
              </div>
              <strong>{releasePending} open controls</strong>
            </header>

            <section className="profile-dossier-grid">
              <article>
                <p>Client profile</p>
                <strong>{order.client}</strong>
                <span>{order.clientProfile} · {order.clientEmail}</span>
              </article>
              <article>
                <p>Assigned notary</p>
                <strong>{order.notary}</strong>
                <span>{order.assignmentStatus}</span>
              </article>
              <article>
                <p>Delivery location</p>
                <strong>{order.location}</strong>
                <span>{order.appointment}</span>
              </article>
              <article>
                <p>Billing posture</p>
                <strong>{order.billingStatus}</strong>
                <span>{order.payableStatus}</span>
              </article>
            </section>

            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Client order delivery receipt matrix</caption>
                <thead>
                  <tr>
                    <th scope="col">Receipt area</th>
                    <th scope="col">Client-visible evidence</th>
                    <th scope="col">Status</th>
                    <th scope="col">Delivery</th>
                    <th scope="col">Access control</th>
                    <th scope="col">Client next action</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((receipt) => (
                    <tr
                      id={`receipt-${receipt.receiptArea.toLowerCase().replaceAll(" ", "-")}`}
                      key={receipt.id}
                    >
                      <td>
                        <span>{receipt.id}</span>
                        <strong>{receipt.receiptArea}</strong>
                      </td>
                      <td>{receipt.clientVisibleEvidence}</td>
                      <td><mark>{receipt.clientStatus}</mark></td>
                      <td>
                        {receipt.deliveryChannel}
                        <span className="evidence-packet-summary">
                          {receipt.deliveredTo} · {receipt.deliveredAt}
                        </span>
                      </td>
                      <td>{receipt.accessControl}</td>
                      <td>{receipt.clientNextAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <section className="case-file-section" id="delivered-documents">
              <header className="console-panel-heading">
                <div>
                  <p className="request-label">Document access</p>
                  <h2>Client-visible document register</h2>
                </div>
                <strong>{documents.length} records</strong>
              </header>
              <div className="verification-table-wrap">
                <table className="verification-table">
                  <caption>Client-visible order documents</caption>
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
                    {documents.map((document) => (
                      <tr key={document.id}>
                        <td><span>{document.id}</span><strong>{document.fileName}</strong></td>
                        <td>{document.custody}</td>
                        <td><mark>{document.status}</mark></td>
                        <td>{document.access}</td>
                        <td>{document.received}</td>
                        <td><a href={`/evidence/${document.evidenceId}`}>Open</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Client completion center</p>
            <h2>Receipt status</h2>
            <p className="activation-summary">
              The final client receipt becomes complete after staff releases
              validated documents, resolves delivery notices, routes financial
              review, and records final order closeout.
            </p>
            <dl>
              <div><dt>Document release</dt><dd>{order.validationStatus}</dd></div>
              <div><dt>Completion package</dt><dd>Staff validation required</dd></div>
              <div><dt>Invoice</dt><dd>{order.billingStatus}</dd></div>
              <div><dt>Communications</dt><dd>{order.communicationStatus}</dd></div>
              <div><dt>Final receipt</dt><dd>Available after closeout</dd></div>
            </dl>
            <CommandStatusPanel
              receipt={latestOrderReceipt}
              showStaffLinks={false}
              title="Client completion"
            />
            <div className="decision-actions">
              <a href={`/orders/${order.id}`}>Open Order Case File</a>
              <a href="/documents">Open Document Vault</a>
              <a href="/notifications">Review Notices</a>
              <a href="/client/orders">Return To Orders</a>
            </div>
            <p className="decision-lock-note">
              Client completion receipts do not expose internal staff audit
              reports, malware scan internals, identity evidence, tax records,
              or notary payable ledger details.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
