import { requireStaffRouteAccess } from "../../access-policy";
import { accessControlRecords } from "../../operations-data";
import { CommandStatusPanel } from "../command-center/CommandStatusPanel";
import { getLatestCommandCenterReceiptForHref } from "../command-center/store";

export default async function AccessControlPage() {
  await requireStaffRouteAccess("/staff/access-control", [
    "Admin",
    "SuperAdmin",
  ]);
  const latestCommandReceipt = getLatestCommandCenterReceiptForHref(
    "/staff/access-control",
  );

  const reviewCount = accessControlRecords.filter((record) =>
    record.accessReview.toLowerCase().includes("review"),
  ).length;
  const passkeyGaps = accessControlRecords.filter((record) =>
    record.passkeyStatus.toLowerCase().includes("required") ||
    record.passkeyStatus.toLowerCase().includes("pending") ||
    record.passkeyStatus.toLowerCase().includes("no passkey"),
  ).length;
  const deviceIssues = accessControlRecords.filter((record) =>
    record.deviceStatus.toLowerCase().includes("required") ||
    record.deviceStatus.toLowerCase().includes("unapproved"),
  ).length;

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Access control navigation">
          <a href="/">Home</a>
          <a href="/staff">Staff Home</a>
          <a href="/staff/system-health">System Health</a>
          <a href="/staff/platform">Platform Configuration</a>
          <a href="/staff/audit-reports">Audit Reports</a>
          <a href="/staff/command-center/activity">Command Activity</a>
          <a className="nav-cta" href="/staff/access-control">Access Control</a>
          <a href="/auth/logout?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Identity Provider · Access Administration</p>
          <h1>Identity Provider And Access Control Administration</h1>
          <p>
            Review staff users, MFA, passkeys, device posture, role-based access
            claims, route restrictions, session status, least-privilege reviews,
            and break-glass controls before sensitive portal workflows are
            available.
          </p>
        </div>
        <aside>
          <p>Access posture</p>
          <strong>{reviewCount} reviews open</strong>
          <span>MFA, passkeys, device controls, and RBAC claims must be enforced.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Access control summary">
        {[
          ["Open reviews", String(reviewCount), "Staff accounts requiring quarterly, monthly, or exception review."],
          ["Passkey gaps", String(passkeyGaps), "Users or roles not fully bound to production passkey enforcement."],
          ["Device issues", String(deviceIssues), "Accounts requiring managed-device or device-compliance review."],
          ["Least privilege", "Required", "Protected routes must follow role, authority, and audit controls."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Access control workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Identity file</p>
              <h2>RBAC controls</h2>
              <span>Staff access must be tied to identity provider claims, session controls, and auditable commands.</span>
            </section>
            <p className="request-label">Access index</p>
            <nav>
              {[
                "GenAdmin",
                "Administrator",
                "Super Admin",
                "Support exceptions",
                "MFA and passkeys",
                "Device controls",
              ].map((label) => (
                <a href="#access-control-matrix" key={label}>
                  <span>{label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main" id="access-control-matrix">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Staff access register</p>
                <h2>Identity, role, and session control matrix</h2>
              </div>
              <strong>{accessControlRecords.length} staff records</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Identity provider and access control records</caption>
                <thead>
                  <tr>
                    <th scope="col">Staff account</th>
                    <th scope="col">Role</th>
                    <th scope="col">MFA / passkey</th>
                    <th scope="col">Device / session</th>
                    <th scope="col">Access review</th>
                    <th scope="col">Restricted routes</th>
                    <th scope="col">Next action</th>
                  </tr>
                </thead>
                <tbody>
                  {accessControlRecords.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <span>{record.id}</span>
                        <strong>{record.staffUser}</strong>
                        <span className="evidence-packet-summary">
                          {record.email}
                        </span>
                      </td>
                      <td><mark>{record.role}</mark></td>
                      <td>
                        {record.mfaStatus}
                        <span className="evidence-packet-summary">
                          {record.passkeyStatus}
                        </span>
                      </td>
                      <td>
                        {record.deviceStatus}
                        <span className="evidence-packet-summary">
                          {record.sessionStatus}
                        </span>
                      </td>
                      <td>
                        {record.accessReview}
                        <span className="evidence-packet-summary">
                          Last reviewed {record.lastReviewed}
                        </span>
                      </td>
                      <td>{record.restrictedRoutes}</td>
                      <td>{record.nextAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Access command center</p>
            <h2>Identity safeguards</h2>
            <p className="activation-summary">
              Access actions should preserve least privilege, require MFA and
              passkey remediation, suspend risky sessions, and escalate
              privilege exceptions before restricted route access changes.
            </p>
            <dl>
              <div><dt>MFA/passkey</dt><dd>Production identity provider enforcement required</dd></div>
              <div><dt>Device controls</dt><dd>Managed or approved staff devices required</dd></div>
              <div><dt>Session controls</dt><dd>Risky sessions can be suspended with receipt</dd></div>
              <div><dt>Privilege exceptions</dt><dd>Escalate before restricted access is granted</dd></div>
            </dl>
            <CommandStatusPanel
              receipt={latestCommandReceipt}
              title="Access control"
            />
            <div className="decision-actions">
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="require-mfa-passkey-reset" />
                <input name="targetId" type="hidden" value="IAM-2607-0002" />
                <button type="submit">Require MFA/Passkey Reset</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="suspend-staff-session" />
                <input name="targetId" type="hidden" value="IAM-2607-0004" />
                <button type="submit">Suspend Staff Session</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="open-access-review" />
                <input name="targetId" type="hidden" value="IAM-2607-0002" />
                <button type="submit">Open Access Review</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="escalate-privilege-exception" />
                <input name="targetId" type="hidden" value="IAM-2607-0004" />
                <button type="submit">Escalate Privilege Exception</button>
              </form>
            </div>
            <p className="decision-lock-note">
              Production access control must be enforced server-side with IdP
              role claims, MFA/passkeys, device posture, session lifetime, and
              immutable audit records.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
