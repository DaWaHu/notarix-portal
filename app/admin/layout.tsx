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
        background: "#F1F5F9",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
      }}
    >
      <div
        style={{
          background: "#0F172A",
          color: "white",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Image
              src="/notarix-logo.png"
              alt="Notarix"
              width={40}
              height={40}
              style={{
                width: 40,
                height: 40,
                objectFit: "contain",
                background: "white",
                borderRadius: 10,
                padding: 4,
              }}
            />
            <div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 18,
                  color: "white",
                  letterSpacing: 0.2,
                }}
              >
                Notarix Staff Portal
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.72)",
                  fontWeight: 700,
                }}
              >
                Internal operations workspace
              </div>
            </div>
          </div>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <a href="/" style={navLink}>
              Home
            </a>
            <a href="/admin/orders" style={navLink}>
              Orders
            </a>
            <a href="/admin/orders/new" style={navLink}>
              Create Order
            </a>
            <a href="/admin/vendors/new" style={navLink}>
              Create Vendor
            </a>
          </nav>
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}

const navLink: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  color: "white",
  fontWeight: 800,
  fontSize: 14,
  padding: "10px 14px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.08)",
};