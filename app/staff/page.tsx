import { requireStaffRouteAccess, type StaffRole } from "../access-policy";
import {
  auditReportRecords,
  credentialMonitorRecords,
  financialControlRecords,
  notificationRecords,
} from "../operations-data";
import { accessRequests } from "./requests/data";

const roleConfig: Record<
  StaffRole,
  {
    title: string;
    subtitle: string;
    primaryQueue: string;
    primaryHref: string;
    lockedCapability: string;
    summary: Array<[string, string, string]>;
    actions: Array<[string, string, string]>;
  }
> = {
  GenAdmin: {
    title: "GenAdmin Operations Home",
    subtitle:
      "Review intake records, verify profile evidence, prepare correction notices, and monitor credential or delivery issues before elevated approval.",
    primaryQueue: "Staff Queue",
    primaryHref: "/staff/requests",
    lockedCapability: "Final approval, financial activation, and restricted audit reports are unavailable to GenAdmin users.",
    summary: [
      ["Open requests", String(accessRequests.length), "Profile requests awaiting review or verification."],
      ["Evidence review", "Active", "Credential and profile evidence require staff attribution."],
      ["Communications", "Controlled", "Correction and invitation notices remain delivery logged."],
      ["Restricted access", "Enforced", "Financial approval and Super Admin audit reports are withheld."],
    ],
    actions: [
      ["Staff Queue", "/staff/requests", "Review access requests and open profile verification."],
      ["Profile Verification", "/staff/requests/NSR-1001/profile-verification", "Verify notary and client profile sections."],
      ["Order Operations", "/staff/orders", "Review order assignment, document, communication, and control posture."],
      ["Order Intake", "/staff/order-intake", "Review client and notary lifecycle submissions before staff release."],
      ["Signer Readiness", "/staff/signers", "Review signer identity method, witness, location, and readiness controls."],
      ["Appointments", "/staff/appointments", "Confirm signer, location, notary, document, and notice readiness."],
      ["Order Closeout", "/staff/order-closeout", "Review delivery, financial, retention, and final closeout controls."],
      ["Evidence Review", "/evidence/EV-IDENTITY-DOCUMENT-ANALYSIS", "Open restricted evidence through logged access."],
      ["Evidence Intake", "/staff/evidence-intake", "Review uploaded evidence custody, validation, and access controls."],
      ["Document Validation", "/staff/document-validation", "Review malware scan, hash, storage, and release status."],
      ["Retention", "/staff/retention", "Review retention holds and deletion eligibility before escalation."],
      ["Communications", "/notifications", "Monitor invitations, corrections, and delivery holds."],
      ["Credential Renewal", "/credentials/expiration", "Review expiring credentials before eligibility is affected."],
    ],
  },
  Admin: {
    title: "Admin Operations Home",
    subtitle:
      "Complete elevated approval, manage financial controls, review payment reporting, and resolve communication or credential issues.",
    primaryQueue: "Elevated Approval",
    primaryHref: "/staff/elevated-approval",
    lockedCapability: "Super Admin audit retention holds and ledger correction overrides remain restricted.",
    summary: [
      ["Elevated approval", "Ready", "Files requiring Administrator or Super Admin final decision."],
      ["Financial controls", String(financialControlRecords.length), "Billing, payable, and invoice-term controls."],
      ["Financial reports", "Available", "Ledger reports connect evidence and authority."],
      ["Audit visibility", "Limited", "Restricted Super Admin reports require elevated audit role."],
    ],
    actions: [
      ["Elevated Approval", "/staff/elevated-approval", "Review files ready for final approval."],
      ["Order Operations", "/staff/orders", "Control order assignment, document release, communication, and escalation."],
      ["Order Intake", "/staff/order-intake", "Route portal order submissions into validation, finance, and closeout review."],
      ["Signer Readiness", "/staff/signers", "Resolve identity, signer presence, witness, and RON readiness issues."],
      ["Appointments", "/staff/appointments", "Confirm appointment readiness and resolve scheduling holds."],
      ["Order Closeout", "/staff/order-closeout", "Control final delivery, invoice routing, payable release, and closeout status."],
      ["Financial Controls", "/staff/financial-controls", "Approve billing and payable activation where authorized."],
      ["Evidence Intake", "/staff/evidence-intake", "Review uploaded evidence before profile, order, or finance release."],
      ["Document Validation", "/staff/document-validation", "Control malware validation, quarantine, and evidence release."],
      ["Financial Reports", "/staff/financial-reports", "Review payment ledger posture and export reports."],
      ["Command Activity", "/staff/command-center/activity", "Review completed and blocked command-center actions."],
      ["Retention", "/staff/retention", "Review legal holds, deletion eligibility, and records policy controls."],
      ["Platform Configuration", "/staff/platform", "Review service, credential, notification, retention, and provider rules."],
      ["Access Control", "/staff/access-control", "Review MFA, passkeys, device posture, and staff session controls."],
      ["System Health", "/staff/system-health", "Review backup, recovery, and provider readiness posture."],
      ["Integrations", "/staff/integrations", "Review provider readiness, callbacks, and data access controls."],
      ["Deployment Readiness", "/staff/deployment-readiness", "Review production bindings, runtime secrets, and callback replay readiness."],
      ["Communications", "/notifications", "Resolve delivery failures and consent holds."],
      ["Credential Renewal", "/credentials/expiration", "Review renewal restrictions before service access changes."],
    ],
  },
  SuperAdmin: {
    title: "Super Admin Operations Home",
    subtitle:
      "Control restricted audit reporting, financial reports, elevated approvals, evidence access, retention holds, and system-level exceptions.",
    primaryQueue: "Audit Reports",
    primaryHref: "/staff/audit-reports",
    lockedCapability: "All restricted controls are visible here; production actions still require MFA, device controls, and immutable audit logging.",
    summary: [
      ["Audit reports", String(auditReportRecords.length), "Restricted audit events available for executive review."],
      ["Financial reports", String(financialControlRecords.length), "Ledger and financial-control records under authority review."],
      ["Credential risks", String(credentialMonitorRecords.length), "Credential renewal controls affecting eligibility."],
      ["Notifications", String(notificationRecords.length), "Delivery, consent, and failure records tied to workflows."],
    ],
    actions: [
      ["Audit Reporting", "/staff/audit-reports", "Review immutable audit events and retention holds."],
      ["Order Operations", "/staff/orders", "Control order lifecycle, assignment, document release, and operational holds."],
      ["Order Intake", "/staff/order-intake", "Review role-submitted order lifecycle events and closeout handoffs."],
      ["Signer Readiness", "/staff/signers", "Review signer identity readiness, witness exceptions, and appointment constraints."],
      ["Appointments", "/staff/appointments", "Review appointment readiness, notice failures, and scheduling exceptions."],
      ["Order Closeout", "/staff/order-closeout", "Control final order delivery, financial release, retention, and closure."],
      ["Financial Reports", "/staff/financial-reports", "Review ledger reports and correction locks."],
      ["Financial Controls", "/staff/financial-controls", "Control payable, billing, and ledger restrictions."],
      ["Evidence Intake", "/staff/evidence-intake", "Review evidence custody, restricted access, and validation posture."],
      ["Document Validation", "/staff/document-validation", "Review release, quarantine, and restricted evidence validation."],
      ["Command Activity", "/staff/command-center/activity", "Review command receipts, blocked attempts, and authority results."],
      ["Retention", "/staff/retention", "Control retention holds, deletion review, and policy exceptions."],
      ["Platform Configuration", "/staff/platform", "Control service rules, retention policy, financial rules, and provider readiness."],
      ["Access Control", "/staff/access-control", "Control identity-provider, RBAC, device, and session posture."],
      ["System Health", "/staff/system-health", "Review recovery, provider health, identity, and storage readiness."],
      ["Integrations", "/staff/integrations", "Control provider integrations, callbacks, data scopes, and degradation."],
      ["Deployment Readiness", "/staff/deployment-readiness", "Control production bindings, runtime secrets, and callback replay readiness."],
      ["Elevated Approval", "/staff/elevated-approval", "Grant final approval after verification and audit review."],
      ["Restricted Evidence", "/evidence/EV-W9-FORM", "Open restricted evidence with access attribution."],
    ],
  },
};

export default async function StaffRoleHomePage() {
  const { role, user } = await requireStaffRouteAccess("/staff", [
    "GenAdmin",
    "Admin",
    "SuperAdmin",
  ]);
  const config = roleConfig[role];

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Role-based staff navigation">
          <a href="/">Home</a>
          <a className="nav-cta" href="/staff">Staff Home</a>
          <a href="/staff/requests">Staff Queue</a>
          <a href="/staff/elevated-approval">Elevated Approval</a>
          <a href="/staff/financial-controls">Financial Controls</a>
          <a href="/auth/logout?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Role-Based Portal Routing · Controlled Access</p>
          <h1>{config.title}</h1>
          <p>{config.subtitle}</p>
        </div>
        <aside>
          <p>Signed-in staff</p>
          <strong>{role}</strong>
          <span>{user.displayName}</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Role-based staff summary">
        {config.summary.map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Role-based staff workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Primary route</p>
              <h2>{config.primaryQueue}</h2>
              <span>Routing is based on staff role and approved authority.</span>
            </section>
            <p className="request-label">Role index</p>
            <nav>
              {config.actions.map(([label, href]) => (
                <a href={href} key={label}>
                  <span>{label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Authorized workspace</p>
                <h2>{role} routing matrix</h2>
              </div>
              <strong>{config.actions.length} destinations</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Role-based portal destinations</caption>
                <thead>
                  <tr>
                    <th scope="col">Destination</th>
                    <th scope="col">Purpose</th>
                    <th scope="col">Authority</th>
                    <th scope="col">Status</th>
                    <th scope="col">Access note</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {config.actions.map(([label, href, purpose]) => (
                    <tr key={label}>
                      <td><span>{role}</span><strong>{label}</strong></td>
                      <td>{purpose}</td>
                      <td>{role}</td>
                      <td><mark>Available</mark></td>
                      <td>Requires authenticated staff session and audit-aware workflow.</td>
                      <td><a href={href}>Open</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Access command center</p>
            <h2>Role restrictions</h2>
            <p className="activation-summary">{config.lockedCapability}</p>
            <dl>
              <div><dt>Authentication</dt><dd>MFA/passkey-capable staff access required</dd></div>
              <div><dt>Least privilege</dt><dd>Routes show only role-appropriate destinations</dd></div>
              <div><dt>Auditability</dt><dd>Workflow actions must identify staff account</dd></div>
              <div><dt>Primary route</dt><dd><a href={config.primaryHref}>{config.primaryQueue}</a></dd></div>
            </dl>
            <div className="decision-actions">
              <a href={config.primaryHref}>Open Primary Workspace</a>
              <a href="/notifications">Open Communications</a>
              <a href="/credentials/expiration">Open Credential Monitor</a>
              {(role === "Admin" || role === "SuperAdmin") && (
                <a href="/staff/deployment-readiness">Open Deployment Readiness</a>
              )}
            </div>
            <p className="decision-lock-note">
              Production role routing should be enforced by the identity
              provider, server-side RBAC checks, and immutable audit logging.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
