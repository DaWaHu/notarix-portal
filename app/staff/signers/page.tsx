import { requireChatGPTUser } from "../../chatgpt-auth";
import { listSignerReadiness } from "../../order-repository";
import { CommandStatusPanel } from "../command-center/CommandStatusPanel";
import { getLatestCommandCenterReceiptForHref } from "../command-center/store";

export default async function SignerReadinessIdentityCheckPage() {
  await requireChatGPTUser("/staff/signers");
  const latestOrderReceipt = getLatestCommandCenterReceiptForHref("/staff/orders");
  const signers = await listSignerReadiness();
  const pendingIdentity = signers.filter((record) =>
    record.identityStatus.toLowerCase().includes("pending"),
  ).length;
  const restrictedSigners = signers.filter((record) =>
    record.identityStatus.toLowerCase().includes("restricted") ||
    record.risk.toLowerCase().includes("restricted"),
  ).length;
  const readySigners = signers.filter((record) =>
    record.identityStatus.toLowerCase().includes("ready"),
  ).length;
  const witnessReviews = signers.filter((record) =>
    record.witnessRequirement.toLowerCase().includes("review"),
  ).length;

  return (
    <main className="staff-page order-workspace-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Signer readiness navigation">
          <a href="/">Home</a>
          <a href="/staff">Staff Home</a>
          <a href="/staff/orders">Orders</a>
          <a href="/staff/appointments">Appointments</a>
          <a className="nav-cta" href="/staff/signers">Signer Readiness</a>
          <a href="/staff/document-validation">Document Validation</a>
          <a href="/notifications">Communications</a>
          <a href="/signout-with-chatgpt?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Signer Readiness · Identity Check Controls</p>
          <h1>Signer Readiness And Identity Check Center</h1>
          <p>
            Review signer identity method, appointment presence, witness
            requirements, location readiness, and special instructions before a
            notarial appointment is confirmed or dispatched.
          </p>
        </div>
        <aside>
          <p>Signer queue</p>
          <strong>{signers.length} signer records</strong>
          <span>{pendingIdentity + restrictedSigners} identity controls require attention.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Signer readiness summary">
        {[
          ["Pending identity checks", String(pendingIdentity), "Signers requiring appointment-day identification review."],
          ["Ready signers", String(readySigners), "Signers with readiness posture prepared for confirmation."],
          ["Restricted signers", String(restrictedSigners), "Signers blocked by RON, document, or identity constraints."],
          ["Witness reviews", String(witnessReviews), "Witness or electronic witness requirements requiring staff review."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Signer readiness workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Signer control file</p>
              <h2>Identity readiness</h2>
              <span>
                Signer readiness protects the appointment from proceeding when
                identity method, witness requirements, location, or signer
                availability are unresolved.
              </span>
            </section>
            <p className="request-label">Signer index</p>
            <nav>
              {signers.map((record) => (
                <a href={`#${record.id.toLowerCase()}`} key={record.id}>
                  <span>{record.signerName}</span>
                  <small>{record.orderId}</small>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Signer register</p>
                <h2>Signer identity and readiness matrix</h2>
              </div>
              <strong>{signers.length} signers</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Signer readiness and identity check matrix</caption>
                <thead>
                  <tr>
                    <th scope="col">Signer</th>
                    <th scope="col">Identity method</th>
                    <th scope="col">Identity status</th>
                    <th scope="col">Location / witness</th>
                    <th scope="col">Special instructions</th>
                    <th scope="col">Owner / next action</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {signers.map((record) => (
                    <tr id={record.id.toLowerCase()} key={record.id}>
                      <td>
                        <span>{record.id} · {record.orderId}</span>
                        <strong>{record.signerName}</strong>
                        <span className="evidence-packet-summary">{record.signerRole}</span>
                      </td>
                      <td>{record.identityMethod}</td>
                      <td><mark>{record.identityStatus}</mark></td>
                      <td>
                        {record.locationReadiness}
                        <span className="evidence-packet-summary">{record.witnessRequirement}</span>
                      </td>
                      <td>
                        {record.specialInstructions}
                        <span className="evidence-packet-summary">{record.risk}</span>
                      </td>
                      <td>
                        {record.staffOwner}
                        <span className="evidence-packet-summary">{record.nextAction}</span>
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
            <p className="request-label">Signer command center</p>
            <h2>Readiness controls</h2>
            <p className="activation-summary">
              Signer readiness actions should resolve identity method,
              appointment presence, witness requirements, and location details
              before appointment confirmation proceeds.
            </p>
            <dl>
              <div><dt>Identity method</dt><dd>Government ID, RON proofing, or approved alternative documented</dd></div>
              <div><dt>Location readiness</dt><dd>Appointment address or remote session details verified</dd></div>
              <div><dt>Witness requirement</dt><dd>Witness posture reviewed before dispatch</dd></div>
              <div><dt>Document name match</dt><dd>Signer names compared against order documents</dd></div>
              <div><dt>Exceptions</dt><dd>Identity or RON restrictions escalated before confirmation</dd></div>
            </dl>
            <CommandStatusPanel receipt={latestOrderReceipt} title="Signer readiness" />
            <div className="decision-actions">
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="confirm-order-appointment" />
                <input name="targetId" type="hidden" value="ORD-2607-0003" />
                <button type="submit">Confirm Ready Appointment</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="request-missing-documents" />
                <input name="targetId" type="hidden" value="ORD-2607-0002" />
                <button type="submit">Request Identity Documents</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="escalate-order-issue" />
                <input name="targetId" type="hidden" value="ORD-2607-0002" />
                <button type="submit">Escalate Identity Issue</button>
              </form>
              <a href="/staff/appointments">Open Appointments</a>
              <a href="/staff/document-validation">Open Document Validation</a>
              <a href="/notifications">Open Communications</a>
            </div>
            <p className="decision-lock-note">
              Production signer readiness should bind signer identity method,
              appointment attendance expectations, witness requirements,
              accessibility notes, and RON identity proofing results to the
              order record.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
