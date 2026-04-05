"use client";

import { useState } from "react";

type CommunicationItem = {
  id: string;
  createdAt: string;
  channel: string | null;
  direction: string | null;
  subject: string | null;
  message: string;
};

type Props = {
  orderId: string;
  communications: CommunicationItem[];
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

export default function OrderCommunicationsPanel({
  orderId,
  communications,
}: Props) {
  const [channel, setChannel] = useState("EMAIL");
  const [direction, setDirection] = useState("OUTBOUND");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  async function handleSave() {
    if (saving) return;
    if (!message.trim()) {
      setStatusMessage("Message is required.");
      return;
    }

    setSaving(true);
    setStatusMessage("Saving communication...");

    try {
      const res = await fetch(`/api/orders/${orderId}/communications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel,
          direction,
          subject: subject || null,
          message: message.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Failed to save communication");
      }

      setSubject("");
      setMessage("");
      setStatusMessage("Communication saved.");
      window.location.reload();
    } catch (error: any) {
      setStatusMessage(error?.message || "Failed to save communication");
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
      <h2 style={{ marginTop: 0, color: "#0F172A" }}>Communications</h2>

      <div style={{ display: "grid", gap: 12 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ fontWeight: 800, color: "#0F172A" }}>Channel</span>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              style={{
                border: "1px solid #CBD5E1",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 14,
                color: "#0F172A",
                background: "#fff",
              }}
            >
              <option value="EMAIL">EMAIL</option>
              <option value="PHONE">PHONE</option>
              <option value="TEXT">TEXT</option>
              <option value="PORTAL">PORTAL</option>
              <option value="INTERNAL_NOTE">INTERNAL_NOTE</option>
            </select>
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ fontWeight: 800, color: "#0F172A" }}>Direction</span>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              style={{
                border: "1px solid #CBD5E1",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 14,
                color: "#0F172A",
                background: "#fff",
              }}
            >
              <option value="OUTBOUND">OUTBOUND</option>
              <option value="INBOUND">INBOUND</option>
              <option value="INTERNAL">INTERNAL</option>
            </select>
          </label>
        </div>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontWeight: 800, color: "#0F172A" }}>Subject</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Optional subject"
            style={{
              border: "1px solid #CBD5E1",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 14,
              color: "#0F172A",
              background: "#fff",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontWeight: 800, color: "#0F172A" }}>Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Record communication with the client, notary, or internal team."
            style={{
              border: "1px solid #CBD5E1",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 14,
              color: "#0F172A",
              background: "#fff",
              minHeight: 110,
              resize: "vertical",
            }}
          />
        </label>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              border: 0,
              borderRadius: 10,
              padding: "12px 16px",
              fontWeight: 900,
              background: saving ? "#94A3B8" : "#2563EB",
              color: "#fff",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Communication"}
          </button>

          {statusMessage ? (
            <div style={{ color: "#475569", fontWeight: 700 }}>{statusMessage}</div>
          ) : null}
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <h3 style={{ margin: "0 0 12px 0", color: "#0F172A" }}>Communication History</h3>

        {communications.length === 0 ? (
          <div style={{ color: "#475569", fontWeight: 600 }}>
            No communication history yet.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {communications.map((item) => (
              <div
                key={item.id}
                style={{
                  border: "1px solid #E5E7EB",
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div style={{ fontWeight: 800, color: "#0F172A" }}>
                  {nice(item.channel)} · {nice(item.direction)}
                </div>
                <div style={{ marginTop: 6, color: "#475569", fontWeight: 700 }}>
                  Subject: {nice(item.subject)}
                </div>
                <div style={{ marginTop: 6, color: "#334155", whiteSpace: "pre-wrap" }}>
                  {nice(item.message)}
                </div>
                <div style={{ marginTop: 8, color: "#64748B", fontSize: 14 }}>
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