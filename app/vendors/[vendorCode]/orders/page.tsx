import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ vendorCode: string }>;
};

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

export default async function VendorOrdersPage({ params }: PageProps) {
  const { vendorCode } = await params;

  const vendor = await prisma.vendor.findUnique({
    where: { vendorcode: vendorCode },
    select: {
      id: true,
      companyName: true,
      vendorcode: true,
    },
  });

  if (!vendor) {
    notFound();
  }

  const orders = await prisma.vendorOrder.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      primaryBorrowerName: true,
      propertyAddress1: true,
      propertyCity: true,
      propertyState: true,
      status: true,
      signingDate: true,
      signingTimeLabel: true,
      createdAt: true,
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
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
            marginBottom: 20,
          }}
        >

          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#64748B",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: 0.04,
            }}
          >
            Client Portal
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
            Client Orders
          </h1>

          <div
            style={{
              marginTop: 10,
              color: "#475569",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Order activity for this client organization.
          </div>
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
            <div
              style={{
                fontSize: 14,
                color: "#64748B",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.4,
              }}
            >
              Client
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 22,
                fontWeight: 900,
                color: "#0F172A",
              }}
            >
              {vendor.companyName || vendorCode}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href={`/vendors/${vendorCode}/orders/new`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                borderRadius: 10,
                padding: "14px 18px",
                fontWeight: 900,
                background: "#1D4ED8",
                color: "#fff",
                boxShadow: "0 10px 24px rgba(29, 78, 216, 0.22)",
              }}
            >
              New Order
            </Link>

          </div>
        </div>

        {orders.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 16,
              padding: 24,
              color: "#475569",
              fontWeight: 600,
            }}
          >
            No orders found for this client yet.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 18,
            }}
          >
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/vendors/${vendorCode}/orders/${order.id}`}
                style={{
                  display: "block",
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#64748B",
                    letterSpacing: 0.3,
                    textTransform: "uppercase",
                  }}
                >
                  Order {nice(order.orderNumber)}
                </div>

                <div
                  style={{
                    marginTop: 10,
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#0F172A",
                  }}
                >
                  {nice(order.primaryBorrowerName)}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    color: "#475569",
                    fontWeight: 600,
                    lineHeight: 1.6,
                  }}
                >
                  {nice(order.propertyAddress1)}
                  <br />
                  {nice(order.propertyCity)}
                  {order.propertyCity && order.propertyState ? ", " : ""}
                  {nice(order.propertyState) === "—" ? "" : order.propertyState}
                </div>

                <div
                  style={{
                    marginTop: 14,
                    display: "inline-flex",
                    alignItems: "center",
                    borderRadius: 999,
                    background: "#EFF6FF",
                    color: "#1D4ED8",
                    padding: "8px 12px",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  {nice(order.status)}
                </div>

                <div
                  style={{
                    marginTop: 14,
                    color: "#475569",
                    fontWeight: 600,
                    lineHeight: 1.6,
                  }}
                >
                  Signing Date: {formatDate(order.signingDate)} - {nice(order.signingTimeLabel)}
                </div>

                <div
                  style={{
                    marginTop: 10,
                    color: "#64748B",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Created: {formatDate(order.createdAt)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main >
  );
}