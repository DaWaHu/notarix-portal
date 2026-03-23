import Image from "next/image";
import type { ReactNode } from "react";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#EEF3F9",
      }}
    >
      <header
        style={{
          background: "#0B1533",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "14px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Image
                src="/notarix-logo.png"
                alt="Notarix logo"
                width={32}
                height={32}
                style={{ objectFit: "contain" }}
              />
            </div>

            <div>
              <div
                style={{
                  color: "#FFFFFF",
                  fontWeight: 900,
                  fontSize: 16,
                  lineHeight: 1.1,
                }}
              >
                Notarix Staff Portal
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.72)",
                  fontSize: 13,
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                Internal operations workspace
              </div>
            </div>
          </div>

          <nav
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <a
              href="/admin"
              style={navLinkStyle}
            >
              Home
            </a>
            <a
              href="/admin/orders"
              style={navLinkStyle}
            >
              Orders
            </a>
            <a
              href="/admin/orders/new"
              style={navLinkStyle}
            >
              Create Order
            </a>
            <a
              href="/admin/vendors/new"
              style={navLinkStyle}
            >
              Create Vendor
            </a>
          </nav>
        </div>
      </header>

      <div>{children}</div>
    </div>
  );
}

const navLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  color: "#FFFFFF",
  background: "rgba(255,255,255,0.10)",
  borderRadius: 12,
  padding: "10px 14px",
  fontWeight: 800,
  fontSize: 14,
};