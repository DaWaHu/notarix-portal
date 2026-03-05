export default function HomePage() {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
        color: "#0F172A",
      }}
    >
      {/* Top Bar */}
      <header
        style={{
          background: "#1E40AF",
          color: "white",
          padding: "18px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Simple logo block (replace later with your real logo) */}
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "rgba(255,255,255,0.15)",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              letterSpacing: 0.5,
            }}
            aria-label="Notarix logo"
          >
            N
          </div>

          {/* THE MARK */}
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 0.3 }}>
              NOTARIX™
            </div>
            <div style={{ fontSize: 12, opacity: 0.92, fontWeight: 700 }}>
              Notary order management & signing coordination platform
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href="/vendors/test/orders"
            style={{
              background: "white",
              color: "#1E40AF",
              padding: "10px 12px",
              borderRadius: 10,
              fontWeight: 900,
              textDecoration: "none",
            }}
          >
            View Portal
          </a>
          <a
            href="#request-demo"
            style={{
              background: "#0F172A",
              color: "white",
              padding: "10px 12px",
              borderRadius: 10,
              fontWeight: 900,
              textDecoration: "none",
            }}
          >
            Request Demo
          </a>
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 980, margin: "0 auto", padding: "34px 24px" }}>
        <h1 style={{ fontSize: 40, margin: "10px 0 10px", fontWeight: 950 }}>
          NOTARIX™ helps title companies manage notary signings end-to-end.
        </h1>

        <p style={{ fontSize: 16, lineHeight: 1.6, color: "#334155", maxWidth: 800 }}>
          NOTARIX™ is a web-based software platform (SaaS) used to create and manage notary
          signing orders, assign notaries, provide signing instructions, share and track closing
          documents, communicate securely between parties, monitor order status, and manage notary
          fee and payment details.
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
          <a
            href="/vendors/test/orders"
            style={{
              background: "#1E40AF",
              color: "white",
              padding: "12px 14px",
              borderRadius: 12,
              fontWeight: 950,
              textDecoration: "none",
            }}
          >
            Create / Manage Notary Orders
          </a>
          <a
            href="#features"
            style={{
              background: "white",
              border: "1px solid #CBD5E1",
              color: "#0F172A",
              padding: "12px 14px",
              borderRadius: 12,
              fontWeight: 950,
              textDecoration: "none",
            }}
          >
            See Features
          </a>
        </div>

        {/* “In Use” proof section (helps show services are being offered) */}
        <div
          style={{
            marginTop: 18,
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: 14,
            padding: 16,
            boxShadow: "0 10px 26px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div style={{ fontWeight: 950, marginBottom: 6 }}>
            Use NOTARIX™ to:
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#334155", lineHeight: 1.7 }}>
            <li>Create notary orders and set appointment date/time</li>
            <li>Assign a notary and track status (Pending → Active → Completed → Closed)</li>
            <li>Upload and share instructions and closing packages</li>
            <li>Send secure messages between title company and notary</li>
            <li>Track notary fee, payment method, and payment timing</li>
          </ul>
        </div>

        {/* Features */}
        <div
          id="features"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 14,
            marginTop: 22,
          }}
        >
          {[
            {
              title: "Notary Orders",
              text: "Create orders, assign notaries, set signing details, and track status.",
            },
            {
              title: "Documents",
              text: "Upload and share closing packages, instructions, and signed returns.",
            },
            {
              title: "Communication & Payments",
              text: "Centralize messages and track notary fee, payment method, and status.",
            },
          ].map((f) => (
            <div
              key={f.title}
              style={{
                background: "white",
                border: "1px solid #E5E7EB",
                borderRadius: 14,
                padding: 16,
                boxShadow: "0 10px 26px rgba(15, 23, 42, 0.06)",
              }}
            >
              <div style={{ fontWeight: 950, marginBottom: 6 }}>{f.title}</div>
              <div style={{ color: "#334155", lineHeight: 1.5 }}>{f.text}</div>
            </div>
          ))}
        </div>

        {/* Demo / Contact */}
        <div
          id="request-demo"
          style={{
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: 14,
            padding: 18,
            marginTop: 22,
          }}
        >
          <div style={{ fontWeight: 950, fontSize: 18 }}>
            Request a NOTARIX™ demo
          </div>
          <p style={{ marginTop: 8, color: "#334155", lineHeight: 1.6 }}>
            Interested in using NOTARIX™ for notary order management and signing coordination?
            Contact us to request a demo.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <a
              href="/notary"
              style={{
                background: "#0F172A",
                color: "white",
                padding: "10px 12px",
                borderRadius: 12,
                fontWeight: 950,
                textDecoration: "none",
              }}
            >
              Contact / Support
            </a>
            <a
              href="/vendors/profile"
              style={{
                background: "#1E40AF",
                color: "white",
                padding: "10px 12px",
                borderRadius: 12,
                fontWeight: 950,
                textDecoration: "none",
              }}
            >
              Create Vendor Profile
            </a>
          </div>
        </div>
      </section>

      {/* Footer (specimen-friendly) */}
      <footer
        style={{
          borderTop: "1px solid #E5E7EB",
          padding: "18px 24px",
          color: "#475569",
          fontWeight: 700,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>© NOTARIX™</div>
        <div>
          Path: <span style={{ fontWeight: 900 }}>/</span> • Accessed:{" "}
          <span style={{ fontWeight: 900 }}>{today}</span>
        </div>
      </footer>
    </main>
  );
}