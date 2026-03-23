"use client";

import { useState } from "react";

type Props = {
  vendorCode: string;
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
  isRON: boolean;
  specialInstructions: string;
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
  isRON: false,
  specialInstructions: "",
};

export default function VendorOrderForm({ vendorCode }: Props) {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string>("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
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
          isRON: form.isRON,
          specialInstructions: form.specialInstructions || null,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Failed to submit order");
      }

      window.location.href = `/vendors/${vendorCode}/orders`;
    } catch (error: any) {
      setStatus(error?.message || "Failed to submit order");
      setSubmitting(false);
      return;
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 24 }}>
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
            <input
              style={inputStyle}
              value={form.primaryBorrowerName}
              onChange={(e) => update("primaryBorrowerName", e.target.value)}
              placeholder="Full borrower name"
              required
            />
          </Field>

          <Field label="Secondary Borrower Name">
            <input
              style={inputStyle}
              value={form.secondaryBorrowerName}
              onChange={(e) => update("secondaryBorrowerName", e.target.value)}
              placeholder="Optional"
            />
          </Field>

          <Field label="Borrower Phone">
            <input
              style={inputStyle}
              value={form.borrowerPhone}
              onChange={(e) => update("borrowerPhone", e.target.value)}
              placeholder="Phone number"
            />
          </Field>

          <Field label="Borrower Email">
            <input
              style={inputStyle}
              type="email"
              value={form.borrowerEmail}
              onChange={(e) => update("borrowerEmail", e.target.value)}
              placeholder="Email address"
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
          Property & Signing
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          <Field label="Property Address 1">
            <input
              style={inputStyle}
              value={form.propertyAddress1}
              onChange={(e) => update("propertyAddress1", e.target.value)}
              placeholder="Street address"
              required
            />
          </Field>

          <Field label="Property Address 2">
            <input
              style={inputStyle}
              value={form.propertyAddress2}
              onChange={(e) => update("propertyAddress2", e.target.value)}
              placeholder="Suite, unit, etc."
            />
          </Field>

          <Field label="City">
            <input
              style={inputStyle}
              value={form.propertyCity}
              onChange={(e) => update("propertyCity", e.target.value)}
              placeholder="City"
              required
            />
          </Field>

          <Field label="State">
            <input
              style={inputStyle}
              value={form.propertyState}
              onChange={(e) => update("propertyState", e.target.value)}
              placeholder="State"
              required
            />
          </Field>

          <Field label="ZIP">
            <input
              style={inputStyle}
              value={form.propertyZip}
              onChange={(e) => update("propertyZip", e.target.value)}
              placeholder="ZIP code"
              required
            />
          </Field>

          <Field label="Signing Date">
            <input
              style={inputStyle}
              type="date"
              value={form.signingDate}
              onChange={(e) => update("signingDate", e.target.value)}
              required
            />
          </Field>

          <Field label="Signing Time">
            <input
              style={inputStyle}
              value={form.signingTimeLabel}
              onChange={(e) => update("signingTimeLabel", e.target.value)}
              placeholder="Example: 10:00 AM"
              required
            />
          </Field>

          <Field label="Estimated Pages">
            <input
              style={inputStyle}
              type="number"
              min="0"
              value={form.estimatedPages}
              onChange={(e) => update("estimatedPages", e.target.value)}
              placeholder="Page count"
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
          Order Preferences
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          <Field label="Paper Size">
            <input
              style={inputStyle}
              value={form.paperSize}
              onChange={(e) => update("paperSize", e.target.value)}
              placeholder="Letter, Legal, A4, etc."
            />
          </Field>

          <Field label="Preferred Ink">
            <input
              style={inputStyle}
              value={form.preferredInk}
              onChange={(e) => update("preferredInk", e.target.value)}
              placeholder="Blue, Black, etc."
            />
          </Field>

          <Field label="Service Type">
            <input
              style={inputStyle}
              value={form.serviceType}
              onChange={(e) => update("serviceType", e.target.value)}
              placeholder="Purchase, Refinance, Seller Package, etc."
              required
            />
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
              <input
                id="vendor-ron"
                type="checkbox"
                checked={form.isRON}
                onChange={(e) => update("isRON", e.target.checked)}
              />
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
