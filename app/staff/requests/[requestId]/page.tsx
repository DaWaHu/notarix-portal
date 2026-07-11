import { notFound } from "next/navigation";
import { requireChatGPTUser } from "../../../chatgpt-auth";
import { findAccessRequest } from "../data";

type StaffRequestReviewPageProps = {
  params: Promise<{
    requestId: string;
  }>;
};

export default async function StaffRequestReviewPage({
  params,
}: StaffRequestReviewPageProps) {
  const { requestId } = await params;
  await requireChatGPTUser(`/staff/requests/${requestId}`);

  const request = findAccessRequest(requestId);
  if (!request) notFound();

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
        </a>
        <nav aria-label="Staff review navigation">
          <a href="/staff/requests">Staff Queue</a>
          <a href="/portal">Access Form</a>
          <a className="nav-cta" href={`/staff/requests/${request.id}`}>
            Open Review
          </a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Staff review record</p>
          <h1>{request.id}</h1>
          <p>
            Review the request, confirm eligibility, issue the correct profile
            invitation, and keep the account inactive until staff approval is
            complete.
          </p>
        </div>
        <aside>
          <p>Current status</p>
          <strong>{request.status}</strong>
          <span>{request.nextAction}</span>
        </aside>
      </section>

      <section className="review-layout" aria-label="Staff review workspace">
        <article className="review-panel summary-panel">
          <div className="review-panel-heading">
            <p className="request-label">Request summary</p>
            <h2>{request.name}</h2>
          </div>
          <div className="summary-grid">
            <section>
              <p className="request-label">Request type</p>
              <strong>{request.type}</strong>
              <span>Received {request.received}</span>
            </section>
            <section>
              <p className="request-label">Organization</p>
              <strong>{request.organization}</strong>
              <span>{request.invitationTarget}</span>
            </section>
            <section>
              <p className="request-label">Contact</p>
              <strong>{request.email}</strong>
              <span>{request.phone}</span>
            </section>
            <section>
              <p className="request-label">Service</p>
              <strong>{request.service}</strong>
              <span>{request.jurisdiction}</span>
            </section>
          </div>
          <div className="staff-note">
            <p className="request-label">Staff review note</p>
            <p>{request.notes}</p>
          </div>
        </article>

        <aside className="review-panel decision-panel">
          <p className="request-label">Activation control</p>
          <h2>{request.risk} review</h2>
          <dl>
            <div>
              <dt>Reviewer</dt>
              <dd>{request.reviewer}</dd>
            </div>
            <div>
              <dt>Portal access</dt>
              <dd>Inactive until approval</dd>
            </div>
            <div>
              <dt>Financial permissions</dt>
              <dd>Disabled pending profile verification</dd>
            </div>
          </dl>
          <div className="decision-actions">
            <button type="button">Send Profile Invitation</button>
            <button type="button">Mark Credential Review</button>
            <button type="button">Place On Hold</button>
          </div>
        </aside>
      </section>

      <section className="checklist-grid" aria-label="Verification checklist">
        <ReviewChecklist title="Eligibility review" items={request.eligibilityItems} />
        <ReviewChecklist title="Credential review" items={request.credentialItems} />
        <ReviewChecklist title="Activation requirements" items={request.activationItems} />
      </section>

      <section className="review-panel audit-panel" aria-label="Audit history">
        <div className="review-panel-heading">
          <p className="request-label">Audit intelligence</p>
          <h2>Review history</h2>
        </div>
        <ol>
          {request.auditEvents.map((event) => (
            <li key={event}>{event}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}

function ReviewChecklist({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <article className="review-panel checklist-panel">
      <p className="request-label">{title}</p>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
