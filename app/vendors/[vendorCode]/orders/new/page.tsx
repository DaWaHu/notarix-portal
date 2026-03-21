type PageProps = {
  params: Promise<{ vendorCode: string }>;
};

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

export default async function VendorNewOrderPage({ params }: PageProps) {
  const { vendorCode } = await params;

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
            marginBottom: 20,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 40,
              lineHeight: 1.1,
              fontWeight: 950,
              color: "#0F172A",
            }}
          >
            Create Vendor Order
          </h1>

          <div
            style={{
              marginTop: 10,
              color: "#475569",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Vendor-facing order intake page for approved client organizations.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#475569",
              }}
            >
              Vendor Code
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 24,
                fontWeight: 950,
                color: "#1D4ED8",
              }}
            >
              {vendorCode}
            </div>
          </div>

          <a
            href={`/vendors/${vendorCode}/orders`}
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

        <div
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          }}
        >
          <form style={{ display: "grid", gap: 28 }}>
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
                    style={inputStyle}
                    placeholder="Last Name, First Name"
                  />
                </Field>

                <Field label="Secondary Borrower / Signer">
                  <input
                    style={inputStyle}
                    placeholder="Last Name, First Name"
                  />
                </Field>

                <Field label="Borrower Phone">
                  <input style={inputStyle} placeholder="(000) 000-0000" />
                </Field>

                <Field label="Borrower Email">
                  <input
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
                  <input style={inputStyle} placeholder="Street address" />
                </Field>

                <Field label="Property Address 2">
                  <input style={inputStyle} placeholder="Suite, unit, etc." />
                </Field>

                <Field label="City">
                  <input style={inputStyle} placeholder="City" />
                </Field>

                <Field label="State">
                  <input style={inputStyle} placeholder="State" />
                </Field>

                <Field label="Zip">
                  <input style={inputStyle} placeholder="Zip code" />
                </Field>

                <Field label="Signing Date">
                  <input type="date" style={inputStyle} />
                </Field>

                <Field label="Signing Time">
                  <input style={inputStyle} placeholder="2:30 PM EST" />
                </Field>

                <Field label="Estimated Pages">
                  <input style={inputStyle} placeholder="Estimated pages" />
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
                  <select style={inputStyle} defaultValue="">
                    <option value="" disabled>
                      Select paper size
                    </option>
                    <option>Letter</option>
                    <option>Legal</option>
                  </select>
                </Field>

                <Field label="Preferred Ink">
                  <select style={inputStyle} defaultValue="">
                    <option value="" disabled>
                      Select preferred ink
                    </option>
                    <option>Black</option>
                    <option>Blue</option>
                  </select>
                </Field>

                <Field label="Service Type">
                  <input
                    style={inputStyle}
                    placeholder="Purchase, Refinance, Seller Package, etc."
                  />
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
                    <input id="vendor-ron" type="checkbox" />
                    <label htmlFor="vendor-ron" style={{ fontWeight: 700 }}>
                      Remote Online Notarization
                    </label>
                  </div>
                </Field>
              </div>

              <div style={{ marginTop: 16 }}>
                <Field label="Special Instructions">
                  <textarea
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
                Submit Order
              </button>

              <a
                href={`/vendors/${vendorCode}/orders`}
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