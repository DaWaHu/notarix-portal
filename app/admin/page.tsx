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
            borderRadius: 18,
            padding: "38px 34px 34px",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
            marginBottom: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 18,
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: 760 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1px solid #DBEAFE",
                  background: "#EFF6FF",
                  color: "#1D4ED8",
                  borderRadius: 999,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 900,
                  marginBottom: 16,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Internal operations workspace
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 48,
                  lineHeight: 1.02,
                  fontWeight: 950,
                  letterSpacing: -1,
                  color: "#0F172A",
                }}
              >
                Admin Portal
              </h1>

              <div
                style={{
                  marginTop: 14,
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: 16,
                  lineHeight: 1.65,
                  maxWidth: 820,
                }}
              >
                Internal Notarix workspace for staff-side order review, client
                onboarding, notary management, order creation, and operational
                coordination across active portal workflows.
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: 10,
                minWidth: 220,
              }}
            >
              <div
                style={{
                  border: "1px solid #E2E8F0",
                  background: "#F8FAFC",
                  borderRadius: 14,
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: 6,
                  }}
                >
                  Workspace role
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: "#0F172A",
                  }}
                >
                  Notarix Staff
                </div>
              </div>

              <div
                style={{
                  border: "1px solid #E2E8F0",
                  background: "#F8FAFC",
                  borderRadius: 14,
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: 6,
                  }}
                >
                  Focus
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#0F172A",
                    lineHeight: 1.45,
                  }}
                >
                  Orders, client records, notaries, and workflow control
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 18,
          }}
        >
          <a
            href="/admin/orders"
            style={cardStyle}
          >
            <div style={cardTitleStyle}>Orders</div>
            <div style={cardBodyStyle}>
              Review staff-facing order activity and navigate active orders.
            </div>
          </a>

          <a
            href="/admin/orders/new"
            style={cardStyle}
          >
            <div style={cardTitleStyle}>Create Order</div>
            <div style={cardBodyStyle}>
              Start a new staff-side order without exposing client codes in the
              route.
            </div>
          </a>

          <a
            href="/admin/vendors/new"
            style={cardStyle}
          >
            <div style={cardTitleStyle}>Create Client</div>
            <div style={cardBodyStyle}>
              Add title companies, law firms, lenders, escrow companies, and
              other approved client organizations.
            </div>
          </a>

          <a
            href="/admin/notaries"
            style={cardStyle}
          >
            <div style={cardTitleStyle}>Notaries</div>
            <div style={cardBodyStyle}>
              Review notary records, open notary profiles, and manage onboarding
              foundation.
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  textDecoration: "none",
  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  color: "#0F172A",
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 950,
  marginBottom: 8,
};

const cardBodyStyle: React.CSSProperties = {
  color: "#475569",
  fontWeight: 600,
  lineHeight: 1.6,
};