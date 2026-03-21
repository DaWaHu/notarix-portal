export default function VendorsLandingPage() {
  return (
    <main
      style={{
        padding: 28,
        minHeight: "100vh",
        background: "#F1F5F9",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
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
            Vendor Portal
          </h1>

          <div
            style={{
              marginTop: 10,
              color: "#475569",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Client-facing vendor area for approved title companies, law firms,
            lenders, escrow companies, and other approved organizations.
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: "#0F172A",
              marginBottom: 12,
            }}
          >
            Portal Access Notes
          </div>

          <div
            style={{
              display: "grid",
              gap: 12,
              color: "#475569",
              fontWeight: 600,
              lineHeight: 1.7,
            }}
          >
            <div>
              Vendor pages are intended for approved client organizations only.
            </div>
            <div>
              Vendor code should appear only for approved non-notary client
              accounts with a created profile page.
            </div>
            <div>
              Notary-facing and staff-facing pages should not expose vendor code
              as display text.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}