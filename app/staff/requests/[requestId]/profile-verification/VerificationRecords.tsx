"use client";

import { useState } from "react";
import {
  type AccessRequest,
  ProfileVerificationItem,
  VerificationDecision,
} from "../../data";

type ProfileVerificationWorkspaceProps = {
  items: ProfileVerificationItem[];
  request: Pick<
    AccessRequest,
    | "approvedProfileNumber"
    | "email"
    | "id"
    | "jurisdiction"
    | "name"
    | "nextAction"
    | "organization"
    | "phone"
    | "projectedProfileNumber"
    | "service"
    | "status"
    | "type"
  >;
};

type VerificationRecordState = ProfileVerificationItem & {
  verifiedBy?: string;
  verifiedOn?: string;
};

const staffDisplayName = "Local Notarix Staff";

export function ProfileVerificationWorkspace({
  items,
  request,
}: ProfileVerificationWorkspaceProps) {
  const [records, setRecords] = useState<VerificationRecordState[]>(items);
  const openItems = records.filter((item) => item.status !== "Verified");
  const allItemsVerified = openItems.length === 0;

  function updateRecord(
    target: VerificationRecordState,
    status: VerificationDecision,
  ) {
    setRecords((currentRecords) =>
      currentRecords.map((record) => {
        if (
          record.section !== target.section ||
          record.requirement !== target.requirement
        ) {
          return record;
        }

        if (status === "Verified") {
          return {
            ...record,
            status,
            verifiedBy: staffDisplayName,
            verifiedOn: formatNotarixDate(new Date()),
          };
        }

        return {
          ...record,
          status,
          verifiedBy: undefined,
          verifiedOn: undefined,
        };
      }),
    );
  }

  return (
    <>
      <article className="review-panel">
        <div className="review-panel-heading">
          <p className="request-label">Submitted profile</p>
          <h2>{request.name}</h2>
        </div>

        <div className="summary-grid verification-profile-summary">
          <section>
            <p className="request-label">Request number</p>
            <strong>{request.id}</strong>
            <span>Intake record before activation.</span>
          </section>
          <section>
            <p className="request-label">
              {request.type === "Notary" ? "Notary number" : "Client number"}
            </p>
            <strong>{request.approvedProfileNumber ?? "Pending approval"}</strong>
            <span>Reserved on approval: {request.projectedProfileNumber}</span>
          </section>
          <section>
            <p className="request-label">Profile type</p>
            <strong>{request.type}</strong>
            <span>{request.service}</span>
          </section>
          <section>
            <p className="request-label">Organization</p>
            <strong>{request.organization}</strong>
            <span>{request.jurisdiction}</span>
          </section>
          <section>
            <p className="request-label">Contact</p>
            <strong>{request.email}</strong>
            <span>{request.phone}</span>
          </section>
          <section>
            <p className="request-label">Current status</p>
            <strong>{request.status}</strong>
            <span>{request.nextAction}</span>
          </section>
        </div>

        <div className="verification-list">
          {records.map((item) => (
            <VerificationRecord
              item={item}
              key={`${item.section}-${item.requirement}`}
              onStatusChange={updateRecord}
            />
          ))}
        </div>
      </article>

      <aside className="review-panel decision-panel">
        <p className="request-label">Final activation controls</p>
        <h2>Staff decision</h2>
        <dl>
          <div>
            <dt>Portal access</dt>
            <dd>
              {allItemsVerified
                ? "Ready for elevated approval review."
                : "Disabled until all required items are verified."}
            </dd>
          </div>
          <div>
            <dt>RON access</dt>
            <dd>Restricted unless state authorization and digital certificate are verified.</dd>
          </div>
          <div>
            <dt>Financial changes</dt>
            <dd>Administrator or Super Admin approval required.</dd>
          </div>
        </dl>
        <div className="decision-actions">
          {allItemsVerified ? (
            <a href={`/staff/requests/${request.id}/profile-verification/decision/approve`}>
              Approve Profile
            </a>
          ) : (
            <button aria-disabled="true" disabled type="button">
              Approval Locked
            </button>
          )}
          <a href={`/staff/requests/${request.id}/profile-verification/decision/corrections`}>
            Request Corrections
          </a>
          <a href={`/staff/requests/${request.id}/profile-verification/decision/inactive`}>
            Keep Inactive
          </a>
        </div>
        {!allItemsVerified ? (
          <p className="decision-lock-note">
            {openItems.length} verification items remain unresolved. Approval should not be
            available until the profile has no pending, deficient, or restricted records.
          </p>
        ) : null}
      </aside>
    </>
  );
}

function VerificationRecord({
  item,
  onStatusChange,
}: {
  item: VerificationRecordState;
  onStatusChange: (
    item: VerificationRecordState,
    status: VerificationDecision,
  ) => void;
}) {
  const isVerified = item.status === "Verified";

  return (
    <section className="verification-record" data-status={item.status}>
      <div>
        <p className="request-label">{item.section}</p>
        <h3>{item.requirement}</h3>
        <p>{item.evidence}</p>
      </div>
      <mark data-status={item.status}>{item.status}</mark>
      <p>{item.reviewerNote}</p>
      {isVerified ? (
        <p className="verification-confirmation">
          Verified by {item.verifiedBy} on {item.verifiedOn}. Reopening this
          record should create an audit entry.
        </p>
      ) : null}
      <div className="verification-actions">
        <span>Staff actions</span>
        {isVerified ? (
          <button type="button" onClick={() => onStatusChange(item, "Pending")}>
            Reopen Review
          </button>
        ) : (
          <button type="button" onClick={() => onStatusChange(item, "Verified")}>
            Record as Verified
          </button>
        )}
        <button type="button" onClick={() => onStatusChange(item, "Deficient")}>
          Request Correction
        </button>
        <button type="button">Open Evidence</button>
      </div>
    </section>
  );
}

function formatNotarixDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
