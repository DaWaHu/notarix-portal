import Image from "next/image";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #EEF4FF 0%, #F8FAFC 48%, #FFFFFF 100%)",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
        color: "#0F172A",
      }}
    >
      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "18px 18px 12px",
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #DBEAFE",
            borderRadius: 16,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            boxShadow: "0 8px 22px rgba(30, 64, 175, 0.08)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Image
              src="/notarix-logo.png"
              alt="Notarix"
              width={42}
              height={42}
              style={{
                width: 42,
                height: 42,
                objectFit: "contain",
                background: "white",
                borderRadius: 10,
                padding: 3,
              }}
            />
            <div>
              <div
                style={{
                  fontWeight: 950,
                  fontSize: 20,
                  letterSpacing: 0.2,
                  color: "#1E3A8A",
                  lineHeight: 1.1,
                }}
              >
                Notarix
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#64748B",
                  fontWeight: 700,
                  lineHeight: 1.3,
                }}
              >
                Professional Signing Coordination Platform
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/contact" style={navButtonSecondary}>
              Request Access
            </a>
            <a href="/admin" style={navButtonPrimary}>
              Staff Portal
            </a>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "10px 18px 14px",
        }}
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 24,
            minHeight: 380,
            backgroundImage:
              "linear-gradient(135deg, rgba(29, 78, 216, 0.78) 0%, rgba(30, 58, 138, 0.84) 100%), url('/city-hero.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            color: "white",
            boxShadow: "0 20px 44px rgba(30, 64, 175, 0.18)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at top right, rgba(255,255,255,0.16), transparent 34%), radial-gradient(circle at bottom left, rgba(255,255,255,0.10), transparent 28%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              padding: "34px 30px",
              display: "grid",
              gridTemplateColumns: "1.15fr 0.85fr",
              gap: 28,
              alignItems: "center",
              minHeight: 380,
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: 999,
                  padding: "7px 12px",
                  fontSize: 12,
                  fontWeight: 800,
                  marginBottom: 16,
                  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.15)",
                }}
              >
                Public access and client onboarding
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 44,
                  lineHeight: 1.02,
                  fontWeight: 950,
                  letterSpacing: -1.1,
                  maxWidth: 680,
                  textShadow: "0 8px 24px rgba(15, 23, 42, 0.22)",
                }}
              >
                Request access to the Notarix portal.
              </h1>

              <p
                style={{
                  marginTop: 16,
                  marginBottom: 0,
                  fontSize: 16,
                  lineHeight: 1.62,
                  color: "rgba(255,255,255,0.95)",
                  maxWidth: 720,
                  fontWeight: 500,
                  textShadow: "0 4px 14px rgba(15, 23, 42, 0.18)",
                }}
              >
                Title companies, law firms, lenders, escrow partners, and
                approved notary professionals can submit a request for portal
                access. Once reviewed and approved, your account profile and
                workflow access can be activated inside Notarix.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginTop: 24,
                }}
              >
                <a href="/contact" style={heroPrimaryButton}>
                  Request Access
                </a>
                <a href="/admin" style={heroSecondaryButton}>
                  Staff Sign In
                </a>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: 12,
              }}
            >
              <ProcessCard
                step="01"
                title="Request Access"
                text="Submit your company or notary request for review and onboarding."
              />
              <ProcessCard
                step="02"
                title="Approval Review"
                text="Notarix reviews client details, contacts, agreements, and required onboarding documents."
              />
              <ProcessCard
                step="03"
                title="Portal Activation"
                text="Approved users receive access to their profile, order history, and ongoing portal workflows."
              />
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "8px 18px 14px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          <div style={featureCard}>
            <div style={featureIcon}>✉</div>
            <div style={featureTitle}>Request Access</div>
            <div style={featureText}>
              Submit your company or notary request for review and onboarding.
            </div>
          </div>

          <div style={featureCard}>
            <div style={featureIcon}>🗂</div>
            <div style={featureTitle}>Approval Review</div>
            <div style={featureText}>
              Notarix reviews client details, contacts, agreements, and required
              onboarding documents before granting access.
            </div>
          </div>

          <div style={featureCard}>
            <div style={featureIcon}>🛡</div>
            <div style={featureTitle}>Portal Activation</div>
            <div style={featureText}>
              Approved users receive access to their profile, order history, and
              ongoing portal workflows.
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "8px 18px 20px",
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 20,
            padding: "24px 22px",
            boxShadow: "0 8px 22px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 950,
              color: "#0F172A",
              marginBottom: 8,
              lineHeight: 1.1,
            }}
          >
            What happens after approval
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 14,
              marginTop: 16,
            }}
          >
            <InfoRow
              title="Client Profile"
              text="Your portal profile can include company logo, address, primary contacts, and billing contacts."
            />
            <InfoRow
              title="Order Creation"
              text="Approved clients can submit and track new orders directly inside their portal workspace."
            />
            <InfoRow
              title="Order Visibility"
              text="Orders appear in both the client view and the internal Notarix operations view."
            />
            <InfoRow
              title="Controlled Access"
              text="Notaries see only the order details they need, while internal staff retain broader client and billing visibility."
            />
          </div>
        </div>
      </section>

      <footer
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "0 18px 24px",
        }}
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 22,
            minHeight: 190,
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.78) 100%), url('/city-footer.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            border: "1px solid #E2E8F0",
            boxShadow: "0 8px 22px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.36) 0%, rgba(255,255,255,0.68) 55%, rgba(255,255,255,0.84) 100%)",
            }}
          />

          <div
            style={{
              position: "relative",
              minHeight: 190,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              color: "#64748B",
              textAlign: "center",
              padding: "24px 16px",
            }}
          >
            <Image
              src="/notarix-logo.png"
              alt="Notarix"
              width={58}
              height={58}
              style={{ width: 58, height: 58, objectFit: "contain" }}
            />
            <div style={{ fontWeight: 800, fontSize: 14 }}>© 2026 Notarix.live</div>
          </div>
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
        borderRadius: 14,
        padding: "14px 16px",
        background: "#F8FAFC",
      }}
    >
      <div
        style={{
          fontSize: 16,
          fontWeight: 900,
          color: "#0F172A",
          marginBottom: 5,
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.55,
          color: "#475569",
          fontWeight: 600,
        }}
      >
        {text}
      </div>
    </div>
  );
}

function ProcessCard({
  step,
  title,
  text,
}: {
  step: string;
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.16)",
        borderRadius: 18,
        padding: "16px 16px",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: 1,
          opacity: 0.8,
          marginBottom: 6,
        }}
      >
        STEP {step}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 900,
          lineHeight: 1.2,
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.55,
          color: "rgba(255,255,255,0.9)",
          fontWeight: 500,
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
  padding: "10px 14px",
  fontWeight: 900,
  fontSize: 14,
};

const navButtonSecondary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  background: "white",
  color: "#0F172A",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 900,
  fontSize: 14,
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
  padding: "12px 16px",
  fontWeight: 900,
  fontSize: 14,
};

const heroSecondaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  background: "transparent",
  color: "white",
  borderRadius: 12,
  padding: "12px 16px",
  fontWeight: 900,
  fontSize: 14,
  border: "1px solid rgba(255,255,255,0.28)",
};

const featureCard: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 18,
  padding: "18px 18px",
  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
};

const featureIcon: React.CSSProperties = {
  fontSize: 20,
  marginBottom: 8,
};

const featureTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 950,
  color: "#0F172A",
  marginBottom: 8,
  lineHeight: 1.2,
};

const featureText: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.55,
  fontWeight: 600,
  color: "#475569",
};