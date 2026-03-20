import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Status = "Pending" | "Active" | "Completed" | "Closed";

function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, { bg: string; fg: string; border: string }> = {
    Pending: { bg: "#FEF3C7", fg: "#B45309", border: "#FDE68A" },
    Active: { bg: "#DCFCE7", fg: "#166534", border: "#BBF7D0" },
    Completed: { bg: "#E0F2FE", fg: "#075985", border: "#BAE6FD" },
    Closed: { bg: "#F3F4F6", fg: "#374151", border: "#E5E7EB" },
  };

  const c = map[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        background: c.bg,
        color: c.fg,
        border: `1px solid ${c.border}`,
        fontWeight: 700,
        fontSize: 12,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: c.fg,
          display: "inline-block",
        }}
      />
      {status}
    </span>
  );
}

export default async function VendorOrdersPage({
  params,
}: {
  params: { vendorCode: string };
}) {
  const vendorCode = String(params.vendorCode || "").toUpperCase().trim();

  const vendor = await prisma.vendor.findUnique({
    where: { vendorcode: vendorCode },
    select: {
      companyName: true,
      vendorcode: true,
    },
  });

  const headerCompanyName = vendor?.companyName || "CLIENT NAME / TITLE COMPANY";
  const displayVendorCode = vendor?.vendorcode || vendorCode;

  const orders = [
    {
      id: "48219",
      name: "John Smith",
      prop: "114 Lake Dr",
      sub: "Created: 03/02/2026 10:14 AM EST",
      status: "Pending" as Status,
    },
    {
      id: "48218",
      name: "Garcia",
      prop: "72 Pine Ave",
      sub: "Signing Date: March 5, 2026 – 2:30 PM EST",
      status: "Active" as Status,
    },
    {
      id: "48212",
      name: "Daniel Brown",
      prop: "905 Oak Ct",
      sub: "Completed: 02/28/2026 5:18 PM EST",
      status: "Completed" as Status,
    },
  ];

  return (
    <main
      style={{
        padding: 28,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
        background: "#F1F5F9",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          background: "#1e40af",
          color: "white",
          padding: "16px 22px",
          borderRadius: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 10px 30px rgba(30, 64, 175, 0.25)",
          marginBottom: 18,
        }}
      >
        <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>
          {headerCompanyName}
        </div>
        <div style={{ fontWeight: 800 }}>Powered by Notarix</div>
      </div>

      <div style={{ display: "flex", alignItems: "end", gap: 14, marginBottom: 18 }}>
        <h1 style={{ fontSize: 34, margin: 0, fontWeight: 950 }}>
          Notary Orders
        </h1>
        <span style={{ color: "#64748B", fontWeight: 700 }}>
          Vendor: {displayVendorCode}
        </span>
      </div>

      <div style={{ display: "grid", gap: 12, marginBottom: 18 }}>
        {orders.map((o) => (
          <div
            key={o.id}
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 12,
              padding: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 8px 22px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div>
              <div style={{ fontWeight: 900, color: "#0F172A" }}>
                Order #{o.id} | {o.name} | Property: {o.prop}
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: "#475569" }}>
                {o.sub}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <StatusPill status={o.status} />
              <span style={{ fontSize: 18, color: "#94A3B8" }}>›</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "right", color: "#64748B", fontWeight: 800 }}>
        © 2026 Notarix.live
      </div>
    </main>
  );
}