import Link from "next/link";
import type { CSSProperties } from "react";
import { prisma } from "@/lib/prisma";

const CARD_GRAY = "#F1F1F1";
const INNER_GRAY = "#F7F7F8";
const BORDER = "#C7CFDB";
const BORDER_SOFT = "#D6DCE6";
const PRIMARY_BLUE = "#3B59F4";
const TEXT_DARK = "#141722";
const TEXT_MID = "#666666";
const TEXT_SOFT = "#7A7A7A";

export const dynamic = "force-dynamic";

function nice(value: string | null | undefined) {
  const v = String(value || "").trim();
  return v || "Not provided";
}

export default async function CreateOrderLandingPage() {
  const clients = await prisma.vendor.findMany({
    orderBy: [{ companyName: "asc" }, { vendorcode: "asc" }],
    select: {
      id: true,
      vendorcode: true,
      companyName: true,
      companyType: true,
      approvalStatus: true,
    },
    take: 100,
  });

  return (
    <>
      <section style={heroPanelStyle}>
        <div style={eyebrowStyle}>Create order</div>
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
          Select a client before creating an order
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
          Use the client directory below to open the correct client-specific
          order form. This keeps each order tied to the proper portal record.
        </p>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Link href="/vendors" style={secondaryLinkStyle}>
            Back to Client List
          </Link>
          <Link href="/vendors/orders" style={secondaryLinkStyle}>
            View Orders
          </Link>
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        {clients.length === 0 ? (
          <div style={emptyStateStyle}>No client records were found.</div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {clients.map((client, index) => {
              const rowBackground = index % 2 === 0 ? INNER_GRAY : "#ECEFF3";

              return (
                <div
                  key={client.id}
                  style={{
                    border: `1px solid ${BORDER_SOFT}`,
                    background: rowBackground,
                    borderRadius: 18,
                    padding: 18,
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) auto",
                      gap: 16,
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          margin: 0,
                          fontSize: 24,
                          lineHeight: 1.08,
                          fontWeight: 900,
                          color: TEXT_DARK,
                        }}
                      >
                        {nice(client.companyName)}
                      </h2>

                      <div
                        style={{
                          marginTop: 12,
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <MetaPill label="Client code" value={client.vendorcode} />
                        <MetaPill
                          label="Company type"
                          value={nice(client.companyType)}
                        />
                        <MetaPill
                          label="Status"
                          value={nice(client.approvalStatus)}
                        />
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
                        href={`/vendors/${client.vendorcode}/orders/new`}
                        style={primaryLinkStyle}
                      >
                        Create Order for Client
                      </Link>
                    </div>
                  </div>
                </div>
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
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        border: `1px solid ${BORDER_SOFT}`,
        background: "#FFFFFF",
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

const primaryLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  borderRadius: 12,
  padding: "10px 16px",
  background: PRIMARY_BLUE,
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: 700,
  lineHeight: 1.3,
  boxShadow: "0 6px 14px rgba(59, 89, 244, 0.18)",
  whiteSpace: "nowrap",
};

const secondaryLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  borderRadius: 12,
  padding: "10px 16px",
  background: "#FFFFFF",
  color: TEXT_DARK,
  fontSize: 15,
  fontWeight: 700,
  lineHeight: 1.3,
  border: `1px solid ${BORDER_SOFT}`,
  whiteSpace: "nowrap",
};

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

const emptyStateStyle: CSSProperties = {
  border: `1px solid ${BORDER_SOFT}`,
  background: INNER_GRAY,
  borderRadius: 18,
  padding: "24px 18px",
  fontSize: 15,
  color: TEXT_MID,
  fontWeight: 600,
};