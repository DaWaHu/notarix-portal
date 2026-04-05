import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import VendorOrderDocumentUpload from "./VendorOrderDocumentUpload";
import Link from "next/link";
import { formatPhone } from "@/lib/formatPhone";

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

type PageProps = {
  params: Promise<{ vendorCode: string; orderId: string }>;
};

export default async function VendorOrderDetailPage({ params }: PageProps) {
  const { vendorCode, orderId } = await params;

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

  const order = await prisma.vendorOrder.findFirst({
    where: {
      id: orderId,
      vendorId: vendor.id,
    },
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
      feeAmount: true,
      paymentMethod: true,
      paymentDueStatus: true,
      paymentDueDate: true,
      paymentPaid: true,
      paymentPaidDate: true,
      paymentNotes: true,
      documents: {
        select: {
          id: true,
          fileName: true,
          storageKey: true,
          documentType: true,
          visibility: true,
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
              Review your submitted notary order details.
            </div>
          </div>

          <Link
            href={`/vendors/${vendorCode}/orders`}
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
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 18,
          }}
        >
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
              <div><strong>Order Number:</strong> {nice(order.orderNumber)}</div>
              <div><strong>Status:</strong> {nice(order.status)}</div>
              <div><strong>Client:</strong> {nice(vendor.companyName)}</div>
              <div><strong>Client Code:</strong> {nice(vendor.vendorcode)}</div>              <div><strong>Service Type:</strong> {nice(order.serviceType)}</div>
              <div><strong>RON:</strong> {order.isRON ? "Yes" : "No"}</div>
              <div><strong>Created:</strong> {formatDateTime(order.createdAt)}</div>
              <div><strong>Updated:</strong> {formatDateTime(order.updatedAt)}</div>
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
              <div><strong>Primary Borrower:</strong> {nice(order.primaryBorrowerName)}</div>
              <div><strong>Secondary Borrower:</strong> {nice(order.secondaryBorrowerName)}</div>
              <div><strong>Borrower Phone:</strong> {formatPhone(order.borrowerPhone) || "—"}</div>
              <div><strong>Borrower Email:</strong> {nice(order.borrowerEmail)}</div>
              <div><strong>Address 1:</strong> {nice(order.propertyAddress1)}</div>
              <div><strong>Address 2:</strong> {nice(order.propertyAddress2)}</div>
              <div><strong>City:</strong> {nice(order.propertyCity)}</div>
              <div><strong>State:</strong> {nice(order.propertyState)}</div>
              <div><strong>Zip:</strong> {nice(order.propertyZip)}</div>
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
            <h2 style={{ marginTop: 0, color: "#0F172A" }}>Signing & Payment</h2>

            <div style={{ display: "grid", gap: 10 }}>
              <div><strong>Signing Date:</strong> {formatDate(order.signingDate)}</div>
              <div><strong>Signing Time:</strong> {nice(order.signingTimeLabel)}</div>
              <div><strong>Estimated Pages:</strong> {order.estimatedPages ?? "—"}</div>
              <div><strong>Paper Size:</strong> {nice(order.paperSize)}</div>
              <div><strong>Required Ink:</strong> {nice(order.preferredInk)}</div>
              <div><strong>Fee Amount:</strong> {order.feeAmount?.toString() ?? "—"}</div>
              <div><strong>Payment Method:</strong> {nice(order.paymentMethod)}</div>
              <div><strong>Payment Due Status:</strong> {nice(order.paymentDueStatus)}</div>
              <div><strong>Payment Due Date:</strong> {formatDate(order.paymentDueDate)}</div>
              <div><strong>Payment Paid:</strong> {order.paymentPaid ? "Yes" : "No"}</div>
              <div><strong>Payment Paid Date:</strong> {formatDate(order.paymentPaidDate)}</div>
              <div><strong>Payment Notes:</strong> {nice(order.paymentNotes)}</div>
              <div><strong>Special Instructions:</strong> {nice(order.specialInstructions)}</div>
              <div><strong>Notes:</strong> {nice(order.notes)}</div>
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
            <h2 style={{ marginTop: 0, color: "#0F172A" }}>Documents</h2>

            <VendorOrderDocumentUpload orderId={order.id} />

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
                    <div style={{ marginTop: 10 }}>
                      <a
                        href={"/api/documents/download?key=" + encodeURIComponent(doc.storageKey)}
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
    </main>
  );
}
