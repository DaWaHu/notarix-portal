"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type FormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  contactType: string;
  requestType: string;
  coverageArea: string;
  message: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  contactType: "",
  requestType: "",
  coverageArea: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const messagePlaceholder = useMemo(() => {
    switch (form.requestType) {
      case "Request Platform Access":
        return "Tell us about your organization, the type of access you need, and any onboarding details our team should review.";
      case "Request Notary Review":
        return "Tell us about your signing experience, service area, credentials, and how you would like to work with Notarix™.";
      case "Request Demo":
        return "Tell us about your current workflow, who would use the platform, and what you want to review in a Notarix™ demo.";
      case "Support Request":
        return "Describe the issue, what page or workflow you were using, and any details that will help us resolve it quickly.";
      case "Partnership Inquiry":
        return "Tell us about your business, your services, and the type of partnership or commercial discussion you want to have.";
      case "Billing / Accounting":
        return "Provide the billing, payment, or accounting details our team should review.";
      case "Integration / Technical Inquiry":
        return "Describe your current systems and the integration or technical discussion you would like to have with Notarix™.";
      default:
        return "Tell us how you plan to use Notarix™, what type of access or onboarding you need, and any relevant details for review.";
    }
  }, [form.requestType]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    if (!form.name || !form.email || !form.contactType || !form.requestType) {
      setResult({
        ok: false,
        message:
          "Please complete Name, Email, Contact Type, and Request Type before submitting.",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({
          ok: false,
          message: data?.error || "Something went wrong. Please try again.",
        });
        setLoading(false);
        return;
      }

      setResult({
        ok: true,
        message:
          "Your request has been submitted successfully. Our team will review it and follow up with you.",
      });

      setForm(INITIAL_FORM);
    } catch {
      setResult({
        ok: false,
        message: "Unable to submit your request right now. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "#0F172A",
      }}
    >
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "6px 4px 0",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "#f3f3f3",
            border: "1px solid #d7d7d7",
            borderRadius: 18,
            padding: "6px 4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 22,
                background: "#ffffff",
                border: "1px solid #d7d7d7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
                flexShrink: 0,
              }}
            >
              <Image
                src="/notarix-logo.png"
                alt="Notarix™"
                width={76}
                height={76}
                style={{
                  width: 76,
                  height: 76,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 950,
                  fontSize: 16,
                  lineHeight: 1.1,
                  letterSpacing: -0.3,
                  color: "#333333",
                }}
              >
                Notarix™
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: "#666666",
                  fontWeight: 600,
                  lineHeight: 1.3,
                  marginTop: 8,
                }}
              >
                Professional Signing Coordination Platform
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <a href="/" style={headerSecondaryButton}>
              Back to Home
            </a>
            <a href="/admin" style={headerPrimaryButton}>
              Staff Portal
            </a>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "18px 20px 28px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "#F1F1F1",
            border: "1px solid #C7CFDB",
            borderRadius: 22,
            padding: "22px 22px 20px",
            boxShadow: "0 1px 2px rgba(20, 23, 34, 0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 18,
            }}
          >
            <div>
              <div
                style={{
                  margin: 0,
                  fontSize: 26,
                  lineHeight: 1.08,
                  fontWeight: 950,
                  color: "#141722",
                  letterSpacing: -0.4,
                }}
              >
                Request Access
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "#666666",
                  fontWeight: 600,
                  maxWidth: 720,
                }}
              >
                Complete the form below and the Notarix™ team will review your
                request, determine the appropriate intake path, and follow up as
                needed.
              </div>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#EEF2FF",
                border: "1px solid #D6DCE6",
                borderRadius: 999,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 800,
                color: "#141722",
              }}
            >
              Internal review required
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 14,
              }}
            >
              <Field label="Name *">
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </Field>

              <Field label="Email *">
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </Field>

              <Field label="Phone">
                <input
                  name="phone"
                  type="text"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Optional"
                  style={inputStyle}
                />
              </Field>

              <Field label="Company Name">
                <input
                  name="company"
                  type="text"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Optional"
                  style={inputStyle}
                />
              </Field>

              <Field label="Contact Type *">
                <select
                  name="contactType"
                  value={form.contactType}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                >
                  <option value="">Select one</option>
                  <option value="Client">Client</option>
                  <option value="Notary">Notary</option>
                  <option value="General">General</option>
                </select>
              </Field>

              <Field label="Request Type *">
                <select
                  name="requestType"
                  value={form.requestType}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                >
                  <option value="">Select one</option>
                  <option value="Request Platform Access">
                    Request Platform Access
                  </option>
                  <option value="Request Notary Review">
                    Request Notary Review
                  </option>
                  <option value="Request Demo">Request Demo</option>
                  <option value="Support Request">Support Request</option>
                  <option value="Billing / Accounting">Billing / Accounting</option>
                  <option value="Partnership Inquiry">Partnership Inquiry</option>
                  <option value="Integration / Technical Inquiry">
                    Integration / Technical Inquiry
                  </option>
                  <option value="Other">Other</option>
                </select>
              </Field>
            </div>

            <Field label="State / Coverage Area">
              <input
                name="coverageArea"
                type="text"
                value={form.coverageArea}
                onChange={handleChange}
                placeholder="Example: North Carolina, South Carolina, Nationwide"
                style={inputStyle}
              />
            </Field>

            <Field label="Message">
              <textarea
                name="message"
                rows={6}
                value={form.message}
                onChange={handleChange}
                placeholder={messagePlaceholder}
                style={{ ...inputStyle, minHeight: 150, resize: "vertical" }}
              />
            </Field>

            {result ? (
              <div
                style={{
                  border: result.ok ? "1px solid #BBF7D0" : "1px solid #FECACA",
                  background: result.ok ? "#F0FDF4" : "#FEF2F2",
                  color: result.ok ? "#166534" : "#B91C1C",
                  borderRadius: 14,
                  padding: "12px 14px",
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                {result.message}
              </div>
            ) : null}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                paddingTop: 2,
              }}
            >
              <button
                type="submit"
                disabled={loading}
                style={{
                  border: 0,
                  borderRadius: 12,
                  padding: "12px 18px",
                  fontWeight: 900,
                  fontSize: 14,
                  background: loading ? "#94A3B8" : "#1D4ED8",
                  color: "#FFFFFF",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 10px 22px rgba(29, 78, 216, 0.18)",
                }}
              >
                {loading ? "Submitting Request..." : "Submit Request"}
              </button>

              <a href="/" style={secondaryActionButton}>
                Return to Home
              </a>
            </div>
          </form>
        </div>
      </section>
    </main>
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #CBD5E1",
  borderRadius: 12,
  padding: "12px 13px",
  fontSize: 14,
  color: "#0F172A",
  background: "#FFFFFF",
  outline: "none",
  boxSizing: "border-box",
};

const headerPrimaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  borderRadius: 12,
  padding: "10px 16px",
  background: "#3B59F4",
  color: "#ffffff",
  fontSize: 15,
  fontWeight: 700,
  lineHeight: 1.3,
  boxShadow: "0 6px 14px rgba(59, 89, 244, 0.18)",
};

const headerSecondaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  background: "#ffffff",
  color: "#0F172A",
  borderRadius: 12,
  padding: "10px 16px",
  fontWeight: 900,
  fontSize: 14,
  border: "1px solid #D6DCE6",
};

const secondaryActionButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  background: "#FFFFFF",
  color: "#0F172A",
  borderRadius: 12,
  padding: "12px 18px",
  fontWeight: 800,
  fontSize: 14,
  border: "1px solid #CBD5E1",
};