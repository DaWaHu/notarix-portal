import { notFound } from "next/navigation";
import { requireChatGPTUser } from "../../chatgpt-auth";
import {
  getEvidenceStorageControl,
  listEvidenceStorageControls,
} from "../../evidence-repository";

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

  const evidence = await getEvidenceStorageControl(evidenceId);
  if (!evidence) notFound();

  const evidenceRecords = await listEvidenceStorageControls();
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
          <span>{evidence.releaseEligibility}</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Evidence control summary">
        {[
          ["Custody", evidence.custody, "Source and handling classification."],
          ["Storage", evidence.encryptionStatus, "Encrypted storage binding status."],
          ["Malware", evidence.malwareStatus, "Validation provider result."],
          ["Retention", evidence.retentionRule, "Record retention requirement."],
          ["Release", evidence.releaseEligibility, "Current release eligibility."],
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
                <p>Encrypted object key</p>
                <strong>{evidence.objectKey}</strong>
              </article>
              <article>
                <p>Malware provider receipt</p>
                <strong>{evidence.providerReceipt}</strong>
              </article>
              <article>
                <p>Release block</p>
                <strong>{evidence.releaseBlockedReason}</strong>
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
                <dd>{evidence.malwareStatus}</dd>
              </div>
              <div>
                <dt>Signed URL</dt>
                <dd>{evidence.accessUrlStatus}</dd>
              </div>
              <div>
                <dt>Storage provider</dt>
                <dd>{evidence.storageProvider}</dd>
              </div>
            </dl>
            <div className="decision-actions">
              <form action={`/evidence/${evidence.id}/access`} method="post">
                <input
                  name="reason"
                  type="hidden"
                  value="Staff evidence viewer access request"
                />
                <button type="submit">Request Signed Access</button>
              </form>
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
