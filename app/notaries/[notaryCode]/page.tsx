import Image from "next/image";
import type { CSSProperties } from "react";
import Script from "next/script";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import NotaryPhotoUpload from "./NotaryPhotoUpload";
import NotaryDocumentUpload from "./NotaryDocumentUpload";

type PageProps = {
  params: Promise<{ notaryCode: string }>;
};

type MissingItem = {
  label: string;
};

export const dynamic = "force-dynamic";

const CARD_GRAY = "#F1F1F1";
const INNER_GRAY = "#F7F7F8";
const BORDER = "#C7CFDB";
const BORDER_SOFT = "#D6DCE6";
const PRIMARY_BLUE = "#3B59F4";
const PRIMARY_BLUE_SOFT = "#EEF2FF";
const TEXT_DARK = "#141722";
const TEXT_MID = "#666666";
const TEXT_SOFT = "#7A7A7A";
const SUCCESS_BG = "#EEF6F0";
const SUCCESS_BORDER = "#CFE0D2";
const SUCCESS_TEXT = "#35543A";

function nice(value: string | null | undefined) {
  const v = String(value || "").trim();
  return v || "Not provided";
}

function emptyString(value: string | null | undefined) {
  return String(value || "").trim();
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Not provided";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "Not provided";
  return d.toLocaleDateString();
}

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "Not provided";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "Not provided";
  return d.toLocaleString();
}

function formatPhoneDisplay(value: string | null | undefined) {
  const digits = String(value || "")
    .replace(/\D/g, "")
    .slice(0, 10);

  if (!digits) return "";
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function normalizePhoneForStorage(value: string | null | undefined) {
  const digits = String(value || "")
    .replace(/\D/g, "")
    .slice(0, 10);

  if (!digits) return null;
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatAddress(parts: Array<string | null | undefined>) {
  const cleaned = parts
    .map((part) => String(part || "").trim())
    .filter(Boolean);

  return cleaned.length > 0 ? cleaned.join(", ") : "Not provided";
}

function phoneFormatterScript() {
  return `
    (function () {
      function formatPhone(value) {
        const digits = String(value || "").replace(/\\D/g, "").slice(0, 10);
        if (digits.length > 6) {
          return digits.slice(0, 3) + "-" + digits.slice(3, 6) + "-" + digits.slice(6);
        }
        if (digits.length > 3) {
          return digits.slice(0, 3) + "-" + digits.slice(3);
        }
        return digits;
      }

      function bindPhoneInput(input) {
        if (!input || input.dataset.phoneBound === "true") return;
        input.dataset.phoneBound = "true";

        input.addEventListener("input", function () {
          const digitsBefore = input.value.replace(/\\D/g, "").slice(0, 10);
          input.value = formatPhone(digitsBefore);
        });

        input.addEventListener("blur", function () {
          input.value = formatPhone(input.value);
        });

        input.value = formatPhone(input.value);
      }

      function init() {
        document
          .querySelectorAll('input[data-phone-format="true"]')
          .forEach(bindPhoneInput);
      }

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
      } else {
        init();
      }
    })();
  `;
}

function getNotaryReadiness(notary: {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  address1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  commissionNumber: string | null;
  commissionState: string | null;
  commissionExpiresAt: Date | null;
  coverageAreas: string | null;
  paymentMethod: string | null;
}) {
  const requiredChecks: Array<{ label: string; complete: boolean }> = [
    { label: "Full Name", complete: !!emptyString(notary.fullName) },
    { label: "Email", complete: !!emptyString(notary.email) },
    { label: "Phone", complete: !!emptyString(notary.phone) },
    { label: "Photo", complete: !!emptyString(notary.photoUrl) },
    { label: "Business Address Line 1", complete: !!emptyString(notary.address1) },
    { label: "City", complete: !!emptyString(notary.city) },
    { label: "State", complete: !!emptyString(notary.state) },
    { label: "ZIP Code", complete: !!emptyString(notary.zip) },
    { label: "Commission Number", complete: !!emptyString(notary.commissionNumber) },
    { label: "Commission State", complete: !!emptyString(notary.commissionState) },
    { label: "Commission Expiration", complete: !!notary.commissionExpiresAt },
    { label: "Coverage Areas", complete: !!emptyString(notary.coverageAreas) },
    { label: "Payment Method", complete: !!emptyString(notary.paymentMethod) },
  ];

  const missingProfileFields: MissingItem[] = requiredChecks
    .filter((item) => !item.complete)
    .map((item) => ({ label: item.label }));

  const completeCount = requiredChecks.filter((item) => item.complete).length;
  const percent = Math.round((completeCount / requiredChecks.length) * 100);

  return {
    percent,
    missingProfileFields,
    completeCount,
    totalCount: requiredChecks.length,
  };
}

function getDisplayReadiness(args: {
  percent: number;
  missingProfileFields: MissingItem[];
}) {
  if (args.missingProfileFields.length === 0) {
    return {
      label: "Ready for Review",
      summary:
        "Your profile appears complete. Internal review and final activation steps are next.",
      tone: {
        border: `1px solid ${SUCCESS_BORDER}`,
        background: SUCCESS_BG,
        color: SUCCESS_TEXT,
        accent: SUCCESS_TEXT,
      },
    };
  }

  if (args.percent > 0) {
    return {
      label: "Pending Completion",
      summary:
        "Your notary profile is in progress. Complete the remaining profile fields and upload your photo before final review.",
      tone: {
        border: `1px solid ${BORDER}`,
        background: CARD_GRAY,
        color: TEXT_DARK,
        accent: PRIMARY_BLUE,
      },
    };
  }

  return {
    label: "Draft",
    summary:
      "Your notary portal record exists, but required profile information is still missing.",
    tone: {
      border: `1px solid ${BORDER}`,
      background: CARD_GRAY,
      color: TEXT_MID,
      accent: PRIMARY_BLUE,
    },
  };
}

async function updateNotaryProfile(formData: FormData) {
  "use server";

  const notaryCode = String(formData.get("notaryCode") || "")
    .trim()
    .toUpperCase();

  if (!notaryCode) {
    throw new Error("Notary code is required.");
  }

  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = normalizePhoneForStorage(String(formData.get("phone") || ""));

  const address1 = String(formData.get("address1") || "").trim();
  const address2 = String(formData.get("address2") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim().toUpperCase();
  const zip = String(formData.get("zip") || "").trim();

  const commissionNumber = String(formData.get("commissionNumber") || "").trim();
  const commissionState = String(formData.get("commissionState") || "")
    .trim()
    .toUpperCase();
  const commissionExpiresAtRaw = String(
    formData.get("commissionExpiresAt") || ""
  ).trim();

  const coverageAreas = String(formData.get("coverageAreas") || "").trim();
  const travelRadiusMilesRaw = String(
    formData.get("travelRadiusMiles") || ""
  ).trim();
  const specialties = String(formData.get("specialties") || "").trim();
  const eoCoverageAmount = String(formData.get("eoCoverageAmount") || "").trim();
  const backgroundCheckDateRaw = String(
    formData.get("backgroundCheckDate") || ""
  ).trim();
  const paymentMethod = String(formData.get("paymentMethod") || "").trim();
  const paymentNotes = String(formData.get("paymentNotes") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const isRONApproved = String(formData.get("isRONApproved") || "") === "true";

  const commissionExpiresAt = commissionExpiresAtRaw
    ? new Date(`${commissionExpiresAtRaw}T00:00:00`)
    : null;

  const backgroundCheckDate = backgroundCheckDateRaw
    ? new Date(`${backgroundCheckDateRaw}T00:00:00`)
    : null;

  const travelRadiusMiles =
    travelRadiusMilesRaw && !Number.isNaN(Number(travelRadiusMilesRaw))
      ? Number(travelRadiusMilesRaw)
      : null;

  if (!fullName) {
    throw new Error("Full name is required.");
  }

  if (!email) {
    throw new Error("Email is required.");
  }

  await prisma.notaryProfile.update({
    where: { notaryCode },
    data: {
      fullName,
      email,
      phone,
      address1: address1 || null,
      address2: address2 || null,
      city: city || null,
      state: state || null,
      zip: zip || null,
      commissionNumber: commissionNumber || null,
      commissionState: commissionState || null,
      commissionExpiresAt:
        commissionExpiresAt && !Number.isNaN(commissionExpiresAt.getTime())
          ? commissionExpiresAt
          : null,
      coverageAreas: coverageAreas || null,
      travelRadiusMiles,
      specialties: specialties || null,
      eoCoverageAmount: eoCoverageAmount || null,
      backgroundCheckDate:
        backgroundCheckDate && !Number.isNaN(backgroundCheckDate.getTime())
          ? backgroundCheckDate
          : null,
      paymentMethod: paymentMethod || null,
      paymentNotes: paymentNotes || null,
      notes: notes || null,
      isRONApproved,
    },
  });

  revalidatePath(`/notaries/${notaryCode}`);
}

export default async function NotaryProfilePage({ params }: PageProps) {
  const { notaryCode } = await params;
  const normalizedNotaryCode = String(notaryCode || "").trim().toUpperCase();

  if (!normalizedNotaryCode) {
    notFound();
  }

  const notary = await prisma.notaryProfile.findUnique({
    where: { notaryCode: normalizedNotaryCode },
    select: {
      id: true,
      notaryCode: true,
      fullName: true,
      email: true,
      phone: true,
      photoUrl: true,
      address1: true,
      address2: true,
      city: true,
      state: true,
      zip: true,
      commissionNumber: true,
      commissionState: true,
      commissionExpiresAt: true,
      isRONApproved: true,
      isActive: true,
      coverageAreas: true,
      travelRadiusMiles: true,
      specialties: true,
      eoCoverageAmount: true,
      backgroundCheckDate: true,
      paymentMethod: true,
      paymentNotes: true,
      notes: true,
      documents: {
        orderBy: { uploadedAt: "desc" },
        select: {
          id: true,
          fileName: true,
          storageKey: true,
          documentType: true,
          visibility: true,
          uploadedAt: true,
          notes: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!notary) {
    notFound();
  }

  const readiness = getNotaryReadiness(notary);
  const displayReadiness = getDisplayReadiness({
    percent: readiness.percent,
    missingProfileFields: readiness.missingProfileFields,
  });

  const address = formatAddress([
    notary.address1,
    notary.address2,
    notary.city,
    notary.state,
    notary.zip,
  ]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "transparent",
        color: TEXT_DARK,
        fontFamily:
          'Inter, "Open Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: 16,
        lineHeight: 1.3,
        padding: "18px 20px 36px",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <section
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
              <img
                src="/notarix-logo.png"
                alt="Notarix™"
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

          <nav
            aria-label="Notary portal navigation"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <a href={`/notaries/${normalizedNotaryCode}`} style={headerButtonStyle}>
              Home
            </a>
            <a href="#assigned-orders" style={headerButtonStyle}>
              Assigned Orders
            </a>
            <a href="#notary-profile-form" style={headerButtonStyle}>
              Profile
            </a>
            <a href="#support" style={headerButtonStyle}>
              Support
            </a>
          </nav>
        </section>

        <section style={{ ...heroPanelStyle, marginTop: 16 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.25fr 0.75fr",
              gap: 20,
              alignItems: "start",
            }}
          >
            <div>
              <div style={eyebrowStyle}>Notarix™ notary portal</div>

              <h1
                style={{
                  margin: "8px 0 0",
                  fontSize: 34,
                  lineHeight: 1.05,
                  fontWeight: 800,
                  letterSpacing: -0.8,
                  color: TEXT_DARK,
                  maxWidth: 560,
                }}
              >
                {nice(notary.fullName)}
              </h1>

              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <MetaPill label="Notary code" value={nice(notary.notaryCode)} />
                <MetaPill
                  label="Commission state"
                  value={nice(notary.commissionState)}
                />
                <MetaPill
                  label="Portal status"
                  value={displayReadiness.label}
                />
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 12,
                  maxWidth: 650,
                }}
              >
                <SummaryStat
                  label="Profile completion"
                  value={`${readiness.percent}%`}
                  accent="progress"
                />
                <SummaryStat
                  label="Missing items"
                  value={String(readiness.missingProfileFields.length)}
                  accent="documents"
                />
                <SummaryStat
                  label="Active status"
                  value={notary.isActive ? "Active" : "Inactive"}
                  accent="orders"
                />
              </div>
            </div>

            <div style={asideCardStyle}>
              <div style={miniSectionTitleStyle}>Notary Photo</div>

              {notary.photoUrl ? (
                <div style={logoFrameStyle}>
                  <img
                    src={notary.photoUrl}
                    alt={`${nice(notary.fullName)} photo`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: 98,
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    ...logoFrameStyle,
                    borderStyle: "dashed",
                    color: "#777777",
                    fontSize: 14,
                    textAlign: "center",
                    padding: 16,
                  }}
                >
                  No photo uploaded yet
                </div>
              )}

              <NotaryPhotoUpload notaryCode={nice(notary.notaryCode)} />
            </div>
          </div>
        </section>

        <section
          style={{
            ...statusPanelStyle,
            marginTop: 16,
            border: displayReadiness.tone.border,
            background: displayReadiness.tone.background,
            color: displayReadiness.tone.color,
            boxShadow: `inset 4px 0 0 ${displayReadiness.tone.accent}`,
          }}
        >
          <div style={eyebrowMutedStyle}>Current status</div>

          <div
            style={{
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 24,
                lineHeight: 1.1,
                fontWeight: 800,
              }}
            >
              {displayReadiness.label}
            </h2>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                padding: "6px 10px",
                background: "rgba(255,255,255,0.45)",
                border: "1px solid rgba(0,0,0,0.08)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Action required
            </span>
          </div>

          <p
            style={{
              marginTop: 12,
              marginBottom: 0,
              maxWidth: 780,
              fontSize: 15,
              lineHeight: 1.5,
            }}
          >
            {displayReadiness.summary}
          </p>
        </section>

        <section style={{ ...panelStyle, marginTop: 16 }}>
          <div style={eyebrowStyle}>What remains</div>
          <h2
            style={{
              margin: "8px 0 0",
              fontSize: 24,
              lineHeight: 1.1,
              fontWeight: 800,
              color: TEXT_DARK,
            }}
          >
            Completion checklist
          </h2>

          <div
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            <ChecklistCard
              title="Profile fields"
              items={readiness.missingProfileFields.map((item) => item.label)}
              emptyMessage="All required profile fields are complete."
            />
            <ChecklistCard
              title="Required documents"
              items={[
                "W-9",
                "Commission Certificate / Record",
                "E&O Certificate",
                "Background Check",
                "Government ID",
                "Void Check / ACH Setup",
              ]}
              emptyMessage="All required documents are on file."
            />
          </div>
        </section>

        <section
          id="notary-profile-form"
          style={{ ...panelStyle, marginTop: 16, scrollMarginTop: 24 }}
        >
          <div style={eyebrowStyle}>Notary profile</div>
          <h2
            style={{
              margin: "8px 0 0",
              fontSize: 24,
              lineHeight: 1.1,
              fontWeight: 800,
              color: TEXT_DARK,
            }}
          >
            Professional and contact details
          </h2>

          <form
            action={updateNotaryProfile}
            style={{ marginTop: 20, display: "grid", gap: 24 }}
          >
            <input type="hidden" name="notaryCode" value={notary.notaryCode || ""} />

            <section>
              <SectionSubhead>Notary Information</SectionSubhead>
              <div style={twoColGridStyle}>
                <Field label="Full Name">
                  <input
                    name="fullName"
                    defaultValue={notary.fullName || ""}
                    style={inputStyle}
                    required
                  />
                </Field>

                <Field label="Email">
                  <input
                    name="email"
                    type="email"
                    defaultValue={notary.email || ""}
                    style={inputStyle}
                    required
                  />
                </Field>

                <Field label="Phone">
                  <input
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    defaultValue={formatPhoneDisplay(notary.phone)}
                    style={inputStyle}
                    placeholder="123-456-7890"
                    maxLength={12}
                    data-phone-format="true"
                  />
                </Field>

                <Field label="Coverage Areas">
                  <input
                    name="coverageAreas"
                    defaultValue={notary.coverageAreas || ""}
                    style={inputStyle}
                    placeholder="Counties, cities, or regions served"
                  />
                </Field>
              </div>
            </section>

            <section>
              <SectionSubhead>Business Address</SectionSubhead>
              <div style={twoColGridStyle}>
                <Field label="Address Line 1">
                  <input
                    name="address1"
                    defaultValue={notary.address1 || ""}
                    style={inputStyle}
                  />
                </Field>

                <Field label="Address Line 2">
                  <input
                    name="address2"
                    defaultValue={notary.address2 || ""}
                    style={inputStyle}
                  />
                </Field>

                <Field label="City">
                  <input
                    name="city"
                    defaultValue={notary.city || ""}
                    style={inputStyle}
                  />
                </Field>

                <Field label="State">
                  <input
                    name="state"
                    defaultValue={notary.state || ""}
                    style={inputStyle}
                    maxLength={2}
                  />
                </Field>

                <Field label="ZIP Code">
                  <input
                    name="zip"
                    defaultValue={notary.zip || ""}
                    style={inputStyle}
                  />
                </Field>
              </div>
            </section>

            <section>
              <SectionSubhead>Commission and Credentials</SectionSubhead>
              <div style={twoColGridStyle}>
                <Field label="Commission Number">
                  <input
                    name="commissionNumber"
                    defaultValue={notary.commissionNumber || ""}
                    style={inputStyle}
                  />
                </Field>

                <Field label="Commission State">
                  <input
                    name="commissionState"
                    defaultValue={notary.commissionState || ""}
                    style={inputStyle}
                    maxLength={2}
                  />
                </Field>

                <Field label="Commission Expiration">
                  <input
                    name="commissionExpiresAt"
                    type="date"
                    defaultValue={
                      notary.commissionExpiresAt
                        ? new Date(notary.commissionExpiresAt)
                          .toISOString()
                          .slice(0, 10)
                        : ""
                    }
                    style={inputStyle}
                  />
                </Field>

                <Field label="RON Approval">
                  <select
                    name="isRONApproved"
                    defaultValue={notary.isRONApproved ? "true" : "false"}
                    style={inputStyle}
                  >
                    <option value="false">Not Approved</option>
                    <option value="true">Approved</option>
                  </select>
                </Field>

                <Field label="Travel Radius (miles)">
                  <input
                    name="travelRadiusMiles"
                    type="number"
                    defaultValue={
                      notary.travelRadiusMiles != null
                        ? String(notary.travelRadiusMiles)
                        : ""
                    }
                    style={inputStyle}
                  />
                </Field>

                <Field label="Specialties">
                  <input
                    name="specialties"
                    defaultValue={notary.specialties || ""}
                    style={inputStyle}
                    placeholder="RON, HELOC, purchase, seller package, etc."
                  />
                </Field>

                <Field label="E&O Coverage">
                  <input
                    name="eoCoverageAmount"
                    defaultValue={notary.eoCoverageAmount || ""}
                    style={inputStyle}
                    placeholder="Example: $100,000"
                  />
                </Field>

                <Field label="Background Check Date">
                  <input
                    name="backgroundCheckDate"
                    type="date"
                    defaultValue={
                      notary.backgroundCheckDate
                        ? new Date(notary.backgroundCheckDate)
                          .toISOString()
                          .slice(0, 10)
                        : ""
                    }
                    style={inputStyle}
                  />
                </Field>
              </div>
            </section>

            <section>
              <SectionSubhead>Payment and Administrative Notes</SectionSubhead>
              <div style={twoColGridStyle}>
                <Field label="Payment Method">
                  <input
                    name="paymentMethod"
                    defaultValue={notary.paymentMethod || ""}
                    style={inputStyle}
                    placeholder="Example: ACH, Check"
                  />
                </Field>

                <Field label="Payment Notes">
                  <input
                    name="paymentNotes"
                    defaultValue={notary.paymentNotes || ""}
                    style={inputStyle}
                  />
                </Field>

                <Field label="Notes">
                  <textarea
                    name="notes"
                    defaultValue={notary.notes || ""}
                    style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
                  />
                </Field>
              </div>
            </section>

            <section>
              <SectionSubhead>Reference Details</SectionSubhead>
              <div style={twoColGridStyle}>
                <ReadOnlyField label="Notary Code" value={nice(notary.notaryCode)} />
                <ReadOnlyField
                  label="Portal Status"
                  value={displayReadiness.label}
                />
                <ReadOnlyField label="Address on File" value={address} />
                <ReadOnlyField
                  label="Last Updated"
                  value={formatDateTime(notary.updatedAt)}
                />
              </div>
            </section>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button type="submit" style={primaryButtonStyle}>
                Save Notary Profile
              </button>
            </div>
          </form>
        </section>

        <section style={{ ...panelStyle, marginTop: 16 }}>
          <div style={eyebrowStyle}>Required documents</div>
          <h2
            style={{
              margin: "8px 0 0",
              fontSize: 24,
              lineHeight: 1.1,
              fontWeight: 800,
              color: TEXT_DARK,
            }}
          >
            Document workspace
          </h2>
          <p
            style={{
              marginTop: 12,
              marginBottom: 0,
              color: TEXT_MID,
              maxWidth: 780,
            }}
          >
            Upload each required notary credential document in the correct row below.
            Existing uploaded records for this notary will appear here as they are added.
          </p>

          <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
            {[
              {
                name: "W-9",
                description: "Current federal tax form used for payment processing.",
              },
              {
                name: "Commission Certificate / Record",
                description: "Commission record or supporting commission documentation.",
              },
              {
                name: "E&O Certificate",
                description: "Errors & omissions certificate or equivalent coverage proof.",
              },
              {
                name: "Background Check",
                description: "Background screening documentation used for compliance review.",
              },
              {
                name: "Government ID",
                description: "Valid identification document used for credential verification.",
              },
              {
                name: "Void Check / ACH Setup",
                description: "Payment setup document used for notary payout processing.",
              },
            ].map((item) => {
              const existing = notary.documents.find(
                (doc) => String(doc.notes || "").trim() === item.name
              );

              return (
                <div
                  key={item.name}
                  style={{
                    border: `1px solid ${BORDER_SOFT}`,
                    background: INNER_GRAY,
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.1fr 0.9fr",
                      gap: 18,
                      alignItems: "start",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 17,
                            fontWeight: 700,
                            color: TEXT_DARK,
                          }}
                        >
                          {item.name}
                        </div>

                        <span
                          style={{
                            border: existing
                              ? `1px solid ${SUCCESS_BORDER}`
                              : "1px solid #E9D9B0",
                            background: existing ? SUCCESS_BG : "#FFF7E8",
                            color: existing ? SUCCESS_TEXT : "#7A5A12",
                            borderRadius: 999,
                            padding: "6px 10px",
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                          }}
                        >
                          {existing ? "Received" : "Pending"}
                        </span>
                      </div>

                      <p
                        style={{
                          marginTop: 8,
                          marginBottom: 0,
                          color: TEXT_MID,
                          fontSize: 14,
                          lineHeight: 1.45,
                          maxWidth: 500,
                        }}
                      >
                        {item.description}
                      </p>

                      {existing ? (
                        <div
                          style={{
                            marginTop: 12,
                            display: "grid",
                            gap: 6,
                            fontSize: 13,
                            color: TEXT_MID,
                          }}
                        >
                          <div>
                            <strong>File:</strong> {existing.fileName}
                          </div>
                          <div>
                            <strong>Uploaded:</strong> {formatDateTime(existing.uploadedAt)}
                          </div>
                          <div>
                            <a
                              href={`/api/documents/download?key=${encodeURIComponent(
                                existing.storageKey
                              )}`}
                              style={{
                                color: PRIMARY_BLUE,
                                fontWeight: 700,
                                textDecoration: "none",
                              }}
                            >
                              Download current document
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            marginTop: 12,
                            fontSize: 13,
                            color: TEXT_MID,
                          }}
                        >
                          No file currently on record for this requirement.
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        border: `1px solid ${BORDER_SOFT}`,
                        background: "#FFFFFF",
                        borderRadius: 12,
                        padding: 14,
                      }}
                    >
                      <NotaryDocumentUpload
                        notaryCode={nice(notary.notaryCode)}
                        documentLabel={item.name}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section
          id="assigned-orders"
          style={{ ...panelStyle, marginTop: 16, scrollMarginTop: 24 }}
        >
          <div style={eyebrowStyle}>Next module</div>
          <h2
            style={{
              margin: "8px 0 0",
              fontSize: 24,
              lineHeight: 1.1,
              fontWeight: 800,
              color: TEXT_DARK,
            }}
          >
            Assigned orders and workflow
          </h2>
          <p
            style={{
              marginTop: 12,
              marginBottom: 0,
              color: TEXT_MID,
              maxWidth: 780,
            }}
          >
            This section will be used for assigned orders, borrower contact
            confirmation, status updates, communication trail actions, and
            completion workflow. It has not been added yet.
          </p>
        </section>

        <section
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          <div style={panelStyle}>
            <div style={eyebrowStyle}>Profile Reference</div>
            <h3
              style={{
                margin: "8px 0 0",
                fontSize: 22,
                lineHeight: 1.1,
                fontWeight: 800,
                color: TEXT_DARK,
              }}
            >
              Readiness Standard
            </h3>
            <p
              style={{
                marginTop: 12,
                marginBottom: 0,
                color: TEXT_MID,
              }}
            >
              A complete notary profile should include contact information,
              commission data, photo, coverage areas, payment setup, and
              credential documents before order assignment workflow is activated.
            </p>
          </div>

          <div id="support" style={panelStyle}>
            <div style={eyebrowStyle}>Support</div>
            <h3
              style={{
                margin: "8px 0 0",
                fontSize: 22,
                lineHeight: 1.1,
                fontWeight: 800,
                color: TEXT_DARK,
              }}
            >
              Need help?
            </h3>
            <p
              style={{
                marginTop: 12,
                marginBottom: 0,
                color: TEXT_MID,
              }}
            >
              Use your internal support path for credential review, payout
              questions, onboarding corrections, and assignment issues.
            </p>
          </div>
        </section>
      </div>

      <Script id="notary-phone-format" strategy="afterInteractive">
        {phoneFormatterScript()}
      </Script>
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
          fontWeight: 600,
          color: TEXT_DARK,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        border: `1px solid ${BORDER_SOFT}`,
        background: INNER_GRAY,
        borderRadius: 12,
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: TEXT_MID,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          color: TEXT_DARK,
          lineHeight: 1.3,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SectionSubhead({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 18,
        lineHeight: 1.2,
        fontWeight: 700,
        color: TEXT_DARK,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

function MetaPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        border: `1px solid ${BORDER_SOFT}`,
        background: "#FFFFFF",
        borderRadius: 999,
        padding: "8px 12px",
        fontSize: 13,
        color: TEXT_MID,
      }}
    >
      <span style={{ fontWeight: 700, color: TEXT_SOFT }}>{label}:</span>
      <span style={{ color: TEXT_DARK }}>{value}</span>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "progress" | "documents" | "orders";
}) {
  const accentColor =
    accent === "progress"
      ? PRIMARY_BLUE
      : accent === "documents"
        ? "#6D5EF4"
        : "#4E7AF0";

  return (
    <div
      style={{
        border: `1px solid ${BORDER_SOFT}`,
        background: "#FFFFFF",
        borderRadius: 14,
        padding: "14px 16px 16px",
        boxShadow: `inset 0 3px 0 ${accentColor}`,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: TEXT_MID,
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          lineHeight: 1.05,
          fontWeight: 800,
          color: TEXT_DARK,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ChecklistCard({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: string[];
  emptyMessage: string;
}) {
  return (
    <div
      style={{
        border: `1px solid ${BORDER_SOFT}`,
        background: INNER_GRAY,
        borderRadius: 14,
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: TEXT_DARK,
          marginBottom: 12,
        }}
      >
        {title}
      </div>

      {items.length === 0 ? (
        <div
          style={{
            fontSize: 14,
            color: SUCCESS_TEXT,
            lineHeight: 1.4,
          }}
        >
          {emptyMessage}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {items.map((item) => (
            <div
              key={item}
              style={{
                fontSize: 14,
                color: "#555555",
                lineHeight: 1.35,
              }}
            >
              • {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  background: CARD_GRAY,
  border: `1px solid ${BORDER}`,
  borderRadius: 18,
  padding: 18,
  boxShadow: "0 1px 2px rgba(20, 23, 34, 0.03)",
};

const heroPanelStyle: React.CSSProperties = {
  background: CARD_GRAY,
  border: `2px solid ${BORDER}`,
  borderRadius: 22,
  padding: 20,
  boxShadow:
    "0 1px 2px rgba(20, 23, 34, 0.03), inset 0 4px 0 rgba(59, 89, 244, 0.85)",
};

const statusPanelStyle: React.CSSProperties = {
  borderRadius: 18,
  padding: 18,
};

const asideCardStyle: React.CSSProperties = {
  border: `1px solid ${BORDER_SOFT}`,
  background: INNER_GRAY,
  borderRadius: 16,
  padding: 16,
};

const logoFrameStyle: React.CSSProperties = {
  marginBottom: 12,
  border: `1px solid ${BORDER_SOFT}`,
  borderRadius: 12,
  background: "#FFFFFF",
  minHeight: 132,
  display: "grid",
  placeItems: "center",
  overflow: "hidden",
  padding: 14,
};

const miniSectionTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: TEXT_MID,
  marginBottom: 12,
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: TEXT_SOFT,
};

const eyebrowMutedStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "inherit",
  opacity: 0.82,
};

const twoColGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 16,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: `1px solid ${BORDER_SOFT}`,
  borderRadius: 12,
  padding: "11px 13px",
  fontSize: 15,
  lineHeight: 1.3,
  color: TEXT_DARK,
  background: "#FFFFFF",
  outline: "none",
  boxSizing: "border-box",
};

const primaryButtonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: 12,
  padding: "12px 16px",
  background: PRIMARY_BLUE,
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 6px 14px rgba(59, 89, 244, 0.18)",
};

const headerButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  borderRadius: 12,
  padding: "6px 10px",
  background: "#3B59F4",
  color: "#ffffff",
  fontSize: 12,
  fontWeight: 700,
  lineHeight: 1.3,
};