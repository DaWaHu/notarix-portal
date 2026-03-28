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
        background:
          "linear-gradient(180deg, #EFF6FF 0%, #F8FBFF 42%, #FFFFFF 100%)",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "#0F172A",
      }}
    >
      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "16px 20px 10px",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            border: "1px solid #DBEAFE",
            borderRadius: 18,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            boxShadow: "0 10px 30px rgba(30, 64, 175, 0.08)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Image
              src="/notarix-logo.png"
              alt="Notarix™"
              width={42}
              height={42}
              style={{
                width: 42,
                height: 42,
                objectFit: "contain",
                background: "#FFFFFF",
                borderRadius: 10,
                padding: 3,
              }}
            />
            <div>
              <div
                style={{
                  fontWeight: 950,
                  fontSize: 20,
                  lineHeight: 1.05,
                  letterSpacing: -0.2,
                  color: "#1D4ED8",
                }}
              >
                Notarix™
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#64748B",
                  fontWeight: 700,
                }}
              >
                Professional Signing Coordination Platform
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/" style={navButtonSecondary}>
              Back to Home
            </a>
            <a href="/admin" style={navButtonPrimary}>
              Staff Portal
            </a>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "10px 20px 14px",
        }}
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 28,
            minHeight: 310,
            backgroundImage:
              "linear-gradient(135deg, rgba(29, 78, 216, 0.88) 0%, rgba(30, 64, 175, 0.92) 48%, rgba(30, 58, 138, 0.94) 100%), url('/city-hero.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            color: "#FFFFFF",
            boxShadow: "0 24px 60px rgba(30, 64, 175, 0.18)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at top right, rgba(255,255,255,0.16), transparent 30%), radial-gradient(circle at bottom left, rgba(255,255,255,0.10), transparent 28%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "grid",
              gridTemplateColumns: "1.15fr 0.85fr",
              gap: 22,
              alignItems: "stretch",
              minHeight: 310,
              padding: "30px 28px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  width: "fit-content",
                  gap: 8,
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: 999,
                  padding: "7px 12px",
                  fontSize: 12,
                  fontWeight: 900,
                  marginBottom: 16,
                  letterSpacing: 0.1,
                }}
              >
                Request access and onboarding
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 44,
                  lineHeight: 0.98,
                  fontWeight: 950,
                  letterSpacing: -1.2,
                  maxWidth: 720,
                  textWrap: "balance",
                }}
              >
                Contact Notarix™ to request platform access.
              </h1>

              <p
                style={{
                  marginTop: 16,
                  marginBottom: 0,
                  maxWidth: 720,
                  fontSize: 15,
                  lineHeight: 1.65,
                  color: "rgba(255,255,255,0.96)",
                  fontWeight: 500,
                }}
              >
                Use this intake form for client onboarding, notary review, demos,
                support, billing inquiries, or partnership discussions. Access is
                activated only after internal review and approval.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gap: 12,
                alignContent: "center",
              }}
            >
              <HeroInfoCard
                title="Approval Review"
                text="Each request is reviewed for business fit, access level, onboarding requirements, and any supporting information needed before activation."
              />
              <HeroInfoCard
                title="Role-Based Access"
                text="Approved users receive only the permissions and visibility appropriate to their role inside the Notarix™ portal."
              />
              <HeroInfoCard
                title="Professional Intake"
                text="Submissions are routed into the internal intake workflow for review, follow-up, and activation."
              />
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "8px 20px 28px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.22fr 0.78fr",
            gap: 18,
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.96)",
              border: "1px solid #E2E8F0",
              borderRadius: 22,
              padding: "22px 22px",
              boxShadow: "0 14px 34px rgba(15, 23, 42, 0.05)",
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
                    fontSize: 26,
                    fontWeight: 950,
                    color: "#0F172A",
                    lineHeight: 1.05,
                    letterSpacing: -0.5,
                  }}
                >
                  Request Access
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: "#475569",
                    fontWeight: 600,
                    maxWidth: 700,
                  }}
                >
                  Complete the form below and the Notarix™ team will review your request,
                  determine the appropriate intake path, and follow up as needed.
                </div>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1px solid #BFDBFE",
                  background: "#EFF6FF",
                  color: "#1D4ED8",
                  borderRadius: 999,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 900,
                  whiteSpace: "nowrap",
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

          <div style={{ display: "grid", gap: 14 }}>
            <SidePanel
              title="Intake Scope"
              text="This page is designed for new access requests, client onboarding, notary review, operational support, billing questions, and partnership discussions."
            />
            <SidePanel
              title="What the review covers"
              text="Requests may be reviewed for business type, role alignment, service area, onboarding requirements, contact structure, and any supporting information needed for activation."
            />
            <SidePanel
              title="After submission"
              text="Your request is routed into the Notarix™ intake workflow. Approved records can then be connected to the correct profile, access path, and portal permissions."
            />
          </div>
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

function HeroInfoCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.16)",
        borderRadius: 18,
        padding: "16px 16px",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          fontSize: 17,
          fontWeight: 900,
          lineHeight: 1.2,
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: "rgba(255,255,255,0.94)",
          fontWeight: 500,
        }}
      >
        {text}
      </div>
    </div>
  );
}

function SidePanel({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.96)",
        border: "1px solid #E2E8F0",
        borderRadius: 18,
        padding: "18px 18px",
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div
        style={{
          fontSize: 17,
          fontWeight: 900,
          color: "#0F172A",
          marginBottom: 8,
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.62,
          fontWeight: 600,
          color: "#475569",
        }}
      >
        {text}
      </div>
    </div>
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

const navButtonPrimary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  background: "#1D4ED8",
  color: "#FFFFFF",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 900,
  fontSize: 14,
};

const navButtonSecondary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  background: "#FFFFFF",
  color: "#0F172A",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 900,
  fontSize: 14,
  border: "1px solid #CBD5E1",
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