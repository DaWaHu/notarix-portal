import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ vendorCode: string }>;
};

export const dynamic = "force-dynamic";

function nice(value: string | null | undefined) {
  const v = String(value || "").trim();
  return v || "—";
}

export default async function VendorHomePage({ params }: PageProps) {
  const { vendorCode } = await params;
  const normalizedVendorCode = String(vendorCode || "").trim().toUpperCase();

  const vendor = await prisma.vendor.findUnique({
    where: { vendorcode: normalizedVendorCode },
    select: {
      id: true,
      vendorcode: true,
      companyName: true,
      primaryContactName: true,
      primaryContactEmail: true,
      primaryContactPhone: true,
      secondaryContactName: true,
      secondaryContactEmail: true,
      secondaryContactPhone: true,
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  if (!vendor) {
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
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
            marginBottom: 20,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 40,
              lineHeight: 1.1,
              fontWeight: 950,
              color: "#0F172A",
            }}
          >
            Vendor Dashboard
          </h1>

          <div
            style={{
              marginTop: 10,
              color: "#475569",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Approved client organization workspace.
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 18,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#0F172A",
                marginBottom: 8,
              }}
            >
              Company Information
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <InfoRow label="Company Name" value={nice(vendor.companyName)} />
              <InfoRow label="Vendor Code" value={nice(vendor.vendorcode)} />
              <InfoRow
                label="Total Orders"
                value={String(vendor._count.orders || 0)}
              />
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#0F172A",
                marginBottom: 8,
              }}
            >
              Quick Actions
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <a href={`/vendors/${vendor.vendorcode}/orders`} style={actionLink}>
                View Orders
              </a>

              <a
                href={`/vendors/${vendor.vendorcode}/orders/new`}
                style={actionLink}
              >
                Create Vendor Order
              </a>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#0F172A",
              marginBottom: 16,
            }}
          >
            Contact Information
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 18,
            }}
          >
            <div
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: 14,
                padding: 18,
                background: "#F8FAFC",
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: "#0F172A",
                  marginBottom: 12,
                }}
              >
                Primary Contact
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                <InfoRow
                  label="Name"
                  value={nice(vendor.primaryContactName)}
                />
                <InfoRow
                  label="Email"
                  value={nice(vendor.primaryContactEmail)}
                />
                <InfoRow
                  label="Phone"
                  value={nice(vendor.primaryContactPhone)}
                />
              </div>
            </div>

            <div
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: 14,
                padding: 18,
                background: "#F8FAFC",
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: "#0F172A",
                  marginBottom: 12,
                }}
              >
                Secondary Contact
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                <InfoRow
                  label="Name"
                  value={nice(vendor.secondaryContactName)}
                />
                <InfoRow
                  label="Email"
                  value={nice(vendor.secondaryContactEmail)}
                />
                <InfoRow
                  label="Phone"
                  value={nice(vendor.secondaryContactPhone)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: "#64748B",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 800,
          color: "#0F172A",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const actionLink: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  border: "1px solid #CBD5E1",
  borderRadius: 10,
  padding: "12px 16px",
  fontWeight: 800,
  color: "#0F172A",
  background: "#fff",
};