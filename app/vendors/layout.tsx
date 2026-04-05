import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

const PAGE_BG = "#FFFFFF";
const SHELL_WIDTH = 1180;
const BODY_WIDTH = 1120;
const HEADER_BG = "#F3F3F3";
const HEADER_BORDER = "#D7D7D7";
const CARD_GRAY = "#F1F1F1";
const BORDER = "#C7CFDB";
const PRIMARY_BLUE = "#3B59F4";
const TEXT_DARK = "#141722";
const TEXT_MID = "#666666";

export default async function VendorLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ vendorCode?: string }>;
}) {
  const resolvedParams = await params;
  const vendorCode = String(resolvedParams?.vendorCode || "")
    .trim()
    .toUpperCase();

  const homeHref = vendorCode ? `/vendors/${vendorCode}` : "/";
  const clientListHref = "/vendors";
  const createClientHref = "/admin/vendors/new";
  const ordersHref = vendorCode ? `/vendors/${vendorCode}/orders` : "/vendors/orders";
  const createOrderHref = vendorCode
    ? `/vendors/${vendorCode}/orders/new`
    : "/vendors/orders/new";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: PAGE_BG,
        fontFamily:
          'Inter, "Open Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: TEXT_DARK,
      }}
    >
      <div
        style={{
          maxWidth: SHELL_WIDTH,
          margin: "0 auto",
          padding: "8px 10px 0",
          boxSizing: "border-box",
        }}
      >
        <header>
          <div
            style={{
              background: HEADER_BG,
              border: `1px solid ${HEADER_BORDER}`,
              borderRadius: 18,
              padding: "6px 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 22,
                  background: "#FFFFFF",
                  border: `1px solid ${HEADER_BORDER}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
                  flexShrink: 0,
                }}
              >
                <Image
                  src="/notarix-logo.png"
                  alt="Notarix™"
                  width={76}
                  height={76}
                  style={{
                    width: 76,
                    height: 76,
                    objectFit: "contain",
                    display: "block",
                  }}
                  priority
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 950,
                    fontSize: 16,
                    lineHeight: 1.1,
                    letterSpacing: -0.3,
                    color: "#333333",
                  }}
                >
                  Notarix™
                </div>

                <div
                  style={{
                    fontSize: 10,
                    color: TEXT_MID,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    marginTop: 8,
                  }}
                >
                  Professional Signing Coordination Platform
                </div>
              </div>
            </div>

            <nav
              aria-label="Client portal navigation"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <Link href={homeHref} style={primaryLinkStyle}>
                Home
              </Link>
              <Link href={clientListHref} style={primaryLinkStyle}>
                Client List
              </Link>
              <Link href={createClientHref} style={primaryLinkStyle}>
                Create Client
              </Link>
              <Link href={ordersHref} style={primaryLinkStyle}>
                Orders
              </Link>
              <Link href={createOrderHref} style={primaryLinkStyle}>
                Create Order
              </Link>
              <Link href="/" style={primaryLinkStyle}>
                Log Off
              </Link>
            </nav>
          </div>
        </header>
      </div>

      <main
        style={{
          maxWidth: BODY_WIDTH,
          margin: "0 auto",
          padding: "22px 20px 28px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: CARD_GRAY,
            border: `1px solid ${BORDER}`,
            borderRadius: 24,
            padding: "22px 22px 24px",
            boxShadow: "0 1px 2px rgba(20, 23, 34, 0.03)",
          }}
        >
          {children}
        </div>
      </main>
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