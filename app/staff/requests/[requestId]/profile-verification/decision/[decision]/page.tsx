import { notFound } from "next/navigation";
import { requireChatGPTUser } from "../../../../../../chatgpt-auth";
import {
  activationDecisions,
  findAccessRequest,
  getProfileVerificationItems,
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
  await requireChatGPTUser(
    `/staff/requests/${requestId}/profile-verification/decision/${decision}`,
  );

  const request = findAccessRequest(requestId);
  if (!request || !validDecisionSlugs.has(decision)) notFound();

  const selectedDecision = activationDecisions.find(
    (item) => item.slug === (decision as ActivationDecisionSlug),
  );
  if (!selectedDecision) notFound();

  const verificationItems = getProfileVerificationItems(request);
  const openItems = verificationItems.filter((item) => item.status !== "Verified");

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
        </a>
        <nav aria-label="Activation decision navigation">
          <a href="/staff/requests">Staff Queue</a>
          <a href={`/staff/requests/${request.id}/profile-verification`}>
            Profile Verification
          </a>
          <a className="nav-cta" href={`/staff/requests/${request.id}`}>
            Request Review
          </a>
        </nav>
      </header>

      <section className="review-hero decision-hero">
        <div>
          <p className="kicker">Activation decision review</p>
          <h1>{selectedDecision.label}</h1>
          <p>
            Review the operational impact before changing the profile status for{" "}
            {request.name}. This screen prepares the staff decision record before
            database activation is connected.
          </p>
        </div>
        <aside>
          <p>{request.id}</p>
          <strong>{selectedDecision.outcome}</strong>
          <span>{selectedDecision.authority}</span>
        </aside>
      </section>

      <section className="decision-workspace" aria-label="Activation decision details">
        <article className="review-panel">
          <p className="request-label">Decision impact</p>
          <h2>{selectedDecision.outcome}</h2>
          <div className="decision-impact-grid">
            <section>
              <p>Staff action</p>
              <strong>{selectedDecision.staffAction}</strong>
            </section>
            <section>
              <p>Portal effect</p>
              <strong>{selectedDecision.portalEffect}</strong>
            </section>
            <section>
              <p>Audit entry</p>
              <strong>{selectedDecision.auditEntry}</strong>
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
    </main>
  );
}
