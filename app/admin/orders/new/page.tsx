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

async function createOrder(formData: FormData) {
  "use server";

  const vendorCode = String(formData.get("vendorCode") || "")
    .trim()
    .toUpperCase();

  const primaryBorrowerName = String(
    formData.get("primaryBorrowerName") || ""
  ).trim();

  const secondaryBorrowerName = String(
    formData.get("secondaryBorrowerName") || ""
  ).trim();

  const borrowerPhone = String(formData.get("borrowerPhone") || "").trim();
  const borrowerEmail = String(formData.get("borrowerEmail") || "").trim();

  const propertyAddress1 = String(formData.get("propertyAddress1") || "").trim();
  const propertyAddress2 = String(formData.get("propertyAddress2") || "").trim();
  const propertyCity = String(formData.get("propertyCity") || "").trim();
  const propertyState = String(formData.get("propertyState") || "").trim();
  const propertyZip = String(formData.get("propertyZip") || "").trim();

  const signingDateRaw = String(formData.get("signingDate") || "").trim();
  const signingTimeLabel = String(formData.get("signingTimeLabel") || "").trim();

  const estimatedPagesRaw = String(formData.get("estimatedPages") || "").trim();
  const estimatedPages = estimatedPagesRaw ? Number(estimatedPagesRaw) : null;

  const paperSize = String(formData.get("paperSize") || "").trim();
  const preferredInk = String(formData.get("preferredInk") || "").trim();
  const serviceType = String(formData.get("serviceType") || "").trim();
  const specialInstructions = String(
    formData.get("specialInstructions") || ""
  ).trim();

  const isRON = formData.get("isRON") === "on";

  if (!vendorCode) {
    throw new Error("Vendor code is required.");
  }

  if (!primaryBorrowerName) {
    throw new Error("Primary borrower name is required.");
  }

  if (!propertyAddress1) {
    throw new Error("Property address is required.");
  }

  const vendor = await prisma.vendor.findUnique({
    where: { vendorcode: vendorCode },
    select: {
      id: true,
      vendorcode: true,
      companyName: true,
    },
  });

  if (!vendor) {
    throw new Error("Vendor code was not found.");
  }

  const signingDate =
    signingDateRaw && !Number.isNaN(new Date(signingDateRaw).getTime())
      ? new Date(signingDateRaw)
      : null;

  const orderNumber = `ORD-${Date.now()}`;

  await prisma.vendorOrder.create({
    data: {
      vendorId: vendor.id,
      orderNumber,
      status: "Pending",
      primaryBorrowerName,
      secondaryBorrowerName: secondaryBorrowerName || null,
      propertyAddress1,
      propertyAddress2: propertyAddress2 || null,
      propertyCity: propertyCity || null,
      propertyState: propertyState || null,
      propertyZip: propertyZip || null,
      borrowerPhone: borrowerPhone || null,
      borrowerEmail: borrowerEmail || null,
      signingDate,
      signingTimeLabel: signingTimeLabel || null,
      estimatedPages: typeof estimatedPages === "number" && !Number.isNaN(estimatedPages)
        ? estimatedPages
        : null,
      paperSize: paperSize || null,
      preferredInk: preferredInk || null,
      isRON,
      serviceType: serviceType || null,
      specialInstructions: specialInstructions || null,
      notes: null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/vendors/${vendor.vendorcode}`);
  revalidatePath(`/vendors/${vendor.vendorcode}/orders`);
  revalidatePath(`/vendors/${vendor.vendorcode}/orders/new`);

  redirect("/admin/orders");
}

export default function AdminNewOrderPage() {
  return (
    <main
      style={{
        padding: 28,
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
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
                Create New Order
              </h1>
              <div
                style={{
                  marginTop: 8,
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: 15,
                }}
              >
                Staff order intake form for title companies, law firms, and other approved clients.
              </div>
            </div>

            <a
              href="/admin/orders"
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
              Back to Orders
            </a>
          </div>

          <form action={createOrder} style={{ display: "grid", gap: 28 }}>
            <section>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#0F172A",
                  marginBottom: 16,
                }}
              >
                Client Information
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 16,
                }}
              >
                <Field label="Vendor Code">
                  <input
                    name="vendorCode"
                    style={inputStyle}
                    placeholder="Example: 2601AB010"
                    required
                  />
                </Field>

                <Field label="Service Type">
                  <input
                    name="serviceType"
                    style={inputStyle}
                    placeholder="Purchase, Refinance, Seller Package, etc."
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
                Borrower Information
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 16,
                }}
              >
                <Field label="Primary Borrower Name">
                  <input
                    name="primaryBorrowerName"
                    style={inputStyle}
                    placeholder="Last Name, First Name"
                    required
                  />
                </Field>

                <Field label="Secondary Borrower / Signer">
                  <input
                    name="secondaryBorrowerName"
                    style={inputStyle}
                    placeholder="Last Name, First Name"
                  />
                </Field>

                <Field label="Borrower Phone">
                  <input
                    name="borrowerPhone"
                    style={inputStyle}
                    placeholder="(000) 000-0000"
                  />
                </Field>

                <Field label="Borrower Email">
                  <input
                    name="borrowerEmail"
                    style={inputStyle}
                    placeholder="borrower@example.com"
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
                Property & Signing Details
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 16,
                }}
              >
                <Field label="Property Address 1">
                  <input
                    name="propertyAddress1"
                    style={inputStyle}
                    placeholder="Street address"
                    required
                  />
                </Field>

                <Field label="Property Address 2">
                  <input
                    name="propertyAddress2"
                    style={inputStyle}
                    placeholder="Suite, unit, etc."
                  />
                </Field>

                <Field label="City">
                  <input
                    name="propertyCity"
                    style={inputStyle}
                    placeholder="City"
                  />
                </Field>

                <Field label="State">
                  <input
                    name="propertyState"
                    style={inputStyle}
                    placeholder="State"
                  />
                </Field>

                <Field label="Zip">
                  <input
                    name="propertyZip"
                    style={inputStyle}
                    placeholder="Zip code"
                  />
                </Field>

                <Field label="Signing Date">
                  <input name="signingDate" type="date" style={inputStyle} />
                </Field>

                <Field label="Signing Time">
                  <input
                    name="signingTimeLabel"
                    style={inputStyle}
                    placeholder="2:30 PM EST"
                  />
                </Field>

                <Field label="Estimated Pages">
                  <input
                    name="estimatedPages"
                    type="number"
                    min="0"
                    style={inputStyle}
                    placeholder="Estimated pages"
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
                Service Details
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 16,
                }}
              >
                <Field label="Paper Size">
                  <select name="paperSize" style={inputStyle} defaultValue="">
                    <option value="" disabled>
                      Select paper size
                    </option>
                    <option>Letter</option>
                    <option>Legal</option>
                  </select>
                </Field>

                <Field label="Preferred Ink">
                  <select name="preferredInk" style={inputStyle} defaultValue="">
                    <option value="" disabled>
                      Select preferred ink
                    </option>
                    <option>Black</option>
                    <option>Blue</option>
                  </select>
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
                    <input id="ron" name="isRON" type="checkbox" />
                    <label htmlFor="ron" style={{ fontWeight: 700 }}>
                      Remote Online Notarization
                    </label>
                  </div>
                </Field>
              </div>

              <div style={{ marginTop: 16 }}>
                <Field label="Special Instructions">
                  <textarea
                    name="specialInstructions"
                    style={{
                      ...inputStyle,
                      minHeight: 140,
                      resize: "vertical",
                    }}
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
                Create Order
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