import { PortalAccessForm } from "./PortalAccessForm";

export default function PortalAccessPage() {
  return (
    <main className="staff-page portal-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Onboarding Operations</span>
        </a>
        <nav aria-label="Portal navigation">
          <a href="/">Home</a>
          <a className="nav-cta" href="#access-request">Contact Form</a>
        </nav>
      </header>

      <section className="review-hero portal-intake-hero">
        <div>
          <p className="kicker">Contact Received · Intake Start</p>
          <h1>Notarix Signings Access Request</h1>
          <p>
            Submit the initial contact form so Notarix staff can create an NSR
            intake record and send the correct client or notary profile invitation.
          </p>
        </div>
        <aside>
          <p>Next staff action</p>
          <strong>NSR intake review</strong>
          <span>Portal access remains inactive until profile verification and elevated approval are complete.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Access request process">
        {[
          ["Step 1", "Contact form", "Client, notary, law firm, title company, or customer submits the intake request."],
          ["Step 2", "NSR created", "Notarix staff converts the contact form into a controlled intake record."],
          ["Step 3", "Profile invitation", "The correct profile completion page is issued for required uploads."],
          ["Step 4", "Staff verification", "GenAdmin and elevated approvers verify and activate only approved permissions."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="intake-layout" id="access-request" aria-label="Access request workspace">
        <aside className="console-rail" aria-label="Access request process">
          <section className="console-subject-card" aria-label="Request status">
            <p className="request-label">Workflow entry</p>
            <h2>Contact Received</h2>
            <span>Before NSR assignment</span>
          </section>
          <p className="request-label">Process path</p>
          <nav>
            {["Contact Form", "NSR Created", "Profile Invitation", "Profile Submitted", "GenAdmin Verification", "Elevated Approval"].map((item) => (
              <a href="#access-request" key={item}>
                <span>{item}</span>
              </a>
            ))}
          </nav>
        </aside>

        <PortalAccessForm />

        <aside className="profile-sidebar">
          <section>
            <p className="request-label">Security posture</p>
            <strong>Controlled intake</strong>
            <span>No portal, order, RON, billing, or payable access is granted from this form.</span>
          </section>
          <section>
            <p className="request-label">After submission</p>
            <ul>
              <li>Notarix staff reviews the request.</li>
              <li>An NSR intake record is created when accepted for onboarding.</li>
              <li>The applicant receives the correct profile completion link.</li>
            </ul>
          </section>
        </aside>
      </section>
    </main>
  );
}
