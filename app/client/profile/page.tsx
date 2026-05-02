import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ReactNode, CSSProperties } from "react";

const TEXT_DARK = "#141722";
const TEXT_MID = "#666666";

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

  revalidatePath(`/client/profile`);
  redirect(`/client/profile?vendorCode=${vendorCode}`);
}

export default async function ClientProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ vendorCode?: string }>;
}) {
  const resolved = (await searchParams) || {};
  const vendorCode = String(resolved.vendorCode || "").trim().toUpperCase();

  if (!vendorCode) {
    return (
      <div style={panelStyle}>
        <div style={eyebrowStyle}>Notarix™ Client Portal</div>
        <h1 style={titleStyle}>Client Profile</h1>
        <p style={bodyStyle}>
          This page needs a client code to load the real profile record.
          Append <strong>?vendorCode=YOURCLIENTCODE</strong> to the URL for now.
        </p>
      </div>
    );
  }

  const vendor = await prisma.vendor.findUnique({
    where: { vendorcode: vendorCode },
    select: {
      vendorcode: true,
      companyName: true,
      companyType: true,
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
      updatedAt: true,
    },
  });

  if (!vendor) {
    return (
      <div style={panelStyle}>
        <div style={eyebrowStyle}>Notarix™ Client Portal</div>
        <h1 style={titleStyle}>Client Profile</h1>
        <p style={bodyStyle}>
          No client record was found for code <strong>{vendorCode}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <div style={eyebrowStyle}>Notarix™ Client Portal</div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={titleStyle}>Client Profile</h1>
          <p style={bodyStyle}>
            Manage your organization details and contact information.
          </p>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <div style={readOnlyMetaStyle}>
            <strong>Client Code:</strong> {vendor.vendorcode}
          </div>
          <div style={readOnlyMetaStyle}>
            <strong>Last Updated:</strong>{" "}
            {new Date(vendor.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>

      <form action={updateClientProfile} style={{ marginTop: 24, display: "grid", gap: 24 }}>
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
                defaultValue={formatPhoneDisplay(vendor.primaryPhone)}
                style={inputStyle}
                placeholder="123-456-7890"
              />
            </Field>

            <Field label="Secondary Office Phone">
              <input
                name="secondaryPhone"
                defaultValue={formatPhoneDisplay(vendor.secondaryPhone)}
                style={inputStyle}
                placeholder="123-456-7890"
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
                defaultValue={formatPhoneDisplay(vendor.primaryContactPhone)}
                style={inputStyle}
                placeholder="123-456-7890"
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
                defaultValue={formatPhoneDisplay(vendor.secondaryContactPhone)}
                style={inputStyle}
                placeholder="123-456-7890"
              />
            </Field>
          </div>
        </section>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button type="submit" style={primaryButtonStyle}>
            Save Client Profile
          </button>
        </div>
      </form>
    </div>
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
      <span style={fieldLabelStyle}>{label}</span>
      {children}
    </label>
  );
}

function SectionSubhead({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        margin: "0 0 16px",
        fontSize: 22,
        lineHeight: 1.1,
        fontWeight: 800,
        color: TEXT_DARK,
      }}
    >
      {children}
    </h2>
  );
}

const panelStyle: CSSProperties = {
  background: "#F3F4F6",
  border: "1px solid #D1D5DB",
  borderRadius: 24,
  padding: 24,
  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
};

const eyebrowStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 900,
  letterSpacing: "0.16em",
  color: "#6B7280",
  marginBottom: 8,
  textTransform: "uppercase",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 44,
  lineHeight: 1.05,
  fontWeight: 950,
  color: "#111827",
};

const bodyStyle: CSSProperties = {
  marginTop: 14,
  marginBottom: 0,
  color: "#4B5563",
  fontWeight: 600,
  fontSize: 16,
  maxWidth: 760,
  lineHeight: 1.6,
};

const twoColGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 16,
};

const fieldLabelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: TEXT_DARK,
};

const inputStyle: CSSProperties = {
  width: "100%",
  border: "1px solid #CBD5E1",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 14,
  color: "#111827",
  background: "#FFFFFF",
  outline: "none",
  boxSizing: "border-box",
};

const primaryButtonStyle: CSSProperties = {
  border: 0,
  borderRadius: 12,
  padding: "14px 18px",
  background: "#3B59F4",
  color: "#FFFFFF",
  fontWeight: 900,
  fontSize: 15,
  cursor: "pointer",
  boxShadow: "0 4px 10px rgba(59, 89, 244, 0.18)",
};

const readOnlyMetaStyle: CSSProperties = {
  fontSize: 14,
  color: TEXT_MID,
  fontWeight: 600,
};