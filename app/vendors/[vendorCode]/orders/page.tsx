type PageProps = {
  params: Promise<{ vendorCode: string }>;
};

const orders = [
  {
    id: "260320-8679",
    borrower: "Test Order",
    property: "241 Westside",
    status: "Pending",
    detail: "Signing Date: 3/30/2026 - 1:30 PM EST",
  },
  {
    id: "260320-3807",
    borrower: "Walker, T",
    property: "902 Cypress Lane",
    status: "Active",
    detail: "Signing Date: 3/24/2026 - 1:45 PM PST",
  },
  {
    id: "260320-2087",
    borrower: "Will, B",
    property: "456 West Street",
    status: "Completed",
    detail: "Signing Date: 3/28/2026 - 7:30 AM PST",
  },
];

export default async function VendorOrdersPage({ params }: PageProps) {
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
            Vendor Orders
          </h1>

          <div
            style={{
              marginTop: 10,
              color: "#475569",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Order activity for approved client organizations.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: 14,
            marginBottom: 18,
            flexWrap: "wrap",
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
            href={`/vendors/${vendorCode}/orders/new`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#1D4ED8",
              color: "white",
              textDecoration: "none",
              borderRadius: 10,
              padding: "12px 16px",
              fontWeight: 900,
            }}
          >
            + Create Vendor Order
          </a>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {orders.map((order) => (
            <a
              key={order.id}
              href={`/vendors/${vendorCode}/orders`}
              style={{
                textDecoration: "none",
                display: "block",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: 12,
                  padding: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 8px 22px rgba(15, 23, 42, 0.05)",
                  cursor: "pointer",
                  gap: 16,
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 900,
                      color: "#0F172A",
                      fontSize: 18,
                    }}
                  >
                    Order #{order.id} | {order.borrower} | Property:{" "}
                    {order.property}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      color: "#475569",
                    }}
                  >
                    {order.detail}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexShrink: 0,
                  }}
                >
                  <span style={getStatusStyle(order.status)}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: getStatusDot(order.status),
                        display: "inline-block",
                      }}
                    />
                    {order.status}
                  </span>

                  <span
                    style={{
                      fontSize: 20,
                      color: "#94A3B8",
                      fontWeight: 700,
                    }}
                  >
                    ›
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}

function getStatusStyle(status: string): React.CSSProperties {
  if (status === "Active") {
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 12px",
      borderRadius: 999,
      background: "#DCFCE7",
      color: "#166534",
      border: "1px solid #BBF7D0",
      fontWeight: 800,
      fontSize: 14,
      whiteSpace: "nowrap",
    };
  }

  if (status === "Completed") {
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 12px",
      borderRadius: 999,
      background: "#E0F2FE",
      color: "#075985",
      border: "1px solid #BAE6FD",
      fontWeight: 800,
      fontSize: 14,
      whiteSpace: "nowrap",
    };
  }

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    background: "#FEF3C7",
    color: "#B45309",
    border: "1px solid #FDE68A",
    fontWeight: 800,
    fontSize: 14,
    whiteSpace: "nowrap",
  };
}

function getStatusDot(status: string) {
  if (status === "Active") return "#166534";
  if (status === "Completed") return "#075985";
  return "#B45309";
}