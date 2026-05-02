export default function ClientSupportPage() {
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
        Notarix™ Client Portal
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
        Support / Need Help
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
        Contact support and get help with portal questions, order issues, and account assistance.
      </p>
    </div>
  );
}