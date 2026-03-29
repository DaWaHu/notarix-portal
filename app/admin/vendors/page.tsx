import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      vendorcode: true,
      companyName: true,
      primaryContactName: true,
      primaryContactEmail: true,
      createdAt: true,
      approvalStatus: true,
    },
    take: 200,
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 28,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 24,
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 40,
                  lineHeight: 1.05,
                  fontWeight: 950,
                  color: "#0F172A",
                }}
              >
                Clients
              </h1>
              <div
                style={{
                  marginTop: 8,
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: 15,
                }}
              >
                Client organization profiles saved in the system.
              </div>
            </div>

            <a
              href="/admin/vendors/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                borderRadius: 10,
                padding: "12px 16px",
                background: "#1D4ED8",
                color: "#FFFFFF",
                fontWeight: 900,
              }}
            >
              + Create Client
            </a>
          </div>

          <div
            style={{
              overflow: "hidden",
              borderRadius: 14,
              border: "1px solid #E5E7EB",
              background: "#FFFFFF",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead style={{ background: "#F8FAFC" }}>
                <tr style={{ color: "#334155", textAlign: "left" }}>
                  <th style={{ padding: "14px 16px" }}>Client Code</th>
                  <th style={{ padding: "14px 16px" }}>Company</th>
                  <th style={{ padding: "14px 16px" }}>Primary Contact</th>
                  <th style={{ padding: "14px 16px" }}>Email</th>
                  <th style={{ padding: "14px 16px" }}>Status</th>
                  <th style={{ padding: "14px 16px" }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {vendors.length === 0 ? (
                  <tr>
                    <td
                      style={{ padding: "16px", color: "#64748B" }}
                      colSpan={6}
                    >
                      No client profiles found yet. Click “Create Client” to add one.
                    </td>
                  </tr>
                ) : (
                  vendors.map((v) => (
                    <tr key={v.id} style={{ borderTop: "1px solid #E5E7EB" }}>
                      <td style={{ padding: "14px 16px", fontFamily: "monospace", fontWeight: 800 }}>
                        <a
                          href={`/vendors/${v.vendorcode}`}
                          style={{ color: "#1D4ED8", textDecoration: "underline" }}
                        >
                          {v.vendorcode}
                        </a>
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 700 }}>{v.companyName}</td>
                      <td style={{ padding: "14px 16px" }}>{v.primaryContactName || "—"}</td>
                      <td style={{ padding: "14px 16px" }}>{v.primaryContactEmail || "—"}</td>
                      <td style={{ padding: "14px 16px" }}>{v.approvalStatus}</td>
                      <td style={{ padding: "14px 16px" }}>
                        {new Date(v.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}