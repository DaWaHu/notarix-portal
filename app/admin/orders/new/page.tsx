import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { CSSProperties, ReactNode } from "react";

const inputStyle: CSSProperties = {
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

function parseOptionalDate(value: string) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

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

  const rawBorrowerPhone = String(formData.get("borrowerPhone") || "").trim();
  const borrowerPhoneDigits = rawBorrowerPhone.replace(/\D/g, "");
  const borrowerPhone =
    borrowerPhoneDigits.length === 10
      ? `${borrowerPhoneDigits.slice(0, 3)}-${borrowerPhoneDigits.slice(3, 6)}-${borrowerPhoneDigits.slice(6)}`
      : rawBorrowerPhone;

  const borrowerEmail = String(formData.get("borrowerEmail") || "").trim();

  const propertyAddress1 = String(formData.get("propertyAddress1") || "").trim();
  const propertyAddress2 = String(formData.get("propertyAddress2") || "").trim();
  const propertyCity = String(formData.get("propertyCity") || "").trim();
  const propertyState = String(formData.get("propertyState") || "").trim();
  const propertyZip = String(formData.get("propertyZip") || "").trim();

  const signingDateRaw = String(formData.get("signingDate") || "").trim();
  const signingTime = String(formData.get("signingTime") || "").trim();
  const signingTimeZone = String(formData.get("signingTimeZone") || "").trim();
  const signingTimeLabel =
    [signingTime, signingTimeZone].filter(Boolean).join(" ") || null;

  const estimatedPagesRaw = String(formData.get("estimatedPages") || "").trim();
  const estimatedPages = estimatedPagesRaw ? Number(estimatedPagesRaw) : null;

  const feeAmountRaw = String(formData.get("feeAmount") || "").trim();
  const feeAmount = feeAmountRaw ? Number(feeAmountRaw) : null;
  const paymentDueStatus = String(formData.get("paymentDueStatus") || "").trim();
  const paymentDueDateRaw = String(formData.get("paymentDueDate") || "").trim();
  const paymentMethod = String(formData.get("paymentMethod") || "").trim();
  const paymentPaid = String(formData.get("paymentPaid") || "false") === "true";
  const paymentPaidDateRaw = String(formData.get("paymentPaidDate") || "").trim();
  const paymentNotes = String(formData.get("paymentNotes") || "").trim();

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

  const signingDate = parseOptionalDate(signingDateRaw);
  const paymentDueDate = parseOptionalDate(paymentDueDateRaw);
  const paymentPaidDate = parseOptionalDate(paymentPaidDateRaw);

  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const orderPrefix = `${yy}${mm}`;

  const existingOrdersThisMonth = await prisma.vendorOrder.count({
    where: {
      orderNumber: {
        startsWith: orderPrefix,
      },
    },
  });

  const sequence = String(existingOrdersThisMonth + 1).padStart(4, "0");
  const orderNumber = `${orderPrefix}${sequence}`;

  await prisma.vendorOrder.create({
    data: {
      vendorId: vendor.id,
      orderNumber,
      status: "DRAFT",
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
      signingTimeLabel,
      estimatedPages:
        typeof estimatedPages === "number" && !Number.isNaN(estimatedPages)
          ? estimatedPages
          : null,
      feeAmount:
        typeof feeAmount === "number" && !Number.isNaN(feeAmount)
          ? feeAmount
          : null,
      paymentDueStatus: paymentDueStatus || null,
      paymentDueDate,
      paymentMethod: paymentMethod || null,
      paymentPaid,
      paymentPaidDate,
      paymentNotes: paymentNotes || null,
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
  const minDate = new Date().toISOString().split("T")[0];
  const maxDate = new Date(
    new Date().setMonth(new Date().getMonth() + 6)
  )
    .toISOString()
    .split("T")[0];

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
            background: "#FFFFFF",
            border: "1px solid #D6DEE8",
            borderRadius: 20,
            padding: 32,
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)"
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
                Staff order intake form for title companies, law firms, and other
                approved clients.
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
                    type="tel"
                    inputMode="numeric"
                    maxLength={12}
                    placeholder="111-222-3333"
                    title="Use format 111-222-3333"
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
                  <select name="propertyState" style={inputStyle} defaultValue="">
                    <option value="" disabled>
                      Select state
                    </option>
                    <option value="AL">AL</option>
                    <option value="AK">AK</option>
                    <option value="AZ">AZ</option>
                    <option value="AR">AR</option>
                    <option value="CA">CA</option>
                    <option value="CO">CO</option>
                    <option value="CT">CT</option>
                    <option value="DC">DC</option>
                    <option value="DE">DE</option>
                    <option value="FL">FL</option>
                    <option value="GA">GA</option>
                    <option value="HI">HI</option>
                    <option value="ID">ID</option>
                    <option value="IL">IL</option>
                    <option value="IN">IN</option>
                    <option value="IA">IA</option>
                    <option value="KS">KS</option>
                    <option value="KY">KY</option>
                    <option value="LA">LA</option>
                    <option value="ME">ME</option>
                    <option value="MD">MD</option>
                    <option value="MA">MA</option>
                    <option value="MI">MI</option>
                    <option value="MN">MN</option>
                    <option value="MS">MS</option>
                    <option value="MO">MO</option>
                    <option value="MT">MT</option>
                    <option value="NE">NE</option>
                    <option value="NV">NV</option>
                    <option value="NH">NH</option>
                    <option value="NJ">NJ</option>
                    <option value="NM">NM</option>
                    <option value="NY">NY</option>
                    <option value="NC">NC</option>
                    <option value="ND">ND</option>
                    <option value="OH">OH</option>
                    <option value="OK">OK</option>
                    <option value="OR">OR</option>
                    <option value="PA">PA</option>
                    <option value="RI">RI</option>
                    <option value="SC">SC</option>
                    <option value="SD">SD</option>
                    <option value="TN">TN</option>
                    <option value="TX">TX</option>
                    <option value="UT">UT</option>
                    <option value="VT">VT</option>
                    <option value="VA">VA</option>
                    <option value="WA">WA</option>
                    <option value="WV">WV</option>
                    <option value="WI">WI</option>
                    <option value="WY">WY</option>
                  </select>
                </Field>

                <Field label="Zip">
                  <input
                    name="propertyZip"
                    style={inputStyle}
                    placeholder="Zip code"
                  />
                </Field>

                <Field label="Signing Date">
                  <input
                    name="signingDate"
                    type="date"
                    style={inputStyle}
                    min={minDate}
                    max={maxDate}
                  />
                </Field>

                <Field label="Signing Time">
                  <select name="signingTime" style={inputStyle} defaultValue="">
                    <option value="" disabled>
                      Select signing time
                    </option>
                    <option value="6:00 AM">6:00 AM</option>
                    <option value="6:30 AM">6:30 AM</option>
                    <option value="7:00 AM">7:00 AM</option>
                    <option value="7:30 AM">7:30 AM</option>
                    <option value="8:00 AM">8:00 AM</option>
                    <option value="8:30 AM">8:30 AM</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="9:30 AM">9:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="12:30 PM">12:30 PM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="1:30 PM">1:30 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="2:30 PM">2:30 PM</option>
                    <option value="3:00 PM">3:00 PM</option>
                    <option value="3:30 PM">3:30 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                    <option value="4:30 PM">4:30 PM</option>
                    <option value="5:00 PM">5:00 PM</option>
                    <option value="5:30 PM">5:30 PM</option>
                    <option value="6:00 PM">6:00 PM</option>
                    <option value="6:30 PM">6:30 PM</option>
                    <option value="7:00 PM">7:00 PM</option>
                    <option value="7:30 PM">7:30 PM</option>
                    <option value="8:00 PM">8:00 PM</option>
                    <option value="8:30 PM">8:30 PM</option>
                    <option value="9:00 PM">9:00 PM</option>
                  </select>
                </Field>

                <Field label="Time Zone">
                  <select name="signingTimeZone" style={inputStyle} defaultValue="">
                    <option value="" disabled>
                      Select time zone
                    </option>
                    <option value="EST">EST</option>
                    <option value="CST">CST</option>
                    <option value="MST">MST</option>
                    <option value="PST">PST</option>
                  </select>
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
                Payment / Fee Details
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 16,
                }}
              >
                <Field label="Fee Amount">
                  <input
                    name="feeAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    style={inputStyle}
                    placeholder="0.00"
                  />
                </Field>

                <Field label="Payment Due Status">
                  <select name="paymentDueStatus" style={inputStyle} defaultValue="">
                    <option value="" disabled>
                      Select payment status
                    </option>
                    <option value="Due on receipt">Due on receipt</option>
                    <option value="Due at signing">Due at signing</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Paid">Paid</option>
                  </select>
                </Field>

                <Field label="Payment Due Date">
                  <input
                    name="paymentDueDate"
                    type="date"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Payment Method">
                  <select name="paymentMethod" style={inputStyle} defaultValue="">
                    <option value="" disabled>
                      Select payment method
                    </option>
                    <option value="ACH">ACH</option>
                    <option value="Check">Check</option>
                    <option value="Wire">Wire</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>

                <Field label="Payment Paid">
                  <select name="paymentPaid" style={inputStyle} defaultValue="false">
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </Field>

                <Field label="Payment Paid Date">
                  <input
                    name="paymentPaidDate"
                    type="date"
                    style={inputStyle}
                  />
                </Field>

                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Payment Notes">
                    <textarea
                      name="paymentNotes"
                      style={{
                        ...inputStyle,
                        minHeight: 110,
                        resize: "vertical",
                      }}
                      placeholder="Add fee notes, due terms, special billing instructions, or payment follow-up details"
                    />
                  </Field>
                </div>
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
                    <option>Both</option>
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