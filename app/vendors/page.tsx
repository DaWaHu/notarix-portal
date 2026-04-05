import Link from "next/link";
import type { CSSProperties } from "react";
import { prisma } from "@/lib/prisma";

const CARD_GRAY = "#F1F1F1";
const BORDER = "#C7CFDB";
const BORDER_SOFT = "#D6DCE6";
const PRIMARY_BLUE = "#3B59F4";
const TEXT_DARK = "#141722";
const TEXT_MID = "#666666";
const TEXT_SOFT = "#7A7A7A";
const SUCCESS_BG = "#EEF6F0";
const SUCCESS_BORDER = "#CFE0D2";
const SUCCESS_TEXT = "#35543A";
const WARNING_BG = "#FFF7E8";
const WARNING_BORDER = "#E9D9B0";
const WARNING_TEXT = "#7A5A12";

export const dynamic = "force-dynamic";

function nice(value: string | null | undefined) {
  const v = String(value || "").trim();
  return v || "Not provided";
}

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString();
}

function getStatusTone(status: string | null | undefined) {
  const normalized = String(status || "").trim().toUpperCase();

  if (normalized === "APPROVED") {
    return {
      background: SUCCESS_BG,
      border: SUCCESS_BORDER,
      color: SUCCESS_TEXT,
      label: "Approved",
    };
  }

  if (normalized === "PENDING" || normalized === "REVIEW NEEDED") {
    return {
      background: WARNING_BG,
      border: WARNING_BORDER,
      color: WARNING_TEXT,
      label: normalized === "REVIEW NEEDED" ? "Review Needed" : "Pending",
    };
  }

  return {
    background: "#F7F7FA",
    border: BORDER_SOFT,
    color: TEXT_SOFT,
    label: normalized || "Draft",
  };
}

export default async function ClientsLandingPage() {
  const clients = await prisma.vendor.findMany({
    orderBy: [{ companyName: "asc" }, { vendorcode: "asc" }],
    select: {
      id: true,
      vendorcode: true,
      companyName: true,
      companyType: true,
      approvalStatus: true,
      companyLogoUrl: true,
      primaryContactName: true,
      primaryContactEmail: true,
      updatedAt: true,
      _count: {
        select: {
          orders: true,
          documents: true,
        },
      },
    },
  });

  return (
    <>
      <section style={heroPanelStyle}>
        <div style={eyebrowStyle}>Client list</div>
        <h1
          style={{
            margin: "8px 0 0",
            fontSize: 36,
            lineHeight: 1.04,
            fontWeight: 900,
            letterSpacing: -0.8,
            color: TEXT_DARK,
          }}
        >
          Client access directory
        </h1>
        <p
          style={{
            marginTop: 14,
            marginBottom: 0,
            maxWidth: 780,
            fontSize: 16,
            lineHeight: 1.55,
            color: TEXT_MID,
            fontWeight: 500,
          }}
        >
          Open a client portal, review current status, and move directly into
          profile, documentation, and order workflow pages.
        </p>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={summaryPillStyle}>
            <span style={summaryLabelStyle}>Total clients</span>
            <span style={summaryValueStyle}>{clients.length}</span>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 26 }}>
        {clients.length === 0 ? (
          <div style={emptyStateStyle}>No client records were found.</div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {clients.map((client, index) => {
              const tone = getStatusTone(client.approvalStatus);
              const isEven = index % 2 === 0;

              const cardBackground = isEven ? "#EAF2FF" : "#FFF3D6";
              const borderColor = isEven ? "#B8C9F4" : "#E2C17A";
              const accentColor = isEven ? "#2F51F2" : "#B7791F";
              const pillBackground = isEven ? "#F8FBFF" : "#FFF9EF";

              return (
                <article
                  key={client.id}
                  style={{
                    backgroundColor: cardBackground,
                    color: "#000000",
                    border: `2px solid ${borderColor}`,
                    padding: 20,
                    borderRadius: 18,
                    transition:
                      "background-color 0.3s, box-shadow 0.3s, transform 0.3s",
                    boxShadow: "0 10px 24px rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) auto",
                      gap: 18,
                      alignItems: "start",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "92px minmax(0, 1fr)",
                        gap: 16,
                        alignItems: "start",
                      }}
                    >
                      <div
                        style={{
                          width: 92,
                          height: 92,
                          borderRadius: 16,
                          background: "#FFFFFF",
                          border: `2px solid ${borderColor}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
                        }}
                      >
                        {client.companyLogoUrl ? (
                          <img
                            src={client.companyLogoUrl}
                            alt={`${nice(client.companyName)} logo`}
                            style={{
                              maxWidth: "82%",
                              maxHeight: "82%",
                              objectFit: "contain",
                              display: "block",
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: 11,
                              color: TEXT_SOFT,
                              fontWeight: 800,
                              textAlign: "center",
                              padding: 8,
                            }}
                          >
                            No Logo
                          </span>
                        )}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            width: 56,
                            height: 6,
                            borderRadius: 999,
                            background: accentColor,
                            marginBottom: 12,
                          }}
                        />

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            flexWrap: "wrap",
                          }}
                        >
                          <h2
                            style={{
                              fontSize: "1.9rem",
                              margin: 0,
                              lineHeight: 1.1,
                              fontWeight: 950,
                              color: "#000000",
                            }}
                          >
                            {nice(client.companyName)}
                          </h2>

                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 999,
                              padding: "6px 10px",
                              background: tone.background,
                              border: `1px solid ${tone.border}`,
                              color: tone.color,
                              fontSize: 12,
                              fontWeight: 800,
                              letterSpacing: "0.04em",
                              textTransform: "uppercase",
                            }}
                          >
                            {tone.label}
                          </span>
                        </div>

                        <div
                          style={{
                            marginTop: 12,
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          <MetaPill
                            label="Client code"
                            value={client.vendorcode}
                            background={pillBackground}
                          />
                          <MetaPill
                            label="Company type"
                            value={nice(client.companyType)}
                            background={pillBackground}
                          />
                          <MetaPill
                            label="Primary contact"
                            value={nice(client.primaryContactName)}
                            background={pillBackground}
                          />
                          <MetaPill
                            label="Email"
                            value={nice(client.primaryContactEmail)}
                            background={pillBackground}
                          />
                        </div>

                        <div
                          style={{
                            marginTop: 14,
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(160px, 1fr))",
                            gap: 12,
                            maxWidth: 720,
                          }}
                        >
                          <StatCard
                            label="Orders"
                            value={String(client._count.orders)}
                            accent={accentColor}
                          />
                          <StatCard
                            label="Documents"
                            value={String(client._count.documents)}
                            accent="#6D5EF4"
                          />
                          <StatCard
                            label="Last updated"
                            value={formatDateTime(client.updatedAt)}
                            accent={accentColor}
                            small
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Link
                        href={`/vendors/${client.vendorcode}`}
                        style={{
                          ...primaryLinkStyle,
                          background: accentColor,
                        }}
                      >
                        Open Portal
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

function MetaPill({
  label,
  value,
  background,
}: {
  label: string;
  value: string;
  background: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        border: `1px solid ${BORDER_SOFT}`,
        background,
        borderRadius: 999,
        padding: "8px 12px",
        fontSize: 13,
        color: TEXT_MID,
      }}
    >
      <span style={{ fontWeight: 700, color: TEXT_SOFT }}>{label}:</span>
      <span style={{ color: TEXT_DARK }}>{value}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  small = false,
}: {
  label: string;
  value: string;
  accent: string;
  small?: boolean;
}) {
  return (
    <div
      style={{
        border: `1px solid ${BORDER_SOFT}`,
        background: "#FFFFFF",
        borderRadius: 14,
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          width: 42,
          height: 4,
          borderRadius: 999,
          background: accent,
          marginBottom: 10,
        }}
      />
      <div
        style={{
          fontSize: 12,
          color: TEXT_MID,
          marginBottom: 8,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        style={{
          lineHeight: 1.15,
          fontWeight: 900,
          color: TEXT_DARK,
          wordBreak: "break-word",
          fontSize: small ? 13 : 22,
        }}
      >
        {value}
      </div>
    </div>
  );
}

const heroPanelStyle: CSSProperties = {
  background: CARD_GRAY,
  border: `2px solid ${BORDER}`,
  borderRadius: 22,
  padding: 20,
  boxShadow:
    "0 1px 2px rgba(20, 23, 34, 0.03), inset 0 4px 0 rgba(59, 89, 244, 0.85)",
};

const eyebrowStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: TEXT_SOFT,
};

const summaryPillStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  borderRadius: 999,
  border: `1px solid ${BORDER_SOFT}`,
  background: "#FFFFFF",
  padding: "10px 14px",
};

const summaryLabelStyle: CSSProperties = {
  fontSize: 13,
  color: TEXT_MID,
  fontWeight: 700,
};

const summaryValueStyle: CSSProperties = {
  fontSize: 16,
  color: TEXT_DARK,
  fontWeight: 900,
};

const primaryLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  borderRadius: 12,
  padding: "10px 16px",
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: 700,
  lineHeight: 1.3,
  boxShadow: "0 6px 14px rgba(0, 0, 0, 0.12)",
  whiteSpace: "nowrap",
};

const emptyStateStyle: CSSProperties = {
  border: `1px solid ${BORDER_SOFT}`,
  background: "#FFFFFF",
  borderRadius: 18,
  padding: "24px 18px",
  fontSize: 15,
  color: TEXT_MID,
  fontWeight: 600,
};