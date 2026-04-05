import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{
    sort?: string;
    dir?: string;
  }>;
};

type SortKey = "company" | "clientCode" | "primaryContact" | "email" | "status" | "created";
type SortDir = "asc" | "desc";

function getValidSort(value: string | undefined): SortKey {
  if (
    value === "company" ||
    value === "clientCode" ||
    value === "primaryContact" ||
    value === "email" ||
    value === "status" ||
    value === "created"
  ) {
    return value;
  }

  return "company";
}

function getValidDir(value: string | undefined): SortDir {
  return value === "desc" ? "desc" : "asc";
}

function buildSortHref(sort: SortKey, currentSort: SortKey, currentDir: SortDir) {
  const nextDir: SortDir =
    currentSort === sort && currentDir === "asc" ? "desc" : "asc";

  return `/admin/vendors?sort=${sort}&dir=${nextDir}`;
}

function formatDateTime(value: Date | string) {
  return new Date(value).toLocaleString();
}

function getApprovalBadgeStyle(status: string): React.CSSProperties {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "APPROVED") {
    return {
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
    };
  }

  if (normalized === "REJECTED") {
    return {
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

  if (normalized === "SUSPENDED") {
    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      padding: "6px 10px",
      fontSize: 12,
      fontWeight: 800,
      background: "#F4F3FF",
      color: "#5925DC",
      border: "1px solid #D9D6FE",
      whiteSpace: "nowrap",
    };
  }

  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 800,
    background: "#FFFAEB",
    color: "#B54708",
    border: "1px solid #FEDF89",
    whiteSpace: "nowrap",
  };
}

function SortHeader({
  label,
  sortKey,
  currentSort,
  currentDir,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  currentDir: SortDir;
}) {
  const isActive = currentSort === sortKey;
  const arrow = isActive ? (currentDir === "asc" ? "↑" : "↓") : "↕";

  return (
    <Link
      href={buildSortHref(sortKey, currentSort, currentDir)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        textDecoration: "none",
        color: "#334155",
        fontWeight: 800,
      }}
    >
      <span>{label}</span>
      <span
        style={{
          fontSize: 12,
          color: isActive ? "#1D4ED8" : "#94A3B8",
          lineHeight: 1,
        }}
      >
        {arrow}
      </span>
    </Link>
  );
}

export default async function AdminClientsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const currentSort = getValidSort(resolvedSearchParams?.sort);
  const currentDir = getValidDir(resolvedSearchParams?.dir);

  const orderBy =
    currentSort === "company"
      ? [{ companyName: currentDir }, { createdAt: "desc" as const }]
      : currentSort === "clientCode"
        ? [{ vendorcode: currentDir }, { companyName: "asc" as const }]
        : currentSort === "primaryContact"
          ? [{ primaryContactName: currentDir }, { companyName: "asc" as const }]
          : currentSort === "email"
            ? [{ primaryContactEmail: currentDir }, { companyName: "asc" as const }]
            : currentSort === "status"
              ? [{ approvalStatus: currentDir }, { companyName: "asc" as const }]
              : [{ createdAt: currentDir }, { companyName: "asc" as const }];

  const clients = await prisma.vendor.findMany({
    orderBy,
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

          </div>

          <div
            style={{
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid #E2E8F0",
                background: "#F8FAFC",
                borderRadius: 999,
                padding: "8px 12px",
                fontSize: 13,
                color: "#334155",
                fontWeight: 700,
              }}
            >
              Default sort: Alphabetical by company
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid #E2E8F0",
                background: "#F8FAFC",
                borderRadius: 999,
                padding: "8px 12px",
                fontSize: 13,
                color: "#334155",
                fontWeight: 700,
              }}
            >
              Active sort: {currentSort} ({currentDir})
            </div>
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
                  <th style={{ padding: "14px 16px" }}>
                    <SortHeader
                      label="Client Code"
                      sortKey="clientCode"
                      currentSort={currentSort}
                      currentDir={currentDir}
                    />
                  </th>
                  <th style={{ padding: "14px 16px" }}>
                    <SortHeader
                      label="Company"
                      sortKey="company"
                      currentSort={currentSort}
                      currentDir={currentDir}
                    />
                  </th>
                  <th style={{ padding: "14px 16px" }}>
                    <SortHeader
                      label="Primary Contact"
                      sortKey="primaryContact"
                      currentSort={currentSort}
                      currentDir={currentDir}
                    />
                  </th>
                  <th style={{ padding: "14px 16px" }}>
                    <SortHeader
                      label="Email"
                      sortKey="email"
                      currentSort={currentSort}
                      currentDir={currentDir}
                    />
                  </th>
                  <th style={{ padding: "14px 16px" }}>
                    <SortHeader
                      label="Status"
                      sortKey="status"
                      currentSort={currentSort}
                      currentDir={currentDir}
                    />
                  </th>
                  <th style={{ padding: "14px 16px" }}>
                    <SortHeader
                      label="Created"
                      sortKey="created"
                      currentSort={currentSort}
                      currentDir={currentDir}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td
                      style={{ padding: "16px", color: "#64748B" }}
                      colSpan={6}
                    >
                      No client profiles found yet. Click “Create Client” to add one.
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id} style={{ borderTop: "1px solid #E5E7EB" }}>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontFamily: "monospace",
                          fontWeight: 800,
                        }}
                      >
                        <a
                          href={`/vendors/${client.vendorcode}`}
                          style={{ color: "#1D4ED8", textDecoration: "underline" }}
                        >
                          {client.vendorcode}
                        </a>
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 700 }}>
                        {client.companyName}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {client.primaryContactName || "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {client.primaryContactEmail || "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={getApprovalBadgeStyle(client.approvalStatus)}>
                          {client.approvalStatus}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {formatDateTime(client.createdAt)}
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