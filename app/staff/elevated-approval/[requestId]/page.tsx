import { notFound } from "next/navigation";
import { requireStaffRouteAccess } from "../../../access-policy";
import {
  activationAuditRequirements,
  finalActivationControls,
  findAccessRequest,
  profileNumberAssignmentRule,
  profileNumberFormatExample,
  profileNumberLabel,
} from "../../requests/data";

type ElevatedApprovalReviewPageProps = {
  params: Promise<{
    requestId: string;
  }>;
};

export default async function ElevatedApprovalReviewPage({
  params,
}: ElevatedApprovalReviewPageProps) {
  const { requestId } = await params;
  await requireStaffRouteAccess(`/staff/elevated-approval/${requestId}`, [
    "Admin",
    "SuperAdmin",
  ]);

  const request = findAccessRequest(requestId);
  if (!request) notFound();

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Final approval navigation">
          <a href="/">Home</a>
          <a href="/staff/elevated-approval">Elevated Approval</a>
          <a href={`/staff/requests/${request.id}/profile-verification`}>Verification Console</a>
          <a href="/signout-with-chatgpt?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Final Approval Review · Elevated Authority</p>
          <h1>{request.id}</h1>
          <div className="console-meta" aria-label="Final approval metadata">
            <span>{request.type} profile</span>
            <span>{request.status}</span>
            <span>{request.reviewer}</span>
          </div>
          <p>
            Confirm General Admin verification, restricted audit review,
            activation controls, profile number assignment, and approval
            notifications before activating this profile.
          </p>
        </div>
        <aside>
          <p>{profileNumberLabel(request.type)}</p>
          <strong>{request.approvedProfileNumber ?? "Generated at approval"}</strong>
          <span>{profileNumberAssignmentRule(request.type)}</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Final approval state">
        {[
          ["Profile number", profileNumberFormatExample(request.type), "Format example; not reserved before activation."],
          ["Audit review", "Required", "Restricted report must be reviewed before approval."],
          ["Notifications", "Required", "Email and phone delivery logs are recorded after approval."],
          ["Portal activation", "Controlled", "Only approved permissions become active."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Final approval workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Profile</p>
              <h2>{request.organization}</h2>
              <span>{request.name}</span>
            </section>
            <p className="request-label">Approval steps</p>
            <nav>
              {["Audit", "Activation", "Number", "Notifications", "Decision"].map((item) => (
                <a href="#final-decision" key={item}>
                  <span>{item}</span>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Restricted review</p>
                <h2>Activation readiness controls</h2>
              </div>
              <strong>Elevated approval</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Activation readiness controls</caption>
                <thead>
                  <tr>
                    <th scope="col">Control</th>
                    <th scope="col">Evidence</th>
                    <th scope="col">Status</th>
                    <th scope="col">Authority</th>
                    <th scope="col">Timing</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {finalActivationControls.map((control) => (
                    <tr key={control}>
                      <td>
                        <span>Activation</span>
                        <strong>{control}</strong>
                      </td>
                      <td>Confirmed during final approval review.</td>
                      <td><mark data-status="Restricted">Controlled</mark></td>
                      <td>Administrator or Super Admin</td>
                      <td>At activation</td>
                      <td><button type="button">Confirm</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="activation-control-center" id="final-decision">
            <p className="request-label">Final decision</p>
            <h2>Approve activation</h2>
            <p className="activation-summary">
              Approval activates only authorized portal permissions and generates
              the permanent {request.type === "Notary" ? "NSN" : "NSC"}.
            </p>
            <dl>
              {activationAuditRequirements.slice(0, 6).map((requirement) => (
                <div key={requirement}>
                  <dt>Audit field</dt>
                  <dd>{requirement}</dd>
                </div>
              ))}
            </dl>
            <div className="decision-actions">
              <form action={`/staff/workflow/${request.id}`} method="post">
                <input name="action" type="hidden" value="grant-final-approval" />
                <input name="role" type="hidden" value="Admin" />
                <button type="submit">Grant Final Approval</button>
              </form>
              <a href={`/staff/requests/${request.id}/profile-verification/decision/corrections`}>Return for Corrections</a>
              <a href={`/staff/requests/${request.id}/profile-verification/decision/inactive`}>Keep Inactive</a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
