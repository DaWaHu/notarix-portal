import { notFound } from "next/navigation";
import {
  finalActivationControls,
  findAccessRequest,
  profileNumberFormatExample,
} from "../../../staff/requests/data";

type ActiveProfilePageProps = {
  params: Promise<{
    requestId: string;
  }>;
};

export default async function ActiveProfilePage({ params }: ActiveProfilePageProps) {
  const { requestId } = await params;
  const request = findAccessRequest(requestId);
  if (!request) notFound();

  const profileNumber = request.approvedProfileNumber ?? profileNumberFormatExample(request.type);

  return (
    <main className="staff-page profile-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Approved Profile</span>
        </a>
        <nav aria-label="Active profile navigation">
          <a href="/">Home</a>
          <a className="nav-cta" href={request.type === "Client" ? "/client/dashboard" : "/notary/dashboard"}>
            Open Dashboard
          </a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Approved · Active Portal Access</p>
          <h1>Profile Activation Complete</h1>
          <div className="console-meta">
            <span>{profileNumber}</span>
            <span>{request.type} profile</span>
            <span>Active</span>
          </div>
          <p>
            Notarix Signings has approved this profile. Email and phone approval
            notifications are recorded when communication consent exists.
          </p>
        </div>
        <aside>
          <p>Assigned profile number</p>
          <strong>{profileNumber}</strong>
          <span>{request.organization}</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Activated permissions">
        {finalActivationControls.slice(0, 4).map((control) => (
          <article key={control}>
            <p>Activated control</p>
            <strong>{control}</strong>
            <span>Enabled only as approved during final review.</span>
          </article>
        ))}
      </section>

      <section className="profile-layout" aria-label="Active profile workspace">
        <aside className="console-rail">
          <section className="console-subject-card">
            <p className="request-label">Profile</p>
            <h2>{request.organization}</h2>
            <span>{request.name}</span>
          </section>
        </aside>
        <article className="profile-form">
          <div className="form-heading">
            <p>Welcome</p>
            <h2>Your Notarix Signings account is active</h2>
          </div>
          <section className="profile-section">
            <div>
              <p className="request-label">Next steps</p>
              <h3>Use approved portal functions only</h3>
              <span>
                Order, document, billing, payable, and RON permissions remain
                limited to the capabilities approved for this profile.
              </span>
            </div>
          </section>
        </article>
        <aside className="profile-sidebar">
          <section>
            <p className="request-label">Support</p>
            <strong>support@notarix.live</strong>
            <span>Contact staff for role changes, billing changes, or credential updates.</span>
          </section>
        </aside>
      </section>
    </main>
  );
}
