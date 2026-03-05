"use client";

import React, { useEffect, useMemo, useState } from "react";

type DocItem = {
  key: string;
  displayName?: string | null;
  sizeBytes?: number | null;
  lastModified?: string | null; // ISO string in UTC
};

function formatBytes(bytes?: number | null) {
  if (bytes == null) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v = v / 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * One UTC time saved in data,
 * shown in:
 * - viewer's local time (no timezone passed)
 * - ET (America/New_York)
 */
function formatDate(iso?: string | null, timeZone?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone, // undefined = viewer local time
  });
  return fmt.format(d);
}

function downloadUrl(key: string) {
  return `/api/documents/download?key=${encodeURIComponent(key)}`;
}

export default function DocumentsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("No file selected yet.");
  const [uploading, setUploading] = useState<boolean>(false);

  const [items, setItems] = useState<DocItem[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [listError, setListError] = useState<string>("");

  const canUpload = useMemo(() => !!selectedFile && !uploading, [selectedFile, uploading]);

  async function refreshList() {
    try {
      setLoadingList(true);
      setListError("");
      const res = await fetch("/api/documents/list", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `List failed (${res.status})`);
      }

      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e: any) {
      setListError(e?.message || "Failed to load documents.");
      setItems([]);
    } finally {
      setLoadingList(false);
    }
  }

  async function onUpload() {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setStatus("Uploading...");

      const fd = new FormData();
      fd.append("file", selectedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Upload failed (${res.status})`);
      }

      setStatus("Upload complete.");
      setSelectedFile(null);
      await refreshList();
    } catch (e: any) {
      setStatus(e?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-6xl font-extrabold tracking-tight text-slate-900">Documents</h1>
          <p className="mt-4 text-xl text-slate-600">
            Upload PDFs to S3 and view your stored files.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Upload card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-500">Upload</div>
                <div className="mt-1 text-2xl font-extrabold text-slate-900">Send a PDF to S3</div>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                S3
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
                  Choose File
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </label>

                <div className="text-sm text-slate-600">
                  {selectedFile ? selectedFile.name : "No file chosen"}
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-700">
                <span className="font-semibold">Status:</span> {selectedFile ? "Ready to upload." : status}
              </div>

              <button
                onClick={onUpload}
                disabled={!canUpload}
                className="mt-4 w-full rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500 disabled:cursor-not-allowed disabled:opacity-60 enabled:bg-indigo-600 enabled:text-white enabled:hover:bg-indigo-700"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>

              <div className="mt-3 text-xs text-slate-500">
                Step 1: Choose PDF. Step 2: Click Upload.
              </div>
            </div>
          </div>

          {/* List card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-500">Your files</div>
                <div className="mt-1 text-2xl font-extrabold text-slate-900">Stored in S3</div>
              </div>

              <button
                onClick={refreshList}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white">
              {loadingList ? (
                <div className="p-4 text-sm text-slate-600">Loading…</div>
              ) : listError ? (
                <div className="p-4 text-sm text-red-600">{listError}</div>
              ) : items.length === 0 ? (
                <div className="p-4 text-sm text-slate-600">No files found.</div>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {items.map((it) => {
                    const title = it.displayName || it.key;
                    const localTime = formatDate(it.lastModified); // viewer local time
                    const etTime = formatDate(it.lastModified, "America/New_York"); // ET

                    return (
                      <li key={it.key} className="flex items-center justify-between gap-4 p-4">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-slate-900" title={title}>
                            {title}
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {localTime ? (
                              <>
                                Uploaded {localTime} <span className="text-slate-400">(your time)</span>
                              </>
                            ) : null}
                            {localTime && etTime ? <span className="text-slate-400"> · </span> : null}
                            {etTime ? (
                              <>
                                {etTime} <span className="text-slate-400">(ET)</span>
                              </>
                            ) : null}
                            {(localTime || etTime) && it.sizeBytes != null ? (
                              <span className="text-slate-400"> · </span>
                            ) : null}
                            {it.sizeBytes != null ? formatBytes(it.sizeBytes) : null}
                          </div>
                        </div>

                        <a
                          href={downloadUrl(it.key)}
                          className="shrink-0 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                        >
                          Download
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-14 border-t border-slate-200 pt-8 text-sm text-slate-500">
          Notary Portal • Simple workflow • One step at a time
        </footer>
      </section>
    </main>
  );
}
