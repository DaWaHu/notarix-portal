import { prisma } from "@/lib/prisma";

type OrderStatus = "Pending" | "Active" | "Completed" | "Closed";

function normalizeStatus(value: string | null | undefined): OrderStatus {
  const v = String(value || "").trim().toUpperCase();

  if (v === "ACTIVE" || v === "IN_PROGRESS" || v === "OPEN") return "Active";
  if (v === "COMPLETED" || v === "DONE") return "Completed";
  if (v === "CLOSED" || v === "CANCELLED" || v === "CANCELED") return "Closed";
  return "Pending";
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

function nice(value: string | null | undefined) {
  const v = String(value || "").trim();
  return v || "—";
}

function getStatusStyle(status: OrderStatus): React.CSSProperties {
  if (status === "Active") {
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 12px",
      borderRadius: 999,
      background: "#DCFCE7",
      color: "#166534",
      border: "1px solid #BBF7D0",
      fontWeight: 800,
      fontSize: 14,
      whiteSpace: "nowrap",
    };
  }

  if (status === "Completed") {
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 12px",
      borderRadius: 999,
      background: "#E0F2FE",
      color: "#075985",
      border: "1px solid #BAE6FD",
      fontWeight: 800,
      fontSize: 14,
      whiteSpace: "nowrap",
    };
  }

  if (status === "Closed") {
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 12px",
      borderRadius: 999,
      background: "#F3F4F6",
      color: "#374151",
      border: "1px solid #E5E7EB",
      fontWeight: 800,
      fontSize: 14,
      whiteSpace: "nowrap",
    };
  }

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    background: "#FEF3C7",
    color: "#B45309",
    border: "1px solid #FDE68A",
    fontWeight: 800,
    fontSize: 14,
    whiteSpace: "nowrap",
  };
}

function getStatusDot(status: OrderStatus) {
  if (status === "Active") return "#166534";
  if (status === "Completed") return "#075985";
  if (status === "Closed") return "#374151";
  return "#B45309";
}

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.vendorOrder.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      orderNumber: true,
      status: true,
      primaryBorrowerName: true,
      propertyAddress1: true,
      signingDate: true,
      signingTimeLabel: true,
      vendor: {
        select: {
          companyName: true,
          vendorcode: true,
        },
      },
    },
  });

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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: 14,
            marginBottom: 18,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 34,
                margin: 0,
                fontWeight: 950,
                color: "#0F172A",
              }}
            >
              Notary Orders
            </h1>
            <div
              style={{
                marginTop: 8,
                color: "#475569",
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              Internal staff dashboard for managing order activity.
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href="/admin/vendors/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
                color: "#0F172A",
                textDecoration: "none",
                borderRadius: 10,
                padding: "12px 16px",
                fontWeight: 900,
                border: "1px solid #CBD5E1",
              }}
            >
              + Create Vendor
            </a>

            <a
              href="/admin/orders/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#1D4ED8",
                color: "white",
                textDecoration: "none",
                borderRadius: 10,
                padding: "12px 16px",
                fontWeight: 900,
              }}
            >
              + Create New Order
            </a>
          </div>
        </div>

        {orders.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 12,
              padding: 18,
              color: "#475569",
              fontWeight: 700,
              boxShadow: "0 8px 22px rgba(15, 23, 42, 0.05)",
            }}
          >
            No orders have been created yet.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {orders.map((order) => {
              const status = normalizeStatus(order.status);
              const borrower =
                nice(order.primaryBorrowerName) !== "—"
                  ? order.primaryBorrowerName
                  : "Borrower";

              const property =
                nice(order.propertyAddress1) !== "—"
                  ? order.propertyAddress1
                  : "Property not entered";

              const orderLabel = order.orderNumber || order.id.slice(-8);

              const detail = order.signingDate
                ? `Signing Date: ${formatDate(order.signingDate)}${
                    order.signingTimeLabel ? ` - ${order.signingTimeLabel}` : ""
                  }`
                : `Created: ${formatDateTime(order.createdAt)}`;

              return (
                <a
                  key={order.id}
                  href="/admin/orders"
                  style={{
                    textDecoration: "none",
                    display: "block",
                  }}
                >
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: 12,
                      padding: 16,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      boxShadow: "0 8px 22px rgba(15, 23, 42, 0.05)",
                      cursor: "pointer",
                      gap: 16,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 900,
                          color: "#0F172A",
                          fontSize: 18,
                        }}
                      >
                        Order #{orderLabel} | {borrower} | Property: {property}
                      </div>

                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 14,
                          color: "#475569",
                        }}
                      >
                        {detail}
                      </div>

                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 13,
                          color: "#64748B",
                          fontWeight: 700,
                        }}
                      >
                        Client: {order.vendor?.companyName || "Unassigned"}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexShrink: 0,
                      }}
                    >
                      <span style={getStatusStyle(status)}>
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            background: getStatusDot(status),
                            display: "inline-block",
                          }}
                        />
                        {status}
                      </span>

                      <span
                        style={{
                          fontSize: 20,
                          color: "#94A3B8",
                          fontWeight: 700,
                        }}
                      >
                        ›
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}