import { notFound } from "next/navigation";
import { requireStaffRouteAccess } from "../../../../access-policy";
import { findAccessRequest } from "../../data";

type InvitationPageProps = {
  params: Promise<{
    requestId: string;
  }>;
};

const profileRequirements = {
  Client: [
    "Organization profile and service location",
    "Authorized account administrator",
    "Billing contact and payment preference",
    "Authorized users who may submit orders",
    "Document handling and communication preferences",
  ],
  Notary: [
    "Commission profile and primary jurisdiction",
    "Identity and contact verification",
    "Credential uploads and expiration dates",
    "Service area and availability",
    "Electronic or RON authorization only when applicable",
  ],
} as const;

export default async function StaffInvitationPage({
  params,
}: InvitationPageProps) {
  const { requestId } = await params;
  await requireStaffRouteAccess(`/staff/requests/${requestId}/invitation`, ["GenAdmin", "Admin", "SuperAdmin"]);

  const request = findAccessRequest(requestId);
  if (!request) notFound();

  const profileType =
    request.type === "Client" ? "Client Portal Profile" : "Notary Portal Profile";
  const completionWindow = "7 calendar days";
  const expiresAt = "Jul 18 2026 at 5:00 PM ET";

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
        </a>
        <nav aria-label="Staff invitation navigation">
          <a href="/">Home</a>
          <a href="/staff/requests">Staff Queue</a>
          <a href={`/staff/requests/${request.id}`}>Review Record</a>
          <a className="nav-cta" href={`/staff/requests/${request.id}/invitation`}>
            Invitation
          </a>
          <a href="/auth/logout?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero invitation-hero">
        <div>
          <p className="kicker">Profile invitation preparation</p>
          <h1>{request.id}</h1>
          <p>
            Prepare the secure profile-completion invitation for {request.name}.
            The account remains inactive until staff verifies the completed
            profile and any required credentials.
          </p>
        </div>
        <aside>
          <p>Invitation target</p>
          <strong>{profileType}</strong>
          <span>Expires {expiresAt}</span>
        </aside>
      </section>

      <section className="invitation-layout" aria-label="Invitation workspace">
        <article className="review-panel invitation-preview">
          <div className="review-panel-heading">
            <p className="request-label">Recipient</p>
            <h2>{request.name}</h2>
          </div>

          <div className="summary-grid invitation-summary">
            <section>
              <p className="request-label">Email</p>
              <strong>{request.email}</strong>
              <span>{request.phone}</span>
            </section>
            <section>
              <p className="request-label">Organization</p>
              <strong>{request.organization}</strong>
              <span>{request.jurisdiction}</span>
            </section>
            <section>
              <p className="request-label">Profile type</p>
              <strong>{profileType}</strong>
              <span>{request.invitationTarget}</span>
            </section>
            <section>
              <p className="request-label">Completion window</p>
              <strong>{completionWindow}</strong>
              <span>{expiresAt}</span>
            </section>
          </div>

          <section className="message-preview" aria-label="Invitation message preview">
            <p className="request-label">Message preview</p>
            <h3>Complete your Notarix Signings profile</h3>
            <p>Hello {request.name},</p>
            <p>
              Notarix Signings has reviewed your portal access request and is
              ready for you to complete your secure {profileType.toLowerCase()}.
              Please complete the required profile sections by {expiresAt}.
            </p>
            <p>
              Portal access will remain inactive until Notarix staff completes
              final review and activation.
            </p>
            <a href={request.invitationUrl}>Preview Profile Completion Page</a>
          </section>
        </article>

        <aside className="review-panel decision-panel invitation-control">
          <p className="request-label">Staff controls</p>
          <h2>Invitation status</h2>
          <dl>
            <div>
              <dt>Current request status</dt>
              <dd>{request.status}</dd>
            </div>
            <div>
              <dt>Post-send status</dt>
              <dd>Profile Invitation Sent</dd>
            </div>
            <div>
              <dt>Security rule</dt>
              <dd>Single recipient, staff-issued, audit logged</dd>
            </div>
          </dl>
          <div className="decision-actions">
            <button type="button">Send Invitation</button>
            <button type="button">Save Draft</button>
            <button type="button">Cancel Invitation</button>
          </div>
        </aside>
      </section>

      <section className="checklist-grid" aria-label="Profile completion requirements">
        <article className="review-panel checklist-panel">
          <p className="request-label">Required profile sections</p>
          <ul>
            {profileRequirements[request.type].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="review-panel checklist-panel">
          <p className="request-label">Before sending</p>
          <ul>
            <li>Confirm email address and phone number format.</li>
            <li>Confirm the correct profile type is selected.</li>
            <li>Confirm access remains inactive until staff approval.</li>
            <li>Confirm the invitation action will be auditable.</li>
          </ul>
        </article>
        <article className="review-panel checklist-panel">
          <p className="request-label">After completion</p>
          <ul>
            <li>Staff receives profile-completion notification.</li>
            <li>Submitted profile moves to GenAdmin Verification.</li>
            <li>Correction requests reopen only the flagged profile sections.</li>
            <li>Activation occurs only after Administrator or Super Admin final approval.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
