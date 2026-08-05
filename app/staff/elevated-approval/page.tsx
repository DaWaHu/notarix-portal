import { requireStaffRouteAccess } from "../../access-policy";
import { accessRequests, finalActivationControls } from "../requests/data";

const elevatedRequests = accessRequests.filter(
  (request) => request.status === "Ready for Elevated Approval",
);

export default async function ElevatedApprovalQueuePage() {
  await requireStaffRouteAccess("/staff/elevated-approval", [
    "Admin",
    "SuperAdmin",
  ]);

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Elevated approval navigation">
          <a href="/">Home</a>
          <a href="/staff/requests">Staff Queue</a>
          <a className="nav-cta" href="/staff/elevated-approval">Elevated Approval</a>
          <a href="/auth/logout?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Administrator / Super Admin · Controlled Access</p>
          <h1>Elevated Approval Queue</h1>
          <p>
            Review profiles that General Admin staff marked verification complete.
            Final approval controls profile number assignment, portal activation,
            billing or payable permissions, and approval notifications.
          </p>
        </div>
        <aside>
          <p>Queue status</p>
          <strong>{elevatedRequests.length} file ready</strong>
          <span>Final approval requires elevated authority and audit review.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Elevated approval controls">
        {[
          ["GenAdmin handoff", "Complete", "Verification complete before elevated review."],
          ["Profile number", "Not assigned", "NSN or NSC generated only at final approval."],
          ["Audit report", "Restricted", "Administrator or Super Admin review required."],
          ["Notifications", "Controlled", "Email and phone notices require delivery records."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Elevated approval workspace">
        <div className="verification-console">
          <aside className="console-rail" aria-label="Approval queue sections">
            <section className="console-subject-card">
              <p className="request-label">Authority</p>
              <h2>Administrator</h2>
              <span>or Super Admin</span>
            </section>
            <p className="request-label">Review focus</p>
            <nav>
              {["Ready files", "Audit report", "Activation controls", "Notifications"].map((item) => (
                <a href="#approval-queue" key={item}>
                  <span>{item}</span>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main" id="approval-queue">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Elevated approval</p>
                <h2>Files ready for final review</h2>
              </div>
              <strong>{elevatedRequests.length} ready</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Elevated approval queue</caption>
                <thead>
                  <tr>
                    <th scope="col">Case file</th>
                    <th scope="col">Profile</th>
                    <th scope="col">Status</th>
                    <th scope="col">Reviewer</th>
                    <th scope="col">Received</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {elevatedRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <span>{request.type}</span>
                        <strong>{request.id}</strong>
                      </td>
                      <td>
                        {request.organization}
                        <span className="evidence-packet-summary">{request.name}</span>
                      </td>
                      <td><mark data-status="Verified">{request.status}</mark></td>
                      <td>{request.reviewer}</td>
                      <td>{request.received}</td>
                      <td>
                        <a href={`/staff/elevated-approval/${request.id}`}>Review</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Final activation controls</p>
            <h2>Before approval</h2>
            <dl>
              {finalActivationControls.slice(0, 6).map((control) => (
                <div key={control}>
                  <dt>Control</dt>
                  <dd>{control}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>
    </main>
  );
}
