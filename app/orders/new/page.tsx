export default function NewOrderPage() {
  return (
    <main className="staff-page profile-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Client Order Entry</span>
        </a>
        <nav aria-label="New order navigation">
          <a href="/client/dashboard">Client Dashboard</a>
          <a href="/documents">Documents</a>
          <a className="nav-cta" href="/orders/new">New Order</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Approved Client Portal · Order Creation</p>
          <h1>Create Notarial Order</h1>
          <p>
            Submit an order request with service type, appointment details,
            signer information, document handling requirements, and billing controls.
          </p>
        </div>
        <aside>
          <p>Order state</p>
          <strong>Draft</strong>
          <span>Order access is available only to approved client users.</span>
        </aside>
      </section>

      <section className="profile-layout" aria-label="New order workspace">
        <aside className="console-rail">
          <p className="request-label">Order sections</p>
          <nav>
            {["Service", "Appointment", "Signer", "Documents", "Billing"].map((item) => (
              <a href={`#${item.toLowerCase()}`} key={item}><span>{item}</span></a>
            ))}
          </nav>
        </aside>
        <form className="profile-form">
          <div className="form-heading">
            <p>ORD draft</p>
            <h2>Order request details</h2>
          </div>
          <div className="field-row" id="service">
            <label>Service type<select name="Service type"><option>Loan signing appointment</option><option>Mobile notarial services</option><option>Electronic notarization</option><option>Remote online notarization</option></select></label>
            <label>Jurisdiction<input name="Jurisdiction" defaultValue="NC" /></label>
          </div>
          <div className="field-row" id="appointment">
            <label>Requested date<input name="Requested date" placeholder="Jul 22 2026" /></label>
            <label>Requested time<input name="Requested time" placeholder="10:30 AM ET" /></label>
          </div>
          <label id="signer">Signer or party information<textarea name="Signer information" rows={4} /></label>
          <label id="documents">Document handling instructions<textarea name="Document handling instructions" rows={4} /></label>
          <label id="billing">Billing reference<input name="Billing reference" placeholder="Closing file or matter number" /></label>
          <div className="form-actions">
            <button type="button">Submit Order Request</button>
            <p>Submission creates an order case file and records the requesting user.</p>
          </div>
        </form>
        <aside className="profile-sidebar">
          <section>
            <p className="request-label">Security</p>
            <strong>Document access logged</strong>
            <span>Uploads and downloads are tracked by user, order, and timestamp.</span>
          </section>
        </aside>
      </section>
    </main>
  );
}
