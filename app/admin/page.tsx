export default function AdminHomePage() {
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
            Admin Portal
          </h1>

          <div
            style={{
              marginTop: 10,
              color: "#475569",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Internal Notarix workspace for staff orders, vendor onboarding, and
            order creation.
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 18,
          }}
        >
          <a
            href="/admin/orders"
            style={{
              textDecoration: "none",
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
              color: "#0F172A",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 950, marginBottom: 8 }}>
              Orders
            </div>
            <div style={{ color: "#475569", fontWeight: 600, lineHeight: 1.6 }}>
              Review staff-facing order activity and navigate active orders.
            </div>
          </a>

          <a
            href="/admin/orders/new"
            style={{
              textDecoration: "none",
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
              color: "#0F172A",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 950, marginBottom: 8 }}>
              Create Order
            </div>
            <div style={{ color: "#475569", fontWeight: 600, lineHeight: 1.6 }}>
              Start a new staff-side order without exposing vendor codes in the
              route.
            </div>
          </a>

          <a
            href="/admin/vendors/new"
            style={{
              textDecoration: "none",
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
              color: "#0F172A",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 950, marginBottom: 8 }}>
              Create Vendor
            </div>
            <div style={{ color: "#475569", fontWeight: 600, lineHeight: 1.6 }}>
              Add title companies, law firms, lenders, escrow companies, and
              other approved client organizations.
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}