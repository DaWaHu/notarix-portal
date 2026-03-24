"use client";

import { useRef, useState } from "react";

type Props = {
  orderId: string;
};

export default function OrderDocumentUpload({ orderId }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!selectedFile || uploading) return;

    setUploading(true);
    setStatus("Uploading document...");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadJson = await uploadRes.json();

      if (!uploadRes.ok || !uploadJson?.ok || !uploadJson?.key) {
        throw new Error(uploadJson?.error || "Upload failed");
      }

      const attachRes = await fetch(`/api/orders/${orderId}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: uploadJson.originalName || selectedFile.name,
          storageKey: uploadJson.key,
          mimeType: "application/pdf",
          fileSizeBytes: uploadJson.size ?? selectedFile.size,
          documentType: "OTHER",
          visibility: "INTERNAL",
        }),
      });

      const attachJson = await attachRes.json();

      if (!attachRes.ok || !attachJson?.ok) {
        throw new Error(attachJson?.error || "Failed to attach document to order");
      }

      setStatus("Document uploaded and attached.");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      window.location.reload();
    } catch (error: any) {
      setStatus(error?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      style={{
        marginBottom: 16,
        padding: 14,
        border: "1px solid #E5E7EB",
        borderRadius: 10,
        background: "#F8FAFC",
      }}
    >
      <div style={{ fontWeight: 800, color: "#0F172A", marginBottom: 10 }}>
        Attach PDF
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
      />

      <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          style={{
            border: "none",
            borderRadius: 10,
            padding: "10px 14px",
            fontWeight: 800,
            cursor: !selectedFile || uploading ? "not-allowed" : "pointer",
            background: !selectedFile || uploading ? "#94A3B8" : "#2563EB",
            color: "#FFFFFF",
          }}
        >
          {uploading ? "Uploading..." : "Upload document"}
        </button>

        {selectedFile ? (
          <div style={{ color: "#475569", fontWeight: 600 }}>
            Selected: {selectedFile.name}
          </div>
        ) : null}
      </div>

      {status ? (
        <div style={{ marginTop: 10, color: "#475569", fontWeight: 600 }}>
          {status}
        </div>
      ) : null}
    </div>
  );
}
