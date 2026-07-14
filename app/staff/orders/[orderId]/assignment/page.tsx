import { notFound } from "next/navigation";
import { requireChatGPTUser } from "../../../../chatgpt-auth";
import { credentialMonitorRecords, findOrderOperationRecord } from "../../../../operations-data";
import { CommandStatusPanel } from "../../../command-center/CommandStatusPanel";
import { getLatestCommandCenterReceiptForHref } from "../../../command-center/store";

type StaffAssignmentPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function StaffAssignmentPage({ params }: StaffAssignmentPageProps) {
  const { orderId } = await params;
  const order = findOrderOperationRecord(orderId);
  if (!order) notFound();
  await requireChatGPTUser(`/staff/orders/${order.id}/assignment`);
  const latestOrderReceipt = getLatestCommandCenterReceiptForHref("/staff/orders");

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Staff assignment navigation">
          <a href="/">Home</a>
          <a href="/staff/requests">Staff Queue</a>
          <a className="nav-cta" href={`/staff/orders/${order.id}/assignment`}>Assignment</a>
          <a href="/signout-with-chatgpt">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Staff Assignment Console · Controlled Access</p>
          <h1>Notary Assignment Review</h1>
          <p>
            Assign an eligible notary only after profile activation,
            jurisdiction, credential, RON, availability, and document-access
            requirements are satisfied.
          </p>
        </div>
        <aside>
          <p>Order</p>
          <strong>{order.id}</strong>
          <span>{order.orderStatus}</span>
        </aside>
      </section>

      <section className="verification-layout" aria-label="Staff assignment workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <p className="request-label">Assignment file</p>
            <nav>
              {["Order", "Eligibility", "Credentials", "Availability", "Decision"].map((label) => (
                <a href={`#${label.toLowerCase()}`} key={label}><span>{label}</span></a>
              ))}
            </nav>
          </aside>

          <article className="console-main">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Eligible notary review</p>
                <h2>Assignment control matrix</h2>
              </div>
              <strong>{order.jurisdiction}</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Assignment eligibility controls</caption>
                <thead>
                  <tr>
                    <th scope="col">Control</th>
                    <th scope="col">Evidence</th>
                    <th scope="col">Status</th>
                    <th scope="col">Assigned reviewer</th>
                    <th scope="col">Last updated</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Profile activation", "Notary profile must be Active with permanent NSN", "Pending", "GenAdmin001", "Jul 18 2026 at 4:20 PM ET"],
                    ["Jurisdiction", `${order.jurisdiction} commission and service area match`, "Pending", "GenAdmin002", "Jul 18 2026 at 4:22 PM ET"],
                    ["Credential posture", "Commission, insurance, background, and RON controls checked", "Restricted", "Super Admin", "Jul 18 2026 at 4:24 PM ET"],
                    ["Availability", "Appointment window and travel coverage confirmed", "Pending", "GenAdmin003", "Jul 18 2026 at 4:27 PM ET"],
                  ].map(([control, evidence, status, reviewer, updated]) => (
                    <tr key={control}>
                      <td><span>Assignment</span><strong>{control}</strong></td>
                      <td>{evidence}</td>
                      <td><mark data-status={status}>{status}</mark></td>
                      <td>{reviewer}</td>
                      <td>{updated}</td>
                      <td><button type="button">Review</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Assignment controls</p>
            <h2>Approval locked</h2>
            <dl>
              <div><dt>Order</dt><dd>{order.id}</dd></div>
              <div><dt>Client</dt><dd>{order.client}</dd></div>
              <div><dt>Credential monitor</dt><dd>{credentialMonitorRecords.length} active records</dd></div>
              <div><dt>Audit attribution</dt><dd>Staff identity required</dd></div>
            </dl>
            <CommandStatusPanel receipt={latestOrderReceipt} title="Assignment" />
            <div className="decision-actions">
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="assign-notary" />
                <input name="targetId" type="hidden" value={order.id} />
                <button type="submit">Queue Assignment</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="confirm-notary-acceptance" />
                <input name="targetId" type="hidden" value={order.id} />
                <button type="submit">Confirm Acceptance</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="escalate-restriction" />
                <input name="targetId" type="hidden" value="CRD-2607-0003" />
                <button type="submit">Request Credential Review</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="hold-order" />
                <input name="targetId" type="hidden" value={order.id} />
                <button type="submit">Keep Order On Hold</button>
              </form>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
