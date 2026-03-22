import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ReactNode } from "react";

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #CBD5E1",
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: 14,
  color: "#0F172A",
  background: "white",
  outline: "none",
  boxSizing: "border-box",
};

async function createVendor(formData: FormData) {
  "use server";

  const companyType = String(formData.get("companyType") || "").trim();
  const companyName = String(formData.get("companyName") || "").trim();
  const vendorCode = String(formData.get("vendorCode") || "")
    .trim()
    .toUpperCase();
  const logoUrl = String(formData.get("logoUrl") || "").trim();

  const primaryContactName = String(
    formData.get("primaryContactName") || ""
  ).trim();
  const primaryContactEmail = String(
    formData.get("primaryContactEmail") || ""
  ).trim();
  const primaryContactPhone = String(
    formData.get("primaryContactPhone") || ""
  ).trim();

  const secondaryContactName = String(
    formData.get("secondaryContactName") || ""
  ).trim();
  const secondaryContactEmail = String(
    formData.get("secondaryContactEmail") || ""
  ).trim();
  const secondaryContactPhone = String(
    formData.get("secondaryContactPhone") || ""
  ).trim();

  if (!companyName) {
    throw new Error("Company name is required.");
  }

  const vendorCodePattern = /^\d{2}\d{4}[A-Z]{2}$/;

  if (!vendorCodePattern.test(vendorCode)) {
    throw new Error(
      "Vendor code must use format YYVVVVST, for example 265000NC."
    );
  }

  if (!vendorCode) {
    throw new Error("Vendor code is required.");
  }

  const existingVendor = await prisma.vendor.findUnique({
    where: { vendorcode: vendorCode },
    select: { id: true },
  });

  if (existingVendor) {
    throw new Error("That vendor code already exists.");
  }

  await prisma.vendor.create({
    data: {
      companyType: companyType || null,
      companyName,
      vendorcode: vendorCode,
      primaryContactName: primaryContactName || null,
      primaryContactEmail: primaryContactEmail || null,
      primaryContactPhone: primaryContactPhone || null,
      secondaryContactName: secondaryContactName || null,
      secondaryContactEmail: secondaryContactEmail || null,
      secondaryContactPhone: secondaryContactPhone || null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/vendors");

  redirect("/admin/vendors");
}

export default function AdminCreateVendorPage() {
  return (
    <main
      style={{
        padding: 28,
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 24,
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 40,
                  lineHeight: 1.1,
                  fontWeight: 950,
                  color: "#0F172A",
                }}
              >
                Create Vendor
              </h1>
              <div
                style={{
                  marginTop: 8,
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: 15,
                }}
              >
                Add a new title company, law firm, lender, escrow company, or
                other approved client organization.
              </div>
            </div>

            <a
              href="/admin/vendors"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                border: "1px solid #CBD5E1",
                borderRadius: 10,
                padding: "12px 16px",
                fontWeight: 800,
                color: "#0F172A",
                background: "#fff",
              }}
            >
              Back to Vendors
            </a>
          </div>

          <form action={createVendor} style={{ display: "grid", gap: 28 }}>
            <section>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#0F172A",
                  marginBottom: 16,
                }}
              >
                Company Information
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 16,
                }}
              >
                <Field label="Company Type">
                  <select style={inputStyle} name="companyType" defaultValue="">
                    <option value="" disabled>
                      Select company type
                    </option>
                    <option>Title Company</option>
                    <option>Law Firm</option>
                    <option>Lender</option>
                    <option>Escrow Company</option>
                    <option>Real Estate Office</option>
                    <option>Other Client Organization</option>
                  </select>
                </Field>

                <Field label="Company Name">
                  <input
                    name="companyName"
                    style={inputStyle}
                    placeholder="Enter company name"
                    required
                  />
                </Field>

                <Field label="Vendor Code">
                  <input
                    name="vendorCode"
                    style={inputStyle}
                    placeholder="Example: 2601AB010"
                    required
                  />
                </Field>

                <Field label="Company Logo URL">
                  <input
                    name="logoUrl"
                    style={inputStyle}
                    placeholder="https://example.com/logo.png"
                  />
                </Field>
              </div>
            </section>

            <section>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#0F172A",
                  marginBottom: 16,
                }}
              >
                Primary Contact
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 16,
                }}
              >
                <Field label="Primary Contact Name">
                  <input
                    name="primaryContactName"
                    style={inputStyle}
                    placeholder="Enter full name"
                  />
                </Field>

                <Field label="Primary Contact Email">
                  <input
                    name="primaryContactEmail"
                    style={inputStyle}
                    placeholder="name@company.com"
                  />
                </Field>

                <Field label="Primary Contact Phone">
                  <input
                    name="primaryContactPhone"
                    style={inputStyle}
                    placeholder="(000) 000-0000"
                  />
                </Field>
              </div>
            </section>

            <section>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#0F172A",
                  marginBottom: 16,
                }}
              >
                Secondary Contact
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 16,
                }}
              >
                <Field label="Secondary Contact Name">
                  <input
                    name="secondaryContactName"
                    style={inputStyle}
                    placeholder="Enter full name"
                  />
                </Field>

                <Field label="Secondary Contact Email">
                  <input
                    name="secondaryContactEmail"
                    style={inputStyle}
                    placeholder="name@company.com"
                  />
                </Field>

                <Field label="Secondary Contact Phone">
                  <input
                    name="secondaryContactPhone"
                    style={inputStyle}
                    placeholder="(000) 000-0000"
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
              <button
                type="submit"
                style={{
                  border: 0,
                  borderRadius: 10,
                  padding: "14px 20px",
                  background: "#1D4ED8",
                  color: "white",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Create Vendor
              </button>

              <a
                href="/admin/vendors"
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
            </div>
          </form>
        </div>
      </div>
    </main>
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