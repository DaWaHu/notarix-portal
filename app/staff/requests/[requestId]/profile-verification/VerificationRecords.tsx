"use client";

import { useState } from "react";
import type {
  ProfileVerificationItem,
  VerificationDecision,
} from "../../data";

type VerificationRecordsProps = {
  items: ProfileVerificationItem[];
};

type VerificationRecordState = ProfileVerificationItem & {
  verifiedBy?: string;
  verifiedOn?: string;
};

const staffDisplayName = "Local Notarix Staff";

export function VerificationRecords({ items }: VerificationRecordsProps) {
  const [records, setRecords] = useState<VerificationRecordState[]>(items);

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
    <div className="verification-list">
      {records.map((item) => (
        <VerificationRecord
          item={item}
          key={`${item.section}-${item.requirement}`}
          onStatusChange={updateRecord}
        />
      ))}
    </div>
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
