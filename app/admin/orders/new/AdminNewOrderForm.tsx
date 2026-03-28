"use client";

import { useMemo, useState } from "react";

type FormState = {
  vendorCode: string;
  serviceType: string;
  customServiceType: string;
  primaryBorrowerName: string;
  borrowerPhone: string;
  borrowerEmail: string;
  secondaryBorrowerName: string;
  propertyAddress1: string;
  propertyAddress2: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  signingDate: string;
  signingTime: string;
  signingTimeZone: string;
  estimatedPages: string;
  feeAmount: string;
  paymentDueStatus: string;
  paymentDueDate: string;
  paymentMethod: string;
  paymentPaid: string;
  paymentPaidDate: string;
  paymentNotes: string;
  paperSize: string;
  preferredInk: string;
  isRON: boolean;
  specialInstructions: string;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #CBD5E1",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 13,
  color: "#0F172A",
  background: "white",
  outline: "none",
  boxSizing: "border-box",
};

const US_STATE_OPTIONS = [
  "", "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
] as const;

const TIMEZONE_OPTIONS = ["", "EST", "CST", "MST", "PST"] as const;
const PAPER_SIZE_OPTIONS = ["", "Both", "Letter", "Legal"] as const;
const INK_OPTIONS = ["", "Blue", "Black"] as const;
const PAYMENT_DUE_STATUS_OPTIONS = ["", "Pending", "Due", "Past Due", "Not Applicable"] as const;
const PAYMENT_METHOD_OPTIONS = ["", "VendorPay", "ACH", "Check", "Wire", "Other"] as const;

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
  vendorCode: "",
  serviceType: "",
  customServiceType: "",
  primaryBorrowerName: "",
  borrowerPhone: "",
  borrowerEmail: "",
  secondaryBorrowerName: "",
  propertyAddress1: "",
  propertyAddress2: "",
  propertyCity: "",
  propertyState: "",
  propertyZip: "",
  signingDate: "",
  signingTime: "",
  signingTimeZone: "",
  estimatedPages: "",
  feeAmount: "",
  paymentDueStatus: "",
  paymentDueDate: "",
  paymentMethod: "",
  paymentPaid: "false",
  paymentPaidDate: "",
  paymentNotes: "",
  paperSize: "",
  preferredInk: "",
  isRON: false,
  specialInstructions: "",
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

export default function AdminNewOrderForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  const minDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  const maxDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split("T")[0];
  }, []);

  const availableTimeOptions = useMemo(() => {
    if (form.signingDate !== minDate) {
      return TIME_OPTIONS;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return TIME_OPTIONS.filter((time) => {
      const match = time.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/);
      if (!match) return false;

      const [, hourText, minuteText, suffix] = match;
      let hour = Number(hourText);
      const minute = Number(minuteText);

      if (suffix === "PM" && hour !== 12) hour += 12;
      if (suffix === "AM" && hour === 12) hour = 0;

      const optionMinutes = hour * 60 + minute;
      return optionMinutes >= currentMinutes;
    });
  }, [form.signingDate, minDate]);

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
    setStatus("Creating order...");

    try {
      const createRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorCode: form.vendorCode.trim().toUpperCase(),
          primaryBorrowerName: form.primaryBorrowerName,
          secondaryBorrowerName: form.secondaryBorrowerName || null,
          propertyAddress1: form.propertyAddress1,
          propertyAddress2: form.propertyAddress2 || null,
          propertyCity: form.propertyCity,
          propertyState: form.propertyState,
          propertyZip: form.propertyZip,
          borrowerPhone: form.borrowerPhone || null,
          borrowerEmail: form.borrowerEmail || null,
          signingDate: form.signingDate || null,
          signingTimeLabel: [form.signingTime, form.signingTimeZone].filter(Boolean).join(" ") || null,
          estimatedPages: form.estimatedPages ? Number(form.estimatedPages) : null,
          paperSize: form.paperSize || null,
          preferredInk: form.preferredInk || null,
          isRON: form.isRON,
          serviceType:
            form.serviceType === "__OTHER__"
              ? form.customServiceType.trim() || "Other"
              : form.serviceType || null,
          specialInstructions: form.specialInstructions || null,
          feeAmount: form.feeAmount ? Number(form.feeAmount) : null,
          paymentDueStatus: form.paymentDueStatus || null,
          paymentDueDate: form.paymentDueDate || null,
          paymentMethod: form.paymentMethod || null,
          paymentPaid: form.paymentPaid === "true",
          paymentPaidDate: form.paymentPaidDate || null,
          paymentNotes: form.paymentNotes || null,
        }),
      });

      const createText = await createRes.text();
      const createJson = parseJsonSafe(createText);

      if (!createRes.ok || !createJson?.ok || !createJson?.order?.id) {
        throw new Error(createJson?.error || "Failed to create order");
      }

      const orderId = createJson.order.id as string;

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
            notes: "Uploaded during order creation",
          }),
        });

        const attachText = await attachRes.text();
        const attachJson = parseJsonSafe(attachText);

        if (!attachRes.ok || !attachJson?.ok) {
          throw new Error(attachJson?.error || `Failed to attach ${file.name}`);
        }
      }

      window.location.href = `/admin/orders/${orderId}`;
    } catch (error: any) {
      setStatus(error?.message || "Failed to create order");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 18 }}>
      <section>
        <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", marginBottom: 12 }}>
          Client Information
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          <Field label="Vendor Code">
            <input
              value={form.vendorCode}
              onChange={(e) => update("vendorCode", e.target.value)}
              style={inputStyle}
              placeholder="Vendor code"
              required
            />
          </Field>

          <Field label="Service Type">
            <div style={{ display: "grid", gap: 10 }}>
              <select
                value={form.serviceType}
                onChange={(e) => update("serviceType", e.target.value)}
                style={inputStyle}
              >
                <option value="">Select service type</option>
                <option value="Claim Documents">Claim Documents</option>
                <option value="HELOC">HELOC</option>
                <option value="Investment">Investment</option>
                <option value="Loan Modification">Loan Modification</option>
                <option value="Miscellaneous Doc(s)">Miscellaneous Doc(s)</option>
                <option value="Photo (Ext/Int)">Photo (Ext/Int)</option>
                <option value="Purchase">Purchase</option>
                <option value="Refinance">Refinance</option>
                <option value="Reverse Mortgage">Reverse Mortgage</option>
                <option value="Seller Package">Seller Package</option>
                <option value="__OTHER__">Other</option>
              </select>

              {form.serviceType === "__OTHER__" ? (
                <input
                  value={form.customServiceType}
                  onChange={(e) => update("customServiceType", e.target.value)}
                  style={inputStyle}
                  placeholder="Type custom service type"
                />
              ) : null}
            </div>

          </Field>
        </div>
      </section>
      <section>
        <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", marginBottom: 12 }}>
          Borrower Information
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          <Field label="Primary Borrower Name">
            <input value={form.primaryBorrowerName} onChange={(e) => update("primaryBorrowerName", e.target.value)} style={inputStyle} placeholder="Last Name, First Name" required />
          </Field>

          <Field label="Borrower Phone">
            <input value={form.borrowerPhone} onChange={(e) => update("borrowerPhone", e.target.value)} style={inputStyle} placeholder="111-222-3333" />
          </Field>

          <Field label="Borrower Email">
            <input value={form.borrowerEmail} onChange={(e) => update("borrowerEmail", e.target.value)} style={inputStyle} placeholder="borrower@example.com" />
          </Field>

          <Field label="Secondary Borrower / Signer">
            <input value={form.secondaryBorrowerName} onChange={(e) => update("secondaryBorrowerName", e.target.value)} style={inputStyle} placeholder="Last Name, First Name" />
          </Field>
        </div>
      </section>

      <section>
        <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", marginBottom: 12 }}>
          Property & Signing Details
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          <Field label="Property Address 1">
            <input value={form.propertyAddress1} onChange={(e) => update("propertyAddress1", e.target.value)} style={inputStyle} placeholder="Street address" required />
          </Field>

          <Field label="Property Address 2">
            <input value={form.propertyAddress2} onChange={(e) => update("propertyAddress2", e.target.value)} style={inputStyle} placeholder="Suite, unit, etc." />
          </Field>

          <Field label="City">
            <input value={form.propertyCity} onChange={(e) => update("propertyCity", e.target.value)} style={inputStyle} placeholder="City" required />
          </Field>

          <Field label="State">
            <select value={form.propertyState} onChange={(e) => update("propertyState", e.target.value)} style={inputStyle} required>
              {US_STATE_OPTIONS.map((state) => (
                <option key={state || "blank-state"} value={state}>
                  {state || "Select state"}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Zip">
            <input value={form.propertyZip} onChange={(e) => update("propertyZip", e.target.value)} style={inputStyle} placeholder="Zip code" required />
          </Field>

          <Field label="Signing Date">
            <input value={form.signingDate} onChange={(e) => update("signingDate", e.target.value)} style={inputStyle} type="date" min={minDate} max={maxDate} required />
          </Field>

          <Field label="Signing Time">
            <select value={form.signingTime} onChange={(e) => update("signingTime", e.target.value)} style={inputStyle} required>
              <option value="">Select signing time</option>
              {availableTimeOptions.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </Field>

          <Field label="Time Zone">
            <select value={form.signingTimeZone} onChange={(e) => update("signingTimeZone", e.target.value)} style={inputStyle}>
              <option value="">Select time zone</option>
              {TIMEZONE_OPTIONS.map((tz) => tz ? <option key={tz} value={tz}>{tz}</option> : null)}
            </select>
          </Field>

        </div>
      </section>

      <section>
        <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", marginBottom: 12 }}>
          Payment / Fee Details
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          <Field label="Fee Amount">
            <input value={form.feeAmount} onChange={(e) => update("feeAmount", e.target.value)} style={inputStyle} placeholder="0.00" type="number" min="0" step="0.01" />
          </Field>

          <Field label="Payment Due Status">
            <select value={form.paymentDueStatus} onChange={(e) => update("paymentDueStatus", e.target.value)} style={inputStyle}>
              {PAYMENT_DUE_STATUS_OPTIONS.map((v) => (
                <option key={v || "blank-due-status"} value={v}>
                  {v || "Select payment status"}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Payment Due Date">
            <input value={form.paymentDueDate} onChange={(e) => update("paymentDueDate", e.target.value)} style={inputStyle} type="date" />
          </Field>

          <Field label="Payment Method">
            <select value={form.paymentMethod} onChange={(e) => update("paymentMethod", e.target.value)} style={inputStyle}>
              {PAYMENT_METHOD_OPTIONS.map((v) => (
                <option key={v || "blank-payment-method"} value={v}>
                  {v || "Select payment method"}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Payment Paid">
            <select value={form.paymentPaid} onChange={(e) => update("paymentPaid", e.target.value)} style={inputStyle}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </Field>

          <Field label="Payment Paid Date">
            <input value={form.paymentPaidDate} onChange={(e) => update("paymentPaidDate", e.target.value)} style={inputStyle} type="date" />
          </Field>
        </div>

        <div style={{ marginTop: 16 }}>
          <Field label="Payment Notes">
            <textarea value={form.paymentNotes} onChange={(e) => update("paymentNotes", e.target.value)} style={{ ...inputStyle, minHeight: 96, resize: "vertical" }} placeholder="Add fee notes, due terms, special billing instructions, or payment follow-up details" />
          </Field>
        </div>
      </section>

      <section>
        <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", marginBottom: 12 }}>
          Service Details
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          <Field label="Paper Size">
            <select
              value={form.paperSize}
              onChange={(e) => update("paperSize", e.target.value)}
              style={inputStyle}
            >
              {PAPER_SIZE_OPTIONS.map((v) => (
                <option key={v || "blank-paper-size"} value={v}>
                  {v || "Select paper size"}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Preferred Ink">
            <select
              value={form.preferredInk}
              onChange={(e) => update("preferredInk", e.target.value)}
              style={inputStyle}
            >
              {INK_OPTIONS.map((v) => (
                <option key={v || "blank-ink"} value={v}>
                  {v || "Select preferred ink"}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Estimated Pages">
            <input
              value={form.estimatedPages}
              onChange={(e) => update("estimatedPages", e.target.value)}
              style={inputStyle}
              placeholder="Estimated pages"
              type="number"
              min="0"
            />
          </Field>

          <Field label="RON">
            <div style={{ ...inputStyle, display: "flex", alignItems: "center", gap: 10 }}>
              <input
                id="admin-is-ron"
                type="checkbox"
                checked={form.isRON}
                onChange={(e) => update("isRON", e.target.checked)}
              />
              <label htmlFor="admin-is-ron" style={{ fontWeight: 700 }}>
                Remote Online Notarization
              </label>
            </div>
          </Field>
        </div>

        <div style={{ marginTop: 16 }}>
          <Field label="Special Instructions">
            <textarea value={form.specialInstructions} onChange={(e) => update("specialInstructions", e.target.value)} style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} placeholder="Add special instructions for the order" />
          </Field>
        </div>
      </section>

      <section>
        <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", marginBottom: 12 }}>
          Documents
        </div>

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

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="submit"
          disabled={submitting}
          style={{
            border: 0,
            borderRadius: 10,
            padding: "14px 18px",
            fontWeight: 900,
            background: submitting ? "#94A3B8" : "#1D4ED8",
            color: "#fff",
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Creating Order..." : "Create Order"}
        </button>

        <a
          href="/admin/orders"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            border: "1px solid #CBD5E1",
            borderRadius: 10,
            padding: "14px 18px",
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
          fontSize: 13,
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
