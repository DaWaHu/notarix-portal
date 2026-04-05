import Link from "next/link";
import Script from "next/script";
import type { CSSProperties, ReactNode } from "react";
import crypto from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  classifyClientDocument,
  getClientReadiness,
} from "@/lib/client-readiness";
import { s3 } from "@/lib/s3";

type PageProps = {
  params: Promise<{ vendorCode: string }>;
};

type RequiredDocumentItem = {
  name: string;
  description: string;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const REQUIRED_DOCUMENT_DETAILS: RequiredDocumentItem[] = [
  {
    name: "Service Agreement",
    description: "Executed services agreement or master services agreement.",
  },
  {
    name: "Billing Setup Form",
    description: "Billing instructions, remittance setup, and payment details.",
  },
  {
    name: "Primary & Secondary Contact Confirmation",
    description: "Named contacts authorized for operations and escalation.",
  },
  {
    name: "W-9",
    description: "Current federal tax form used for payment processing.",
  },
  {
    name: "Business License or Registration",
    description: "Business registration, license, or formation record.",
  },
  {
    name: "E&O Certificate",
    description: "Errors & omissions or equivalent professional coverage.",
  },
  {
    name: "Portal Access Authorization",
    description: "Authorization for portal access and operational permissions.",
  },
];

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
const WARNING_BG = "#FFF7E8";
const WARNING_BORDER = "#E9D9B0";
const WARNING_TEXT = "#7A5A12";

function nice(value: string | null | undefined) {
  const v = String(value || "").trim();
  return v || "Not provided";
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

function formatPhoneDisplay(value: string | null | undefined) {
  const digits = String(value || "")
    .replace(/\D/g, "")
    .slice(0, 10);

  if (!digits) return "";
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

function formatDateTime(value: Date | string) {
  return new Date(value).toLocaleString();
}

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in environment variables`);
  }
  return value;
}

function getS3BucketAndRegion() {
  const region =
    process.env.AWS_REGION ||
    process.env.AWS_DEFAULT_REGION ||
    getRequiredEnv("AWS_REGION");

  const bucket =
    process.env.S3_BUCKET_NAME ||
    process.env.AWS_S3_BUCKET ||
    getRequiredEnv("S3_BUCKET_NAME");

  return { region, bucket };
}

function buildPublicS3Url(bucket: string, region: string, key: string) {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

function getDisplayReadiness(args: {
  approvalStatus: string;
  missingProfileFields: string[];
  missingRequiredDocs: string[];
  profilePercent: number;
  requiredDocsReceived: number;
  requiredDocsTotal: number;
}) {
  const approvalStatus = String(args.approvalStatus || "").toUpperCase();
  const hasMissing =
    args.missingProfileFields.length > 0 || args.missingRequiredDocs.length > 0;
  const allDocs = args.requiredDocsReceived >= args.requiredDocsTotal;
  const profileReady = args.missingProfileFields.length === 0;

  if (approvalStatus === "APPROVED" && !hasMissing) {
    return {
      label: "Approved",
      summary:
        "Your organization profile is complete and all required documents are on file.",
      tone: {
        border: `1px solid ${SUCCESS_BORDER}`,
        background: SUCCESS_BG,
        color: SUCCESS_TEXT,
        accent: SUCCESS_TEXT,
      },
    };
  }

  if (approvalStatus === "APPROVED" && hasMissing) {
    return {
      label: "Review Needed",
      summary:
        "This record was previously marked approved, but the current profile or documentation is incomplete and should be reviewed.",
      tone: {
        border: `1px solid ${WARNING_BORDER}`,
        background: WARNING_BG,
        color: WARNING_TEXT,
        accent: WARNING_TEXT,
      },
    };
  }

  if (profileReady && allDocs) {
    return {
      label: "Ready for Final Review",
      summary:
        "All required profile fields and required documents appear complete. Notarix™ final review is the next step.",
      tone: {
        border: `1px solid ${BORDER}`,
        background: PRIMARY_BLUE_SOFT,
        color: TEXT_DARK,
        accent: PRIMARY_BLUE,
      },
    };
  }

  if (args.profilePercent > 0 || args.requiredDocsReceived > 0) {
    return {
      label: "Pending Completion",
      summary:
        "Your profile is in progress. Complete the remaining profile fields and upload the remaining required documents below.",
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
      "Your portal is active, but the profile and required documents have not been completed yet.",
    tone: {
      border: `1px solid ${BORDER}`,
      background: CARD_GRAY,
      color: TEXT_MID,
      accent: PRIMARY_BLUE,
    },
  };
}

function buildSupportMailto(args: {
  vendorCode: string;
  companyName: string | null;
  primaryContactName: string | null;
  primaryContactEmail: string | null;
}) {
  const subject = `Notarix portal help request - ${args.vendorCode}`;
  const body = [
    `Client Code: ${args.vendorCode}`,
    `Organization: ${args.companyName || "Not provided"}`,
    `Primary Contact: ${args.primaryContactName || "Not provided"}`,
    `Primary Contact Email: ${args.primaryContactEmail || "Not provided"}`,
    "",
    "Please describe your issue below:",
    "",
  ].join("\n");

  return `mailto:support@notarix.live?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

async function updateClientProfile(formData: FormData) {
  "use server";

  const vendorCode = String(formData.get("vendorCode") || "")
    .trim()
    .toUpperCase();

  if (!vendorCode) {
    throw new Error("Client code is required.");
  }

  const companyName = String(formData.get("companyName") || "").trim();
  if (!companyName) {
    throw new Error("Company name is required.");
  }

  await prisma.vendor.update({
    where: { vendorcode: vendorCode },
    data: {
      companyName,
      companyType: String(formData.get("companyType") || "").trim() || null,
      website: String(formData.get("website") || "").trim() || null,
      address1: String(formData.get("address1") || "").trim() || null,
      address2: String(formData.get("address2") || "").trim() || null,
      city: String(formData.get("city") || "").trim() || null,
      state: String(formData.get("state") || "").trim().toUpperCase() || null,
      zip: String(formData.get("zip") || "").trim() || null,
      primaryPhone: normalizePhoneForStorage(
        String(formData.get("primaryPhone") || "")
      ),
      secondaryPhone: normalizePhoneForStorage(
        String(formData.get("secondaryPhone") || "")
      ),
      primaryContactName:
        String(formData.get("primaryContactName") || "").trim() || null,
      primaryContactEmail:
        String(formData.get("primaryContactEmail") || "").trim() || null,
      primaryContactPhone: normalizePhoneForStorage(
        String(formData.get("primaryContactPhone") || "")
      ),
      secondaryContactName:
        String(formData.get("secondaryContactName") || "").trim() || null,
      secondaryContactEmail:
        String(formData.get("secondaryContactEmail") || "").trim() || null,
      secondaryContactPhone: normalizePhoneForStorage(
        String(formData.get("secondaryContactPhone") || "")
      ),
      profilePageCreated: true,
    },
  });

  revalidatePath(`/vendors/${vendorCode}`);
  redirect(`/vendors/${vendorCode}`);
}

async function uploadCompanyLogo(formData: FormData) {
  "use server";

  const vendorCode = String(formData.get("vendorCode") || "")
    .trim()
    .toUpperCase();
  const file = formData.get("companyLogoFile");

  if (!vendorCode) {
    throw new Error("Client code is required.");
  }

  if (!file || !(file instanceof File) || file.size === 0) {
    throw new Error("Please choose an image file for the company logo.");
  }

  const allowedMimeTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/svg+xml",
    "image/gif",
  ];

  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error("Company logo must be an image file.");
  }

  const vendor = await prisma.vendor.findUnique({
    where: { vendorcode: vendorCode },
    select: { id: true, vendorcode: true },
  });

  if (!vendor) {
    throw new Error("Client not found.");
  }

  const { region, bucket } = getS3BucketAndRegion();
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = (file.name || "company-logo")
    .replace(/[^\w.\-]+/g, "_")
    .toLowerCase();
  const key = `uploads/vendors/${vendor.vendorcode}/logos/${crypto.randomUUID()}-${safeName}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalname: safeName,
        purpose: "company-logo",
      },
    })
  );

  const publicUrl = buildPublicS3Url(bucket, region, key);

  await prisma.vendor.update({
    where: { id: vendor.id },
    data: {
      companyLogoUrl: publicUrl,
      profilePageCreated: true,
    },
  });

  revalidatePath(`/vendors/${vendorCode}`);
  redirect(`/vendors/${vendorCode}`);
}

async function uploadRequiredDocument(formData: FormData) {
  "use server";

  const vendorCode = String(formData.get("vendorCode") || "")
    .trim()
    .toUpperCase();
  const documentLabel = String(formData.get("documentLabel") || "").trim();
  const file = formData.get("file");

  if (!vendorCode) {
    throw new Error("Client code is required.");
  }

  if (!documentLabel) {
    throw new Error("Document type is required.");
  }

  if (!file || !(file instanceof File)) {
    throw new Error("Please choose a PDF file to upload.");
  }

  const filename = file.name || "upload.pdf";
  const isPdf =
    file.type === "application/pdf" || filename.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    throw new Error("Only PDF files are allowed.");
  }

  const vendor = await prisma.vendor.findUnique({
    where: { vendorcode: vendorCode },
    select: { id: true, vendorcode: true },
  });

  if (!vendor) {
    throw new Error("Client not found.");
  }

  const { region, bucket } = getS3BucketAndRegion();
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = filename.replace(/[^\w.\-]+/g, "_");
  const key = `uploads/vendors/${vendor.vendorcode}/documents/${crypto.randomUUID()}-${safeName}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: "application/pdf",
      Metadata: {
        originalname: safeName,
        documentlabel: documentLabel,
        region,
      },
    })
  );

  await prisma.document.create({
    data: {
      vendorId: vendor.id,
      fileName: filename,
      storageKey: key,
      mimeType: "application/pdf",
      fileSizeBytes: buffer.length,
      notes: documentLabel,
    },
  });

  revalidatePath(`/vendors/${vendorCode}`);
  redirect(`/vendors/${vendorCode}`);
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

export default async function VendorHomePage({ params }: PageProps) {
  const { vendorCode } = await params;
  const normalizedVendorCode = String(vendorCode || "").trim().toUpperCase();

  const vendor = await prisma.vendor.findUnique({
    where: { vendorcode: normalizedVendorCode },
    select: {
      id: true,
      vendorcode: true,
      companyName: true,
      companyType: true,
      companyLogoUrl: true,
      website: true,
      address1: true,
      address2: true,
      city: true,
      state: true,
      zip: true,
      primaryPhone: true,
      secondaryPhone: true,
      primaryContactName: true,
      primaryContactEmail: true,
      primaryContactPhone: true,
      secondaryContactName: true,
      secondaryContactEmail: true,
      secondaryContactPhone: true,
      approvalStatus: true,
      createdAt: true,
      updatedAt: true,
      documents: {
        orderBy: { uploadedAt: "desc" },
        select: {
          id: true,
          fileName: true,
          notes: true,
          uploadedAt: true,
          storageKey: true,
        },
        take: 100,
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  if (!vendor) {
    notFound();
  }

  const readiness = getClientReadiness(vendor);

  const displayReadiness = getDisplayReadiness({
    approvalStatus: vendor.approvalStatus,
    missingProfileFields: readiness.missingProfileFields,
    missingRequiredDocs: readiness.missingRequiredDocs,
    profilePercent: readiness.completion.percent,
    requiredDocsReceived: readiness.requiredDocsReceived,
    requiredDocsTotal: readiness.requiredDocs.length,
  });

  const address = formatAddress([
    vendor.address1,
    vendor.address2,
    vendor.city,
    vendor.state,
    vendor.zip,
  ]);

  const documentMap = new Map(
    REQUIRED_DOCUMENT_DETAILS.map((item) => {
      const matchingDoc = vendor.documents.find(
        (doc) => classifyClientDocument(doc.fileName, doc.notes) === item.name
      );

      return [item.name, matchingDoc || null] as const;
    })
  );

  const supportHref = buildSupportMailto({
    vendorCode: vendor.vendorcode,
    companyName: vendor.companyName,
    primaryContactName: vendor.primaryContactName,
    primaryContactEmail: vendor.primaryContactEmail,
  });

  return (
    <>
      <section style={heroPanelStyle}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.25fr 0.75fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          <div>
            <div style={eyebrowStyle}>Notarix™ client portal</div>

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
              {nice(vendor.companyName)}
            </h1>

            <div
              style={{
                marginTop: 16,
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <MetaPill label="Client code" value={vendor.vendorcode} />
              <MetaPill label="Company type" value={nice(vendor.companyType)} />
              <MetaPill label="Portal status" value={displayReadiness.label} />
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
                value={`${readiness.completion.percent}%`}
                accent="progress"
              />
              <SummaryStat
                label="Required documents"
                value={`${readiness.requiredDocsReceived}/${readiness.requiredDocs.length}`}
                accent="documents"
              />
              <SummaryStat
                label="Orders on file"
                value={String(vendor._count.orders)}
                accent="orders"
              />
            </div>
          </div>

          <div style={asideCardStyle}>
            <div style={miniSectionTitleStyle}>Company Logo</div>

            {vendor.companyLogoUrl ? (
              <div style={logoFrameStyle}>
                <img
                  src={vendor.companyLogoUrl}
                  alt={`${nice(vendor.companyName)} logo`}
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
                No logo uploaded yet
              </div>
            )}

            <form action={uploadCompanyLogo} style={{ display: "grid", gap: 10 }}>
              <input type="hidden" name="vendorCode" value={vendor.vendorcode} />
              <input
                name="companyLogoFile"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
                required
              />
              <button type="submit" style={primaryButtonStyle}>
                {vendor.companyLogoUrl ? "Replace Logo" : "Upload Logo"}
              </button>
            </form>
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
            items={readiness.missingProfileFields}
            emptyMessage="All required profile fields are complete."
          />
          <ChecklistCard
            title="Required documents"
            items={readiness.missingRequiredDocs}
            emptyMessage="All required documents are on file."
          />
        </div>
      </section>

      <section
        id="client-profile-form"
        style={{ ...panelStyle, marginTop: 16, scrollMarginTop: 24 }}
      >
        <div style={eyebrowStyle}>Client profile</div>
        <h2
          style={{
            margin: "8px 0 0",
            fontSize: 24,
            lineHeight: 1.1,
            fontWeight: 800,
            color: TEXT_DARK,
          }}
        >
          Organization and contact details
        </h2>

        <form
          action={updateClientProfile}
          style={{ marginTop: 20, display: "grid", gap: 24 }}
        >
          <input type="hidden" name="vendorCode" value={vendor.vendorcode} />

          <section>
            <SectionSubhead>Organization Information</SectionSubhead>
            <div style={twoColGridStyle}>
              <Field label="Company Name">
                <input
                  name="companyName"
                  defaultValue={vendor.companyName || ""}
                  style={inputStyle}
                  required
                />
              </Field>

              <Field label="Company Type">
                <input
                  name="companyType"
                  defaultValue={vendor.companyType || ""}
                  style={inputStyle}
                />
              </Field>

              <Field label="Website">
                <input
                  name="website"
                  defaultValue={vendor.website || ""}
                  style={inputStyle}
                  placeholder="https://"
                />
              </Field>

              <Field label="Main Office Phone">
                <input
                  name="primaryPhone"
                  type="tel"
                  inputMode="numeric"
                  defaultValue={formatPhoneDisplay(vendor.primaryPhone)}
                  style={inputStyle}
                  placeholder="123-456-7890"
                  maxLength={12}
                  data-phone-format="true"
                />
              </Field>

              <Field label="Secondary Office Phone">
                <input
                  name="secondaryPhone"
                  type="tel"
                  inputMode="numeric"
                  defaultValue={formatPhoneDisplay(vendor.secondaryPhone)}
                  style={inputStyle}
                  placeholder="123-456-7890"
                  maxLength={12}
                  data-phone-format="true"
                />
              </Field>
            </div>
          </section>

          <section>
            <SectionSubhead>Mailing Address</SectionSubhead>
            <div style={twoColGridStyle}>
              <Field label="Address Line 1">
                <input
                  name="address1"
                  defaultValue={vendor.address1 || ""}
                  style={inputStyle}
                />
              </Field>

              <Field label="Address Line 2">
                <input
                  name="address2"
                  defaultValue={vendor.address2 || ""}
                  style={inputStyle}
                />
              </Field>

              <Field label="City">
                <input
                  name="city"
                  defaultValue={vendor.city || ""}
                  style={inputStyle}
                />
              </Field>

              <Field label="State">
                <input
                  name="state"
                  defaultValue={vendor.state || ""}
                  style={inputStyle}
                  maxLength={2}
                />
              </Field>

              <Field label="ZIP Code">
                <input
                  name="zip"
                  defaultValue={vendor.zip || ""}
                  style={inputStyle}
                />
              </Field>
            </div>
          </section>

          <section>
            <SectionSubhead>Primary Representative</SectionSubhead>
            <div style={twoColGridStyle}>
              <Field label="Primary Contact Name">
                <input
                  name="primaryContactName"
                  defaultValue={vendor.primaryContactName || ""}
                  style={inputStyle}
                />
              </Field>

              <Field label="Primary Contact Email">
                <input
                  name="primaryContactEmail"
                  defaultValue={vendor.primaryContactEmail || ""}
                  style={inputStyle}
                  type="email"
                />
              </Field>

              <Field label="Primary Contact Phone">
                <input
                  name="primaryContactPhone"
                  type="tel"
                  inputMode="numeric"
                  defaultValue={formatPhoneDisplay(vendor.primaryContactPhone)}
                  style={inputStyle}
                  placeholder="123-456-7890"
                  maxLength={12}
                  data-phone-format="true"
                />
              </Field>
            </div>
          </section>

          <section>
            <SectionSubhead>Secondary Representative</SectionSubhead>
            <div style={twoColGridStyle}>
              <Field label="Secondary Contact Name">
                <input
                  name="secondaryContactName"
                  defaultValue={vendor.secondaryContactName || ""}
                  style={inputStyle}
                />
              </Field>

              <Field label="Secondary Contact Email">
                <input
                  name="secondaryContactEmail"
                  defaultValue={vendor.secondaryContactEmail || ""}
                  style={inputStyle}
                  type="email"
                />
              </Field>

              <Field label="Secondary Contact Phone">
                <input
                  name="secondaryContactPhone"
                  type="tel"
                  inputMode="numeric"
                  defaultValue={formatPhoneDisplay(vendor.secondaryContactPhone)}
                  style={inputStyle}
                  placeholder="123-456-7890"
                  maxLength={12}
                  data-phone-format="true"
                />
              </Field>
            </div>
          </section>

          <section>
            <SectionSubhead>Reference Details</SectionSubhead>
            <div style={twoColGridStyle}>
              <ReadOnlyField label="Client Code" value={vendor.vendorcode} />
              <ReadOnlyField
                label="Portal Status"
                value={displayReadiness.label}
              />
              <ReadOnlyField label="Address on File" value={address} />
              <ReadOnlyField
                label="Last Updated"
                value={formatDateTime(vendor.updatedAt)}
              />
            </div>
          </section>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="submit" style={primaryButtonStyle}>
              Save Client Profile
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
          Upload each document in the correct row below. Each requirement is
          tracked individually.
        </p>

        <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
          {REQUIRED_DOCUMENT_DETAILS.map((item) => {
            const existing = documentMap.get(item.name);
            const received = readiness.uploadedLabels.some(
              (label) => label === item.name
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
                      <StatusChip
                        label={received ? "Received" : "Missing"}
                        tone={received ? "received" : "missing"}
                      />
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
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        <a
                          href={`/api/documents/download?key=${encodeURIComponent(
                            existing.storageKey
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          style={secondaryInlineLinkStyle}
                        >
                          Download current PDF
                        </a>
                        <span
                          style={{
                            fontSize: 13,
                            color: TEXT_MID,
                          }}
                        >
                          Uploaded {formatDateTime(existing.uploadedAt)}
                        </span>
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

                  <form
                    action={uploadRequiredDocument}
                    style={{
                      border: `1px solid ${BORDER_SOFT}`,
                      background: "#FFFFFF",
                      borderRadius: 12,
                      padding: 14,
                      display: "grid",
                      gap: 12,
                    }}
                  >
                    <input type="hidden" name="vendorCode" value={vendor.vendorcode} />
                    <input type="hidden" name="documentLabel" value={item.name} />

                    <label style={{ display: "grid", gap: 8 }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: TEXT_DARK,
                        }}
                      >
                        Upload PDF
                      </span>
                      <input
                        name="file"
                        type="file"
                        accept="application/pdf,.pdf"
                        required
                      />
                    </label>

                    <button type="submit" style={primaryButtonStyle}>
                      {existing ? "Replace Document" : "Upload Document"}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
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
          <div style={eyebrowStyle}>Reference</div>
          <h3
            style={{
              margin: "8px 0 0",
              fontSize: 22,
              lineHeight: 1.1,
              fontWeight: 800,
              color: TEXT_DARK,
            }}
          >
            Business Rules
          </h3>
          <p
            style={{
              marginTop: 12,
              marginBottom: 0,
              color: TEXT_MID,
            }}
          >
            Review Notarix™ operating standards, document expectations, and
            workflow guidance.
          </p>
          <div style={{ marginTop: 16 }}>
            <Link href="/vendors/business-rules" style={secondaryLinkStyle}>
              Open Business Rules
            </Link>
          </div>
        </div>

        <div style={panelStyle}>
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
            Use the help button below to open a message to Notarix™ support
            with your client code included automatically.
          </p>
          <div style={{ marginTop: 16 }}>
            <a href={supportHref} style={secondaryLinkStyle}>
              Request Help
            </a>
          </div>
        </div>
      </section>

      <Script id="vendor-phone-format" strategy="afterInteractive">
        {phoneFormatterScript()}
      </Script>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
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

function SectionSubhead({ children }: { children: ReactNode }) {
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

function StatusChip({
  label,
  tone,
}: {
  label: string;
  tone: "received" | "missing";
}) {
  const style =
    tone === "received"
      ? {
          border: `1px solid ${SUCCESS_BORDER}`,
          background: SUCCESS_BG,
          color: SUCCESS_TEXT,
        }
      : {
          border: `1px solid ${WARNING_BORDER}`,
          background: WARNING_BG,
          color: WARNING_TEXT,
        };

  return (
    <span
      style={{
        ...style,
        borderRadius: 999,
        padding: "6px 10px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  );
}

const panelStyle: CSSProperties = {
  background: CARD_GRAY,
  border: `1px solid ${BORDER}`,
  borderRadius: 18,
  padding: 18,
  boxShadow: "0 1px 2px rgba(20, 23, 34, 0.03)",
};

const heroPanelStyle: CSSProperties = {
  background: CARD_GRAY,
  border: `2px solid ${BORDER}`,
  borderRadius: 22,
  padding: 20,
  boxShadow:
    "0 1px 2px rgba(20, 23, 34, 0.03), inset 0 4px 0 rgba(59, 89, 244, 0.85)",
};

const statusPanelStyle: CSSProperties = {
  borderRadius: 18,
  padding: 18,
};

const asideCardStyle: CSSProperties = {
  border: `1px solid ${BORDER_SOFT}`,
  background: INNER_GRAY,
  borderRadius: 16,
  padding: 16,
};

const logoFrameStyle: CSSProperties = {
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

const miniSectionTitleStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: TEXT_MID,
  marginBottom: 12,
};

const eyebrowStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: TEXT_SOFT,
};

const eyebrowMutedStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "inherit",
  opacity: 0.82,
};

const twoColGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 16,
};

const inputStyle: CSSProperties = {
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

const primaryButtonStyle: CSSProperties = {
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

const secondaryLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  border: `1px solid ${BORDER_SOFT}`,
  borderRadius: 12,
  padding: "11px 16px",
  background: "#FFFFFF",
  color: TEXT_DARK,
  fontSize: 15,
  fontWeight: 700,
};

const secondaryInlineLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  border: `1px solid ${BORDER_SOFT}`,
  borderRadius: 10,
  padding: "8px 12px",
  background: "#FFFFFF",
  color: TEXT_DARK,
  fontSize: 13,
  fontWeight: 700,
};