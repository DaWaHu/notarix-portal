export default function GlobalLoading() {
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
          width: "100%",
          maxWidth: 720,
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 18,
          padding: 28,
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div
          style={{
            width: 180,
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
    </main>
  );
}