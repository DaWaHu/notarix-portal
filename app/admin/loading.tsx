export default function AdminLoading() {
  return (
    <main
      style={{
        padding: 28,
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            style={{
              width: 220,
              height: 18,
              borderRadius: 999,
              background: "#E2E8F0",
              marginBottom: 14,
            }}
          />
          <div
            style={{
              width: "100%",
              height: 52,
              borderRadius: 12,
              background: "#F1F5F9",
              marginBottom: 12,
            }}
          />
          <div
            style={{
              width: "100%",
              height: 52,
              borderRadius: 12,
              background: "#F1F5F9",
              marginBottom: 12,
            }}
          />
          <div
            style={{
              width: "100%",
              height: 52,
              borderRadius: 12,
              background: "#F1F5F9",
            }}
          />
        </div>
      </div>
    </main>
  );
}