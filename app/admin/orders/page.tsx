import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Status = "Pending" | "Active" | "Completed" | "Closed";

function normalizeStatus(value: string | null | undefined): Status {
  const v = String(value || "").trim().toUpperCase();

  if (v === "ACTIVE" || v === "IN_PROGRESS" || v === "OPEN") return "Active";
  if (v === "COMPLETED" || v === "DONE") return "Completed";
  if (v === "CLOSED" || v === "CANCELLED" || v === "CANCELED") return "Closed";
  return "Pending";
}

function nice(value: string | null | undefined) {
  const v = String(value || "").trim();
  return v || "—";
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function buildPropertyLine(order: {
  propertyAddress1: string | null;
  propertyAddress2: string | null;
  propertyCity: string | null;
  propertyState: string | null;
  propertyZip: string | null;
}) {
  const line1 = [order.propertyAddress1, order.propertyAddress2]
    .filter((v) => String(v || "").trim())
    .join(", ");

  const line2 = [order.propertyCity, order.propertyState, order.propertyZip]
    .filter((v) => String(v || "").trim())
    .join(", ");

  return [line1, line2].filter(Boolean).join(" • ") || "—";
}

function StatusBadge({ status }: { status: Status }) {
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

export default async function AdminOrdersPage() {
  const orders = await prisma.vendorOrder.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      orderNumber: true,
      status: true,
      primaryBorrowerName: true,
      secondaryBorrowerName: true,
      propertyAddress1: true,
      propertyAddress2: true,
      propertyCity: true,
      propertyState: true,
      propertyZip: true,
      borrowerPhone: true,
      borrowerEmail: true,
      signingDate: true,
      signingTimeLabel: true,
      estimatedPages: true,
      paperSize: true,
      preferredInk: true,
      isRON: true,
      serviceType: true,
      specialInstructions: true,
      vendor: {
        select: {
          vendorcode: true,
          companyName: true,
        },
      },
    },
    take: 500,
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 28,
        background: "#F1F5F9",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
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
            Notarix Owner Dashboard
          </div>
          <div style={{ fontWeight: 800 }}>All Orders</div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: 14,
            marginBottom: 18,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ fontSize: 34, margin: 0, fontWeight: 950 }}>
              All Orders
            </h1>
            <div style={{ color: "#64748B", fontWeight: 700, marginTop: 4 }}>
              Owner view • showing all vendors and all saved orders
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 10,
              padding: "10px 14px",
              fontWeight: 800,
              color: "#0F172A",
            }}
          >
            Total Orders: {orders.length}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 1400,
              }}
            >
              <thead
                style={{
                  background: "#E2E8F0",
                }}
              >
                <tr>
                  {[
                    "Order #",
                    "Vendor Code",
                    "Client Company",
                    "Primary Borrower",
                    "Secondary Borrower",
                    "Property",
                    "Signing",
                    "Status",
                    "Service Type",
                    "Pages",
                    "Paper",
                    "Ink",
                    "RON",
                    "Borrower Email",
                    "Borrower Phone",
                    "Created",
                    "Updated",
                    "Portal Link",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        fontSize: 13,
                        color: "#0F172A",
                        fontWeight: 900,
                        borderBottom: "1px solid #CBD5E1",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={18}
                      style={{
                        padding: 20,
                        color: "#475569",
                        fontWeight: 700,
                      }}
                    >
                      No orders found yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const status = normalizeStatus(order.status);
                    const propertyLine = buildPropertyLine(order);
                    const signingLine = order.signingDate
                      ? `${formatDate(order.signingDate)}${
                          order.signingTimeLabel
                            ? ` • ${order.signingTimeLabel}`
                            : ""
                        }`
                      : "—";

                    return (
                      <tr key={order.id}>
                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #E5E7EB",
                            fontWeight: 900,
                            color: "#0F172A",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {nice(order.orderNumber)}
                        </td>

                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #E5E7EB",
                            fontWeight: 800,
                            color: "#0F172A",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {nice(order.vendor?.vendorcode)}
                        </td>

                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #E5E7EB",
                            fontWeight: 700,
                            color: "#0F172A",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {nice(order.vendor?.companyName)}
                        </td>

                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #E5E7EB",
                            fontWeight: 700,
                            color: "#0F172A",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {nice(order.primaryBorrowerName)}
                        </td>

                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #E5E7EB",
                            fontWeight: 700,
                            color: "#0F172A",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {nice(order.secondaryBorrowerName)}
                        </td>

                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #E5E7EB",
                            fontWeight: 600,
                            color: "#0F172A",
                            minWidth: 240,
                          }}
                        >
                          {propertyLine}
                        </td>

                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #E5E7EB",
                            fontWeight: 700,
                            color: "#0F172A",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {signingLine}
                        </td>

                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #E5E7EB",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <StatusBadge status={status} />
                        </td>

                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #E5E7EB",
                            fontWeight: 700,
                            color: "#0F172A",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {nice(order.serviceType)}
                        </td>

                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #E5E7EB",
                            fontWeight: 700,
                            color: "#0F172A",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {order.estimatedPages != null
                            ? String(order.estimatedPages)
                            : "—"}
                        </td>

                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #E5E7EB",
                            fontWeight: 700,
                            color: "#0F172A",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {nice(order.paperSize)}
                        </td>

                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #E5E7EB",
                            fontWeight: 700,
                            color: "#0F172A",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {nice(order.preferredInk)}
                        </td>

                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #E5E7EB",
                            fontWeight: 800,
                            color: "#0F172A",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {order.isRON ? "Yes" : "No"}
                        </td>

                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #E5E7EB",
                            fontWeight: 600,
                            color: "#0F172A",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {nice(order.borrowerEmail)}
                        </td>

                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #E5E7EB",
                            fontWeight: 600,
                            color: "#0F172A",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {nice(order.borrowerPhone)}
                        </td>

                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #E5E7EB",
                            fontWeight: 600,
                            color: "#0F172A",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDateTime(order.createdAt)}
                        </td>

                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #E5E7EB",
                            fontWeight: 600,
                            color: "#0F172A",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDateTime(order.updatedAt)}
                        </td>

                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #E5E7EB",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <a
                            href={`/vendors/${order.vendor.vendorcode}/orders?order=${order.id}`}
                            style={{
                              color: "#1D4ED8",
                              fontWeight: 900,
                              textDecoration: "none",
                            }}
                          >
                            Open
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}