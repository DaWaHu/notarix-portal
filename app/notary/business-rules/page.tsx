export default function NotaryBusinessRulesPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 16,
        background: "#F8FAFC",
      }}
    >
      <div style={{ maxWidth: 1600, margin: "0 auto" }}>
        <div
          style={{
            background: "#F3F4F6",
            border: "1px solid #D1D5DB",
            borderRadius: 24,
            padding: 16,
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: 116,
                height: 116,
                borderRadius: 20,
                background: "#FFFFFF",
                border: "1px solid #D1D5DB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <img
                src="/notarix-logo.png"
                alt="Notarix logo"
                style={{
                  maxWidth: "78%",
                  maxHeight: "78%",
                  objectFit: "contain",
                }}
              />
            </div>

            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: "#111827",
                  marginBottom: 4,
                }}
              >
                Notarix™
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#4B5563",
                }}
              >
                Professional Signing Coordination Platform
              </div>
            </div>
          </div>
        </div>

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
            Business Rules
          </h1>

          <p
            style={{
              marginTop: 14,
              marginBottom: 0,
              color: "#4B5563",
              fontWeight: 600,
              fontSize: 16,
              maxWidth: 760,
              lineHeight: 1.6,
            }}
          >
            This page will display portal requirements, compliance expectations, profile completion rules, and workflow standards for the notary.
          </p>
        </div>
      </div>
    </main>
  );
}