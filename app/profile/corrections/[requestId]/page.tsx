import { notFound } from "next/navigation";
import { findAccessRequest, getProfileVerificationItems } from "../../../staff/requests/data";

type CorrectionResponsePageProps = {
  params: Promise<{
    requestId: string;
  }>;
};

export default async function CorrectionResponsePage({
  params,
}: CorrectionResponsePageProps) {
  const { requestId } = await params;
  const request = findAccessRequest(requestId);
  if (!request) notFound();

  const correctionItems = getProfileVerificationItems(request).slice(0, 3);

  return (
    <main className="staff-page profile-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Profile Correction</span>
        </a>
        <nav aria-label="Correction navigation">
          <a href="/">Home</a>
          <a className="nav-cta" href="#correction-response">Correction Response</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Corrections Requested · Limited Edit Access</p>
          <h1>Profile Correction Response</h1>
          <div className="console-meta">
            <span>{request.id}</span>
            <span>{request.type} profile</span>
            <span>Corrections Requested</span>
          </div>
          <p>
            Update only the returned sections. Other profile sections remain
            locked for staff review to preserve evidence custody and audit history.
          </p>
        </div>
        <aside>
          <p>Next staff action</p>
          <strong>Resume GenAdmin Verification</strong>
          <span>Notarix staff reviews corrected evidence after resubmission.</span>
        </aside>
      </section>

      <section className="profile-layout" id="correction-response" aria-label="Correction response workspace">
        <aside className="console-rail">
          <section className="console-subject-card">
            <p className="request-label">Case file</p>
            <h2>{request.id}</h2>
            <span>{request.organization}</span>
          </section>
          <p className="request-label">Returned sections</p>
          <nav>
            {correctionItems.map((item) => (
              <a href={`#${item.section.toLowerCase()}`} key={item.requirement}>
                <span>{item.requirement}</span>
              </a>
            ))}
          </nav>
        </aside>

        <form className="profile-form">
          <div className="form-heading">
            <p>Correction packet</p>
            <h2>Returned profile sections</h2>
          </div>
          {correctionItems.map((item) => (
            <section className="profile-section" id={item.section.toLowerCase()} key={item.requirement}>
              <div>
                <p className="request-label">{item.section}</p>
                <h3>{item.requirement}</h3>
                <span>{item.reviewerNote}</span>
              </div>
              <label>
                Corrected explanation
                <textarea name={`${item.requirement} correction`} rows={4} />
              </label>
              <label>
                Replacement or supporting evidence
                <input name={`${item.requirement} evidence`} type="file" />
              </label>
            </section>
          ))}
          <div className="form-actions">
            <button type="button">Resubmit Corrections</button>
            <p>Resubmission returns this file to GenAdmin Verification.</p>
          </div>
        </form>

        <aside className="profile-sidebar">
          <section>
            <p className="request-label">Edit scope</p>
            <strong>Restricted to returned sections</strong>
            <span>Locked sections cannot be changed unless Notarix staff returns them for correction.</span>
          </section>
          <section>
            <p className="request-label">Support</p>
            <span>Contact support@notarix.live if a returned section appears incorrect.</span>
          </section>
        </aside>
      </section>
    </main>
  );
}
