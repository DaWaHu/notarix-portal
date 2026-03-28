"use client";

import { useState } from "react";

const STATUS_OPTIONS = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "ASSIGNED",
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
] as const;

type StatusValue = (typeof STATUS_OPTIONS)[number];

type HistoryItem = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  reason: string | null;
  createdAt: string;
};

type Props = {
  orderId: string;
  currentStatus: string;
  history: HistoryItem[];
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

export default function OrderStatusPanel({
  orderId,
  currentStatus,
  history,
}: Props) {
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpdate() {
    if (saving || selectedStatus === currentStatus) return;

    setSaving(true);
    setMessage("Updating status...");

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toStatus: selectedStatus,
          reason: reason || null,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Failed to update status");
      }

      setMessage("Status updated.");
      window.location.reload();
    } catch (error: any) {
      setMessage(error?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

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
      <h2 style={{ marginTop: 0, color: "#0F172A" }}>Status Workflow</h2>

      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <strong>Current Status:</strong> {nice(currentStatus)}
        </div>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontWeight: 800, color: "#0F172A" }}>Change Status</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              border: "1px solid #CBD5E1",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 14,
              color: "#0F172A",
              background: "#fff",
            }}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontWeight: 800, color: "#0F172A" }}>Reason</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional status update note"
            style={{
              border: "1px solid #CBD5E1",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 14,
              color: "#0F172A",
              background: "#fff",
              minHeight: 88,
              resize: "vertical",
            }}
          />
        </label>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={saving || selectedStatus === currentStatus}
            style={{
              border: 0,
              borderRadius: 10,
              padding: "12px 16px",
              fontWeight: 900,
              background:
                saving || selectedStatus === currentStatus ? "#94A3B8" : "#2563EB",
              color: "#fff",
              cursor:
                saving || selectedStatus === currentStatus ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Updating..." : "Update Status"}
          </button>

          {message ? (
            <div style={{ color: "#475569", fontWeight: 700 }}>{message}</div>
          ) : null}
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <h3 style={{ margin: "0 0 12px 0", color: "#0F172A" }}>Status History</h3>

        {history.length === 0 ? (
          <div style={{ color: "#475569", fontWeight: 600 }}>
            No status history yet.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  border: "1px solid #E5E7EB",
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div style={{ fontWeight: 800, color: "#0F172A" }}>
                  {nice(item.fromStatus)} → {nice(item.toStatus)}
                </div>
                <div style={{ marginTop: 6, color: "#475569" }}>
                  Reason: {nice(item.reason)}
                </div>
                <div style={{ marginTop: 4, color: "#64748B", fontSize: 14 }}>
                  {formatDateTime(item.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
