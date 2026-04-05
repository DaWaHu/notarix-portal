type StatusItem = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  reason: string | null;
  createdAt: string;
};

type CommunicationItem = {
  id: string;
  createdAt: string;
  channel: string | null;
  direction: string | null;
  subject: string | null;
  message: string;
};

type DocumentItem = {
  id: string;
  fileName: string;
  documentType: string;
  visibility: string;
  createdAt: string;
};

type Props = {
  statusHistory: StatusItem[];
  communications: CommunicationItem[];
  documents: DocumentItem[];
};

function nice(value: string | null | undefined) {
  const v = String(value || "").trim();
  return v || "—";
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function OrderActivityPanel({
  statusHistory,
  communications,
  documents,
}: Props) {
  const activity = [
    ...statusHistory.map((item) => ({
      id: `status-${item.id}`,
      createdAt: item.createdAt,
      kind: "STATUS" as const,
      title: `${nice(item.fromStatus)} → ${nice(item.toStatus)}`,
      detail: item.reason ? `Reason: ${item.reason}` : "Status updated",
    })),
    ...communications.map((item) => ({
      id: `comm-${item.id}`,
      createdAt: item.createdAt,
      kind: "COMMUNICATION" as const,
      title: `${nice(item.channel)} · ${nice(item.direction)}`,
      detail: item.subject ? `${item.subject} — ${item.message}` : item.message,
    })),
    ...documents.map((item) => ({
      id: `doc-${item.id}`,
      createdAt: item.createdAt,
      kind: "DOCUMENT" as const,
      title: item.fileName,
      detail: `Type: ${item.documentType} · Visibility: ${item.visibility}`,
    })),
  ].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 14,
        padding: 20,
        boxShadow: "0 8px 22px rgba(15, 23, 42, 0.05)",
      }}
    >
      <h2 style={{ marginTop: 0, color: "#0F172A" }}>Activity History</h2>

      {activity.length === 0 ? (
        <div style={{ color: "#475569", fontWeight: 600 }}>
          No activity recorded yet.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {activity.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div style={{ fontWeight: 800, color: "#0F172A" }}>
                {item.kind}: {item.title}
              </div>
              <div
                style={{
                  marginTop: 6,
                  color: "#475569",
                  whiteSpace: "pre-wrap",
                }}
              >
                {item.detail}
              </div>
              <div
                style={{
                  marginTop: 8,
                  color: "#64748B",
                  fontSize: 14,
                }}
              >
                {formatDateTime(item.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}