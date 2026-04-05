"use client";

import { useRef, useState } from "react";

type Props = {
  notaryCode: string;
  documentLabel: string;
};

export default function NotaryDocumentUpload({
  notaryCode,
  documentLabel,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!selectedFile || uploading) return;

    setUploading(true);
    setStatus("Uploading document...");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("documentLabel", documentLabel);

      const res = await fetch(
        `/api/notaries/${encodeURIComponent(notaryCode)}/documents`,
        {
          method: "POST",
          body: formData,
        }
      );

      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Failed to upload document");
      }

      setStatus("Document uploaded.");
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
    <div style={{ display: "grid", gap: 12 }}>
      <label style={{ display: "grid", gap: 8 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#141722",
          }}
        >
          Upload file
        </span>
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        />
      </label>

      <button
        type="button"
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        style={{
          border: 0,
          borderRadius: 12,
          padding: "12px 16px",
          background: !selectedFile || uploading ? "#94A3B8" : "#3B59F4",
          color: "#FFFFFF",
          fontSize: 15,
          fontWeight: 700,
          cursor: !selectedFile || uploading ? "not-allowed" : "pointer",
          boxShadow: !selectedFile || uploading
            ? "none"
            : "0 6px 14px rgba(59, 89, 244, 0.18)",
        }}
      >
        {uploading ? "Uploading..." : "Upload Document"}
      </button>

      {selectedFile ? (
        <div style={{ color: "#475569", fontWeight: 600 }}>
          Selected: {selectedFile.name}
        </div>
      ) : null}

      {status ? (
        <div style={{ color: "#475569", fontWeight: 600 }}>{status}</div>
      ) : null}
    </div>
  );
}