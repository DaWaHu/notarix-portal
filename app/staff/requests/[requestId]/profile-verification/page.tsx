import { notFound } from "next/navigation";
import { requireStaffRouteAccess } from "../../../../access-policy";
import {
  findAccessRequest,
  getProfileVerificationItems,
} from "../../data";
import { ProfileVerificationWorkspace } from "./VerificationRecords";

type StaffProfileVerificationPageProps = {
  params: Promise<{
    requestId: string;
  }>;
};

export default async function StaffProfileVerificationPage({
  params,
}: StaffProfileVerificationPageProps) {
  const { requestId } = await params;
  await requireStaffRouteAccess(`/staff/requests/${requestId}/profile-verification`, ["GenAdmin", "Admin", "SuperAdmin"]);

  const request = findAccessRequest(requestId);
  if (!request) notFound();

  const verificationItems = getProfileVerificationItems(request);
  const pendingCount = verificationItems.filter(
    (item) => item.status !== "Verified",
  ).length;
  const verificationSummary =
    request.type === "Notary"
      ? [
          ["Activation", "Locked", `${pendingCount} required controls unresolved.`],
          ["Credential posture", "Pending", "Identity, commission, insurance, RON, tax, and payable records."],
          ["RON authority", "Restricted", "Remote services remain disabled until authorization is verified."],
          ["Financial authority", "Restricted", "W-9 and payable activation require elevated approval."],
        ]
      : [
          ["Activation", "Locked", `${pendingCount} required controls unresolved.`],
          ["Client authority", "Pending", "Organization, representative, users, orders, and compliance records."],
          ["Order access", "Restricted", "Client order submission remains disabled until authority is verified."],
          ["Billing authority", "Restricted", "Billing setup and payment terms require elevated approval."],
        ];
  const reviewScope =
    request.type === "Notary"
      ? "credential evidence, payable readiness, RON authority, and activation restrictions"
      : "organization authority, billing readiness, user access, document controls, order permissions, and activation restrictions";

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Profile verification navigation">
          <a href="/">Home</a>
          <a href="/staff/requests">Staff Queue</a>
          <a href={`/staff/requests/${request.id}`}>Request Review</a>
          <a className="nav-cta" href={`/profile/complete/${request.id}`}>
            Submitted Profile
          </a>
          <a href="/auth/logout?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Staff Verification Console · Controlled Access</p>
          <h1>
            {request.type === "Notary"
              ? "Notary Profile Verification"
              : "Client Profile Verification"}
          </h1>
          <div className="console-meta" aria-label="Profile verification metadata">
            <span>{request.id}</span>
            <span>{request.type} profile</span>
            <span>{request.status}</span>
            <span>{pendingCount} items unresolved</span>
          </div>
          <p>
            Verify the submitted profile, {reviewScope} before Notarix Signings
            enables portal access.
          </p>
        </div>
        <aside>
          <p>Operational hold</p>
          <strong>Activation prohibited</strong>
          <span>{pendingCount} controls require staff verification and audit attribution.</span>
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
        <ProfileVerificationWorkspace items={verificationItems} request={request} />
      </section>
    </main>
  );
}
