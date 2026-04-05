"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  vendorCode: string;
};

type UploadState = {
  error: string | null;
  success: string | null;
};

export default function VendorDocumentUpload({ vendorCode }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<UploadState>({
    error: null,
    success: null,
  });
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ error: null, success: null });

    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setState({ error: "Please choose a PDF file to upload.", success: null });
      return;
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setState({ error: "Only PDF files are allowed.", success: null });
      return;
    }

    try {
      setIsUploading(true);

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const uploadJson = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadJson?.ok) {
        throw new Error(uploadJson?.error || "Upload failed.");
      }

      const persistResponse = await fetch(
        `/api/vendors/${encodeURIComponent(vendorCode)}/documents`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: uploadJson.originalName,
            storageKey: uploadJson.key,
            mimeType: "application/pdf",
            fileSizeBytes: uploadJson.size,
            notes: notes.trim() || null,
          }),
        }
      );

      const persistJson = await persistResponse.json();

      if (!persistResponse.ok || !persistJson?.ok) {
        throw new Error(
          persistJson?.error || "Failed to attach document to client."
        );
      }

      setState({
        error: null,
        success: "Document uploaded successfully.",
      });

      setNotes("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (error: any) {
      setState({
        error: error?.message || "Something went wrong during upload.",
        success: null,
      });
    } finally {
      setIsUploading(false);
    }
  }

  const busy = isUploading || isPending;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 18,
        padding: 22,
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontWeight: 950,
          color: "#0F172A",
          marginBottom: 8,
        }}
      >
        Upload Client Document
      </div>

      <div
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          fontWeight: 600,
          color: "#475569",
          marginBottom: 16,
        }}
      >
        Upload a PDF document to your client record. Uploaded files count toward
        required document readiness when they match a required document category.
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        <label style={{ display: "grid", gap: 8 }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: "#0F172A",
            }}
          >
            PDF File
          </span>
          <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: "#0F172A",
            }}
          >
            Notes
          </span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Example: W-9, billing setup form, service agreement, portal access authorization"
            rows={4}
            style={{
              width: "100%",
              border: "1px solid #CBD5E1",
              borderRadius: 12,
              padding: "12px 14px",
              fontSize: 14,
              color: "#0F172A",
              background: "#FFFFFF",
              outline: "none",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />
        </label>

        {state.error ? (
          <div
            style={{
              borderRadius: 12,
              border: "1px solid #FECACA",
              background: "#FEF2F2",
              color: "#B91C1C",
              padding: "12px 14px",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {state.error}
          </div>
        ) : null}

        {state.success ? (
          <div
            style={{
              borderRadius: 12,
              border: "1px solid #A7F3D0",
              background: "#ECFDF5",
              color: "#047857",
              padding: "12px 14px",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {state.success}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          style={{
            border: 0,
            borderRadius: 12,
            padding: "14px 20px",
            background: busy ? "#93C5FD" : "#1D4ED8",
            color: "#FFFFFF",
            fontWeight: 900,
            cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          {busy ? "Uploading..." : "Upload Document"}
        </button>
      </form>
    </div>
  );
}