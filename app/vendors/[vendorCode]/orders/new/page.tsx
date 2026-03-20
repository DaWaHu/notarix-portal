"use client";

import Image from "next/image";
import { useState } from "react";
import { useParams } from "next/navigation";

type FormState = {
  primaryBorrowerName: string;
  secondaryBorrowerName: string;
  propertyAddress1: string;
  propertyAddress2: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  borrowerPhone: string;
  borrowerEmail: string;
  signingDate: string;
  signingTimeLabel: string;
  estimatedPages: string;
  paperSize: string;
  preferredInk: string;
  isRON: boolean;
  serviceType: string;
  specialInstructions: string;
};

const initialForm: FormState = {
  primaryBorrowerName: "",
  secondaryBorrowerName: "",
  propertyAddress1: "",
  propertyAddress2: "",
  propertyCity: "",
  propertyState: "",
  propertyZip: "",
  borrowerPhone: "",
  borrowerEmail: "",
  signingDate: "",
  signingTimeLabel: "",
  estimatedPages: "",
  paperSize: "",
  preferredInk: "",
  isRON: false,
  serviceType: "",
  specialInstructions: "",
};

export default function NewVendorOrderPage() {
  const params = useParams();
  const vendorCode = String(params?.vendorCode || "").toUpperCase().trim();

  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!vendorCode) {
      setError("Vendor code is missing from the page URL.");
      return;
    }

    if (
      !form.primaryBorrowerName.trim() ||
      !form.propertyAddress1.trim() ||
      !form.propertyCity.trim() ||
      !form.propertyState.trim() ||
      !form.propertyZip.trim()
    ) {
      setError(
        "Please complete Primary Borrower Name, Property Address, City, State, and Zip."
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendorCode,
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
          signingTimeLabel: form.signingTimeLabel || null,
          estimatedPages: form.estimatedPages ? Number(form.estimatedPages) : null,
          paperSize: form.paperSize || null,
          preferredInk: form.preferredInk || null,
          isRON: form.isRON,
          serviceType: form.serviceType || null,
          specialInstructions: form.specialInstructions || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Unable to save order.");
      }

      setSuccess(
        `Order created successfully. Order Number: ${data.order?.orderNumber || "Created"}`
      );
      setForm(initialForm);
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F1F5F9",
        padding: 28,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
      }}
    >
      <div
        style={{
          background: "#1e40af",
          color: "white",
          padding: "16px 22px",
          borderRadius: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 10px 30px rgba(30, 64, 175, 0.25)",
          marginBottom: 18,
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Image
            src="/notarix-logo.png"
            alt="Notarix"
            width={44}
            height={44}
            style={{
              width: 44,
              height: 44,
              objectFit: "contain",
              background: "white",
              borderRadius: 10,
              padding: 4,
            }}
          />
          <div style={{ fontWeight: 900 }}>Create New Order</div>
        </div>

        <div style={{ fontWeight: 800 }}>Powered by Notarix</div>
      </div>

      <form
        onSubmit={onSubmit}
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 14,
          padding: 24,
          boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
        }}
      >
        <h1
          style={{
            margin: "0 0 18px",
            fontSize: 28,
            fontWeight: 950,
            color: "#0F172A",
          }}
        >
          Order Intake
        </h1>

        {error ? (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 14px",
              borderRadius: 10,
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#991B1B",
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 14px",
              borderRadius: 10,
              background: "#ECFDF5",
              border: "1px solid #A7F3D0",
              color: "#065F46",
              fontWeight: 700,
            }}
          >
            {success}
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          <label>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              Primary Borrower Name
            </div>
            <input
              value={form.primaryBorrowerName}
              onChange={(e) => update("primaryBorrowerName", e.target.value)}
              placeholder="Last Name, First Name"
              style={inputStyle}
            />
          </label>

          <label>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              Secondary Borrower / Signer
            </div>
            <input
              value={form.secondaryBorrowerName}
              onChange={(e) => update("secondaryBorrowerName", e.target.value)}
              placeholder="Last Name, First Name"
              style={inputStyle}
            />
          </label>

          <label style={{ gridColumn: "1 / span 2" }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              Property Address 1
            </div>
            <input
              value={form.propertyAddress1}
              onChange={(e) => update("propertyAddress1", e.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={{ gridColumn: "1 / span 2" }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              Property Address 2
            </div>
            <input
              value={form.propertyAddress2}
              onChange={(e) => update("propertyAddress2", e.target.value)}
              style={inputStyle}
            />
          </label>

          <label>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>City</div>
            <input
              value={form.propertyCity}
              onChange={(e) => update("propertyCity", e.target.value)}
              style={inputStyle}
            />
          </label>

          <label>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>State</div>
            <input
              value={form.propertyState}
              onChange={(e) => update("propertyState", e.target.value)}
              style={inputStyle}
            />
          </label>

          <label>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Zip</div>
            <input
              value={form.propertyZip}
              onChange={(e) => update("propertyZip", e.target.value)}
              style={inputStyle}
            />
          </label>

          <label>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              Borrower Phone
            </div>
            <input
              value={form.borrowerPhone}
              onChange={(e) => update("borrowerPhone", e.target.value)}
              style={inputStyle}
            />
          </label>

          <label>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              Borrower Email
            </div>
            <input
              type="email"
              value={form.borrowerEmail}
              onChange={(e) => update("borrowerEmail", e.target.value)}
              style={inputStyle}
            />
          </label>

          <label>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              Signing Date
            </div>
            <input
              type="date"
              value={form.signingDate}
              onChange={(e) => update("signingDate", e.target.value)}
              style={inputStyle}
            />
          </label>

          <label>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              Signing Time
            </div>
            <input
              value={form.signingTimeLabel}
              onChange={(e) => update("signingTimeLabel", e.target.value)}
              placeholder="2:30 PM EST"
              style={inputStyle}
            />
          </label>

          <label>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              Estimated Pages
            </div>
            <input
              type="number"
              value={form.estimatedPages}
              onChange={(e) => update("estimatedPages", e.target.value)}
              style={inputStyle}
            />
          </label>

          <label>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              Paper Size
            </div>
            <select
              value={form.paperSize}
              onChange={(e) => update("paperSize", e.target.value)}
              style={inputStyle}
            >
              <option value="">Select</option>
              <option value="LEGAL">Legal</option>
              <option value="LETTER">Letter</option>
              <option value="BOTH">Both</option>
            </select>
          </label>

          <label>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              Preferred Ink
            </div>
            <select
              value={form.preferredInk}
              onChange={(e) => update("preferredInk", e.target.value)}
              style={inputStyle}
            >
              <option value="">Select</option>
              <option value="BLUE">Blue</option>
              <option value="BLACK">Black</option>
            </select>
          </label>

          <label>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              Service Type
            </div>
            <input
              value={form.serviceType}
              onChange={(e) => update("serviceType", e.target.value)}
              placeholder="Purchase, Refinance, Seller Package, etc."
              style={inputStyle}
            />
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 28,
              fontWeight: 800,
            }}
          >
            <input
              type="checkbox"
              checked={form.isRON}
              onChange={(e) => update("isRON", e.target.checked)}
            />
            Remote Online Notarization (RON)
          </label>

          <label style={{ gridColumn: "1 / span 2" }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              Special Instructions
            </div>
            <textarea
              value={form.specialInstructions}
              onChange={(e) => update("specialInstructions", e.target.value)}
              rows={5}
              style={{ ...inputStyle, resize: "vertical" as const }}
            />
          </label>
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: "#1D4ED8",
              color: "white",
              border: "none",
              borderRadius: 10,
              padding: "12px 18px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            {submitting ? "Saving..." : "Create Order"}
          </button>

          <a
            href={`/vendors/${vendorCode}/orders`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #CBD5E1",
              borderRadius: 10,
              padding: "12px 18px",
              fontWeight: 900,
              color: "#0F172A",
              textDecoration: "none",
            }}
          >
            Back to Orders
          </a>
        </div>
      </form>

      <div
        style={{
          marginTop: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          color: "#64748B",
        }}
      >
        <Image
          src="/notarix-logo.png"
          alt="Notarix"
          width={72}
          height={72}
          style={{ width: 72, height: 72, objectFit: "contain" }}
        />
        <div style={{ fontWeight: 800 }}>© 2026 Notarix.live</div>
      </div>
    </div>
    </main >
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #CBD5E1",
  borderRadius: 10,
  fontSize: 14,
  outline: "none",
  background: "#fff",
};