"use client";

import { useRef, useState } from "react";

type Props = {
  notaryCode: string;
};

export default function NotaryPhotoUpload({ notaryCode }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!selectedFile || uploading) return;

    setUploading(true);
    setStatus("Uploading photo...");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(
        `/api/notaries/${encodeURIComponent(notaryCode)}/photo`,
        {
          method: "POST",
          body: formData,
        }
      );

      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Failed to upload notary photo");
      }

      setStatus("Notary photo uploaded.");
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
        marginTop: 14,
        display: "grid",
        gap: 10,
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
      />

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          style={{
            border: 0,
            borderRadius: 10,
            padding: "10px 14px",
            fontWeight: 800,
            cursor: !selectedFile || uploading ? "not-allowed" : "pointer",
            background: !selectedFile || uploading ? "#94A3B8" : "#2563EB",
            color: "#FFFFFF",
          }}
        >
          {uploading ? "Uploading..." : "Upload Photo"}
        </button>

        {selectedFile ? (
          <div style={{ color: "#475569", fontWeight: 600 }}>
            Selected: {selectedFile.name}
          </div>
        ) : null}
      </div>

      {status ? (
        <div style={{ color: "#475569", fontWeight: 600 }}>{status}</div>
      ) : null}
    </div>
  );
}