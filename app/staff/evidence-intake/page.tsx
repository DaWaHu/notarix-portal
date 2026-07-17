import { requireChatGPTUser } from "../../chatgpt-auth";
import { listEvidenceStorageControls } from "../../evidence-repository";

type EvidenceIntakePageProps = {
  searchParams: Promise<{
    evidenceId?: string;
    fileName?: string;
    upload?: string;
  }>;
};

function evidenceAnchor(label: string) {
  return label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function EvidenceIntakePage({
  searchParams,
}: EvidenceIntakePageProps) {
  await requireChatGPTUser("/staff/evidence-intake");
  const evidenceRecords = await listEvidenceStorageControls();
  const uploadFeedback = await searchParams;
  const uploadIssued = uploadFeedback.upload === "issued";
  const uploadCompleted = uploadFeedback.upload === "completed";

  const profileEvidence = evidenceRecords.filter(
    (record) => record.source === "Profile Verification",
  ).length;
  const orderEvidence = evidenceRecords.filter(
    (record) => record.source === "Order Document",
  ).length;
  const restrictedEvidence = evidenceRecords.filter((record) =>
    record.accessLevel.toLowerCase().includes("restricted"),
  ).length;
  const scanCompleteCount = evidenceRecords.filter((record) =>
    record.malwareStatus.toLowerCase().includes("complete"),
  ).length;
  const releaseBlockedCount = evidenceRecords.filter(
    (record) => record.releaseEligibility !== "Release Eligible",
  ).length;

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Evidence intake navigation">
          <a href="/">Home</a>
          <a href="/staff">Staff Home</a>
          <a href="/staff/requests">Staff Queue</a>
          <a href="/staff/document-validation">Document Validation</a>
          <a href="/staff/financial-controls">Financial Controls</a>
          <a href="/credentials/expiration">Credentials</a>
          <a className="nav-cta" href="/staff/evidence-intake">Evidence Intake</a>
          <a href="/signout-with-chatgpt?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Evidence Intake · Upload Review Controls</p>
          <h1>Evidence Upload And Intake Review</h1>
          <p>
            Review submitted profile credentials, provider results, order
            documents, restricted identity records, tax files, billing
            authorizations, custody classification, scan status, retention
            policy, and access controls before evidence is released into profile,
            order, credential, financial, or audit workflows.
          </p>
        </div>
        <aside>
          <p>Evidence custody</p>
          <strong>{evidenceRecords.length} files under review</strong>
          <span>Uploaded records must retain scan, custody, and access context.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Evidence intake summary">
        {[
          ["Profile evidence", String(profileEvidence), "Credentials and onboarding records tied to NSR requests."],
          ["Order documents", String(orderEvidence), "Client-uploaded documents tied to active order files."],
          ["Restricted files", String(restrictedEvidence), "Identity, tax, financial, and RON evidence requiring controlled access."],
          ["Scan complete", String(scanCompleteCount), "Records with malware scan or provider integrity status already recorded."],
          ["Release blocked", String(releaseBlockedCount), "Files held by storage, malware, or restricted-access controls."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Evidence intake workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Intake queue</p>
              <h2>Submitted evidence</h2>
              <span>
                Review scan status, custody, retention, and workflow linkage
                before staff verification or order processing.
              </span>
            </section>
            <p className="request-label">Evidence index</p>
            <nav>
              {[
                "Profile Verification",
                "Provider Result",
                "Order Document",
                "Restricted Access",
                "Financial Evidence",
                "RON Evidence",
              ].map((label) => (
                <a href="#evidence-intake-matrix" key={label}>
                  <span>{label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main" id="evidence-intake-matrix">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Evidence intake register</p>
                <h2>Upload custody and validation matrix</h2>
              </div>
              <strong>{evidenceRecords.length} records</strong>
            </header>
            {uploadIssued || uploadCompleted ? (
              <section className="review-panel command-feedback-panel" aria-label="Latest evidence upload result">
                <p className="request-label">Latest upload result</p>
                {uploadIssued ? (
                  <>
                    <h3>Upload URL Issued · {uploadFeedback.evidenceId}</h3>
                    <p>
                      {uploadFeedback.fileName ?? "Submitted evidence"} received
                      a signed upload URL. The evidence remains blocked until
                      upload completion, malware validation, storage binding,
                      custody attribution, and release controls are recorded.
                    </p>
                  </>
                ) : (
                  <>
                    <h3>Upload Completed · {uploadFeedback.evidenceId}</h3>
                    <p>
                      Encrypted object storage has acknowledged the upload. The
                      evidence is now marked Upload received; malware validation
                      pending. It remains blocked until malware validation and
                      staff release controls clear.
                    </p>
                  </>
                )}
              </section>
            ) : null}
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Evidence upload and intake review records</caption>
                <thead>
                  <tr>
                    <th scope="col">Evidence</th>
                    <th scope="col">Source</th>
                    <th scope="col">Custody</th>
                    <th scope="col">Scan / storage</th>
                    <th scope="col">Access</th>
                    <th scope="col">Release</th>
                    <th scope="col">Retention</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {evidenceRecords.map((record) => (
                    <tr key={record.id} id={evidenceAnchor(record.id)}>
                      <td>
                        <span>{record.id} · {record.fileType}</span>
                        <strong>{record.title}</strong>
                        <span className="evidence-packet-summary">
                          {record.fileName} · {record.size}
                        </span>
                      </td>
                      <td>
                        {record.source}
                        <span className="evidence-packet-summary">
                          {record.requestId ?? record.orderId ?? "Provider evidence"}
                        </span>
                      </td>
                      <td>
                        {record.custody}
                        <span className="evidence-packet-summary">
                          Received {record.received}
                        </span>
                      </td>
                      <td>
                        <mark>{record.malwareStatus}</mark>
                        <span className="evidence-packet-summary">
                          {record.objectKey}
                        </span>
                      </td>
                      <td>
                        {record.accessLevel}
                        <span className="evidence-packet-summary">
                          Last accessed {record.lastAccessed}
                        </span>
                      </td>
                      <td>
                        {record.releaseEligibility}
                        <span className="evidence-packet-summary">
                          {record.releaseBlockedReason}
                        </span>
                      </td>
                      <td>{record.retentionRule}</td>
                      <td>
                        <a className="table-action-link" href={`/evidence/${record.id}`}>
                          Open Evidence
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Upload control center</p>
            <h2>Validation gates</h2>
            <p className="activation-summary">
              Evidence should not become usable in profile verification, order
              processing, payment, RON, or audit workflows until upload
              validation, malware scanning, custody assignment, and access
              classification are recorded.
            </p>
            <dl>
              <div><dt>Upload intake</dt><dd>Source workflow and owner record required</dd></div>
              <div><dt>Validation</dt><dd>File type, size, hash, and malware scan recorded</dd></div>
              <div><dt>Custody</dt><dd>Provider, profile, order, tax, or restricted identity classification</dd></div>
              <div><dt>Storage</dt><dd>Encrypted object storage and signed access URLs required in production</dd></div>
              <div><dt>Release</dt><dd>Files remain blocked until storage and malware controls clear</dd></div>
              <div><dt>Audit</dt><dd>Every restricted view remains attributable</dd></div>
            </dl>
            <form className="stacked-form" action="/staff/evidence-intake/upload" method="post">
              <label>
                File name
                <input name="fileName" placeholder="seller-closing-package.pdf" required />
              </label>
              <label>
                Owner record
                <input name="orderId" placeholder="ORD-NC-2607-0001 or NSR-1001" />
              </label>
              <label>
                Source workflow
                <select name="source" defaultValue="Order Document">
                  <option>Order Document</option>
                  <option>Profile Verification</option>
                  <option>Provider Result</option>
                </select>
              </label>
              <label>
                Access classification
                <select name="accessLevel" defaultValue="Restricted staff review">
                  <option>Client, assigned notary, staff</option>
                  <option>Restricted staff review</option>
                  <option>Administrator or Super Admin review</option>
                </select>
              </label>
              <button type="submit">Request Signed Upload URL</button>
            </form>
            <div className="decision-actions">
              <a href="/staff/document-validation">Open Validation Queue</a>
              <a href="/evidence/EV-W9-FORM">Review W-9 Evidence</a>
              <a href="/evidence/EV-NNA-CERTIFICATE">Review NNA Certificate</a>
              <a href="/evidence/DOC-2607-0001">Review Order Document</a>
            </div>
            <p className="decision-lock-note">
              Production upload submission will require encrypted storage,
              malware scanning, signed access URLs, retention policy, and
              immutable audit records before files are released.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
