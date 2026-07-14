import { notFound } from "next/navigation";
import { requireChatGPTUser } from "../../chatgpt-auth";
import { evidenceRecords, findEvidenceRecord } from "../../evidence-data";

type EvidenceViewerPageProps = {
  params: Promise<{
    evidenceId: string;
  }>;
};

export default async function EvidenceViewerPage({
  params,
}: EvidenceViewerPageProps) {
  const { evidenceId } = await params;
  await requireChatGPTUser(`/evidence/${evidenceId}`);

  const evidence = findEvidenceRecord(evidenceId);
  if (!evidence) notFound();

  const relatedEvidence = evidenceRecords
    .filter((record) => {
      if (evidence.requestId) return record.requestId === evidence.requestId;
      if (evidence.orderId) return record.orderId === evidence.orderId;
      return record.section === evidence.section;
    })
    .slice(0, 6);

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Evidence Viewer</span>
        </a>
        <nav aria-label="Evidence viewer navigation">
          <a href="/">Home</a>
          <a href="/documents">Document Vault</a>
          {evidence.requestId ? (
            <a href={`/staff/requests/${evidence.requestId}/profile-verification`}>
              Verification Console
            </a>
          ) : null}
          {evidence.orderId ? <a href={`/orders/${evidence.orderId}`}>Order File</a> : null}
          <a className="nav-cta" href={`/evidence/${evidence.id}`}>Evidence</a>
          <a href="/signout-with-chatgpt?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Controlled Evidence Review · Access Logged</p>
          <h1>{evidence.title}</h1>
          <div className="console-meta" aria-label="Evidence metadata">
            <span>{evidence.id}</span>
            <span>{evidence.fileType}</span>
            <span>{evidence.source}</span>
            <span>{evidence.accessLevel}</span>
          </div>
          <p>
            Review file custody, scan status, access classification, storage
            control, retention requirements, and staff audit events before using
            this evidence in a profile, order, billing, RON, or payable decision.
          </p>
        </div>
        <aside>
          <p>Access decision</p>
          <strong>{evidence.scanStatus}</strong>
          <span>{evidence.accessLevel}</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Evidence control summary">
        {[
          ["Custody", evidence.custody, "Source and handling classification."],
          ["Storage", evidence.storageStatus, "Encrypted storage binding status."],
          ["Retention", evidence.retentionRule, "Record retention requirement."],
          ["Last access", evidence.lastAccessed, "Most recent logged evidence access."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Evidence viewer workspace">
        <div className="verification-console evidence-viewer-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Evidence file</p>
              <h2>{evidence.id}</h2>
              <span>{evidence.fileName}</span>
              <dl>
                <div>
                  <dt>Section</dt>
                  <dd>{evidence.section}</dd>
                </div>
                <div>
                  <dt>Received</dt>
                  <dd>{evidence.received}</dd>
                </div>
                <div>
                  <dt>Size</dt>
                  <dd>{evidence.size}</dd>
                </div>
              </dl>
            </section>

            <p className="request-label">Related evidence</p>
            <nav>
              {relatedEvidence.map((record) => (
                <a href={`/evidence/${record.id}`} key={record.id}>
                  <span>{record.title}</span>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">File preview</p>
                <h2>{evidence.fileName}</h2>
              </div>
              <strong>{evidence.fileType}</strong>
            </header>

            <section className="evidence-preview-panel" aria-label="Evidence file preview">
              <div className="evidence-preview-toolbar">
                <span>{evidence.fileType}</span>
                <span>{evidence.scanStatus}</span>
                <span>{evidence.accessLevel}</span>
              </div>
              <div className="evidence-preview-sheet">
                <p className="request-label">{evidence.category}</p>
                <h3>{evidence.title}</h3>
                <dl>
                  {evidence.previewFields.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            <section className="evidence-detail-grid" aria-label="Evidence integrity details">
              <article>
                <p>SHA-256 fingerprint</p>
                <strong>{evidence.sha256}</strong>
              </article>
              <article>
                <p>Storage control</p>
                <strong>{evidence.storageStatus}</strong>
              </article>
              <article>
                <p>Retention rule</p>
                <strong>{evidence.retentionRule}</strong>
              </article>
              <article>
                <p>Access classification</p>
                <strong>{evidence.accessLevel}</strong>
              </article>
            </section>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Evidence command</p>
            <h2>Access controlled</h2>
            <p className="activation-summary">
              Production viewing should stream this file from encrypted storage
              only after authorization, malware scan validation, and access
              logging.
            </p>
            <dl>
              <div>
                <dt>Request</dt>
                <dd>{evidence.requestId ?? "Not profile evidence"}</dd>
              </div>
              <div>
                <dt>Order</dt>
                <dd>{evidence.orderId ?? "Not order evidence"}</dd>
              </div>
              <div>
                <dt>Custody</dt>
                <dd>{evidence.custody}</dd>
              </div>
              <div>
                <dt>Scan status</dt>
                <dd>{evidence.scanStatus}</dd>
              </div>
            </dl>
            <div className="decision-actions">
              <button type="button">Record Access Note</button>
              <button type="button">Flag Evidence Issue</button>
              <button type="button">Request Replacement</button>
            </div>

            <section className="evidence-audit-list" aria-label="Evidence audit events">
              <p className="request-label">Access audit</p>
              <ol>
                {evidence.auditEvents.map((event) => (
                  <li key={event}>{event}</li>
                ))}
              </ol>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
