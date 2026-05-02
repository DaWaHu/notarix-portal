import AdminNewOrderForm from "./AdminNewOrderForm";

export default function AdminNewOrderPage() {
  return (
    <main
      style={{
        padding: 16,
        minHeight: "100vh",
      }}
    >[o]
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #D6DEE8",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 28,
                  lineHeight: 1.05,
                  fontWeight: 900,
                  color: "#0F172A",
                }}
              >
                Create New Order
              </h1>

              <div
                style={{
                  marginTop: 6,
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: 14,
                  lineHeight: 1.35,
                  maxWidth: 760,
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
                padding: "10px 14px",
                fontWeight: 800,
                fontSize: 14,
                color: "#0F172A",
                background: "#fff",
              }}
            >
              Back to Orders
            </a>
          </div>

          <AdminNewOrderForm />
        </div>
      </div>
    </main>
  );
}