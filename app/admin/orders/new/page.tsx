import AdminNewOrderForm from "./AdminNewOrderForm";

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

          <AdminNewOrderForm />
        </div>
      </div>
    </main>
  );
}
