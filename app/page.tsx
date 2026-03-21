import Image from "next/image";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #EFF6FF 0%, #F8FAFC 45%, #FFFFFF 100%)",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
        color: "#0F172A",
      }}
    >
      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "28px 24px 20px",
        }}
      >
        <div
          style={{
            background: "white",
            border: "1px solid #DBEAFE",
            borderRadius: 18,
            padding: "18px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            boxShadow: "0 12px 30px rgba(30, 64, 175, 0.08)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Image
              src="/notarix-logo.png"
              alt="Notarix"
              width={50}
              height={50}
              style={{
                width: 50,
                height: 50,
                objectFit: "contain",
                background: "white",
                borderRadius: 12,
                padding: 4,
              }}
            />
            <div>
              <div
                style={{
                  fontWeight: 950,
                  fontSize: 22,
                  letterSpacing: 0.2,
                  color: "#1E3A8A",
                }}
              >
                Notarix
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#64748B",
                  fontWeight: 700,
                }}
              >
                Modern Notary Workflow Platform
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/admin" style={navButtonSecondary}>
              Staff Portal
            </a>
            <a href="/admin/orders/new" style={navButtonPrimary}>
              Create Order
            </a>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "24px 24px 18px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 24,
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)",
              color: "white",
              borderRadius: 24,
              padding: "44px 36px",
              boxShadow: "0 22px 50px rgba(30, 64, 175, 0.22)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 999,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 800,
                marginBottom: 18,
              }}
            >
              Built for notary order management
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 54,
                lineHeight: 1.02,
                fontWeight: 950,
                letterSpacing: -1.4,
                maxWidth: 760,
              }}
            >
              Streamline vendor intake, order creation, and notary operations.
            </h1>

            <p
              style={{
                marginTop: 18,
                marginBottom: 0,
                fontSize: 18,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.92)",
                maxWidth: 760,
                fontWeight: 500,
              }}
            >
              Notarix gives your staff a structured portal to manage title
              companies, law firms, lenders, escrow partners, and incoming order
              requests without exposing vendor codes where they do not belong.
            </p>

            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginTop: 28,
              }}
            >
              <a href="/admin" style={heroPrimaryButton}>
                Open Staff Portal
              </a>
              <a href="/admin/vendors/new" style={heroSecondaryButton}>
                Create Vendor
              </a>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 18,
            }}
          >
            <div style={metricCard}>
              <div style={metricValue}>Admin</div>
              <div style={metricLabel}>
                Staff-facing routes separated from vendor routes
              </div>
            </div>

            <div style={metricCard}>
              <div style={metricValue}>Vendor</div>
              <div style={metricLabel}>
                Title companies, law firms, lenders, escrow, and approved client
                accounts
              </div>
            </div>

            <div style={metricCard}>
              <div style={metricValue}>Secure</div>
              <div style={metricLabel}>
                Vendor code hidden from notary-facing and owner-staff display
                contexts
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "18px 24px 18px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 18,
          }}
        >
          <div style={featureCard}>
            <div style={featureTitle}>Staff Order Intake</div>
            <div style={featureText}>
              Create new orders from a clean internal interface designed for
              operational staff.
            </div>
            <a href="/admin/orders/new" style={featureLink}>
              Go to Create Order →
            </a>
          </div>

          <div style={featureCard}>
            <div style={featureTitle}>Vendor Setup</div>
            <div style={featureText}>
              Register title companies, law firms, and other approved client
              organizations.
            </div>
            <a href="/admin/vendors/new" style={featureLink}>
              Go to Create Vendor →
            </a>
          </div>

          <div style={featureCard}>
            <div style={featureTitle}>Order Dashboard</div>
            <div style={featureText}>
              Give staff one place to review active orders, upcoming signings,
              and workflow status.
            </div>
            <a href="/admin/orders" style={featureLink}>
              Go to Staff Orders →
            </a>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "18px 24px 34px",
        }}
      >
        <div
          style={{
            background: "white",
            border: "1px solid #E2E8F0",
            borderRadius: 22,
            padding: "30px 26px",
            boxShadow: "0 10px 26px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 950,
              color: "#0F172A",
              marginBottom: 10,
            }}
          >
            What this portal now supports
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 16,
              marginTop: 20,
            }}
          >
            <InfoRow
              title="Homepage"
              text="A professional front door with direct navigation to staff workflows."
            />
            <InfoRow
              title="Staff Orders"
              text="An internal dashboard for reviewing and launching order activity."
            />
            <InfoRow
              title="Create Order"
              text="A staff-facing intake form that does not require a vendor code in the URL."
            />
            <InfoRow
              title="Create Vendor"
              text="A form for building approved client organizations and vendor records."
            />
          </div>
        </div>
      </section>

      <footer
        style={{
          padding: "0 24px 34px",
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            color: "#64748B",
          }}
        >
          <Image
            src="/notarix-logo.png"
            alt="Notarix"
            width={74}
            height={74}
            style={{ width: 74, height: 74, objectFit: "contain" }}
          />
          <div style={{ fontWeight: 800 }}>© 2026 Notarix.live</div>
        </div>
      </footer>
    </main>
  );
}

function InfoRow({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #E2E8F0",
        borderRadius: 16,
        padding: "16px 18px",
        background: "#F8FAFC",
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 900,
          color: "#0F172A",
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 15,
          lineHeight: 1.6,
          color: "#475569",
          fontWeight: 600,
        }}
      >
        {text}
      </div>
    </div>
  );
}

const navButtonPrimary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  background: "#1D4ED8",
  color: "white",
  borderRadius: 10,
  padding: "12px 16px",
  fontWeight: 900,
};

const navButtonSecondary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  background: "white",
  color: "#0F172A",
  borderRadius: 10,
  padding: "12px 16px",
  fontWeight: 900,
  border: "1px solid #CBD5E1",
};

const heroPrimaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  background: "white",
  color: "#1E3A8A",
  borderRadius: 12,
  padding: "14px 18px",
  fontWeight: 900,
};

const heroSecondaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  background: "transparent",
  color: "white",
  borderRadius: 12,
  padding: "14px 18px",
  fontWeight: 900,
  border: "1px solid rgba(255,255,255,0.28)",
};

const metricCard: React.CSSProperties = {
  background: "white",
  border: "1px solid #DBEAFE",
  borderRadius: 20,
  padding: "24px 22px",
  boxShadow: "0 10px 25px rgba(30, 64, 175, 0.05)",
};

const metricValue: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 950,
  color: "#1E3A8A",
  marginBottom: 6,
};

const metricLabel: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.65,
  fontWeight: 600,
  color: "#475569",
};

const featureCard: React.CSSProperties = {
  background: "white",
  border: "1px solid #E2E8F0",
  borderRadius: 20,
  padding: "24px 22px",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
};

const featureTitle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 950,
  color: "#0F172A",
  marginBottom: 10,
};

const featureText: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.65,
  fontWeight: 600,
  color: "#475569",
  marginBottom: 18,
};

const featureLink: React.CSSProperties = {
  display: "inline-flex",
  textDecoration: "none",
  fontWeight: 900,
  color: "#1D4ED8",
};