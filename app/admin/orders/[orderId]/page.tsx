import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OrderDocumentUpload from "./OrderDocumentUpload";
import OrderStatusPanel from "./components/OrderStatusPanel";
import OrderCommunicationsPanel from "./components/OrderCommunicationsPanel";
import OrderSigningDetailsPanel from "./components/OrderSigningDetailsPanel";
import OrderActivityPanel from "./components/OrderActivityPanel";

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

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { orderId: string };
}) {
  const order = await prisma.vendorOrder.findUnique({
    where: { id: params.orderId },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      orderNumber: true,
      status: true,
      primaryBorrowerName: true,
      secondaryBorrowerName: true,
      borrowerPhone: true,
      borrowerEmail: true,
      propertyAddress1: true,
      propertyAddress2: true,
      propertyCity: true,
      propertyState: true,
      propertyZip: true,
      signingDate: true,
      signingTimeLabel: true,
      estimatedPages: true,
      paperSize: true,
      preferredInk: true,
      isRON: true,
      serviceType: true,
      specialInstructions: true,
      notes: true,
      vendor: {
        select: {
          companyName: true,
          vendorcode: true,
        },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          fromStatus: true,
          toStatus: true,
          reason: true,
          createdAt: true,
        },
      },
      communications: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          createdAt: true,
          channel: true,
          direction: true,
          subject: true,
          message: true,
        },
      },
      documents: {
        select: {
          id: true,
          fileName: true,
          storageKey: true,
          documentType: true,
          visibility: true,
          createdAt: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main
      style={{
        padding: 28,
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 34,
                fontWeight: 950,
                color: "#0F172A",
              }}
            >
              Order Detail
            </h1>
            <div
              style={{
                marginTop: 8,
                color: "#475569",
                fontWeight: 600,
              }}
            >
              Review order details, status workflow, communications, and attached documents.
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href="/admin/orders"
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
              Back to Orders
            </a>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 18,
          }}
        >
          <OrderStatusPanel
            orderId={order.id}
            currentStatus={order.status}
            history={order.statusHistory.map((item) => ({
              ...item,
              createdAt: item.createdAt.toISOString(),
            }))}
          />

          <OrderCommunicationsPanel
            orderId={order.id}
            communications={order.communications.map((item) => ({
              ...item,
              createdAt: item.createdAt.toISOString(),
            }))}
          />

          <OrderActivityPanel
            statusHistory={order.statusHistory.map((item) => ({
              ...item,
              createdAt: item.createdAt.toISOString(),
            }))}
            communications={order.communications.map((item) => ({
              ...item,
              createdAt: item.createdAt.toISOString(),
            }))}
            documents={order.documents.map((doc) => ({
              ...doc,
              createdAt: doc.createdAt.toISOString(),
            }))}
          />

          <section
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 14,
              padding: 20,
              boxShadow: "0 8px 22px rgba(15, 23, 42, 0.05)",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#0F172A" }}>Order Summary</h2>

            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <strong>Order Number:</strong> {nice(order.orderNumber)}
              </div>
              <div>
                <strong>Status:</strong> {nice(order.status)}
              </div>
              <div>
                <strong>Vendor:</strong> {nice(order.vendor?.companyName)}
              </div>
              <div>
                <strong>Vendor Code:</strong> {nice(order.vendor?.vendorcode)}
              </div>
              <div>
                <strong>Service Type:</strong> {nice(order.serviceType)}
              </div>
              <div>
                <strong>RON:</strong> {order.isRON ? "Yes" : "No"}
              </div>
              <div>
                <strong>Created:</strong> {formatDateTime(order.createdAt)}
              </div>
              <div>
                <strong>Updated:</strong> {formatDateTime(order.updatedAt)}
              </div>
            </div>
          </section>

          <section
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 14,
              padding: 20,
              boxShadow: "0 8px 22px rgba(15, 23, 42, 0.05)",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#0F172A" }}>Borrower & Property</h2>

            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <strong>Primary Borrower:</strong> {nice(order.primaryBorrowerName)}
              </div>
              <div>
                <strong>Secondary Borrower:</strong> {nice(order.secondaryBorrowerName)}
              </div>
              <div>
                <strong>Borrower Phone:</strong> {nice(order.borrowerPhone)}
              </div>
              <div>
                <strong>Borrower Email:</strong> {nice(order.borrowerEmail)}
              </div>
              <div>
                <strong>Address 1:</strong> {nice(order.propertyAddress1)}
              </div>
              <div>
                <strong>Address 2:</strong> {nice(order.propertyAddress2)}
              </div>
              <div>
                <strong>City:</strong> {nice(order.propertyCity)}
              </div>
              <div>
                <strong>State:</strong> {nice(order.propertyState)}
              </div>
              <div>
                <strong>Zip:</strong> {nice(order.propertyZip)}
              </div>
            </div>
          </section>

          <OrderSigningDetailsPanel
            orderId={order.id}
            paperSize={order.paperSize}
            preferredInk={order.preferredInk}
            specialInstructions={order.specialInstructions}
            signingDate={order.signingDate ? order.signingDate.toISOString() : null}
            signingTimeLabel={order.signingTimeLabel}
            estimatedPages={order.estimatedPages}
            notes={order.notes}
          />

          <section
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 14,
              padding: 20,
              boxShadow: "0 8px 22px rgba(15, 23, 42, 0.05)",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#0F172A" }}>Documents</h2>

            <OrderDocumentUpload orderId={order.id} />

            {order.documents.length === 0 ? (
              <div style={{ color: "#475569", fontWeight: 600 }}>
                No documents attached yet.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {order.documents.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      border: "1px solid #E5E7EB",
                      borderRadius: 10,
                      padding: 12,
                    }}
                  >
                    <div style={{ fontWeight: 800, color: "#0F172A" }}>
                      {doc.fileName}
                    </div>
                    <div style={{ color: "#475569", marginTop: 6 }}>
                      Type: {doc.documentType}
                    </div>
                    <div style={{ color: "#475569", marginTop: 4 }}>
                      Visibility: {doc.visibility}
                    </div>
                    <div style={{ color: "#64748B", marginTop: 4 }}>
                      Uploaded: {formatDateTime(doc.createdAt)}
                    </div>
                    <div style={{ color: "#64748B", marginTop: 4 }}>
                      Uploaded: {formatDateTime(doc.createdAt)}
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <a
                        href={
                          "/api/documents/download?key=" +
                          encodeURIComponent(doc.storageKey)
                        }
                        style={{
                          color: "#2563EB",
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        Download document
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main >
  );
}