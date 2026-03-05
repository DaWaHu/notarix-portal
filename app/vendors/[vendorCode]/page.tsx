export default function VendorOrdersTemplatePage({
  params,
}: {
  params: { vendorCode: string };
}) {
  return (
    <main style={{ padding: 30, fontFamily: "Arial, sans-serif" }}>

      {/* HEADER */}
      <div
        style={{
          background: "#1e40af",
          color: "white",
          padding: "18px 24px",
          borderRadius: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 25,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 18 }}>
          CLIENT NAME / TITLE COMPANY
        </div>

        <div style={{ fontWeight: 600 }}>Powered by Notarix</div>
      </div>

      {/* PAGE TITLE */}
      <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 20 }}>
        Notary Orders
      </h1>

      {/* STATUS LEGEND */}
      <div style={{ marginBottom: 10 }}>
        ● Pending &nbsp;&nbsp; ● Active &nbsp;&nbsp; ● Completed &nbsp;&nbsp; ● Closed
      </div>

      {/* ORDER CARD */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 16,
          marginBottom: 12,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <strong>Order #48219</strong> | John Smith | Property: 114 Lake Dr
          <div style={{ fontSize: 12, color: "#555" }}>
            Created: 03/02/2026 10:14 AM EST
          </div>
        </div>

        <div style={{ color: "#f59e0b", fontWeight: 600 }}>
          Pending
        </div>
      </div>

      {/* ORDER CARD */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 16,
          marginBottom: 12,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <strong>Order #48218</strong> | Garcia | Property: 72 Pine Ave
          <div style={{ fontSize: 12, color: "#555" }}>
            Signing Date: March 5, 2026 – 2:30 PM EST
          </div>
        </div>

        <div style={{ color: "green", fontWeight: 600 }}>
          Active
        </div>
      </div>

      {/* ORDER CARD */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <strong>Order #48212</strong> | Daniel Brown | Property: 905 Oak Ct
          <div style={{ fontSize: 12, color: "#555" }}>
            Completed: 02/28/2026 5:18 PM EST
          </div>
        </div>

        <div style={{ color: "#16a34a", fontWeight: 600 }}>
          Completed
        </div>
      </div>

    </main>
  );
}