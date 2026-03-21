import Image from "next/image";
import { prisma } from "@/lib/prisma";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

type Status = "Pending" | "Active" | "Completed" | "Closed";

type PageProps = {
  params: Promise<{ vendorCode: string }>;
  searchParams?: Promise<{ order?: string }>;
};

function normalizeStatus(value: string | null | undefined): Status {
  const v = String(value || "").trim().toUpperCase();

  if (v === "ACTIVE" || v === "IN_PROGRESS" || v === "OPEN") return "Active";
  if (v === "COMPLETED" || v === "DONE") return "Completed";
  if (v === "CLOSED" || v === "CANCELLED" || v === "CANCELED") return "Closed";
  return "Pending";
}

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

function Card({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        background: "#fff",
        overflow: "hidden",
        boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div
        style={{
          background: "#1e40af",
          color: "white",
          padding: "10px 14px",
          fontWeight: 800,
          fontSize: 14,
        }}
      >
        {title}
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: "#0F172A", fontWeight: 700 }}>
        {value}
      </div>
    </div>
  );
}

function Tag({
  label,
  checked,
}: {
  label: string;
  checked?: boolean;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        border: "1px solid #E5E7EB",
        borderRadius: 10,
        background: "#F8FAFC",
        fontWeight: 800,
        color: "#0F172A",
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          border: `2px solid ${checked ? "#1D4ED8" : "#CBD5E1"}`,
          background: checked ? "#1D4ED8" : "transparent",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 11,
          lineHeight: 1,
          fontWeight: 900,
        }}
      >
        {checked ? "✓" : ""}
      </span>
      {label}
    </div>
  );
}

function Timeline({ current }: { current: Status }) {
  const steps: Status[] = ["Pending", "Active", "Completed", "Closed"];
  const idx = steps.indexOf(current);

  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      {steps.map((s, i) => {
        const done = i <= idx;
        return (
          <div key={s} style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: done ? "#1D4ED8" : "#CBD5E1",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontWeight: 800,
                  color: done ? "#0F172A" : "#94A3B8",
                  fontSize: 13,
                }}
              >
                {s}
              </span>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 999,
                background: done ? "#1D4ED8" : "#E5E7EB",
              }}
            />
          </div>
        );
      })}
    </div>
  );
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

function buildPropertyLine(order: {
  propertyAddress1: string | null;
  propertyAddress2: string | null;
  propertyCity: string | null;
  propertyState: string | null;
  propertyZip: string | null;
}) {
  const first = [order.propertyAddress1, order.propertyAddress2]
    .filter((v) => String(v || "").trim())
    .join(", ");

  const second = [order.propertyCity, order.propertyState, order.propertyZip]
    .filter((v) => String(v || "").trim())
    .join(", ");

  return [first, second].filter(Boolean).join(" • ") || "—";
}

export default async function VendorOrdersPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) || {};

  const vendorCode = String(resolvedParams.vendorCode || "")
    .toUpperCase()
    .trim();

  const selectedOrderId = String(resolvedSearchParams.order || "").trim();

  const vendor = await prisma.vendor.findUnique({
    where: { vendorcode: vendorCode },
    select: {
      id: true,
      companyName: true,
      vendorcode: true,
      primaryContactName: true,
      primaryContactEmail: true,
      primaryContactPhone: true,
      secondaryContactName: true,
      secondaryContactEmail: true,
      secondaryContactPhone: true,
      orders: {
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
          notes: true,
        },
      },
    },
  });

  if (!vendor) {
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
            maxWidth: 900,
            margin: "0 auto",
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 14,
            padding: 24,
          }}
        >
          <h1 style={{ marginTop: 0 }}>Vendor not found</h1>
          <p>No vendor record was found for code: {vendorCode || "—"}</p>
        </div>
      </main>
    );
  }

  const displayVendorCode = "Notarix Staff Portal";
  const companyName = vendor.companyName || "CLIENT";
  const orders = vendor.orders;
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || null;
  const selectedStatus = normalizeStatus(selectedOrder?.status);

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
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Image
            src="/notarix-logo.png"
            alt="Notarix"
            width={44}
            height={44}
            style={{
              width: 44,
              height: 44,
              objectFit: "contain",
              background: "white",
              borderRadius: 10,
              padding: 4,
            }}
          />
          <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>
            {"Notarix Staff Portal"}
          </div>
        </div>

        <div style={{ fontWeight: 800 }}>Powered by Notarix</div>
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
            Notary Orders
          </h1>
        </div>

        <a
          href={`/admin/orders/new`}
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

      {!selectedOrder ? (
        <div style={{ display: "grid", gap: 12, marginBottom: 18 }}>
          {orders.length === 0 ? (
            <div
              style={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                padding: 18,
                color: "#475569",
                fontWeight: 700,
              }}
            >
              No orders have been created yet.
            </div>
          ) : (
            orders.map((o) => {
              const status = normalizeStatus(o.status);
              const borrower =
                nice(o.primaryBorrowerName) !== "—"
                  ? o.primaryBorrowerName
                  : "Borrower";
              const property =
                nice(o.propertyAddress1) !== "—"
                  ? o.propertyAddress1
                  : "Property not entered";
              const orderLabel = o.orderNumber || o.id.slice(-8);

              return (
                <a
                  key={o.id}
                  href={`/vendors/${vendorCode}/orders?order=${o.id}`}
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
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 900, color: "#0F172A" }}>
                        Order #{orderLabel} | {borrower} | Property: {property}
                      </div>
                      <div
                        style={{ marginTop: 4, fontSize: 12, color: "#475569" }}
                      >
                        {o.signingDate
                          ? `Signing Date: ${formatDate(o.signingDate)}${
                              o.signingTimeLabel ? ` – ${o.signingTimeLabel}` : ""
                            }`
                          : `Created: ${formatDateTime(o.createdAt)}`}
                      </div>
                    </div>

                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <StatusPill status={status} />
                      <span style={{ fontSize: 18, color: "#94A3B8" }}>›</span>
                    </div>
                  </div>
                </a>
              );
            })
          )}
        </div>
      ) : (
        <>
          <div
            style={{
              background: "#1e40af",
              color: "white",
              padding: "14px 18px",
              borderRadius: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 10px 30px rgba(30, 64, 175, 0.25)",
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <a
                href={`/admin/orders`}
                style={{
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 900,
                  fontSize: 18,
                }}
              >
                ←
              </a>
              <div style={{ fontWeight: 950 }}>
                Order #{selectedOrder.orderNumber || selectedOrder.id.slice(-8)} –{" "}
                {nice(selectedOrder.primaryBorrowerName)}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontWeight: 800 }}>
                ✓ Status: {selectedStatus}
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 1.5fr 1.4fr",
                gap: 12,
              }}
            >
              <Card title="Borrower Information">
                <Field
                  label="Primary Borrower"
                  value={nice(selectedOrder.primaryBorrowerName)}
                />
                <Field
                  label="Secondary Borrower / Signer"
                  value={nice(selectedOrder.secondaryBorrowerName)}
                />
                <Field
                  label="Property Address"
                  value={buildPropertyLine(selectedOrder)}
                />
                <Field
                  label="Signing Date"
                  value={formatDate(selectedOrder.signingDate)}
                />
                <Field
                  label="Signing Time"
                  value={nice(selectedOrder.signingTimeLabel)}
                />
                <Field label="Phone" value={nice(selectedOrder.borrowerPhone)} />
                <Field label="Email" value={nice(selectedOrder.borrowerEmail)} />
              </Card>

              <Card title="Order Details">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #E5E7EB",
                      borderRadius: 10,
                      background: "#fff",
                      fontWeight: 900,
                      color: "#0F172A",
                    }}
                  >
                    Est. Pages:{" "}
                    {selectedOrder.estimatedPages != null
                      ? selectedOrder.estimatedPages
                      : "—"}
                  </div>

                  <Tag
                    label="Legal"
                    checked={String(selectedOrder.paperSize || "")
                      .toUpperCase()
                      .includes("LEGAL")}
                  />
                  <Tag
                    label="Letter"
                    checked={String(selectedOrder.paperSize || "")
                      .toUpperCase()
                      .includes("LETTER")}
                  />
                  <Tag label="RON" checked={Boolean(selectedOrder.isRON)} />
                </div>

                <Field
                  label="Preferred Ink"
                  value={nice(selectedOrder.preferredInk)}
                />
                <Field
                  label="Service Type"
                  value={nice(selectedOrder.serviceType)}
                />

                <div
                  style={{
                    border: "1px solid #E5E7EB",
                    borderRadius: 10,
                    padding: 12,
                    background: "#F8FAFC",
                    color: "#334155",
                    fontSize: 13,
                    fontWeight: 650,
                  }}
                >
                  {nice(selectedOrder.specialInstructions) !== "—"
                    ? selectedOrder.specialInstructions
                    : "No special instructions entered."}
                </div>
              </Card>

              <Card title="Documents">
                <div
                  style={{
                    color: "#475569",
                    fontWeight: 700,
                    fontSize: 14,
                    padding: "4px 2px",
                  }}
                >
                  No documents uploaded yet.
                </div>
              </Card>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 1.5fr 1.4fr",
                gap: 12,
              }}
            >
              <Card title="Contacts">
                <div style={{ display: "grid", gap: 12 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: "#E2E8F0",
                        border: "1px solid #CBD5E1",
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 900, color: "#0F172A" }}>
                        {nice(vendor.primaryContactName)}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#64748B",
                          fontWeight: 800,
                        }}
                      >
                        Primary Contact
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#0F172A",
                          fontWeight: 800,
                        }}
                      >
                        {nice(vendor.primaryContactPhone)}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#0F172A",
                          fontWeight: 800,
                        }}
                      >
                        {nice(vendor.primaryContactEmail)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: "#E2E8F0",
                        border: "1px solid #CBD5E1",
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 900, color: "#0F172A" }}>
                        {nice(vendor.secondaryContactName)}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#64748B",
                          fontWeight: 800,
                        }}
                      >
                        Secondary Contact
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#0F172A",
                          fontWeight: 800,
                        }}
                      >
                        {nice(vendor.secondaryContactPhone)}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#0F172A",
                          fontWeight: 800,
                        }}
                      >
                        {nice(vendor.secondaryContactEmail)}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Communication Log">
                <div
                  style={{
                    color: "#475569",
                    fontWeight: 700,
                    fontSize: 14,
                    padding: "4px 2px",
                  }}
                >
                  No communication messages yet.
                </div>
              </Card>

              <Card title="Payment Details">
                <Field label="Payment Status" value="Not configured" />
                <Field label="Estimated Payment Date" value="—" />
              </Card>
            </div>

            <Card title="Order Status">
              <Timeline current={selectedStatus} />
            </Card>
          </div>
        </>
      )}

      <div
        style={{
          marginTop: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          color: "#64748B",
        }}
      >
        <Image
          src="/notarix-logo.png"
          alt="Notarix"
          width={72}
          height={72}
          style={{ width: 72, height: 72, objectFit: "contain" }}
        />
        <div style={{ fontWeight: 800 }}>© 2026 Notarix.live</div>
      </div>
    </main>
  );
}