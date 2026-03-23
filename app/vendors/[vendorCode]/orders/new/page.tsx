import VendorOrderForm from "./VendorOrderForm";

type PageProps = {
  params: Promise<{ vendorCode: string }>;
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
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 18,
            padding: 28,
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
            marginBottom: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "end",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                }}
              >
                Vendor Submission
              </div>

              <h1
                style={{
                  margin: "10px 0 0 0",
                  fontSize: 38,
                  lineHeight: 1.1,
                  fontWeight: 950,
                  color: "#0F172A",
                }}
              >
                New Vendor Order
              </h1>

              <div
                style={{
                  marginTop: 10,
                  color: "#475569",
                  fontWeight: 600,
                }}
              >
                Submit a new signing request for vendor code <strong>{vendorCode}</strong>.
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
                padding: "14px 18px",
                fontWeight: 800,
                color: "#0F172A",
                background: "#fff",
              }}
            >
              Back to Orders
            </a>
          </div>
        </div>

        <VendorOrderForm vendorCode={vendorCode} />
      </div>
    </main>
  );
}
