import { notFound } from "next/navigation";
import {
  getOrderOperation,
  listNotaryCompletionReceipts,
  listOrderDocuments,
} from "../../../../order-repository";
import { CommandStatusPanel } from "../../../../staff/command-center/CommandStatusPanel";
import { getLatestCommandCenterReceiptForHref } from "../../../../staff/command-center/store";

type NotaryCompletionPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function NotaryCompletionPackagePage({
  params,
}: NotaryCompletionPageProps) {
  const { orderId } = await params;
  const order = await getOrderOperation(orderId);
  if (!order || order.notary === "Unassigned") notFound();

  const receipts = await listNotaryCompletionReceipts(order.id);
  const documents = listOrderDocuments(order.id).filter((document) =>
    document.access.toLowerCase().includes("notary"),
  );
  const latestOrderReceipt = getLatestCommandCenterReceiptForHref("/staff/orders");
  const openItems = receipts.filter(
    (receipt) =>
      !["complete", "verified", "released"].includes(receipt.status.toLowerCase()),
  ).length;

  return (
    <main className="staff-page order-workspace-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Notary Portal</span>
        </a>
        <nav aria-label="Notary completion navigation">
          <a href="/">Home</a>
          <a href="/notary">Notary Home</a>
          <a href="/notary/dashboard">Dashboard</a>
          <a href="/notary/assignments">Assignments</a>
          <a className="nav-cta" href={`/notary/assignments/${order.id}/completion`}>
            Completion Package
          </a>
          <a href="/credentials/expiration">Credentials</a>
          <a href="/notifications">Notices</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Notary Completion · Assignment Receipt</p>
          <h1>Completion Package And Payable Status</h1>
          <p>
            Review assignment acceptance, arrival confirmation, completion
            package upload, credential impact, and payable eligibility for the
            assigned order without exposing client billing internals.
          </p>
        </div>
        <aside>
          <p>Assigned order</p>
          <strong>{order.id}</strong>
          <span>{openItems} completion controls remain open.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Notary completion summary">
        {[
          ["Notary", order.notary, `${order.notaryProfile} · ${order.assignmentStatus}`],
          ["Appointment", order.appointment, `${order.service} · ${order.location}`],
          ["Documents", order.documentCount, `${documents.length} notary-accessible document records`],
          ["Payable", order.payableStatus, "Payment remains restricted until completion and elevated financial controls clear."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Notary completion workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Completion file</p>
              <h2>{order.id}</h2>
              <span>
                This view is notary-facing. Client invoice details, internal
                staff audit reports, and restricted financial controls remain
                staff-only.
              </span>
            </section>
            <p className="request-label">Completion index</p>
            <nav>
              {[
                ["Assignment acceptance", "assignment-acceptance"],
                ["Appointment attendance", "appointment-attendance"],
                ["Completion package upload", "completion-package-upload"],
                ["Credential impact", "credential-impact"],
                ["Payable status", "payable-status"],
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
                <p className="request-label">Notary completion register</p>
                <h2>Completion package and payable matrix</h2>
              </div>
              <strong>{openItems} open controls</strong>
            </header>

            <section className="profile-dossier-grid">
              <article>
                <p>Assignment</p>
                <strong>{order.assignmentStatus}</strong>
                <span>{order.orderStatus}</span>
              </article>
              <article>
                <p>Service authority</p>
                <strong>{order.service}</strong>
                <span>{order.jurisdiction} · RON: {order.ronStatus}</span>
              </article>
              <article>
                <p>Document posture</p>
                <strong>{order.documentStatus}</strong>
                <span>{order.validationStatus}</span>
              </article>
              <article>
                <p>Payable posture</p>
                <strong>{order.payableStatus}</strong>
                <span>W-9 and elevated approval required before release.</span>
              </article>
            </section>

            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Notary completion package and payable status matrix</caption>
                <thead>
                  <tr>
                    <th scope="col">Receipt area</th>
                    <th scope="col">Evidence</th>
                    <th scope="col">Status</th>
                    <th scope="col">Notary action</th>
                    <th scope="col">Staff review</th>
                    <th scope="col">Payable impact</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((receipt) => (
                    <tr
                      id={receipt.receiptArea.toLowerCase().replaceAll(" ", "-")}
                      key={receipt.id}
                    >
                      <td>
                        <span>{receipt.id}</span>
                        <strong>{receipt.receiptArea}</strong>
                      </td>
                      <td>{receipt.evidence}</td>
                      <td><mark>{receipt.status}</mark></td>
                      <td>{receipt.notaryAction}</td>
                      <td>{receipt.staffReview}</td>
                      <td>{receipt.payableImpact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <section className="case-file-section" id="notary-documents">
              <header className="console-panel-heading">
                <div>
                  <p className="request-label">Document access</p>
                  <h2>Notary-accessible document register</h2>
                </div>
                <strong>{documents.length} records</strong>
              </header>
              <div className="verification-table-wrap">
                <table className="verification-table">
                  <caption>Notary-accessible order documents</caption>
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
            <p className="request-label">Notary completion center</p>
            <h2>Completion controls</h2>
            <p className="activation-summary">
              Completion actions create order receipts that staff can validate
              before client delivery, invoice routing, notary payable review,
              and final closeout.
            </p>
            <dl>
              <div><dt>Acceptance</dt><dd>{order.assignmentStatus}</dd></div>
              <div><dt>Arrival</dt><dd>Confirm only at the appointment location</dd></div>
              <div><dt>Package upload</dt><dd>Executed documents and notarial certificate required</dd></div>
              <div><dt>Credentials</dt><dd>Commission, E&amp;O, and RON posture monitored</dd></div>
              <div><dt>Payables</dt><dd>{order.payableStatus}</dd></div>
            </dl>
            <CommandStatusPanel
              receipt={latestOrderReceipt}
              showStaffLinks={false}
              title="Notary completion"
            />
            <div className="decision-actions">
              <form action="/notary/assignment-actions" method="post">
                <input name="action" type="hidden" value="notary-accept-assignment" />
                <input name="targetId" type="hidden" value={order.id} />
                <button type="submit">Accept Assignment</button>
              </form>
              <form action="/notary/assignment-actions" method="post">
                <input name="action" type="hidden" value="notary-confirm-arrival" />
                <input name="targetId" type="hidden" value={order.id} />
                <button type="submit">Confirm Arrival</button>
              </form>
              <form action="/notary/assignment-actions" method="post">
                <input name="action" type="hidden" value="notary-upload-completion-package" />
                <input name="targetId" type="hidden" value={order.id} />
                <button type="submit">Upload Completion Package</button>
              </form>
              <a href={`/orders/${order.id}`}>Open Order Case File</a>
              <a href="/credentials/expiration">Review Credentials</a>
              <a href="/support">Contact Support</a>
            </div>
            <p className="decision-lock-note">
              Notary completion receipts do not approve payment. Payable release
              requires staff validation, tax onboarding controls, and elevated
              financial authority.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
