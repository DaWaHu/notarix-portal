export default function VendorNotFound() {
  return (
    <main
      style={{
        padding: 28,
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#1D4ED8",
              marginBottom: 10,
            }}
          >
            Vendor Portal
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 40,
              lineHeight: 1.1,
              fontWeight: 950,
              color: "#0F172A",
            }}
          >
            Vendor page not found
          </h1>

          <div
            style={{
              marginTop: 14,
              color: "#475569",
              fontWeight: 600,
              fontSize: 16,
              lineHeight: 1.7,
            }}
          >
            The vendor route you tried to open does not exist or is no longer available.
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: 24,
            }}
          >
            <a
              href="/vendors"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                borderRadius: 10,
                padding: "12px 16px",
                fontWeight: 900,
                background: "#1D4ED8",
                color: "white",
              }}
            >
              Open Vendor Portal
            </a>

            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                borderRadius: 10,
                padding: "12px 16px",
                fontWeight: 900,
                background: "#fff",
                color: "#0F172A",
                border: "1px solid #CBD5E1",
              }}
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}