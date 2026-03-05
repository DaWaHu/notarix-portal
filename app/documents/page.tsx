"use client";

import React, { useEffect, useMemo, useState } from "react";

type DocItem = {
  key: string;
  size?: number;
  lastModified?: string; // ISO string in UTC from the API (recommended)
};

function getLocalTimeZone(): string {
  // Browser knows the user's timezone automatically.
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function formatDateTime(
  iso: string,
  timeZone: string,
  opts?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const formatter = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    ...opts,
  });

  return formatter.format(date);
}

function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === null) return "";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
}

function basenameFromKey(key: string): string {
  const base = key.split("/").pop() || key;
  return base;
}

function niceFilename(key: string): string {
  const base = basenameFromKey(key);

  // If your keys look like: UUID-FILENAME.pdf
  // Example: 6572f8e4-a773-4801-9874-cd845b2737df-Completed_3_of_3.pdf
  // This removes the UUID + dash prefix.
  const uuidPrefix =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i;

  const withoutUuid = base.replace(uuidPrefix, "");

  // Optional small cleanup: underscores to spaces for readability.
  // (If you prefer underscores, delete the next line.)
  return withoutUuid.replaceAll("_", " ");
}

export default function DocumentsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("No file selected yet.");
  const [uploading, setUploading] = useState<boolean>(false);

  const [items, setItems] = useState<DocItem[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [listError, setListError] = useState<string>("");

  const localTZ = useMemo(() => getLocalTimeZone(), []);
  const COMPANY_TZ = "America/New_York"; // Eastern Time (handles DST automatically)

  const canUpload = useMemo(
    () => !!selectedFile && !uploading,
    [selectedFile, uploading]
  );

  async function refreshList() {
    setLoadingList(true);
    setListError("");
    try {
      const res = await fetch("/api/documents/list", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `List failed (${res.status})`);
      }

      const next: DocItem[] = Array.isArray(data.items) ? data.items : [];
      setItems(next);
    } catch (e: any) {
      setItems([]);
      setListError(e?.message || "Failed to load documents.");
    } finally {
      setLoadingList(false);
    }
  }

  async function uploadFile() {
    if (!selectedFile) return;

    setUploading(true);
    setStatus("Uploading...");
    try {
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

  function downloadUrl(key: string) {
    return `/api/documents/download?key=${encodeURIComponent(key)}`;
  }

  useEffect(() => {
    refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-6xl font-extrabold tracking-tight text-slate-900">
            Documents
          </h1>
          <p className="mt-4 text-xl text-slate-600">
            Upload PDFs to S3 and view your stored files.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Upload card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-500">
                  Upload
                </div>
                <div className="mt-1 text-2xl font-extrabold text-slate-900">
                  Send a PDF to S3
                </div>
              </div>

              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                S3
              </span>
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
                  Choose File
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setSelectedFile(f);
                      setStatus(f ? "Ready to upload." : "No file selected yet.");
                    }}
                  />
                </label>

                <div className="text-sm text-slate-600">
                  {selectedFile ? selectedFile.name : "No file chosen"}
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-700">
                <span className="font-semibold">Status:</span>{" "}
                <span>{status}</span>
              </div>

              <button
                className="mt-4 w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500 shadow-sm disabled:cursor-not-allowed enabled:bg-indigo-50 enabled:text-indigo-700 enabled:hover:bg-indigo-100"
                disabled={!canUpload}
                onClick={uploadFile}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>

              <div className="mt-3 text-xs text-slate-500">
                Step 1: Choose PDF. Step 2: Click Upload.
              </div>
            </div>

            {/* Keeps the card height balanced visually (optional spacer) */}
            <div className="mt-6 min-h-[220px]" />
          </div>

          {/* List card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-500">
                  Your files
                </div>
                <div className="mt-1 text-2xl font-extrabold text-slate-900">
                  Stored in S3
                </div>
              </div>

              <button
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                onClick={refreshList}
                disabled={loadingList}
              >
                {loadingList ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200">
              {listError ? (
                <div className="p-4 text-sm text-red-600">{listError}</div>
              ) : items.length === 0 ? (
                <div className="p-4 text-sm text-slate-600">
                  {loadingList ? "Loading..." : "No documents found."}
                </div>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {items.map((it) => {
                    const displayName = niceFilename(it.key);
                    const last = it.lastModified;

                    // Local time for the viewer (automatic)
                    const localTime = last
                      ? formatDateTime(last, localTZ)
                      : "";

                    // Company official time (ET)
                    const easternTime = last
                      ? formatDateTime(last, COMPANY_TZ)
                      : "";

                    return (
                      <li
                        key={it.key}
                        className="flex items-center justify-between gap-4 p-4"
                      >
                        <div className="min-w-0">
                          <div
                            className="truncate text-sm font-bold text-slate-900"
                            title={displayName}
                          >
                            {displayName}
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {last ? (
                              <>
                                Uploaded{" "}
                                <span className="font-semibold text-slate-700">
                                  {localTime}
                                </span>{" "}
                                <span className="text-slate-400">
                                  (your time)
                                </span>
                                <span className="text-slate-300"> • </span>
                                <span className="font-semibold text-slate-700">
                                  {easternTime}
                                </span>{" "}
                                <span className="text-slate-400">(ET)</span>
                              </>
                            ) : (
                              "Uploaded time not available"
                            )}
                            {it.size !== undefined ? (
                              <>
                                <span className="text-slate-300"> • </span>
                                {formatBytes(it.size)}
                              </>
                            ) : null}
                          </div>
                        </div>

                        <a
                          href={downloadUrl(it.key)}
                          className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
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
