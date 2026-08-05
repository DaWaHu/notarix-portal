import { notFound } from "next/navigation";
import { requireStaffRouteAccess } from "../../../../../../access-policy";
import {
  activationAuditRequirements,
  activationDecisions,
  canActivateProfile,
  findAccessRequest,
  generalAdminReviewers,
  getProfileVerificationItems,
  profileNumberAssignmentRule,
  profileNumberFormatExample,
  profileNumberLabel,
  type ActivationDecisionSlug,
} from "../../../../data";

type StaffDecisionPageProps = {
  params: Promise<{
    requestId: string;
    decision: string;
  }>;
};

const validDecisionSlugs = new Set<string>(
  activationDecisions.map((decision) => decision.slug),
);

export default async function StaffProfileDecisionPage({
  params,
}: StaffDecisionPageProps) {
  const { requestId, decision } = await params;
  await requireStaffRouteAccess(
    `/staff/requests/${requestId}/profile-verification/decision/${decision}`,
    ["Admin", "SuperAdmin"],
  );

  const request = findAccessRequest(requestId);
  if (!request || !validDecisionSlugs.has(decision)) notFound();

  const selectedDecision = activationDecisions.find(
    (item) => item.slug === (decision as ActivationDecisionSlug),
  );
  if (!selectedDecision) notFound();

  const verificationItems = getProfileVerificationItems(request);
  const openItems = verificationItems.filter((item) => item.status !== "Verified");
  const approvalBlocked = selectedDecision.slug === "approve" && !canActivateProfile(request);

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
        </a>
        <nav aria-label="Activation decision navigation">
          <a href="/">Home</a>
          <a href="/staff/requests">Staff Queue</a>
          <a href={`/staff/requests/${request.id}/profile-verification`}>
            Profile Verification
          </a>
          <a className="nav-cta" href={`/staff/requests/${request.id}`}>
            Request Review
          </a>
          <a href="/auth/logout?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero decision-hero">
        <div>
          <p className="kicker">Activation decision review</p>
          <h1>{approvalBlocked ? "Approval blocked" : selectedDecision.label}</h1>
          <p>
            Review the operational impact before changing the profile status for{" "}
            {request.name}. Activation decisions require stored verification records,
            staff identity, role authority, and audit history.
          </p>
        </div>
        <aside>
          <p>{request.id}</p>
          <strong>
            {approvalBlocked
              ? `${openItems.length} items must be resolved`
              : selectedDecision.outcome}
          </strong>
          <span>
            {request.approvedProfileNumber ??
              `${profileNumberPrefixText(request.type)} generated at approval`}
          </span>
        </aside>
      </section>

      <section className="decision-workspace" aria-label="Activation decision details">
        <article className="review-panel">
          <p className="request-label">Decision impact</p>
          <h2>
            {approvalBlocked
              ? "Profile cannot be approved yet"
              : selectedDecision.outcome}
          </h2>
          {approvalBlocked ? (
            <p className="decision-lock-note">
              Approval is blocked because stored verification records still contain
              pending, deficient, or restricted items. The {profileNumberLabel(request.type)}{" "}
              must be generated at activation, not reserved before approval.
            </p>
          ) : null}
          <div className="decision-impact-grid">
            <section>
              <p>Staff action</p>
              <strong>
                {approvalBlocked
                  ? "Return to profile verification and resolve every open credential, identity, RON, and payable review item before approval."
                  : selectedDecision.staffAction}
              </strong>
            </section>
            <section>
              <p>Portal effect</p>
              <strong>
                {approvalBlocked
                  ? "Portal access remains inactive. RON, documents, assignments, and payable permissions remain disabled."
                  : selectedDecision.portalEffect}
              </strong>
            </section>
            <section>
              <p>Audit entry</p>
              <strong>
                {approvalBlocked
                  ? "No activation audit entry may be recorded until approval is eligible."
                  : selectedDecision.auditEntry}
              </strong>
            </section>
          </div>
        </article>

        <aside className="review-panel decision-panel">
          <p className="request-label">Profile control</p>
          <h2>{request.name}</h2>
          <dl>
            <div>
              <dt>Request type</dt>
              <dd>{request.type}</dd>
            </div>
            <div>
              <dt>{profileNumberLabel(request.type)}</dt>
              <dd>{request.approvedProfileNumber ?? "Not assigned"}</dd>
            </div>
            <div>
              <dt>Activation assignment</dt>
              <dd>Not reserved before activation</dd>
            </div>
            <div>
              <dt>Numbering rule</dt>
              <dd>{profileNumberAssignmentRule(request.type)}</dd>
            </div>
            <div>
              <dt>Format example</dt>
              <dd>{profileNumberFormatExample(request.type)}</dd>
            </div>
            <div>
              <dt>Current status</dt>
              <dd>{request.status}</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>{request.email}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{request.phone}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="decision-workspace" aria-label="Decision safeguards">
        <article className="review-panel">
          <p className="request-label">Safeguards</p>
          <h2>Controls that must remain enforced</h2>
          <ul className="decision-safeguards">
            {selectedDecision.safeguards.map((safeguard) => (
              <li key={safeguard}>{safeguard}</li>
            ))}
          </ul>
        </article>

        <aside className="review-panel decision-panel">
          <p className="request-label">Open review items</p>
          <h2>{openItems.length} items not verified</h2>
          <div className="compact-verification-list">
            {openItems.map((item) => (
              <section key={`${item.section}-${item.requirement}`}>
                <span>{item.status}</span>
                <strong>{item.requirement}</strong>
                <p>{item.section}</p>
              </section>
            ))}
          </div>
        </aside>
      </section>

      <section className="decision-workspace" aria-label="Internal audit accountability">
        <article className="review-panel">
          <p className="request-label">Internal audit report</p>
          <h2>Approval accountability</h2>
          <div className="decision-impact-grid">
            {activationAuditRequirements.map((requirement) => (
              <section key={requirement}>
                <p>Audit field</p>
                <strong>{requirement}</strong>
              </section>
            ))}
          </div>
        </article>

        <aside className="review-panel decision-panel">
          <p className="request-label">General admin tracking</p>
          <h2>Reviewer identities</h2>
          <div className="compact-verification-list">
            {generalAdminReviewers.map((reviewer) => (
              <section key={reviewer}>
                <span>Staff ID</span>
                <strong>{reviewer}</strong>
                <p>Actions must be attributable in the internal audit report.</p>
              </section>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

function profileNumberPrefixText(type: "Client" | "Notary"): string {
  return type === "Notary" ? "NSN" : "NSC";
}
