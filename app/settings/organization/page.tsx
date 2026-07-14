export default function OrganizationSettingsPage() {
  return (
    <main className="staff-page profile-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Organization Settings</span>
        </a>
        <nav aria-label="Organization settings navigation">
          <a href="/client/dashboard">Client Dashboard</a>
          <a href="/account/users">Users</a>
          <a className="nav-cta" href="/settings/organization">Settings</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Client Profile Settings · Controlled Updates</p>
          <h1>Organization Profile Controls</h1>
          <p>
            Maintain approved organization information while routing address,
            authority, billing, and document-handling changes through the
            appropriate review path.
          </p>
        </div>
        <aside>
          <p>Profile number</p>
          <strong>NSC-NC-2607-0001</strong>
          <span>Permanent after activation and never reused.</span>
        </aside>
      </section>

      <section className="profile-layout" aria-label="Organization settings workspace">
        <aside className="console-rail">
          <p className="request-label">Settings index</p>
          <nav>
            {["Organization", "Addresses", "Contacts", "Billing", "Documents"].map((label) => (
              <a href={`#${label.toLowerCase()}`} key={label}><span>{label}</span></a>
            ))}
          </nav>
        </aside>
        <form className="profile-form">
          <div className="form-heading">
            <p>Approved client profile</p>
            <h2>Coleman Title Group profile settings</h2>
          </div>
          <div className="field-row" id="organization">
            <label>Legal entity<input name="Legal entity" defaultValue="Coleman Title Group" /></label>
            <label>Client type<input name="Client type" defaultValue="Title company" /></label>
          </div>
          <div className="field-row" id="addresses">
            <label>Business address<input name="Business address" defaultValue="210 Market Street, Raleigh, NC 27601" /></label>
            <label>Mailing address<input name="Mailing address" defaultValue="PO Box 2401, Raleigh, NC 27602" /></label>
          </div>
          <div className="field-row" id="contacts">
            <label>Primary contact<input name="Primary contact" defaultValue="Avery Coleman" /></label>
            <label>Office phone<input name="Office phone" defaultValue="555-234-6789" /></label>
          </div>
          <label id="billing">Billing change request<textarea name="Billing change request" rows={4} placeholder="Describe requested billing or payment-term change." /></label>
          <label id="documents">Document handling update<textarea name="Document handling update" rows={4} placeholder="Describe delivery, retention, upload, or retrieval changes." /></label>
          <div className="form-actions">
            <button type="button">Submit Profile Change</button>
            <p>Restricted profile changes create a staff review record before taking effect.</p>
          </div>
        </form>
        <aside className="profile-sidebar">
          <section>
            <p className="request-label">Change control</p>
            <strong>Staff review required</strong>
            <span>Billing, authority, and document-handling changes remain restricted until approved.</span>
          </section>
        </aside>
      </section>
    </main>
  );
}
