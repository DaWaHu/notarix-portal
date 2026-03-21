export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F1F5F9",
        padding: 28,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
      }}
    >
      <div
        style={{
          maxWidth: 720,
          width: "100%",
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 18,
          padding: 32,
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#1D4ED8",
            marginBottom: 10,
          }}
        >
          Notarix
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
          Page not found
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
          The page you tried to open does not exist or the route has changed.
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
            href="/"
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
            Go Home
          </a>

          <a
            href="/admin"
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
            Open Admin Portal
          </a>
        </div>
      </div>
    </main>
  );
}