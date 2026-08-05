import { requireStaffRouteAccess } from "../../access-policy";
import {
  listEvidenceStorageControls,
  type EvidenceStorageControlRecord,
} from "../../evidence-repository";
import { CommandStatusPanel } from "../command-center/CommandStatusPanel";
import { getLatestCommandCenterReceiptForHref } from "../command-center/store";

type ValidationRecord = EvidenceStorageControlRecord & {
  fileTypeStatus: string;
  hashStatus: string;
  releaseStatus: string;
  reviewer: string;
  nextAction: string;
};

function validationStatusFor(record: EvidenceStorageControlRecord): ValidationRecord {
  const restricted = record.accessLevel.toLowerCase().includes("restricted");

  return {
    ...record,
    fileTypeStatus: ["PDF", "JSON", "CSV", "URL"].includes(record.fileType)
      ? "Allowed type"
      : "Requires review",
    hashStatus: record.contentHashStatus,
    releaseStatus: record.releaseEligibility,
    reviewer: restricted ? "Administrator or Super Admin" : "GenAdmin evidence review",
    nextAction: record.releaseBlockedReason,
  };
}

export default async function DocumentValidationPage() {
  await requireStaffRouteAccess("/staff/document-validation", [
    "GenAdmin",
    "Admin",
    "SuperAdmin",
  ]);
  const latestCommandReceipt = getLatestCommandCenterReceiptForHref(
    "/staff/document-validation",
  );

  const evidenceRecords = await listEvidenceStorageControls();
  const validationRecords = evidenceRecords.map(validationStatusFor);
  const readyCount = validationRecords.filter(
    (record) => record.releaseStatus === "Release Eligible",
  ).length;
  const restrictedCount = validationRecords.filter(
    (record) => record.releaseStatus === "Restricted Hold",
  ).length;
  const storagePendingCount = validationRecords.filter((record) =>
    record.releaseStatus === "Storage Binding Required",
  ).length;
  const hashCount = validationRecords.filter(
    (record) => record.hashStatus === "SHA-256 fingerprint recorded",
  ).length;

  return (
    <main className="staff-page">
      <header className="staff-header">
        <a className="brand" href="/">
          <img src="/notarix-logo.png" alt="Notarix Signings" />
          <span>Secure Staff Operations</span>
        </a>
        <nav aria-label="Document validation navigation">
          <a href="/">Home</a>
          <a href="/staff">Staff Home</a>
          <a href="/staff/evidence-intake">Evidence Intake</a>
          <a href="/documents">Documents</a>
          <a href="/staff/financial-controls">Financial Controls</a>
          <a className="nav-cta" href="/staff/document-validation">
            Document Validation
          </a>
          <a href="/signout-with-chatgpt?return_to=/">Logout</a>
        </nav>
      </header>

      <section className="review-hero">
        <div>
          <p className="kicker">Document Validation · Malware And Release Queue</p>
          <h1>Document Malware And Validation Queue</h1>
          <p>
            Validate uploaded evidence and order documents before release into
            profile verification, credential renewal, RON review, financial
            approval, order processing, or restricted audit workflows.
          </p>
        </div>
        <aside>
          <p>Release control</p>
          <strong>{restrictedCount + storagePendingCount} controls require review</strong>
          <span>Restricted or storage-pending files cannot be released automatically.</span>
        </aside>
      </section>

      <section className="verification-summary" aria-label="Document validation summary">
        {[
          ["Release eligible", String(readyCount), "Files with acceptable type, scan, storage, and nonrestricted access posture."],
          ["Restricted holds", String(restrictedCount), "Identity, tax, financial, or RON evidence requiring elevated release review."],
          ["Storage pending", String(storagePendingCount), "Files awaiting production encrypted object storage binding."],
          ["Hash coverage", `${hashCount} of ${validationRecords.length}`, "Files with SHA-256 fingerprint recorded for integrity review."],
        ].map(([label, value, description]) => (
          <article key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>

      <section className="verification-layout" aria-label="Document validation workspace">
        <div className="verification-console">
          <aside className="console-rail">
            <section className="console-subject-card">
              <p className="request-label">Validation queue</p>
              <h2>File release controls</h2>
              <span>
                Staff must verify file type, malware status, hash integrity,
                storage posture, and access classification before release.
              </span>
            </section>
            <p className="request-label">Validation index</p>
            <nav>
              {[
                "Ready for release",
                "Restricted release hold",
                "Storage pending",
                "Hash recorded",
                "Quarantine review",
                "Replacement upload",
              ].map((label) => (
                <a href="#document-validation-matrix" key={label}>
                  <span>{label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <article className="console-main" id="document-validation-matrix">
            <header className="console-panel-heading">
              <div>
                <p className="request-label">Validation register</p>
                <h2>Malware scan and release matrix</h2>
              </div>
              <strong>{validationRecords.length} files</strong>
            </header>
            <div className="verification-table-wrap">
              <table className="verification-table">
                <caption>Document malware and validation queue</caption>
                <thead>
                  <tr>
                    <th scope="col">Uploaded file</th>
                    <th scope="col">Source workflow</th>
                    <th scope="col">File / hash</th>
                    <th scope="col">Malware / storage</th>
                    <th scope="col">Access classification</th>
                    <th scope="col">Release status</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {validationRecords.map((record) => (
                    <tr key={record.id}>
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
                          {record.requestId ?? record.orderId ?? "Provider result"}
                        </span>
                      </td>
                      <td>
                        {record.fileTypeStatus}
                        <span className="evidence-packet-summary">
                          {record.validationStatus}
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
                          Reviewer: {record.reviewer}
                        </span>
                      </td>
                      <td>
                        {record.releaseStatus}
                        <span className="evidence-packet-summary">
                          {record.nextAction}
                        </span>
                      </td>
                      <td>
                        <a className="table-action-link" href={`/evidence/${record.id}`}>
                          Review
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="activation-control-center">
            <p className="request-label">Validation command center</p>
            <h2>Release authority</h2>
            <p className="activation-summary">
              Staff may prepare validation decisions, but restricted evidence,
              quarantine, and release controls must remain attributable and
              auditable.
            </p>
            <dl>
              <div><dt>Malware scan</dt><dd>Required before workflow release</dd></div>
              <div><dt>File integrity</dt><dd>SHA-256 fingerprint must remain recorded</dd></div>
              <div><dt>Quarantine</dt><dd>Failed or suspicious files remain unavailable</dd></div>
              <div><dt>Release</dt><dd>Administrator or Super Admin for production release</dd></div>
              <div><dt>Replacement</dt><dd>New upload restarts validation and custody review</dd></div>
            </dl>
            <CommandStatusPanel
              receipt={latestCommandReceipt}
              title="Document validation"
            />
            <div className="decision-actions">
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="release-validated-evidence" />
                <input name="targetId" type="hidden" value="DOC-2607-0001" />
                <button type="submit">Release Validated Evidence</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="quarantine-failed-file" />
                <input name="targetId" type="hidden" value="DOC-2607-0002" />
                <button type="submit">Quarantine Failed File</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="request-replacement-upload" />
                <input name="targetId" type="hidden" value="EV-W9-FORM" />
                <button type="submit">Request Replacement Upload</button>
              </form>
              <form action="/staff/command-center" method="post">
                <input name="action" type="hidden" value="escalate-restricted-document" />
                <input name="targetId" type="hidden" value="DOC-2607-0002" />
                <button type="submit">Escalate Restricted Document</button>
              </form>
            </div>
            <p className="decision-lock-note">
              Production validation must connect to a real malware scanning
              service, encrypted object storage, signed access URLs, retention
              policy, and immutable release/quarantine audit records.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
