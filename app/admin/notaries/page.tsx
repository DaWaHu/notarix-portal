import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

function getStatusBadgeStyle(isActive: boolean): React.CSSProperties {
  return isActive
    ? {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        padding: "6px 10px",
        fontSize: 12,
        fontWeight: 800,
        background: "#ECFDF3",
        color: "#027A48",
        border: "1px solid #ABEFC6",
        whiteSpace: "nowrap",
      }
    : {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        padding: "6px 10px",
        fontSize: 12,
        fontWeight: 800,
        background: "#FEF3F2",
        color: "#B42318",
        border: "1px solid #FECDCA",
        whiteSpace: "nowrap",
      };
}

export default async function AdminNotariesPage() {
  const notaries = await prisma.notaryProfile.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      notaryCode: true,
      fullName: true,
      email: true,
      phone: true,
      commissionState: true,
      commissionNumber: true,
      isRONApproved: true,
      isActive: true,
      createdAt: true,
    },
    take: 300,
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
                Notaries
              </h1>
              <div
                style={{
                  marginTop: 8,
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: 15,
                }}
              >
                Notary profiles created in the system.
              </div>
            </div>

            <a
              href="/admin/notaries/new"
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
              + Create Notary
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
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead style={{ background: "#F8FAFC" }}>
                <tr style={{ color: "#334155", textAlign: "left" }}>
                  <th style={{ padding: "14px 16px" }}>Notary Code</th>
                  <th style={{ padding: "14px 16px" }}>Name</th>
                  <th style={{ padding: "14px 16px" }}>Email</th>
                  <th style={{ padding: "14px 16px" }}>Phone</th>
                  <th style={{ padding: "14px 16px" }}>Commission</th>
                  <th style={{ padding: "14px 16px" }}>RON</th>
                  <th style={{ padding: "14px 16px" }}>Status</th>
                  <th style={{ padding: "14px 16px" }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {notaries.length === 0 ? (
                  <tr>
                    <td style={{ padding: "16px", color: "#64748B" }} colSpan={8}>
                      No notary profiles found yet. Click “Create Notary” to add one.
                    </td>
                  </tr>
                ) : (
                  notaries.map((notary) => (
                    <tr key={notary.id} style={{ borderTop: "1px solid #E5E7EB" }}>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontFamily:
                            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                          fontWeight: 800,
                        }}
                      >
                        <Link
                          href={`/notaries/${encodeURIComponent(
                            notary.notaryCode || notary.id
                          )}`}
                          style={{ color: "#1D4ED8", textDecoration: "underline" }}
                        >
                          {notary.notaryCode || "—"}
                        </Link>
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 700 }}>
                        {nice(notary.fullName)}
                      </td>
                      <td style={{ padding: "14px 16px" }}>{nice(notary.email)}</td>
                      <td style={{ padding: "14px 16px" }}>{nice(notary.phone)}</td>
                      <td style={{ padding: "14px 16px" }}>
                        {nice(notary.commissionState)} / {nice(notary.commissionNumber)}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {notary.isRONApproved ? "Approved" : "No"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={getStatusBadgeStyle(notary.isActive)}>
                          {notary.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {formatDateTime(notary.createdAt)}
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