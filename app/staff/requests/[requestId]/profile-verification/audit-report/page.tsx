import { notFound } from "next/navigation";
import { requireStaffRouteAccess } from "../../../../../access-policy";
import { findAccessRequest } from "../../../data";

type AuditReportPageProps = {
  params: Promise<{
    requestId: string;
  }>;
};

const elevatedAuditEvents = [
  ["GenAdmin001", "Jul 10 2026 at 9:12 AM ET", "NSR received from access form."],
  ["GenAdmin003", "Jul 10 2026 at 9:18 AM ET", "Staff queue record created."],
  ["GenAdmin004", "Jul 10 2026 at 12:02 PM ET", "W-9 and payable status queued for elevated approval."],
] as const;

export default async function SuperAdminAuditReportPage({
  params,
}: AuditReportPageProps) {
  const { requestId } = await params;
  await requireStaffRouteAccess(
    `/staff/requests/${requestId}/profile-verification/audit-report`,
    ["SuperAdmin"],
  );

  const request = findAccessRequest(requestId);
  if (!request) notFound();

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Super Admin audit report navigation">
          <a href="/">Home</a>
          <a href="/staff/requests">Staff Queue</a>
          <a href={`/staff/requests/${request.id}/profile-verification`}>
            Verification Console
          </a>
          <a href="/signout-with-chatgpt?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="decision-hero">
        <div>
          <p className="kicker">Super Admin Report · Restricted Audit Access</p>
          <h1>Profile Verification Audit Report</h1>
          <p>
            Restricted audit history for elevated approval review. General Admin
            verification work is reviewed here before final profile activation.
          </p>
        </div>
        <aside>
          <p>Case file</p>
          <strong>{request.id}</strong>
          <span>{request.name} · {request.status}</span>
        </aside>
      </section>

      <section className="decision-workspace">
        <article className="decision-panel">
          <p className="request-label">Elevated approval gate</p>
          <h2>Two-step approval evidence</h2>
          <div className="summary-grid">
            <section>
              <p className="request-label">Step 1</p>
              <strong>General Admin verification</strong>
              <span>GenAdmin reviewers validate every required profile item.</span>
            </section>
            <section>
              <p className="request-label">Step 2</p>
              <strong>Administrator or Super Admin approval</strong>
              <span>Elevated approver records the final activation decision.</span>
            </section>
            <section>
              <p className="request-label">Notification recipients</p>
              <strong>Super Admin and Administrator</strong>
              <span>Approval notice is sent only after all items are verified.</span>
            </section>
          </div>
        </article>

        <aside className="decision-panel">
          <p className="request-label">Restricted access</p>
          <h2>Super Admin only</h2>
          <p>
            This report is intentionally separated from the GenAdmin verification
            console so routine reviewers cannot browse elevated audit history.
          </p>
        </aside>
      </section>

      <section className="decision-workspace">
        <article className="decision-panel">
          <p className="request-label">Internal audit report</p>
          <h2>GenAdmin activity trail</h2>
          <ol className="audit-report-list">
            {elevatedAuditEvents.map(([actor, timestamp, event]) => (
              <li key={`${actor}-${timestamp}`}>
                <span>{actor}</span>
                <strong>{timestamp}</strong>
                <p>{event}</p>
              </li>
            ))}
          </ol>
        </article>
      </section>
    </main>
  );
}
