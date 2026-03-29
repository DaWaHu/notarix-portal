export default function MaintenancePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#EAF0FB",
        padding: 24,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          background: "#FFFFFF",
          border: "1px solid #D8E1F0",
          borderRadius: 24,
          padding: 40,
          boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#1D4ED8",
          }}
        >
          Notarix
        </div>

        <h1
          style={{
            margin: "12px 0 0",
            fontSize: 42,
            lineHeight: 1,
            fontWeight: 950,
            color: "#0F172A",
          }}
        >
          Portal temporarily unavailable
        </h1>

        <p
          style={{
            margin: "18px auto 0",
            maxWidth: 560,
            fontSize: 16,
            lineHeight: 1.7,
            color: "#475569",
            fontWeight: 600,
          }}
        >
          The portal is currently in maintenance mode. Please check back later.
        </p>
      </div>
    </main>
  );
}