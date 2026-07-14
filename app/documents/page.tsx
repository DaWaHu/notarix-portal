import { documentRecords } from "../operations-data";

export default function DocumentsPage() {
  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Document Vault</span>
        </a>
        <nav aria-label="Document navigation">
          <a href="/client/dashboard">Client Dashboard</a>
          <a href="/notary/dashboard">Notary Dashboard</a>
          <a className="nav-cta" href="/documents">Documents</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Secure Documents · Evidence And Order Files</p>
          <h1>Document Vault</h1>
          <p>
            Review uploaded order documents, restricted identity records,
            custody source, scan status, and approved access boundaries.
          </p>
        </div>
        <aside>
          <p>Access model</p>
          <strong>Role-based</strong>
          <span>Every document access event must be logged.</span>
        </aside>
      </section>

      <section className="verification-layout" aria-label="Document vault workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <p className="request-label">Document views</p>
            <nav>
              {["All Documents", "Restricted", "Malware Scan", "Order Files", "Evidence"].map((label) => (
                <a href={`#${label.toLowerCase().replaceAll(" ", "-")}`} key={label}><span>{label}</span></a>
              ))}
            </nav>
          </aside>

          <article className="console-main" id="all-documents">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Custody register</p>
                <h2>Uploaded document controls</h2>
              </div>
              <strong>{documentRecords.length} records</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Document custody register</caption>
                <thead>
                  <tr>
                    <th scope="col">Document</th>
                    <th scope="col">Order</th>
                    <th scope="col">Status</th>
                    <th scope="col">Access</th>
                    <th scope="col">Received</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documentRecords.map((document) => (
                    <tr key={document.id}>
                      <td><span>{document.id}</span><strong>{document.fileName}</strong></td>
                      <td>{document.order}<span className="evidence-packet-summary">{document.custody}</span></td>
                      <td><mark>{document.status}</mark></td>
                      <td>{document.access}</td>
                      <td>{document.received}</td>
                      <td><a href={`/evidence/${document.evidenceId}`}>Open</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Document policy</p>
            <h2>Vault controls</h2>
            <dl>
              <div><dt>Malware scanning</dt><dd>Required before staff reliance</dd></div>
              <div><dt>Restricted identity records</dt><dd>Limited to approved roles</dd></div>
              <div><dt>Download logging</dt><dd>User, order, and timestamp required</dd></div>
              <div><dt>Replacement rules</dt><dd>Prior version remains auditable</dd></div>
            </dl>
          </aside>
        </div>
      </section>
    </main>
  );
}
