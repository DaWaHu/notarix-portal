import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getClientReadiness } from "@/lib/client-readiness";

type PageProps = {
  params: Promise<{ vendorCode: string }>;
};

export const dynamic = "force-dynamic";

function nice(value: string | null | undefined) {
  const v = String(value || "").trim();
  return v || "Not provided";
}

function buildAddress(parts: Array<string | null | undefined>) {
  const cleaned = parts
    .map((part) => String(part || "").trim())
    .filter(Boolean);

  return cleaned.length > 0 ? cleaned.join(", ") : "Not provided";
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
      companyLogoUrl: String(formData.get("companyLogoUrl") || "").trim() || null,
      website: String(formData.get("website") || "").trim() || null,
      address1: String(formData.get("address1") || "").trim() || null,
      address2: String(formData.get("address2") || "").trim() || null,
      city: String(formData.get("city") || "").trim() || null,
      state: String(formData.get("state") || "").trim().toUpperCase() || null,
      zip: String(formData.get("zip") || "").trim() || null,
      primaryPhone: String(formData.get("primaryPhone") || "").trim() || null,
      secondaryPhone: String(formData.get("secondaryPhone") || "").trim() || null,
      primaryContactName:
        String(formData.get("primaryContactName") || "").trim() || null,
      primaryContactEmail:
        String(formData.get("primaryContactEmail") || "").trim() || null,
      primaryContactPhone:
        String(formData.get("primaryContactPhone") || "").trim() || null,
      secondaryContactName:
        String(formData.get("secondaryContactName") || "").trim() || null,
      secondaryContactEmail:
        String(formData.get("secondaryContactEmail") || "").trim() || null,
      secondaryContactPhone:
        String(formData.get("secondaryContactPhone") || "").trim() || null,
      profilePageCreated: true,
    },
  });

  revalidatePath(`/vendors/${vendorCode}`);
  redirect(`/vendors/${vendorCode}`);
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
      profilePageCreated: true,
      createdAt: true,
      updatedAt: true,
      documents: {
        orderBy: { uploadedAt: "desc" },
        select: {
          id: true,
          fileName: true,
          documentType: true,
          notes: true,
          uploadedAt: true,
          mimeType: true,
          fileSizeBytes: true,
          storageKey: true,
        },
        take: 50,
      },
      _count: {
        select: {
          orders: true,
          documents: true,
          users: true,
        },
      },
    },
  });

  if (!vendor) {
    notFound();
  }

  const address = buildAddress([
    vendor.address1,
    vendor.address2,
    vendor.city,
    vendor.state,
    vendor.zip,
  ]);

  const {
    completion,
    requiredDocs,
    requiredDocsReceived,
    uploadedLabels,
    readiness,
  } = getClientReadiness(vendor);

  return (
    <main
      style={{
        padding: "8px 18px 32px",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <section
          style={{
            background: "linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)",
            border: "1px solid #BFDBFE",
            borderRadius: 30,
            padding: 26,
            boxShadow: "0 14px 34px rgba(30, 58, 138, 0.14)",
            color: "#FFFFFF",
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 22,
            marginBottom: 22,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.10)",
                padding: "8px 12px",
                fontSize: 11,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "#DBEAFE",
              }}
            >
              Client Portal
            </div>

            <h1
              style={{
                margin: "14px 0 0",
                fontSize: 44,
                lineHeight: 1,
                fontWeight: 950,
                letterSpacing: -1,
              }}
            >
              {vendor.companyName}
            </h1>

            <div
              style={{
                marginTop: 12,
                fontSize: 15,
                lineHeight: 1.7,
                fontWeight: 600,
                color: "#E0E7FF",
                maxWidth: 760,
              }}
            >
              Complete your organization profile, upload required client documents,
              and review Notarix operating standards before final approval.
            </div>

            <div
              style={{
                marginTop: 18,
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <span style={heroPillStyle}>Client Code: {vendor.vendorcode}</span>
              <span style={heroPillStyle}>Approval: {vendor.approvalStatus}</span>
              <span style={heroPillStyle}>
                Profile Completion: {completion.percent}%
              </span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            <HeroMetric label="Orders" value={vendor._count.orders} />
            <HeroMetric label="Documents" value={vendor._count.documents} />
            <HeroMetric label="Users" value={vendor._count.users} />
            <HeroMetric
              label="Required Docs"
              value={`${requiredDocsReceived}/${requiredDocs.length}`}
            />
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "0.95fr 1.05fr",
            gap: 20,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 18,
              padding: 22,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 950,
                color: "#0F172A",
                marginBottom: 14,
              }}
            >
              Organization Overview
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <InfoRow label="Company Name" value={nice(vendor.companyName)} />
              <InfoRow label="Client Code" value={nice(vendor.vendorcode)} />
              <InfoRow label="Company Type" value={nice(vendor.companyType)} />
              <InfoRow label="Website" value={nice(vendor.website)} />
              <InfoRow label="Main Office Phone" value={nice(vendor.primaryPhone)} />
              <InfoRow
                label="Secondary Office Phone"
                value={nice(vendor.secondaryPhone)}
              />
              <InfoRow
                label="Profile Page Created"
                value={vendor.profilePageCreated ? "Yes" : "No"}
              />
              <InfoRow
                label="Created"
                value={new Date(vendor.createdAt).toLocaleString()}
              />
              <InfoRow
                label="Last Updated"
                value={new Date(vendor.updatedAt).toLocaleString()}
              />
            </div>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 18,
              padding: 22,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "start",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 950,
                    color: "#0F172A",
                  }}
                >
                  Account Readiness
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    color: "#475569",
                    fontWeight: 600,
                  }}
                >
                  Approval status is controlled by required profile completion and required documents.
                </div>
              </div>
            </div>

            <div
              style={{
                borderRadius: 16,
                padding: 16,
                ...readiness.tone,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                }}
              >
                Current State
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 28,
                  lineHeight: 1,
                  fontWeight: 950,
                }}
              >
                {readiness.label}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  lineHeight: 1.7,
                  fontWeight: 700,
                }}
              >
                {readiness.description}
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              <a href="#client-profile-form" style={actionLink}>
                Complete Profile
              </a>

              <Link href="/vendors/business-rules" style={actionLink}>
                Business Rules
              </Link>

              <Link href={`/vendors/${vendor.vendorcode}/orders`} style={actionLink}>
                View Orders
              </Link>

              <Link
                href={`/vendors/${vendor.vendorcode}/orders/new`}
                style={actionLink}
              >
                Create Order
              </Link>
            </div>

            <div
              style={{
                marginTop: 18,
                border: "1px solid #E2E8F0",
                borderRadius: 16,
                background: "#F8FAFC",
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#0F172A",
                  marginBottom: 8,
                }}
              >
                Address on File
              </div>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  fontWeight: 700,
                  color: "#334155",
                }}
              >
                {address}
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "0.95fr 1.05fr",
            gap: 20,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 18,
              padding: 22,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "end",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "#1D4ED8",
                  }}
                >
                  Approval Readiness
                </div>
                <h2
                  style={{
                    margin: "8px 0 0",
                    fontSize: 28,
                    lineHeight: 1,
                    fontWeight: 950,
                    color: "#0F172A",
                  }}
                >
                  Required Documents
                </h2>
              </div>

              <div
                style={{
                  borderRadius: 12,
                  border: "1px solid #DBEAFE",
                  background: "#EFF6FF",
                  color: "#1D4ED8",
                  padding: "10px 14px",
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                Received {requiredDocsReceived}/{requiredDocs.length}
              </div>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {requiredDocs.map((doc) => {
                const present = uploadedLabels.some((uploaded) => uploaded === doc);

                return (
                  <div
                    key={doc}
                    style={{
                      border: `1px solid ${present ? "#A7F3D0" : "#E2E8F0"}`,
                      background: present ? "#ECFDF5" : "#F8FAFC",
                      borderRadius: 14,
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: "#0F172A",
                      }}
                    >
                      {doc}
                    </div>

                    <span
                      style={{
                        borderRadius: 999,
                        padding: "6px 10px",
                        fontSize: 12,
                        fontWeight: 900,
                        background: present ? "#D1FAE5" : "#E2E8F0",
                        color: present ? "#047857" : "#475569",
                      }}
                    >
                      {present ? "Received" : "Missing"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 18,
              padding: 22,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "end",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "#1D4ED8",
                  }}
                >
                  Profile Requirements
                </div>
                <h2
                  style={{
                    margin: "8px 0 0",
                    fontSize: 28,
                    lineHeight: 1,
                    fontWeight: 950,
                    color: "#0F172A",
                  }}
                >
                  Required Profile Fields
                </h2>
              </div>

              <div
                style={{
                  borderRadius: 12,
                  border: "1px solid #DBEAFE",
                  background: "#EFF6FF",
                  color: "#1D4ED8",
                  padding: "10px 14px",
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                Complete {completion.completed}/{completion.total}
              </div>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {completion.checks.map((check) => (
                <div
                  key={check.label}
                  style={{
                    border: `1px solid ${check.complete ? "#A7F3D0" : "#E2E8F0"}`,
                    background: check.complete ? "#ECFDF5" : "#F8FAFC",
                    borderRadius: 14,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#0F172A",
                    }}
                  >
                    {check.label}
                  </div>

                  <span
                    style={{
                      borderRadius: 999,
                      padding: "6px 10px",
                      fontSize: 12,
                      fontWeight: 900,
                      background: check.complete ? "#D1FAE5" : "#E2E8F0",
                      color: check.complete ? "#047857" : "#475569",
                    }}
                  >
                    {check.complete ? "Complete" : "Missing"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="client-profile-form"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 18,
            padding: 24,
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
            marginBottom: 20,
            scrollMarginTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "end",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 18,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: "#1D4ED8",
                }}
              >
                Profile Completion
              </div>
              <h2
                style={{
                  margin: "8px 0 0",
                  fontSize: 32,
                  lineHeight: 1,
                  fontWeight: 950,
                  color: "#0F172A",
                }}
              >
                Complete Client Profile
              </h2>
            </div>

            <div
              style={{
                borderRadius: 12,
                border: "1px solid #DBEAFE",
                background: "#EFF6FF",
                color: "#1D4ED8",
                padding: "10px 14px",
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              Completion {completion.percent}%
            </div>
          </div>

          <form action={updateClientProfile} style={{ display: "grid", gap: 26 }}>
            <input type="hidden" name="vendorCode" value={vendor.vendorcode} />

            <section>
              <div style={sectionTitleStyle}>Organization Information</div>
              <div style={twoColGridStyle}>
                <Field label="Company Name">
                  <input
                    name="companyName"
                    defaultValue={vendor.companyName}
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

                <Field label="Company Logo URL">
                  <input
                    name="companyLogoUrl"
                    defaultValue={vendor.companyLogoUrl || ""}
                    style={inputStyle}
                  />
                </Field>

                <Field label="Website">
                  <input
                    name="website"
                    defaultValue={vendor.website || ""}
                    style={inputStyle}
                  />
                </Field>

                <Field label="Main Office Phone">
                  <input
                    name="primaryPhone"
                    defaultValue={vendor.primaryPhone || ""}
                    style={inputStyle}
                  />
                </Field>

                <Field label="Secondary Office Phone">
                  <input
                    name="secondaryPhone"
                    defaultValue={vendor.secondaryPhone || ""}
                    style={inputStyle}
                  />
                </Field>
              </div>
            </section>

            <section>
              <div style={sectionTitleStyle}>Mailing Address</div>
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
              <div style={sectionTitleStyle}>Primary Representative</div>
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
                    defaultValue={vendor.primaryContactPhone || ""}
                    style={inputStyle}
                  />
                </Field>
              </div>
            </section>

            <section>
              <div style={sectionTitleStyle}>Secondary Representative</div>
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
                    defaultValue={vendor.secondaryContactPhone || ""}
                    style={inputStyle}
                  />
                </Field>
              </div>
            </section>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <button type="submit" style={primaryButtonStyle}>
                Save Client Profile
              </button>

              <Link
                href={`/vendors/${vendor.vendorcode}/orders`}
                style={secondaryButtonStyle}
              >
                View Orders
              </Link>
            </div>
          </form>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 20,
          }}
        >
          <ContactCard
            title="Primary Contact"
            name={vendor.primaryContactName}
            email={vendor.primaryContactEmail}
            phone={vendor.primaryContactPhone}
          />

          <ContactCard
            title="Secondary Contact"
            name={vendor.secondaryContactName}
            email={vendor.secondaryContactEmail}
            phone={vendor.secondaryContactPhone}
          />
        </section>
      </div>
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

function HeroMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(255,255,255,0.10)",
        padding: "16px 16px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          color: "#DBEAFE",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 32,
          lineHeight: 1,
          fontWeight: 950,
          color: "#FFFFFF",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ContactCard({
  title,
  name,
  email,
  phone,
}: {
  title: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 18,
        padding: 22,
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontWeight: 950,
          color: "#0F172A",
          marginBottom: 14,
        }}
      >
        {title}
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <InfoRow label="Name" value={nice(name)} />
        <InfoRow label="Email" value={nice(email)} />
        <InfoRow label="Phone" value={nice(phone)} />
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #E2E8F0",
        background: "#F8FAFC",
        borderRadius: 14,
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 900,
          color: "#64748B",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 800,
          color: "#0F172A",
          lineHeight: 1.6,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 950,
  color: "#0F172A",
  marginBottom: 16,
};

const twoColGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 16,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #CBD5E1",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 14,
  color: "#0F172A",
  background: "#FFFFFF",
  outline: "none",
  boxSizing: "border-box",
};

const heroPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.10)",
  padding: "8px 12px",
  fontSize: 12,
  fontWeight: 800,
  color: "#FFFFFF",
};

const actionLink: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  border: "1px solid #CBD5E1",
  borderRadius: 12,
  padding: "12px 16px",
  fontWeight: 800,
  color: "#0F172A",
  background: "#FFFFFF",
};

const primaryButtonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: 12,
  padding: "14px 20px",
  background: "#1D4ED8",
  color: "#FFFFFF",
  fontWeight: 900,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  border: "1px solid #CBD5E1",
  borderRadius: 12,
  padding: "14px 20px",
  fontWeight: 800,
  color: "#0F172A",
  background: "#FFFFFF",
};