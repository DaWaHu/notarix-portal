"use client";

import { useState } from "react";

type Props = {
  orderId: string;
  paperSize: string | null;
  preferredInk: string | null;
  specialInstructions: string | null;
  signingDate: string | null;
  signingTimeLabel: string | null;
  estimatedPages: number | null;
  notes: string | null;
};

function nice(value: string | null | undefined) {
  const v = String(value || "").trim();
  return v || "—";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

export default function OrderSigningDetailsPanel({
  orderId,
  paperSize,
  preferredInk,
  specialInstructions,
  signingDate,
  signingTimeLabel,
  estimatedPages,
  notes,
}: Props) {
  const [paperSizeValue, setPaperSizeValue] = useState(paperSize || "");
  const [preferredInkValue, setPreferredInkValue] = useState(preferredInk || "");
  const [specialInstructionsValue, setSpecialInstructionsValue] = useState(
    specialInstructions || ""
  );
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  async function handleSave() {
    if (saving) return;

    setSaving(true);
    setStatusMessage("Saving signing details...");

    try {
      const res = await fetch(`/api/orders/${orderId}/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paperSize: paperSizeValue || null,
          preferredInk: preferredInkValue || null,
          specialInstructions: specialInstructionsValue || null,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Failed to update signing details");
      }

      setStatusMessage("Signing details updated.");
      window.location.reload();
    } catch (error: any) {
      setStatusMessage(error?.message || "Failed to update signing details");
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
      <h2 style={{ marginTop: 0, color: "#0F172A" }}>Signing Details</h2>

      <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
        <div>
          <strong>Signing Date:</strong> {formatDate(signingDate)}
        </div>
        <div>
          <strong>Signing Time:</strong> {nice(signingTimeLabel)}
        </div>
        <div>
          <strong>Estimated Pages:</strong> {estimatedPages ?? "—"}
        </div>
        <div>
          <strong>Notes:</strong> {nice(notes)}
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontWeight: 800, color: "#0F172A" }}>Paper Size</span>
          <input
            value={paperSizeValue}
            onChange={(e) => setPaperSizeValue(e.target.value)}
            placeholder="Example: Letter or Legal"
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
          <span style={{ fontWeight: 800, color: "#0F172A" }}>Required Ink</span>
          <input
            value={preferredInkValue}
            onChange={(e) => setPreferredInkValue(e.target.value)}
            placeholder="Example: Blue or Black"
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
          <span style={{ fontWeight: 800, color: "#0F172A" }}>Special Instructions</span>
          <textarea
            value={specialInstructionsValue}
            onChange={(e) => setSpecialInstructionsValue(e.target.value)}
            placeholder="Enter signing-specific instructions"
            style={{
              border: "1px solid #CBD5E1",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 14,
              color: "#0F172A",
              background: "#fff",
              minHeight: 100,
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
            {saving ? "Saving..." : "Save Signing Details"}
          </button>

          {statusMessage ? (
            <div style={{ color: "#475569", fontWeight: 700 }}>{statusMessage}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}