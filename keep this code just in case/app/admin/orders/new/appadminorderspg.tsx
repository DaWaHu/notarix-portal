import Image from "next/image";

const orders = [
  {
    id: "260320-8679",
    borrower: "Test Order",
    property: "241 Westside",
    status: "Pending",
    detail: "Signing Date: 3/30/2026 - 1:30 PM EST",
  },
  {
    id: "260320-8678",
    borrower: "Another",
    property: "test street",
    status: "Pending",
    detail: "Created: 3/20/2026, 6:00:47 PM",
  },
  {
    id: "260320-3807",
    borrower: "Test Walker",
    property: "dklfjdklj",
    status: "Pending",
    detail: "Signing Date: 3/24/2026 - 1:45 PM PST",
  },
  {
    id: "260320-2087",
    borrower: "Will, B",
    property: "456 West Street",
    status: "Pending",
    detail: "Signing Date: 3/28/2026 - 7:30 AM PST",
  },
  {
    id: "260320-8677",
    borrower: "Doe, J",
    property: "djlif",
    status: "Pending",
    detail: "Signing Date: 3/26/2026 - 1:30 PM EST",
  },
];

export default function AdminOrdersPage() {
  return (
    <main
      style={{
        padding: 28,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
        background: "#F1F5F9",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            background: "#1e40af",
            color: "white",
            padding: "16px 22px",
            borderRadius: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 10px 30px rgba(30, 64, 175, 0.25)",
            marginBottom: 18,
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Image
              src="/notarix-logo.png"
              alt="Notarix"
              width={44}
              height={44}
              style={{
                width: 44,
                height: 44,
                objectFit: "contain",
                background: "white",
                borderRadius: 10,
                padding: 4,
              }}
            />
            <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>
              Notarix Staff Portal
            </div>
          </div>

          <div style={{ fontWeight: 800 }}>Powered by Notarix</div>
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
            <h1
              style={{
                fontSize: 34,
                margin: 0,
                fontWeight: 950,
                color: "#0F172A",
              }}
            >
              Notary Orders
            </h1>
            <div
              style={{
                marginTop: 8,
                color: "#475569",
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              Internal staff dashboard for managing order activity.
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href="/admin/vendors/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
                color: "#0F172A",
                textDecoration: "none",
                borderRadius: 10,
                padding: "12px 16px",
                fontWeight: 900,
                border: "1px solid #CBD5E1",
              }}
            >
              + Create Vendor
            </a>

            <a
              href="/admin/orders/new"
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
              + Create New Order
            </a>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {orders.map((order) => (
            <a
              key={order.id}
              href="/admin/orders"
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
                  <span
                    style={{
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
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: "#B45309",
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

        <div
          style={{
            marginTop: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            color: "#64748B",
          }}
        >
          <Image
            src="/notarix-logo.png"
            alt="Notarix"
            width={72}
            height={72}
            style={{ width: 72, height: 72, objectFit: "contain" }}
          />
          <div style={{ fontWeight: 800 }}>© 2026 Notarix.live</div>
        </div>
      </div>
    </main>
  );
}