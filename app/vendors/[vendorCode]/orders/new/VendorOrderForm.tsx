"use client";

import { useMemo, useState } from "react";

type VendorSnapshot = {
  vendorcode: string;
  companyName: string;
  companyType: string | null;
  companyLogoUrl: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  website: string | null;
  primaryPhone: string | null;
  secondaryPhone: string | null;
  primaryContactName: string | null;
  primaryContactEmail: string | null;
  primaryContactPhone: string | null;
  secondaryContactName: string | null;
  secondaryContactEmail: string | null;
  secondaryContactPhone: string | null;
  approvalStatus: string;
  isActive: boolean;
};

type Props = {
  vendorCode: string;
  vendor?: VendorSnapshot | null;
};

type FormState = {
  primaryBorrowerName: string;
  secondaryBorrowerName: string;
  borrowerPhone: string;
  borrowerEmail: string;
  propertyAddress1: string;
  propertyAddress2: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  signingDate: string;
  signingTimeLabel: string;
  estimatedPages: string;
  paperSize: string;
  preferredInk: string;
  serviceType: string;
  feeAmount: string;
  isRON: boolean;
  specialInstructions: string;
  paymentMethod: string;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid #CBD5E1",
  background: "#fff",
  color: "#0F172A",
  padding: "12px 14px",
  fontSize: 15,
  outline: "none",
};

const US_STATE_OPTIONS = [
  "",
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
] as const;

const PAPER_SIZE_OPTIONS = ["", "Both", "Letter", "Legal"] as const;
const INK_OPTIONS = ["", "Blue", "Black"] as const;

function formatPhoneDisplay(value: string | null | undefined) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 10);

  if (!digits) return "—";
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addMonths(date: Date, months: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function buildTimeOptions() {
  const options: string[] = [];
  for (let hour = 6; hour <= 21; hour += 1) {
    for (const minute of [0, 30]) {
      if (hour === 21 && minute > 0) continue;
      const suffix = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const displayMinute = String(minute).padStart(2, "0");
      options.push(`${displayHour}:${displayMinute} ${suffix}`);
    }
  }
  return options;
}

const TIME_OPTIONS = buildTimeOptions();

const initialState: FormState = {
  primaryBorrowerName: "",
  secondaryBorrowerName: "",
  borrowerPhone: "",
  borrowerEmail: "",
  propertyAddress1: "",
  propertyAddress2: "",
  propertyCity: "",
  propertyState: "",
  propertyZip: "",
  signingDate: "",
  signingTimeLabel: "",
  estimatedPages: "",
  paperSize: "",
  preferredInk: "",
  serviceType: "",
  feeAmount: "",
  isRON: false,
  specialInstructions: "",
  paymentMethod: "VendorPay",
};

function parseJsonSafe(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export default function VendorOrderForm({ vendorCode, vendor }: Props) {
  function nice(value: string | null | undefined) {
    const v = String(value || "").trim();
    return v || "—";
  }

  const [form, setForm] = useState<FormState>(initialState);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string>("");

  const minDate = useMemo(() => formatDateInput(new Date()), []);
  const maxDate = useMemo(() => formatDateInput(addMonths(new Date(), 6)), []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addFiles(next: FileList | null) {
    if (!next?.length) return;
    setFiles((prev) => [...prev, ...Array.from(next)]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setStatus("Submitting order...");

    try {
      const res = await fetch("/api/vendors/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendorCode,
          primaryBorrowerName: form.primaryBorrowerName,
          secondaryBorrowerName: form.secondaryBorrowerName || null,
          borrowerPhone: form.borrowerPhone || null,
          borrowerEmail: form.borrowerEmail || null,
          propertyAddress1: form.propertyAddress1,
          propertyAddress2: form.propertyAddress2 || null,
          propertyCity: form.propertyCity,
          propertyState: form.propertyState,
          propertyZip: form.propertyZip,
          signingDate: form.signingDate,
          signingTimeLabel: form.signingTimeLabel,
          estimatedPages: form.estimatedPages ? Number(form.estimatedPages) : null,
          paperSize: form.paperSize || null,
          preferredInk: form.preferredInk || null,
          serviceType: form.serviceType,
          feeAmount: form.feeAmount ? Number(form.feeAmount) : null,
          isRON: form.isRON,
          specialInstructions: form.specialInstructions || null,
          paymentMethod: form.paymentMethod || "VendorPay",
        }),
      });

      const text = await res.text();
      const json = parseJsonSafe(text);

      if (!res.ok || !json?.ok || !json?.order?.id) {
        throw new Error(json?.error || "Failed to submit order");
      }

      const orderId = json.order.id as string;

      for (const file of files) {
        setStatus(`Uploading ${file.name}...`);

        const uploadData = new FormData();
        uploadData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        const uploadText = await uploadRes.text();
        const uploadJson = parseJsonSafe(uploadText);

        if (!uploadRes.ok || !uploadJson?.ok || !uploadJson?.key) {
          throw new Error(uploadJson?.error || `Failed to upload ${file.name}`);
        }

        const attachRes = await fetch(`/api/orders/${orderId}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: uploadJson.originalName || file.name,
            storageKey: uploadJson.key,
            mimeType: file.type || "application/octet-stream",
            fileSizeBytes: uploadJson.size ?? file.size,
            documentType: "OTHER",
            visibility: "INTERNAL",
            notes: "Uploaded during vendor order creation",
          }),
        });

        const attachText = await attachRes.text();
        const attachJson = parseJsonSafe(attachText);

        if (!attachRes.ok || !attachJson?.ok) {
          throw new Error(attachJson?.error || `Failed to attach ${file.name}`);
        }
      }

      window.location.href = `/vendors/${vendorCode}/orders/${orderId}`;
    } catch (error: any) {
      setStatus(error?.message || "Failed to submit order");
      setSubmitting(false);
      return;
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 24 }}>
      {vendor ? (
        <section
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 18, color: "#0F172A" }}>
            Vendor Account Review
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 2fr) 240px",
              gap: 24,
              alignItems: "start",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 16,
              }}
            >
              <div><strong>Vendor Code:</strong> {nice(vendor.vendorcode)}</div>
              <div><strong>Company Name:</strong> {nice(vendor.companyName)}</div>
              <div><strong>Company Type:</strong> {nice(vendor.companyType)}</div>
              <div><strong>Approval Status:</strong> {nice(vendor.approvalStatus)}</div>
              <div><strong>Primary Contact:</strong> {nice(vendor.primaryContactName)}</div>
              <div><strong>Primary Contact Email:</strong> {nice(vendor.primaryContactEmail)}</div>
              <div><strong>Primary Contact Phone:</strong> {formatPhoneDisplay(vendor.primaryContactPhone)}</div>
              <div><strong>Primary Phone:</strong> {formatPhoneDisplay(vendor.primaryPhone)}</div>
              <div><strong>Secondary Phone:</strong> {formatPhoneDisplay(vendor.secondaryPhone)}</div>
              <div><strong>Secondary Contact Phone:</strong> {formatPhoneDisplay(vendor.secondaryContactPhone)}</div>
              <div><strong>Website:</strong> {nice(vendor.website)}</div>
              <div><strong>Address 1:</strong> {nice(vendor.address1)}</div>
              <div><strong>Address 2:</strong> {nice(vendor.address2)}</div>
              <div><strong>City:</strong> {nice(vendor.city)}</div>
              <div><strong>State:</strong> {nice(vendor.state)}</div>
              <div><strong>ZIP:</strong> {nice(vendor.zip)}</div>
              <div><strong>Active:</strong> {vendor.isActive ? "Yes" : "No"}</div>
            </div>

            <div
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: 14,
                padding: 16,
                background: "#F8FAFC",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                  marginBottom: 12,
                }}
              >
                Vendor Logo
              </div>

              {vendor.companyLogoUrl ? (
                <img
                  src={vendor.companyLogoUrl}
                  alt={`${vendor.companyName} logo`}
                  style={{
                    width: "100%",
                    maxHeight: 180,
                    objectFit: "contain",
                    borderRadius: 10,
                    background: "#fff",
                    border: "1px solid #E5E7EB",
                    padding: 12,
                  }}
                />
              ) : (
                <div
                  style={{
                    minHeight: 180,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    borderRadius: 10,
                    border: "1px dashed #CBD5E1",
                    background: "#fff",
                    color: "#64748B",
                    fontWeight: 700,
                    padding: 12,
                  }}
                >
                  No logo on file
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <section
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 18, color: "#0F172A" }}>
          Borrower Information
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          <Field label="Primary Borrower Name">
            <input style={inputStyle} value={form.primaryBorrowerName} onChange={(e) => update("primaryBorrowerName", e.target.value)} placeholder="Full borrower name" required />
          </Field>

          <Field label="Secondary Borrower Name">
            <input style={inputStyle} value={form.secondaryBorrowerName} onChange={(e) => update("secondaryBorrowerName", e.target.value)} placeholder="Optional" />
          </Field>

          <Field label="Borrower Phone">
            <input style={inputStyle} value={form.borrowerPhone} onChange={(e) => update("borrowerPhone", e.target.value)} placeholder="Phone number" />
          </Field>

          <Field label="Borrower Email">
            <input style={inputStyle} type="email" value={form.borrowerEmail} onChange={(e) => update("borrowerEmail", e.target.value)} placeholder="Email address" />
          </Field>
        </div>
      </section>

      <section
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 18, color: "#0F172A" }}>
          Property & Signing
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          <Field label="Property Address 1">
            <input style={inputStyle} value={form.propertyAddress1} onChange={(e) => update("propertyAddress1", e.target.value)} placeholder="Street address" required />
          </Field>

          <Field label="Property Address 2">
            <input style={inputStyle} value={form.propertyAddress2} onChange={(e) => update("propertyAddress2", e.target.value)} placeholder="Suite, unit, etc." />
          </Field>

          <Field label="City">
            <input style={inputStyle} value={form.propertyCity} onChange={(e) => update("propertyCity", e.target.value)} placeholder="City" required />
          </Field>

          <Field label="State">
            <select style={inputStyle} value={form.propertyState} onChange={(e) => update("propertyState", e.target.value)} required>
              {US_STATE_OPTIONS.map((state) => (
                <option key={state || "blank-state"} value={state}>
                  {state || "Select state"}
                </option>
              ))}
            </select>
          </Field>

          <Field label="ZIP">
            <input style={inputStyle} value={form.propertyZip} onChange={(e) => update("propertyZip", e.target.value)} placeholder="ZIP code" required />
          </Field>

          <Field label="Signing Date">
            <input
              style={inputStyle}
              type="date"
              min={minDate}
              max={maxDate}
              value={form.signingDate}
              onChange={(e) => update("signingDate", e.target.value)}
              required
            />
          </Field>

          <Field label="Signing Time">
            <select style={inputStyle} value={form.signingTimeLabel} onChange={(e) => update("signingTimeLabel", e.target.value)} required>
              <option value="">Select signing time</option>
              {TIME_OPTIONS.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Estimated Pages">
            <input style={inputStyle} type="number" min="0" value={form.estimatedPages} onChange={(e) => update("estimatedPages", e.target.value)} placeholder="Page count" />
          </Field>
        </div>
      </section>

      <section
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 18, color: "#0F172A" }}>
          Order Preferences
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          <Field label="Paper Size">
            <select style={inputStyle} value={form.paperSize} onChange={(e) => update("paperSize", e.target.value)}>
              {PAPER_SIZE_OPTIONS.map((size) => (
                <option key={size || "blank-paper"} value={size}>
                  {size || "Select paper size"}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Preferred Ink">
            <select style={inputStyle} value={form.preferredInk} onChange={(e) => update("preferredInk", e.target.value)}>
              {INK_OPTIONS.map((ink) => (
                <option key={ink || "blank-ink"} value={ink}>
                  {ink || "Select ink preference"}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Service Type">
            <input style={inputStyle} value={form.serviceType} onChange={(e) => update("serviceType", e.target.value)} placeholder="Purchase, Refinance, Seller Package, etc." required />
          </Field>

          <Field label="RON">
            <div
              style={{
                ...inputStyle,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <input id="vendor-ron" type="checkbox" checked={form.isRON} onChange={(e) => update("isRON", e.target.checked)} />
              <label htmlFor="vendor-ron" style={{ fontWeight: 700 }}>
                Remote Online Notarization
              </label>
            </div>
          </Field>
        </div>

        <div style={{ marginTop: 16 }}>
          <Field label="Special Instructions">
            <textarea
              style={{
                ...inputStyle,
                minHeight: 140,
                resize: "vertical",
              }}
              value={form.specialInstructions}
              onChange={(e) => update("specialInstructions", e.target.value)}
              placeholder="Add special instructions for the order"
            />
          </Field>
        </div>
      </section>

      <section
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 18, color: "#0F172A" }}>
          Payment Fee
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          <Field label="Signing Fee">
            <input
              style={inputStyle}
              type="number"
              min="0"
              step="0.01"
              value={form.feeAmount}
              onChange={(e) => update("feeAmount", e.target.value)}
              placeholder="Enter fee amount"
            />
          </Field>

          <Field label="Payment Method">
            <input style={inputStyle} value={form.paymentMethod} readOnly />
          </Field>
        </div>

        <div style={{ marginTop: 12, color: "#475569", fontWeight: 600 }}>
          VendorPay is the current payment path for vendor-submitted orders.
        </div>
      </section>

      <section
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 18, color: "#0F172A" }}>
          Documents
        </h2>

        <div
          style={{
            border: "1px solid #E5E7EB",
            borderRadius: 14,
            background: "#F8FAFC",
            padding: 16,
          }}
        >
          <input
            type="file"
            multiple
            accept=".pdf,application/pdf"
            onChange={(e) => addFiles(e.target.files)}
          />

          {files.length > 0 ? (
            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${file.size}-${index}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    border: "1px solid #E5E7EB",
                    borderRadius: 10,
                    padding: 12,
                    background: "#fff",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: "#0F172A" }}>{file.name}</div>
                    <div style={{ color: "#475569", marginTop: 4 }}>{formatBytes(file.size)}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    style={{
                      border: "1px solid #CBD5E1",
                      borderRadius: 10,
                      padding: "8px 12px",
                      background: "#fff",
                      color: "#0F172A",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: 12, color: "#475569", fontWeight: 600 }}>
              No documents selected yet.
            </div>
          )}
        </div>
      </section>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button
          type="submit"
          disabled={submitting}
          style={{
            border: 0,
            borderRadius: 10,
            padding: "14px 20px",
            background: submitting ? "#94A3B8" : "#1D4ED8",
            color: "white",
            fontWeight: 900,
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Submitting..." : "Submit Order"}
        </button>

        <a
          href={`/vendors/${vendorCode}/orders`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            border: "1px solid #CBD5E1",
            borderRadius: 10,
            padding: "14px 20px",
            fontWeight: 800,
            color: "#0F172A",
            background: "#fff",
          }}
        >
          Cancel
        </a>

        {status ? (
          <div style={{ color: "#475569", fontWeight: 700 }}>
            {status}
          </div>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <span
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: "#0F172A",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}