export default function NotaryDashboardPage() {
  return (
    <div
      style={{
        background: "#F3F4F6",
        border: "1px solid #D1D5DB",
        borderRadius: 24,
        padding: 24,
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: "0.16em",
          color: "#6B7280",
          marginBottom: 8,
          textTransform: "uppercase",
        }}
      >
        Notarix™ Notary Portal
      </div>

      <h1
        style={{
          margin: 0,
          fontSize: 44,
          lineHeight: 1.05,
          fontWeight: 950,
          color: "#111827",
        }}
      >
        Notary Dashboard
      </h1>

      <p
        style={{
          marginTop: 14,
          marginBottom: 28,
          color: "#4B5563",
          fontWeight: 600,
          fontSize: 16,
          maxWidth: 760,
          lineHeight: 1.6,
        }}
      >
        View assigned orders and manage your notary profile, banking information, credentials, and support resources.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 16,
        }}
      >

        <a href="/notary/profile" style={cardStyle}>
          <div style={cardTitleStyle}>Profile</div>
          <div style={cardBodyStyle}>
            Review and update your profile details.
          </div>
        </a>

        <a href="/notary/orders" style={cardStyle}>
          <div style={cardTitleStyle}>Assigned Orders</div>
          <div style={cardBodyStyle}>
            View orders assigned to you.
          </div>
        </a>

        <a href="/notary/banking" style={cardStyle}>
          <div style={cardTitleStyle}>Banking Information</div>
          <div style={cardBodyStyle}>
            Manage payout and payment details.
          </div>
        </a>

        <a href="/notary/credentials" style={cardStyle}>
          <div style={cardTitleStyle}>Credentials</div>
          <div style={cardBodyStyle}>
            Review and maintain commission and document requirements.
          </div>
        </a>

        <a href="/notary/business-rules" style={cardStyle}>
          <div style={cardTitleStyle}>Business Rules</div>
          <div style={cardBodyStyle}>
            Review portal rules, requirements, and expectations.
          </div>
        </a>

        <a href="/notary/support" style={cardStyle}>
          <div style={cardTitleStyle}>Support / Need Help</div>
          <div style={cardBodyStyle}>
            Contact support and get help with portal issues.
          </div>
        </a>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  display: "block",
  textDecoration: "none",
  background: "#FFFFFF",
  border: "1px solid #D1D5DB",
  borderRadius: 18,
  padding: 20,
  color: "#111827",
  boxShadow: "0 1px 4px rgba(15, 23, 42, 0.04)",
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  marginBottom: 8,
};

const cardBodyStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.5,
  color: "#4B5563",
  fontWeight: 600,
};