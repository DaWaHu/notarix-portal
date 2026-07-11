import { notFound } from "next/navigation";
import { requireChatGPTUser } from "../../../../chatgpt-auth";
import {
  findAccessRequest,
  getProfileVerificationItems,
  type ProfileVerificationItem,
} from "../../data";

type StaffProfileVerificationPageProps = {
  params: Promise<{
    requestId: string;
  }>;
};

const verificationSummary = [
  ["Submitted profile", "Received", "Profile completion received for staff review."],
  ["Credentials", "Pending", "Each required record must be verified before activation."],
  ["Portal status", "Inactive", "Portal access remains disabled until final approval."],
  ["Financial access", "Restricted", "Payable permissions require elevated approval."],
] as const;

export default async function StaffProfileVerificationPage({
  params,
}: StaffProfileVerificationPageProps) {
  const { requestId } = await params;
  await requireChatGPTUser(`/staff/requests/${requestId}/profile-verification`);

  const request = findAccessRequest(requestId);
  if (!request) notFound();

  const verificationItems = getProfileVerificationItems(request);
  const pendingCount = verificationItems.filter(
    (item) => item.status !== "Verified",
  ).length;

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
        </a>
        <nav aria-label="Profile verification navigation">
          <a href="/staff/requests">Staff Queue</a>
          <a href={`/staff/requests/${request.id}`}>Request Review</a>
          <a className="nav-cta" href={`/profile/complete/${request.id}`}>
            Submitted Profile
          </a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Profile verification workspace</p>
          <h1>{request.id}</h1>
          <p>
            Verify the submitted profile, credential evidence, payable readiness,
            and activation restrictions before Notarix staff enables portal access.
          </p>
        </div>
        <aside>
          <p>Activation decision</p>
          <strong>{pendingCount} items require review</strong>
          <span>Account remains inactive until staff approval is complete.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Verification status">
        {verificationSummary.map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Profile verification details">
        <article className="review-panel">
          <div className="review-panel-heading">
            <p className="request-label">Submitted profile</p>
            <h2>{request.name}</h2>
          </div>

          <div className="summary-grid verification-profile-summary">
            <section>
              <p className="request-label">Profile type</p>
              <strong>{request.type}</strong>
              <span>{request.service}</span>
            </section>
            <section>
              <p className="request-label">Organization</p>
              <strong>{request.organization}</strong>
              <span>{request.jurisdiction}</span>
            </section>
            <section>
              <p className="request-label">Contact</p>
              <strong>{request.email}</strong>
              <span>{request.phone}</span>
            </section>
            <section>
              <p className="request-label">Current status</p>
              <strong>{request.status}</strong>
              <span>{request.nextAction}</span>
            </section>
          </div>

          <div className="verification-list">
            {verificationItems.map((item) => (
              <VerificationRecord item={item} key={`${item.section}-${item.requirement}`} />
            ))}
          </div>
        </article>

        <aside className="review-panel decision-panel">
          <p className="request-label">Final activation controls</p>
          <h2>Staff decision</h2>
          <dl>
            <div>
              <dt>Portal access</dt>
              <dd>Disabled until all required items are verified.</dd>
            </div>
            <div>
              <dt>RON access</dt>
              <dd>Restricted unless state authorization and digital certificate are verified.</dd>
            </div>
            <div>
              <dt>Financial changes</dt>
              <dd>Administrator or Super Admin approval required.</dd>
            </div>
          </dl>
          <div className="decision-actions">
            <button type="button">Approve Profile</button>
            <button type="button">Request Corrections</button>
            <button type="button">Keep Inactive</button>
          </div>
        </aside>
      </section>
    </main>
  );
}

function VerificationRecord({ item }: { item: ProfileVerificationItem }) {
  return (
    <section className="verification-record">
      <div>
        <p className="request-label">{item.section}</p>
        <h3>{item.requirement}</h3>
        <p>{item.evidence}</p>
      </div>
      <mark data-status={item.status}>{item.status}</mark>
      <p>{item.reviewerNote}</p>
      <div className="verification-actions">
        <button type="button">Mark Verified</button>
        <button type="button">Flag Deficiency</button>
        <button type="button">View Evidence</button>
      </div>
    </section>
  );
}
